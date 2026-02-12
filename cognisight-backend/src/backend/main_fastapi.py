# main_fastapi.py
import uvicorn
import io
import os
import zipfile
import gc
import torch
import re
from typing import List, Dict
from pydantic import BaseModel
# FastAPI Imports
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Document Processing Imports
from pypdf import PdfReader
from docx import Document

# AI Model Imports
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForCausalLM

# --- CONFIGURATION & HARDWARE CHECK ---
PORT = 8000
HOST = "0.0.0.0"

# 1. Determine Device
if torch.cuda.is_available():
    DEVICE = "cuda"
    GPU_NAME = torch.cuda.get_device_name(0)
    print(f"\n{'='*40}")
    print(f"✅ HARDWARE ACCELERATION ENABLED")
    print(f"🚀 DEVICE: {DEVICE.upper()} ({GPU_NAME})")
    print(f"{'='*40}\n")
    # Optional: Enable CUDNN benchmark for slight speedup on fixed input sizes
    torch.backends.cudnn.benchmark = True
else:
    DEVICE = "cpu"
    print(f"\n{'='*40}")
    print(f"⚠️  NO GPU DETECTED - RUNNING ON CPU")
    print(f"🐢 Expect significantly slower generation times.")
    print(f"{'='*40}\n")

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
# --- UTILITY FUNCTIONS ---

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extracts text from PDF/DOCX templates."""
    ext = filename.split('.')[-1].lower()
    text = ""
    try:
        if ext == 'pdf':
            reader = PdfReader(io.BytesIO(file_content))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted: text += extracted + "\n"
        elif ext == 'docx':
            doc = Document(io.BytesIO(file_content))
            for para in doc.paragraphs:
                text += para.text + "\n"
    except Exception as e:
        print(f"Error reading template: {e}")
    return text

def parse_code_context(zip_bytes: bytes) -> Dict[str, str]:
    """
    Analyzes zip to extract:
    1. Structure, 2. Priority Context, 3. General Context, 4. Modules
    """
    priority_files = {'package.json', 'requirements.txt', 'README.md', 'Dockerfile', 'docker-compose.yml', 'settings.py', 'config.js', 'pom.xml', 'build.gradle'}
    ignored_dirs = {'node_modules', '.git', '__pycache__', 'dist', 'build', 'venv', '.idea', '.vscode', 'coverage', 'assets', 'images', 'bin', 'obj'}
    allowed_exts = {'.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.css', '.html', '.sql', '.json', '.yml', '.md', '.cs'}

    file_structure = []
    detected_modules = set()
    priority_content = ""
    general_content = ""

    regex_python = re.compile(r'^(?:from|import)\s+([a-zA-Z0-9_]+)', re.MULTILINE)
    regex_js = re.compile(r'(?:require\(|from\s+)[\'"]([@a-zA-Z0-9_\-/]+)[\'"]', re.MULTILINE)

    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
            file_list = sorted(z.infolist(), key=lambda x: x.filename)
            
            for file_info in file_list:
                if file_info.is_dir(): continue
                
                path_parts = file_info.filename.split('/')
                if any(part in ignored_dirs for part in path_parts): continue
                file_structure.append(file_info.filename)
                
                ext = os.path.splitext(file_info.filename)[1].lower()
                base_name = os.path.basename(file_info.filename)
                
                if ext in allowed_exts or base_name in priority_files:
                    try:
                        raw = z.read(file_info.filename).decode('utf-8', errors='ignore')
                        
                        if len(raw) > 12000 or (len(raw) > 500 and raw.count('\n') < 3): 
                            continue
                            
                        entry = f"\n\n--- FILE: {file_info.filename} ---\n{raw}\n"
                        
                        # Module Extraction
                        if ext == '.py':
                            detected_modules.update(regex_python.findall(raw))
                        elif ext in ['.js', '.jsx', '.ts', '.tsx']:
                            detected_modules.update(regex_js.findall(raw))
                        
                        if base_name in priority_files:
                            priority_content += entry
                        else:
                            general_content += entry
                    except: continue
                    
    except Exception as e:
        print(f"Zip Error: {e}")
        return {}

    return {
        "structure": "\n".join(file_structure[:60]),
        "priority_context": priority_content[:10000],
        "general_context": general_content[:15000],
        "modules": ", ".join(list(detected_modules)[:30])
    }

# --- MODEL ENGINE ---

def cleanup_gpu():
    """Aggressively clears GPU memory."""
    if torch.cuda.is_available():
        gc.collect()
        torch.cuda.empty_cache()

class SequentialGenerator:
    def __init__(self, context_data: Dict[str, str]):
        self.context = context_data
        self.summaries = {}
        self.detailed_docs = {}
        self.final_docs = {}

    def run_stage_1_summarization(self, headings: List[str]):
        """Stage 1: Flan-T5 - Intent extraction."""
        print("\n--- [1/3] Loading Flan-T5 (Summarizer) ---")
        cleanup_gpu()
        model = None
        tokenizer = None
        try:
            model_id = "models/flan-t5-base"
            tokenizer = AutoTokenizer.from_pretrained(model_id, legacy=False)
            model = AutoModelForSeq2SeqLM.from_pretrained(model_id).to(DEVICE)
            
            with torch.inference_mode():
                for heading in headings:
                    prompt = (
                        f"Task: Write one professional technical sentence describing the section '{heading}'. "
                        f"Context snippet: {self.context['priority_context'][:800]}"
                    )
                    inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True).to(DEVICE)
                    outputs = model.generate(inputs.input_ids, max_new_tokens=60)
                    summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
                    self.summaries[heading] = summary
                    print(f"Stage 1 (Summary) for {heading}: {summary}")
                    
                    del inputs, outputs
                    
        except Exception as e:
            print(f"Stage 1 Error: {e}")
            for heading in headings: self.summaries[heading] = "Overview of this module."
        finally:
            if model: del model
            if tokenizer: del tokenizer
            cleanup_gpu()

    def run_stage_2_elaboration(self, headings: List[str]):
        """Stage 2: TinyLlama - Structuring Content."""
        print("\n--- [2/3] Loading TinyLlama (Expander) ---")
        cleanup_gpu()
        model = None
        tokenizer = None
        try:
            model_id = "models/tinyllama"
            tokenizer = AutoTokenizer.from_pretrained(model_id, legacy=False)
            model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16).to(DEVICE)
            
            with torch.inference_mode():
                for heading in headings:
                    summary = self.summaries.get(heading, "")
                    
                    prompt = (
                        f"<|system|>\n"
                        f"You are a Lead Technical Writer creating official documentation for an enterprise software project. "
                        f"Your goal is to write a precise, technically accurate section based strictly on the provided codebase analysis.\n\n"
                        f"GUIDELINES:\n"
                        f"1. Use a formal, objective tone (avoid 'I', 'we', 'here is').\n"
                        f"2. Reference specific file names and libraries from the provided Context.\n"
                        f"3. Do not invent features; rely on the File Structure and Config Context.\n"
                        f"4. Format the output with clear headings and bullet points.\n"
                        f"<|end|>\n"
                        f"<|user|>\n"
                        f"### PROJECT CONTEXT\n"
                        f"**File Structure:**\n{self.context['structure']}\n\n"
                        f"**Tech Stack & Modules:**\n{self.context['modules']}\n\n"
                        f"**Critical Configurations (Context):**\n{self.context['priority_context']}\n\n"
                        f"### WRITING TASK\n"
                        f"**Section Title:** {heading}\n"
                        f"**Section Objective:** {summary}\n\n"
                        f"**Required Output Structure:**\n"
                        f"## 1. Overview\n"
                        f"(Write 2 professional paragraphs explaining the purpose of this section based on the objective.)\n\n"
                        f"## 2. Key Capabilities\n"
                        f"(List 3-5 bullet points highlighting specific features found in the code.)\n\n"
                        f"## 3. Technical Implementation\n"
                        f"(Explain how the identified files and modules interact to achieve this functionality.)\n\n"
                        f"Draft the content for '{heading}' now:\n"
                        f"<|end|>\n"
                        f"<|assistant|>"
                    )
                    
                    inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
                    
                    outputs = model.generate(
                        inputs.input_ids, 
                        max_new_tokens=512, 
                        do_sample=True,
                        temperature=0.6, 
                        repetition_penalty=1.15
                    )
                    detailed = tokenizer.decode(outputs[0], skip_special_tokens=True)
                    if "<|assistant|>" in detailed:
                        detailed = detailed.split("<|assistant|>")[-1].strip()
                    
                    self.detailed_docs[heading] = detailed
                    print(f"Stage 2 (Draft) for {heading}")

                    # PERFORMANCE FIX: Removed the slow cleanup_gpu() from inside this loop
                    del inputs, outputs 
                    
        except Exception as e:
            print(f"Stage 2 Error: {e}")
            for heading in headings: self.detailed_docs[heading] = "Content generation failed."
        finally:
            if model: del model
            if tokenizer: del tokenizer
            cleanup_gpu()

    def run_stage_3_polishing(self, headings: List[str]):
        """Stage 3: Gemma - Styling & Snippet Selection."""
        print("\n--- [3/3] Loading Gemma (Polisher) ---")
        cleanup_gpu()
        model = None
        tokenizer = None
        try:
            model_id = "models/gemma-2b-it" 
            tokenizer = AutoTokenizer.from_pretrained(model_id, legacy=False)
            model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16).to(DEVICE)
            
            with torch.inference_mode():
                for heading in headings:
                    content = self.detailed_docs.get(heading, "")
                    
                    prompt = (
                        f"<|system|>\n"
                        f"You are a Senior Technical Editor. Your job is to format raw technical drafts into polished, publication-ready documentation.\n"
                        f"STRICT RULES:\n"
                        f"1. OUTPUT FORMAT: Use clean Markdown. Use '##' for main sections and '###' for subsections.\n"
                        f"2. TONE: Professional, objective, and concise. Remove all conversational filler (e.g., 'Here is the code', 'In this section').\n"
                        f"3. LISTS: Convert feature lists or steps into bullet points for readability.\n"
                        f"4. CODE SNIPPET: Identify the most relevant logic in the provided Code Context. Insert ONE concise snippet (max 10-12 lines) inside a ```block```. Do NOT invent code.\n"
                        f"<|end|>\n"
                        f"<|user|>\n"
                        f"RAW DRAFT:\n{content}\n\n"
                        f"AVAILABLE CODE CONTEXT:\n{self.context['general_context'][:2000]}\n\n"
                        f"TASK: Rewrite the Raw Draft into the final Markdown format now.\n"
                        f"<|end|>\n"
                        f"<|assistant|>"
                    )
                    
                    inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
                    
                    outputs = model.generate(
                        inputs.input_ids, 
                        max_new_tokens=600, 
                        do_sample=True,
                        temperature=0.5,
                        repetition_penalty=1.2
                    )
                    final_output = tokenizer.decode(outputs[0], skip_special_tokens=True)
                    
                    final_output = final_output.replace(prompt, "")
                    final_output = re.sub(r"^(User:|Model:|Response:|Here is).*?\n", "", final_output, flags=re.IGNORECASE | re.MULTILINE).strip()
                    
                    self.final_docs[heading] = final_output
                    print(f"Stage 3 (Final) for {heading}")

                    # PERFORMANCE FIX: Removed the slow cleanup_gpu() from inside this loop
                    del inputs, outputs
                    
        except Exception as e:
            print(f"Stage 3 Error: {e}")
            for heading in headings: self.final_docs[heading] = self.detailed_docs.get(heading, "")
        finally:
            if model: del model
            if tokenizer: del tokenizer
            cleanup_gpu()
        
        return self.final_docs

# --- FASTAPI APP ---

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/extract-headings")
async def extract_headings(template_file: UploadFile = File(...)):
    content = await template_file.read()
    text = extract_text_from_file(content, template_file.filename)
    lines = text.split('\n')
    headings = []
    for line in lines:
        clean = line.strip()
        if len(clean) > 3 and len(clean) < 60:
            if clean[0].isdigit() or clean.isupper() or clean.endswith(':'):
                headings.append(clean)
    headings = list(dict.fromkeys(headings))
    if not headings:
        headings = ["1. Introduction", "2. System Architecture", "3. Installation", "4. API Usage", "5. Conclusion"]
    return {"headings": headings[:15]}

@app.post("/generate-doc")
async def generate_documentation(
    zip_file: UploadFile = File(...),
    project_name: str = Form(...),
    project_description: str = Form(...),
    domain: str = Form(...),
    template: str = Form(...) 
):
    print(f"\n--- New Job: {project_name} ---")
    
    zip_content = await zip_file.read()
    context_data = parse_code_context(zip_content)
    
    if not context_data:
        raise HTTPException(status_code=400, detail="Could not extract valid code from zip.")

    headings = [h.strip() for h in template.split('\n') if h.strip()]
    if not headings: headings = ["Overview", "Technical Implementation"]

    try:
        generator = SequentialGenerator(context_data)
        generator.run_stage_1_summarization(headings)
        generator.run_stage_2_elaboration(headings) 
        final_sections = generator.run_stage_3_polishing(headings)
        
        # Return structured JSON to frontend
        return {
            "project_name": project_name,
            "domain": domain,
            "sections": final_sections
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")



@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    print(f"\n--- Chat Request: {request.message[:50]}... ---")
    
    cleanup_gpu()
    
    model_id = "models/gemma-2b-it" 
    tokenizer = None
    model = None
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_id, legacy=False)
        # Fixed: using 'torch_dtype' correctly or 'dtype' as suggested by your warning
        model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16).to(DEVICE)
        
        # 1. BUILD VALID CONVERSATION (Fixes the TemplateError)
        conversation = []
        last_role = None
        
        for msg in request.history:
            # Gemma expects "assistant", not "model"
            role = "user" if msg['role'] == "user" else "assistant"
            
            # Skip if the same role repeats (Gemma requires alternation)
            if role == last_role:
                continue
                
            conversation.append({"role": role, "content": msg['content']})
            last_role = role
        
        # Add the current message
        if last_role != "user":
            conversation.append({"role": "user", "content": request.message})
        else:
            # If the last message in history was also "user", update it instead
            conversation[-1]["content"] += f"\n{request.message}"

        # 2. APPLY TEMPLATE
        full_prompt = tokenizer.apply_chat_template(conversation, tokenize=False, add_generation_prompt=True)

        inputs = tokenizer(full_prompt, return_tensors="pt").to(DEVICE)
        input_length = inputs.input_ids.shape[1]
        
        # 3. GENERATE FULL RESPONSE
        outputs = model.generate(
            inputs.input_ids,
            max_new_tokens=1024, # High limit for full responses
            do_sample=True,
            temperature=0.7,
            repetition_penalty=1.1
        )
        
        # 4. ACCURATE DECODING
        generated_tokens = outputs[0][input_length:]
        response_text = tokenizer.decode(generated_tokens, skip_special_tokens=True)

        return {"reply": response_text.strip()}

    except Exception as e:
        import traceback
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if model: del model
        if tokenizer: del tokenizer
        cleanup_gpu()

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)
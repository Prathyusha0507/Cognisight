# Project Title  
Cognisight – AI Orchestrated Lifecycle Management System  

# Team Members   
- Makkena Venkataprathyusha  
- Dontuboina Divya Siva Naga Malleswari
- Kesani Santhosh Kumar   
- Koti Venkata Srinivasarao –  



# Project Overview  
Cognisight is a unified AI-assisted web platform that combines project scaffolding, dynamic test-case generation, and automated documentation in a single development environment.  
It is designed for students, educators, and practitioners who need integrated support for project setup, validation, and documentation without depending on cloud-based tools.  

# Module-wise Overview  

1. **Assisted Project Builder** 
- Takes title, aim, and description as input and semantically generates a complete project workspace with directory structure and starter files.  
- Includes a Monaco-based editor with selection-based AI code assistance, inline corrections, and insights such as frequently edited files and recurring errors.  

2. **Dynamic Testcase Generation & Execution Module**  
- Offers quick mode with template/range-based random input generation and constraint mode for LeetCode-style, condition-based testcases.  
- Executes C, C++, Java, and Python programs in an isolated multi-language runtime, capturing outputs, failures, and edge cases.  

3. **AI-Driven Documentation Generator**  
- Continuously produces project overviews, module descriptions, API references, and usage guides from current code and runtime behavior.  
- Keeps documentation synchronized with evolving files and tests, and exports artifacts in formats like Markdown, PDF, or HTML.  

4. **AI Assistance & Insight Layer**  
- Uses local instruction-tuned Transformer models for context-aware code completion, explanation, and chat-style guidance based on the active workspace.  
- Highlights development patterns and quality indicators, such as error trends and frequently modified regions, to support better decision-making.  

### Technologies Used  
- Frontend: React.js with TypeScript, React Router, Tailwind CSS, Monaco Editor.  
- Backend: Node.js, Express.js, REST APIs.  
- AI Services: Python FastAPI with Transformer models for documentation, summarization, code assistance, and chat.  
- Databases: MongoDB for project metadata and file trees, PostgreSQL for execution logs and metrics (optional).  
- Other: Local toolchains for C, C++, Java, and Python; isolated execution (e.g., via Docker or sandboxing); JSON-based processing pipeline.

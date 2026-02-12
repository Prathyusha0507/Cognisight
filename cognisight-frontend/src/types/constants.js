export const FILETYPES = {
  jsx: { icon: '⚛️', color: 'text-yellow-400' },
  js: { icon: '📜', color: 'text-yellow-400' },
  ts: { icon: '🔷', color: 'text-blue-400' },
  tsx: { icon: '⚛️', color: 'text-blue-400' },
  css: { icon: '🎨', color: 'text-blue-400' },
  scss: { icon: '🎨', color: 'text-pink-400' },
  html: { icon: '🌐', color: 'text-orange-400' },
  json: { icon: '📋', color: 'text-yellow-300' },
  md: { icon: '📝', color: 'text-purple-400' },
  py: { icon: '🐍', color: 'text-blue-500' },
  java: { icon: '☕', color: 'text-orange-600' },
  sql: { icon: '🗄️', color: 'text-blue-600' },
  xml: { icon: '📦', color: 'text-orange-500' },
  env: { icon: '⚙️', color: 'text-gray-400' },
  txt: { icon: '📄', color: 'text-gray-400' },
  folder: { icon: '📁', color: 'text-blue-400' },
};

// Project templates with complete folder structure
export const PROJECT_TEMPLATES = {
  'react-vite': {
    label: 'React + Vite',
    description: 'Fast React development with Vite bundler',
    icon: '⚛️',
    files: {
      'package.json': `{
  "name": "react-vite-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0",
    "eslint": "^8.40.0"
  }
}`,
      'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  }
});`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Vite App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,
      '.gitignore': `node_modules
dist
.env
.env.local
*.log
.DS_Store`,
      'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      'src/App.jsx': `import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>React + Vite</h1>
      <p>Welcome to your React Vite project</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;`,
      'src/App.css': `.app {
  text-align: center;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  transition: background 0.3s;
}

button:hover {
  background: #0056b3;
}`,
      'README.md': `# React Vite App

A fast React development environment with Vite.

## Getting Started

1. \`npm install\` - Install dependencies
2. \`npm run dev\` - Start dev server
3. \`npm run build\` - Build for production
4. \`npm run preview\` - Preview production build

## Project Structure

\`\`\`
src/
├── main.jsx      - Application entry
├── App.jsx       - Main App component
└── App.css       - App styles
\`\`\``,
      'public/.gitkeep': '',
    }
  },
  'node-express': {
    label: 'Node + Express',
    description: 'Backend server with Node.js and Express',
    icon: '🚀',
    files: {
      'package.json': `{
  "name": "express-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}`,
      'server.js': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Express API' });
});

app.post('/api/echo', (req, res) => {
  const { message } = req.body;
  res.json({ echo: message });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,
      '.env': `PORT=3000
NODE_ENV=development`,
      '.gitignore': `node_modules
.env
.env.local
*.log
dist
.DS_Store`,
      'README.md': `# Express Server

A Node.js and Express backend server.

## Getting Started

1. \`npm install\` - Install dependencies
2. \`npm run dev\` - Start dev server with nodemon
3. \`npm start\` - Start production server

## API Endpoints

- \`GET /api/health\` - Health check
- \`GET /api\` - Welcome message
- \`POST /api/echo\` - Echo back your message

## Project Structure

\`\`\`
├── server.js     - Main server file
├── .env         - Environment variables
└── package.json - Dependencies
\`\`\``,
      'routes/.gitkeep': '',
      'middleware/.gitkeep': '',
      'controllers/.gitkeep': '',
    }
  },
  'vue-app': {
    label: 'Vue 3',
    description: 'Progressive Vue.js web framework',
    icon: '💚',
    files: {
      'package.json': `{
  "name": "vue-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.0.0",
    "vite": "^4.3.0"
  }
}`,
      'vite.config.js': `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: { port: 5174 }
});`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`,
      'src/main.js': `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');`,
      'src/App.vue': `<template>
  <div class="app">
    <h1>Vue 3 Application</h1>
    <p>{{ message }}</p>
    <button @click="count++">Count: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
const message = ref('Welcome to Vue 3!');
</script>

<style scoped>
.app {
  text-align: center;
  padding: 2rem;
}

button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>`,
      'README.md': `# Vue 3 App

Modern Vue.js 3 application setup.

## Getting Started

1. \`npm install\`
2. \`npm run dev\`
3. \`npm run build\``,
      'src/.gitkeep': '',
    }
  },
  'python-flask': {
    label: 'Python Flask',
    description: 'Lightweight Python web framework',
    icon: '🐍',
    files: {
      'requirements.txt': `Flask==2.3.0
Flask-CORS==4.0.0
python-dotenv==1.0.0`,
      'app.py': `from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "Server is running!"})

@app.route('/api', methods=['GET'])
def welcome():
    return jsonify({"message": "Welcome to Flask API"})

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    message = data.get('message', '')
    return jsonify({"echo": message})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port)`,
      '.env': `FLASK_ENV=development
PORT=5000`,
      '.gitignore': `__pycache__
*.pyc
venv/
.env
.env.local`,
      'README.md': `# Flask Server

A Python Flask web server.

## Getting Started

1. Create virtual env: \`python -m venv venv\`
2. Activate: \`source venv/bin/activate\` (or \`venv\\Scripts\\activate\` on Windows)
3. Install: \`pip install -r requirements.txt\`
4. Run: \`python app.py\`

## API Endpoints

- \`GET /api/health\`
- \`GET /api\`
- \`POST /api/echo\``,
    }
  }
};

// Terminal mock commands
export const TERMINAL_COMMANDS = {
  'npm install': 'Dependencies installed successfully ✓',
  'npm run dev': 'Starting dev server on localhost:5173...',
  'npm run build': 'Building for production... Done! ✓',
  'git status': 'On branch main, working tree clean',
  'ls': 'src/  public/  package.json  README.md',
  'cd src': 'Changed directory to src',
  'clear': '',
};

// AI Assistant responses
export const AI_RESPONSES = [
  "I'd be happy to help! Based on your question, here are some suggestions:\n1. Check the documentation\n2. Review error logs\n3. Try debugging step by step",
  "Great question! I recommend:\n- Adding error handling\n- Following best practices\n- Testing thoroughly",
  "I understand your question.\n- Refactoring code for clarity\n- Adding type safety\n- Improving performance",
];

// Navigation pages
export const NAV_PAGES = [
  { id: 'home', label: 'Home',path :'/documentation'},
  { id: 'ai-assistant', label: 'AI Assistant',path :'/documentation' },
  { id: 'documentation', label: 'Documentation',path :'/documentation' },
  { id: 'testcase', label: 'Testcase Generator',path :'/documentation' },
];

// Spring dependencies
// export const DEPENDENCIES = [
//   'Spring Web',
//   'Spring Data JPA',
//   'H2 Database',
//   'Lombok',
//   'Spring Security',
//   'Spring Boot DevTools',
// ];

export const DEPENDENCIES = [
  'spring-boot-starter-web',
  'spring-boot-starter-data-jpa',
  'spring-boot-starter-security',
  'spring-boot-starter-validation',
  'mysql-connector-java',
  'spring-boot-starter-test',
  'junit-jupiter-api',
  'mockito-core',
];
// Import CSS files
import '../css/main.css';
import '../css/welcome.css';
import '../css/controls.css';
import '../css/prompt-generator.css';

// Import CodeMirror styles
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Notes2LLM App Initializing...");
    initUI();
});

# Notes2LLM

<img src="src/assets/logo.webp" width="200px">

## About
Notes2LLM is a browser-based tool for editing and refining HTML, CSS, and JavaScript code. It combines a visual editor with code-level access and AI integration to facilitate the creation and modification of web content. It is designed to bridge the gap between visual design and code generation by Large Language Models (LLMs).

## Features

### Visual Workspace
- **Visual Editing**: Select elements to edit text content, image sources, and attributes directly.
- **Styling Controls**: Modify CSS classes, IDs, inline styles, and manage CSS rules.
- **DOM Manipulation**: Move, copy, or remove elements within the document structure.
- **Responsive Preview**: View content in Desktop, Tablet, and Mobile viewport sizes.
- **Interactive Preview Mode**: Toggle to interact with the page (e.g., test buttons, links, and scripts).

### AI Integration
- **Generate Code**: Create new components or pages from text descriptions using configured AI providers.
- **AI-Assisted Editing**: Select an element and describe changes. The tool sends the element's HTML, relevant CSS, and a screenshot to the AI for context-aware updates.
- **Supported Providers**: OpenAI, Google (Gemini), OpenRouter, and local models (via OpenAI-compatible endpoints).

### Code Tools
- **Snap-to-Code**: A dual-view mode that highlights the HTML, CSS, and JavaScript code corresponding to the selected visual element.
- **Full Code Editors**: Access and edit the complete HTML body, CSS stylesheet, and JavaScript.
- **Prompt Generator**: A form-based tool to construct detailed prompts for external LLM sessions, covering styling, composition, and accessibility requirements.

### Project Management
- **Import/Export**: Save work as a project file (.json) containing code and edit history, or export as a standalone HTML file.
- **Comments**: Add specific comments to elements to guide further refinement.

## Usage Scenarios

### General Workflow
1. **Generate or Import**: Start by generating code within the app, pasting code from an external source, or importing an HTML file.
2. **Refine**: Use visual controls or AI commands to adjust the content and styling.
3. **Export**: Save the project or export the final HTML code.

### WordPress
- **Gutenberg**: Paste the exported code into a "Custom HTML" block.
- **Page Builders**: Use "HTML" or "Custom Code" widgets in builders like Elementor.

### Email
- **Templates**: Use the Prompt Generator to specify "Email" purpose for table-based layouts.
- **Clients**: Paste the code into HTML-supported email editors (e.g., Thunderbird, Outlook HTML mode).

## Configuration

To use the integrated AI features:
1. Open the settings menu (gear icon).
2. Select a provider (OpenAI, Google, OpenRouter, or Local).
3. Enter your API key and select a model.
4. Keys are stored in your browser's `localStorage`.

## Privacy

Notes2LLM operates client-side. Code processing occurs in the browser. API keys are stored locally and are only used to communicate directly with the selected AI provider.

## License

Notes2LLM is released under the MIT License.

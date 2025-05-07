# Notes2LLM

<img src="logo.png" width="200px">

## About
Notes2LLM is a browser-based tool consisting of a visual code editor/annotator workspace and a prompt generator. 

It was developed to assist inexperienced users in their interaction with LLMs (AI), especially in chat interfaces, when creating advanced HTML/CSS/JS projects like static websites, web pages, Wordpress (and other CMS) posts, pages, widgets and homepages, emails and email newsletters, data/information visualisations (tables, diagrams) etc. 

It is meant for people who find it challenging to edit text in nested HTML, quickly and reliably prompt a model to fix/remove/expand some element of a project, or craft structured prompts, and cannot afford the services of a professional developer, the credits needed to work with a tool like a page builder (Elementor) or coding assistant (Aider), or a specialized plugin that creates a specific widget they want.

## The problem it tries to solve
With models like Gemini 2.5 Pro, which can be used for free in a chat interface and reliably handle quite sizable projects, web development has become more accessible to people without coding knowledge who need to maintain their Wordpress sites, create a personal/company website, need a nice custom email signature or a newsletter template, etc. It is easy to generate visually appealing, advanced elements like custom, unique galleries, slideshows, tables, tabbed content, diagrams and so on without learning and/or purchasing a plugin. The challenge is often to get the result *just right* without browsing nested HTML tags, manually editing text etc. and going back-and-forth with the AI multiple times, which can lead to running out of LLM context, losing track of changes and requires time and effort to write very specific, detailed follow-up prompts to obtain the desired result.

## Components

### Prompt Generator
The integrated prompt generator helps users create well-structured, comprehensive prompts for LLMs to generate high-quality code. Features include:

- **Purpose Selection**: Specify if you're creating content for WordPress, email, a full website, etc.
- **Styling Options**: Define colors, fonts, and general style direction
- **Component Selection**: Easily specify if you need headers, sliders, galleries, etc.
- **Content Instructions**: Add your content and specify how the LLM should treat your text
- **Accessibility Options**: Ensure your generated code follows accessibility best practices
- **Output Customization**: Control class naming conventions, code comments, and more

The prompt generator outputs a comprehensive, ready-to-paste prompt that guides the LLM to produce exactly what you need.

### Workspace Editor
The visual editor allows you to:

- **Preview Generated Code**: See the rendered HTML/CSS/JS in a live preview
- **Edit Text Content**: Directly edit text without digging through HTML
- **Modify Images**: Change image sources with a simple input field
- **Customize Styling**: Edit CSS properties for selected elements
- **Manipulate Elements**: Duplicate, remove, or add comments to elements
- **Test Interactions**: Toggle preview mode to test interactive elements
- **Extract Final Code**: Get the processed code to send back to the LLM

## Example Workflow

The intended workflow follows these steps:

1. **Prepare Content**: Gather your text or data that needs to be presented on the web
2. **Generate Initial Prompt**: Use the Notes2LLM prompt generator to create a structured prompt
3. **Get LLM Response**: Submit the prompt to your preferred LLM and receive generated code
4. **Review & Edit**: Load the code into Notes2LLM workspace to preview and make adjustments
5. **Add Comments**: Insert specific comments about changes needed
6. **Refine with LLM**: Send the edited code with comments back to the LLM
7. **Repeat if Needed**: Continue the refinement process until satisfied
8. **Export Final Code**: Extract the production-ready code for your project

### Using it for WordPress

WordPress integration can be done in several ways:

#### Using Gutenberg Custom HTML Block
1. In your WordPress editor, add a "Custom HTML" block
2. Paste your final Notes2LLM-processed code into the block
3. Switch between "HTML" and "Preview" modes in the block to verify appearance
4. Publish or update your page/post

#### Using Elementor or Other Page Builders
1. Add an "HTML" or "Custom Code" widget to your page layout
2. Paste your final code from Notes2LLM
3. Most page builders will render the preview instantly
4. Save or update your page

### Using it for Email

Email HTML requires special considerations due to limited CSS support across email clients:

#### Creating Email Signatures or Templates
1. Use the prompt generator with "Email" as the purpose
2. Specify "Email Signature" or "Newsletter" as appropriate
3. The generated code will use table-based layouts and inline CSS for maximum compatibility

#### Implementing in Email Clients
- **Thunderbird**: Go to Account Settings > Composition & Addressing > HTML Editor, paste your code
- **Outlook**: Create a new signature in Settings > Mail > Compose and reply, use the HTML editor option
- **Gmail**: Limited HTML editing – best to use signature managers like WiseStamp that let you paste HTML

### Using it for a Website

For standalone websites or web pages:

1. Use the prompt generator with "Full Website," "Web Page," or "Web App" as the purpose
2. Load the generated code into the Notes2LLM workspace
3. Make visual edits and add comments for refinement
4. After refinement with the LLM, extract the final code
5. Deploy to your hosting provider (copy files or use the HTML in a site builder)

### Recommended LLMs

Different LLMs have different strengths for code generation:

- **Claude 3.7 Sonnet with Thinking** (requires Claude Pro subscription, $20/month): Exceptional for complex layouts and maintaining visual consistency. The "thinking" mode significantly improves code quality.

- **Gemini 2.5 Pro** (free in Google AI Studio): Very high quality code generation with good visual design sense. Requires more specific prompts than Claude but handles large projects well.

- **Deepseek v3**: Strong code generation capabilities, particularly good at implementing specific technical requirements.

For comparing different models, consider using [lmarena.ai/leaderboard](https://web.lmarena.ai/leaderboard), which provides comprehensive benchmarks of different models' capabilities.

## Privacy

Notes2LLM processes all code directly in your browser. No data is sent to any server, and no information is collected or stored outside your browser. All operations happen locally on your device, ensuring complete privacy of your content and code.

## License

Notes2LLM is released under the MIT License, making it free to use and modify.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to help improve Notes2LLM.

## Getting Started

1. Visit the Notes2LLM website or download and open index.html
2. Use the prompt generator to create a structured prompt
3. Send the prompt to your preferred LLM
4. Load the generated code into the Notes2LLM workspace
5. Make visual edits and add comments
6. Export the final code for your project
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';

const API_KEY_PREFIX = 'n2l-api-key-';

/**
 * Saves an API key for a specific provider to localStorage.
 * @param {string} provider - The provider name (e.g., 'openai', 'google').
 * @param {string} key - The API key.
 */
export function saveApiKey(provider, key) {
    localStorage.setItem(`${API_KEY_PREFIX}${provider}`, key);
}

/**
 * Retrieves an API key for a specific provider from localStorage.
 * @param {string} provider - The provider name.
 * @returns {string|null} The API key or null if not found.
 */
export function getApiKey(provider) {
    return localStorage.getItem(`${API_KEY_PREFIX}${provider}`);
}

/**
 * Factory function to create an AI client based on the provider.
 * @param {object} providerConfig - Configuration object.
 * @param {string} providerConfig.provider - The provider name.
 * @param {string} [providerConfig.apiKey] - The API key.
 * @param {string} [providerConfig.baseURL] - The base URL for local/custom providers.
 * @returns {object} The initialized Vercel SDK client.
 */
function createClient({ provider, apiKey, baseURL }) {
    switch (provider) {
        case 'openai':
            return createOpenAI({
                apiKey: apiKey || getApiKey('openai'),
                dangerouslyAllowBrowser: true,
            });
        case 'google':
            return createGoogleGenerativeAI({
                apiKey: apiKey || getApiKey('google'),
                dangerouslyAllowBrowser: true,
            });
        case 'openrouter':
            return createOpenRouter({
                apiKey: apiKey || getApiKey('openrouter'),
                dangerouslyAllowBrowser: true,
            });
        case 'local':
            return createOpenAI({ // Use OpenAI SDK compatibility for local models
                apiKey: apiKey || getApiKey('local') || 'local', // Some servers require a placeholder
                baseURL: baseURL,
                dangerouslyAllowBrowser: true,
            });
        default:
            throw new Error(`Unsupported AI provider: ${provider}`);
    }
}

/**
 * Generates new code from a text prompt.
 * @param {string} prompt - The user's prompt.
 * @param {object} config - Configuration for the AI client and model.
 * @returns {Promise<{html: string, css: string, javascript?: string}>} The generated code as a structured object.
 */

const newCodeSchema = z.object({
    html: z.string().describe('The HTML content for the body of the page.'),
    css: z.string().describe('All the CSS code required. Do not include <style> tags.'),
    javascript: z.string().optional().describe('Any JavaScript code required. Do not include <script> tags.')
});

export async function generateNewCode(prompt, config) {
    const client = createClient(config);
    const systemPrompt = `You are an expert web developer tasked with generating a new HTML component from a user's prompt.
You must generate the HTML, CSS, and JavaScript for this component.
Return the result in a structured JSON object with the keys "html", "css", and "javascript".
- The "html" value should contain only the HTML for the body.
- The "css" value should contain all CSS, without <style> tags.
- The "javascript" value should contain all JS, without <script> tags.
IMPORTANT: Return ONLY valid JSON. Do NOT wrap the response in markdown code blocks (like \`\`\`json). Just return the raw JSON string.`;

    const { object } = await generateObject({
        model: client(config.model),
        schema: newCodeSchema,
        system: systemPrompt,
        prompt: prompt,
    });

    // Sanitize AI output to remove markdown code blocks
    if (object.html) object.html = object.html.replace(/```html/g, '').replace(/```/g, '').trim();
    if (object.css) object.css = object.css.replace(/```css/g, '').replace(/```/g, '').trim();
    if (object.javascript) object.javascript = object.javascript.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '').trim();

    return object;
}

// Zod schema for the AI edit response
const editResultSchema = z.object({
    html: z.string().describe('The full, updated outerHTML for the element.'),
    css: z.array(z.object({
        selector: z.string().describe('The full CSS selector.'),
        properties: z.string().describe('The CSS properties for the selector, e.g., "color: red; font-size: 16px;".'),
        media: z.string().optional().describe('The media query, if any, e.g., "@media (max-width: 600px)".')
    })).describe('An array of CSS rules that apply to the element. Include existing, modified, and new rules.'),
    javascript: z.string().describe('The full, updated JavaScript code. Return the entire script, including any changes. If no script is needed, return an empty string. Do not include <script> tags.')
});


/**
 * Generates an edited version of an element's code based on a prompt and context.
 * @param {string} prompt - The user's edit instruction.
 * @param {object} context - The context of the element being edited.
 * @param {string} context.html - The element's outerHTML.
 * @param {Array} context.css - Matching CSS rules.
 * @param {string} context.js - Relevant JS snippets.
 * @param {object} config - Configuration for the AI client and model.
 * @returns {Promise<{html: string, css: Array}>} The structured edit result.
 */
export async function generateEdit(prompt, context, config) {
    const client = createClient(config);
    const systemPrompt = `You are an expert web developer. The user wants to edit an element.
Your task is to modify the HTML, CSS, and/or JavaScript based on the instruction and return the result in a structured JSON object. If a screenshot is provided, use it as a visual reference for the current state of the element and its surroundings.
IMPORTANT: Return ONLY valid JSON. Do NOT wrap the response in markdown code blocks (like \`\`\`json). Just return the raw JSON string.`;

    const formattedCss = context.css.map(rule => {
        const formattedProperties = rule.properties
            .split(';')
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => `  ${p};`)
            .join('\n');
    
        const cssBlock = `${rule.selector} {\n${formattedProperties}\n}`;
    
        if (rule.media) {
            // Indent the rule block inside the media query
            const indentedRuleBlock = cssBlock.split('\n').map(line => `  ${line}`).join('\n');
            return `${rule.media} {\n${indentedRuleBlock}\n}`;
        }
        return cssBlock;
    }).join('\n\n');

    const fullPromptText = `You will be given the relevant code (HTML, CSS, JS) and an instruction.
- When the user asks for visual or styling changes, you MUST primarily modify the CSS rules. You should only modify the HTML if it is necessary to achieve the styling (e.g., adding a wrapper div for layout). Do not add or remove content unless explicitly asked.
- If a screenshot is provided, it shows the current state. Use it as a visual reference to understand the context of the user's request.
- Return the *full, updated* outerHTML for the element.
- Return *all* relevant CSS rules for the element, including existing, modified, and any new rules you create. Do not omit rules that were not changed.
- The **full JavaScript** for the page is provided. If the instruction requires JS changes, modify the script and return the **entire, updated script**. If no JS changes are needed, return the original script unmodified. If the script should be removed, return an empty string.
- The user's instruction is: "${prompt}"

Element Context:
---
HTML:
\`\`\`html
${context.html}
\`\`\`
---
CSS:
\`\`\`css
${formattedCss}
\`\`\`
---
JavaScript:
\`\`\`javascript
${context.js || 'No JavaScript on the page.'}
\`\`\`
---
`;

    const promptPayload = [{ type: 'text', text: fullPromptText }];
    if (context.screenshot) {
        promptPayload.push({ type: 'image', image: context.screenshot });
    }

    console.log("--- AI Edit Request ---");
    console.log("System Prompt:", systemPrompt);
    console.log("User Prompt (Full Context):", fullPromptText);

    // When using multimodal prompts (with images), we must use the `messages` array.
    // The `system` and `prompt` parameters are ignored when `messages` is provided.
    const { object } = await generateObject({
        model: client(config.model),
        schema: editResultSchema,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: promptPayload }
        ],
    });

    console.log("--- AI Edit Response ---");
    console.log("Received object:", JSON.parse(JSON.stringify(object)));

    // Sanitize AI output to remove markdown code blocks
    if (object.html) object.html = object.html.replace(/```html/g, '').replace(/```/g, '').trim();
    if (object.javascript) object.javascript = object.javascript.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '').trim();
    if (object.css && Array.isArray(object.css)) {
        object.css.forEach(rule => {
            if (rule.properties) {
                rule.properties = rule.properties.replace(/```css/g, '').replace(/```/g, '').trim();
            }
        });
    }

    return object;
}

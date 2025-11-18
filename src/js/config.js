export const PROVIDERS = {
    openai: {
        name: 'OpenAI',
        models: [
            { id: 'gpt-5.1', name: 'gpt-5.1' },
            { id: 'gpt-5-mini', name: 'gpt-5-mini' },
        ],
    },
    google: {
        name: 'Google',
        models: [
            { id: 'models/gemini-3-pro-preview', name: 'gemini-3-pro-preview' },
            { id: 'models/gemini-2.5-pro', name: 'gemini-2.5-pro' },
            { id: 'models/gemini-2.5-flash', name: 'gemini-2.5-flash' },
        ],
    },
    openrouter: {
        name: 'OpenRouter',
        models: [
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
            { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5 (Google via OR)' },
            { id: 'deepseek/deepseek-coder', name: 'Deepseek Coder' },
            { id: 'mistralai/mistral-large', name: 'Mistral Large' },
        ],
    },
    local: {
        name: 'Local/Custom',
        models: [], // User will provide custom model IDs
    }
};

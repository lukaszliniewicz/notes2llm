import { Notes2LLMCssManager } from './cssManager.js';
import { CommandHistory } from './commands.js';

const state = {
    iframeDoc: null,
    iframeWin: null,
    selectedElement: null,
    isResizing: false,
    originalJs: '',
    originalPrompt: '',
    previewModeActive: false,
    cssManager: new Notes2LLMCssManager(),
    gettingStartedVisible: true,
    commentedElements: new Map(),
    originalElementsSnapshot: new Map(),
    nextN2LId: 1,
    commandHistory: new CommandHistory(),
    prePreviewHTML: null,
    lastSelectedId: null,
    userScriptHasRun: false,
    activeSidebarTab: 'n2l-content-tab',
    editingMode: 'gui', // 'gui' or 'snap-to-code'

    // DOM Elements - will be populated in ui.js
    uiElements: {},
};

export default state;

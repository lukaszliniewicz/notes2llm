import state from './state.js';
import { assignN2LIdsToDom, ensureN2LId } from './domUtils.js';
import { populateControls, snapToCode, clearSnapToCodeHighlights } from './ui.js';
import { RemoveElementCommand, CopyElementCommand, MoveElementCommand } from './commands.js';

let lastHoveredElement = null;

export function handleIframeMouseOver(event) {
    // If in preview, not snap-to-code mode, or an element is already selected (pinned), do nothing on hover.
    if (state.previewModeActive || state.editingMode !== 'snap-to-code' || state.selectedElement) return;
    
    const hoveredElement = event.target;

    // Avoid re-highlighting the same element or non-selectable elements
    if (hoveredElement === lastHoveredElement || hoveredElement === state.iframeDoc.body || hoveredElement === state.iframeDoc.documentElement || (hoveredElement.id && hoveredElement.id.startsWith('n2l-'))) {
        return;
    }

    lastHoveredElement = hoveredElement;

    // In snap-to-code, we don't select on hover, we just highlight code.
    if (hoveredElement) {
        snapToCode(hoveredElement);
    }
}

export function handleIframeMouseOut(event) {
    if (state.previewModeActive || state.editingMode !== 'snap-to-code' || state.selectedElement) return;

    // The relatedTarget is the element the mouse is moving to.
    // If it's null or not in the same document, it means we're leaving the iframe window.
    if (!event.relatedTarget || event.relatedTarget.ownerDocument !== state.iframeDoc) {
        clearSnapToCodeHighlights();
        lastHoveredElement = null;
    }
}

// --- Element Selection & Control/Toolbar Management ---
export function handleIframeClick(event) {
    if (state.previewModeActive) return; // If in preview mode, don't handle clicks for selection
    
    // Don't select if a comment icon was clicked
    if (event.target.closest('.n2l-comment-indicator')) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    const clickedElement = event.target;

    if (clickedElement === state.iframeDoc.body || clickedElement === state.iframeDoc.documentElement || clickedElement.id === 'n2l-comment-icon-container') {
        deselectElement();
        return;
    }
    selectElement(clickedElement);
}

export function selectElement(element) {
    if (state.previewModeActive) return; // Ignore selection in preview mode
    
    if (state.selectedElement === element) {
        positionActionToolbar(); 
        updateAllCommentIconsPositions(); // Refresh icon positions too
        return;
    }

    deselectElement();

    const id = ensureN2LId(element);
    if (id) {
        // It's a new element that we just tagged. Add it to the snapshot to make it permanent.
        const cleanClasses = Array.from(element.classList).join(' ');
        state.originalElementsSnapshot.set(id, {
            className: cleanClasses,
            styleCssText: element.style.cssText
        });
    }

    state.selectedElement = element;
    state.selectedElement.classList.add('N2L_EDITOR_SELECTED');

    // Hide getting started section when first element is selected
    if (state.gettingStartedVisible) {
        const gettingStartedSection = document.querySelector('.n2l-getting-started');
        if (gettingStartedSection) {
            gettingStartedSection.style.display = 'none';
            state.gettingStartedVisible = false;
        }
    }

    if (state.editingMode === 'gui') {
        populateControls(state.selectedElement);
        state.uiElements.controlsPanel.style.display = 'block';
    } else if (state.editingMode === 'snap-to-code') {
        snapToCode(state.selectedElement);
        state.uiElements.snapToCodePanel.style.display = 'flex';
    }

    positionActionToolbar();
    updateAllCommentIconsPositions(); // Update icon positions on selection change
}


export function deselectElement() {
    if (state.selectedElement) {
        state.selectedElement.classList.remove('N2L_EDITOR_SELECTED');
        state.selectedElement.classList.remove('N2L_EDITOR_HOVER');
    }
    const hoverBtn = document.getElementById('n2l-toggle-hover-btn');
    if (hoverBtn) {
        hoverBtn.classList.remove('active');
    }
    state.selectedElement = null;

    // In GUI mode, hide the controls panel.
    // In snap-to-code, just clear highlights. The panel stays visible.
    if (state.editingMode === 'gui') {
        state.uiElements.controlsPanel.style.display = 'none';
    } else {
        clearSnapToCodeHighlights();
    }

    hideActionToolbar();
    state.uiElements.selectorIndicator.style.display = 'none';
}

export function hideActionToolbar() {
    state.uiElements.actionToolbar.style.display = 'none';
    state.uiElements.selectorIndicator.style.display = 'none';
}

export function positionActionToolbar() {
    if (!state.selectedElement || state.previewModeActive || !state.uiElements.actionToolbar) {
        hideActionToolbar();
        return;
    }

    const toolbar = state.uiElements.actionToolbar;
    
    // To measure, we need to make it display:block but invisible
    toolbar.style.display = 'block';
    toolbar.style.visibility = 'hidden';
    const toolbarHeight = toolbar.offsetHeight;
    const toolbarWidth = toolbar.offsetWidth;

    const iframeRect = state.uiElements.previewIframe.getBoundingClientRect(); 
    const elementRect = state.selectedElement.getBoundingClientRect(); 

    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    const elementAbs = {
        top: iframeRect.top + elementRect.top,
        bottom: iframeRect.top + elementRect.bottom,
        left: iframeRect.left + elementRect.left,
        width: elementRect.width
    };

    const GAP = 8;
    let top, left;

    // --- Vertical Positioning ---
    // Try to position above the element
    top = elementAbs.top - toolbarHeight - GAP;
    
    // If it goes off-screen at the top, try to position below
    if (top < GAP) {
        top = elementAbs.bottom + GAP;
    }

    // If it now goes off-screen at the bottom, the element is likely very tall.
    // Position it just inside the element at the top, respecting viewport boundaries.
    if (top + toolbarHeight > viewport.height - GAP) {
        top = Math.min(elementAbs.top + GAP, viewport.height - toolbarHeight - GAP);
        top = Math.max(GAP, top); // Ensure it's not off the top of the viewport
    }
    
    // --- Horizontal Positioning ---
    // Try to center it horizontally relative to the element
    left = elementAbs.left + (elementAbs.width / 2) - (toolbarWidth / 2);

    // Keep it within the viewport horizontally
    left = Math.max(GAP, left);
    left = Math.min(viewport.width - toolbarWidth - GAP, left);

    toolbar.style.top = `${top}px`;
    toolbar.style.left = `${left}px`;
    toolbar.style.visibility = 'visible';
    
    positionSelectorIndicator();
}

export function positionSelectorIndicator() {
    const { selectedElement, selectorIndicator, actionToolbar } = state.uiElements;
    if (!state.selectedElement || state.previewModeActive || !selectorIndicator || !actionToolbar.style.display || actionToolbar.style.display === 'none') {
        if(selectorIndicator) selectorIndicator.style.display = 'none';
        return;
    }
    
    const tagName = state.selectedElement.tagName.toLowerCase();
    const id = state.selectedElement.id ? `#${state.selectedElement.id}` : '';
    const classes = state.selectedElement.classList.length > 0 ? 
        Array.from(state.selectedElement.classList)
            .filter(c => c !== 'N2L_EDITOR_SELECTED')
            .map(c => `.${c}`)
            .join('') : '';
            
    let selectorText = id ? id : (classes ? `${tagName}${classes}` : tagName);
    
    selectorIndicator.textContent = selectorText;
    
    selectorIndicator.style.display = 'block';
    selectorIndicator.style.visibility = 'hidden';
    const indicatorHeight = selectorIndicator.offsetHeight;

    const toolbarRect = actionToolbar.getBoundingClientRect(); // Relative to viewport
    const GAP = 2;

    // Try to position above toolbar
    let top = toolbarRect.top - indicatorHeight - GAP;
    
    // If it's off-screen at the top, position below
    if (top < GAP) {
        top = toolbarRect.bottom + GAP;
    }
    
    selectorIndicator.style.top = `${top}px`;
    selectorIndicator.style.left = `${toolbarRect.left}px`;
    selectorIndicator.style.visibility = 'visible';
}

export function ensureSelectedElementIsVisible() {
    if (state.selectedElement) {
        // Using a small timeout allows the browser to reflow the layout
        // after a change, ensuring we scroll to the correct new position.
        setTimeout(() => {
            if (state.selectedElement) { // Check again in case it was deselected
                state.selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50); // A small delay is usually enough
    }
}

// --- Toolbar Actions ---
export function removeSelectedElement() {
    if (!state.selectedElement) return;
    const command = new RemoveElementCommand(state.selectedElement);
    state.commandHistory.execute(command);
    deselectElement();
    updateAllCommentIconsPositions();
}

export function copyElement() {
    if (!state.selectedElement) return;
    const command = new CopyElementCommand(state.selectedElement);
    state.commandHistory.execute(command);
}

export function moveElementUp() {
    if (!state.selectedElement || !state.selectedElement.previousElementSibling) return;
    const command = new MoveElementCommand(state.selectedElement, 'up');
    state.commandHistory.execute(command);
}

export function moveElementDown() {
    if (!state.selectedElement || !state.selectedElement.nextElementSibling) return;
    const command = new MoveElementCommand(state.selectedElement, 'down');
    state.commandHistory.execute(command);
}

export function toggleHoverState() {
    if (!state.selectedElement) return;
    state.selectedElement.classList.toggle('N2L_EDITOR_HOVER');
    
    const hoverBtn = document.getElementById('n2l-toggle-hover-btn');
    if (hoverBtn) {
        hoverBtn.classList.toggle('active');
    }
    
    populateControls(state.selectedElement);
}

export function toggleElementState() {
    if (!state.selectedElement) return;

    // To allow JS-driven elements to function, we need to execute the user's script once.
    if (state.originalJs && state.originalJs.trim() !== '' && !state.userScriptHasRun) {
        try {
            const scriptElement = state.iframeDoc.createElement('script');
            scriptElement.textContent = state.originalJs;
            state.iframeDoc.body.appendChild(scriptElement);
            
            const domLoadedEvent = new Event('DOMContentLoaded', {
                bubbles: true,
                cancelable: true
            });
            state.iframeDoc.dispatchEvent(domLoadedEvent);
            state.userScriptHasRun = true;
        } catch (error) {
            console.error("Error executing user JavaScript for state toggle:", error);
        }
    }
    
    // Temporarily disable the editor's click handler to let the element's own handler run
    state.iframeDoc.body.removeEventListener('click', handleIframeClick, true);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: state.iframeWin });
    state.selectedElement.dispatchEvent(clickEvent);

    // Re-enable the editor's click handler after the event has been processed.
    // This ensures subsequent clicks are for selecting elements, not triggering JS again.
    setTimeout(() => {
        if (state.iframeDoc && state.iframeDoc.body) {
            state.iframeDoc.body.addEventListener('click', handleIframeClick, true);
        }
    }, 0);
    // Don't re-select. The user can now select any newly revealed elements.
}

// --- Comment Icon Logic ---
export function ensureIconContainer() {
    if (!state.iframeDoc || !state.iframeDoc.body) return null;
    let container = state.iframeDoc.getElementById('n2l-comment-icon-container');
    if (!container) {
        container = state.iframeDoc.createElement('div');
        container.id = 'n2l-comment-icon-container';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.pointerEvents = 'none'; 
        container.style.zIndex = '1001'; 
        state.iframeDoc.body.appendChild(container);
    }
    container.style.width = `${state.iframeDoc.body.scrollWidth}px`;
    container.style.height = `${state.iframeDoc.body.scrollHeight}px`;
    return container;
}

export function addCommentForElement() {
    if (!state.selectedElement) return;
    const commentText = prompt("Enter comment text for the LLM:", "TODO: Refine this section");
    if (commentText === null || commentText.trim() === "") return;

    const commentNode = state.iframeDoc.createComment(` N2L_COMMENT: ${commentText.trim()} `);
    const targetElement = state.selectedElement; 

    targetElement.parentNode.insertBefore(commentNode, targetElement);
    createOrUpdateCommentIcon(targetElement, commentNode, 'above');
    updateAllCommentIconsPositions();
}

export function createOrUpdateCommentIcon(element, commentNode, position) {
    const iconContainer = ensureIconContainer();
    if (!iconContainer) return;

    if (state.commentedElements.has(element)) {
        const oldEntry = state.commentedElements.get(element);
        if (oldEntry.iconElement && oldEntry.iconElement.parentNode) {
            oldEntry.iconElement.remove();
        }
    }

    const iconElement = state.iframeDoc.createElement('div');
    iconElement.className = 'n2l-comment-indicator';
    iconElement.innerHTML = '<i class="fas fa-comment-dots"></i>';
    iconElement.title = "Edit/View Comment";
    iconContainer.appendChild(iconElement);
    iconElement.style.pointerEvents = 'auto';

    state.commentedElements.set(element, { commentNode, iconElement, position });

    iconElement.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCommentIconClick(element);
    });
}

function handleCommentIconClick(element) {
    const entry = state.commentedElements.get(element);
    if (!entry) return;

    const currentCommentText = entry.commentNode.nodeValue.replace(/^ N2L_COMMENT: /, '').replace(/ $/, '').trim();
    const newCommentText = prompt("Edit comment (leave empty to delete):", currentCommentText);

    if (newCommentText === null) return;

    if (newCommentText.trim() === "") { 
        if(entry.commentNode.parentNode) entry.commentNode.remove();
        if(entry.iconElement.parentNode) entry.iconElement.remove();
        state.commentedElements.delete(element);
    } else { 
        entry.commentNode.nodeValue = ` N2L_COMMENT: ${newCommentText.trim()} `;
    }
}

function positionCommentIcon(element, iconElement) {
    if (!element || !iconElement || !element.parentNode || !iconElement.parentNode) {
        if (iconElement && iconElement.parentNode) iconElement.remove();
        if (state.commentedElements.has(element)) state.commentedElements.delete(element);
        return;
    }
    const elementRect = element.getBoundingClientRect(); 
    
    const iconWidth = 20;
    const iconHeight = 20;
    const H_OFFSET = -iconWidth / 2; 
    const V_OFFSET = -iconHeight / 2; 

    const iframeScrollTop = state.iframeWin.pageYOffset || state.iframeDoc.documentElement.scrollTop;
    const iframeScrollLeft = state.iframeWin.pageXOffset || state.iframeDoc.documentElement.scrollLeft;

    let top = elementRect.top + iframeScrollTop + V_OFFSET;
    let left = elementRect.right + iframeScrollLeft + H_OFFSET;
    
    const container = iconElement.parentNode;
    if (container) {
        top = Math.max(0, Math.min(top, container.scrollHeight - iconHeight));
        left = Math.max(0, Math.min(left, container.scrollWidth - iconWidth));
    }

    iconElement.style.top = `${top}px`;
    iconElement.style.left = `${left}px`;
    iconElement.style.display = 'flex';
}

export function updateAllCommentIconsPositions() {
    if (!state.iframeDoc || !state.iframeDoc.body) return;
    const iconContainer = ensureIconContainer();
    if (!iconContainer) return;

    for (const [element, entry] of state.commentedElements) {
        if (element.isConnected && entry.iconElement.isConnected) {
            positionCommentIcon(element, entry.iconElement);
        } else {
            if (entry.iconElement.isConnected) entry.iconElement.remove();
            state.commentedElements.delete(element);
        }
    }
}

export function scanForExistingComments() {
    if (!state.iframeDoc || !state.iframeDoc.body) return;
    ensureIconContainer();

    const treeWalker = state.iframeDoc.createTreeWalker(state.iframeDoc.body, NodeFilter.SHOW_COMMENT, null, false);
    let commentNode;
    const newCommentEntries = new Map();

    while (commentNode = treeWalker.nextNode()) {
        if (commentNode.nodeValue.includes('N2L_COMMENT:')) {
            let associatedElement = null;
            let position = null;

            if (commentNode.nextSibling && commentNode.nextSibling.nodeType === Node.ELEMENT_NODE) {
                associatedElement = commentNode.nextSibling;
                position = 'above';
            } else if (commentNode.previousSibling && commentNode.previousSibling.nodeType === Node.ELEMENT_NODE) {
                associatedElement = commentNode.previousSibling;
                position = 'below';
            }

            if (associatedElement) {
                if (!state.commentedElements.has(associatedElement) && !newCommentEntries.has(associatedElement)) {
                    newCommentEntries.set(associatedElement, { commentNode, position });
                }
            }
        }
    }
    for (const [element, data] of newCommentEntries) {
        createOrUpdateCommentIcon(element, data.commentNode, data.position);
    }
    updateAllCommentIconsPositions();
}

// Rebuilds the snapshot of original element states. This is the "source of truth" for exports.
export function rebuildOriginalElementsSnapshot() {
    if (!state.iframeDoc || !state.iframeDoc.body) return;
    state.originalElementsSnapshot.clear();

    const elements = state.iframeDoc.body.querySelectorAll('[data-n2l-id]');
    elements.forEach(el => {
        const id = el.getAttribute('data-n2l-id');
        if (id) {
            state.originalElementsSnapshot.set(id, {
                className: el.className,
                styleCssText: el.style.cssText
            });
        }
    });
}

// --- Preview Mode ---

function reinitializeEditorState() {
    state.iframeDoc.body.addEventListener('click', handleIframeClick, true);

    // Re-create comment icons and map from comment nodes in the restored DOM
    scanForExistingComments();
    
    // Refresh styles from the CSS Manager, which might have been changed by AI before preview
    refreshIframeStyles();

    // If an element was selected, find it again by ID and re-select it
    if (state.lastSelectedId) {
        const elementToReselect = state.iframeDoc.querySelector(`[data-n2l-id="${state.lastSelectedId}"]`);
        if (elementToReselect) {
            selectElement(elementToReselect);
        } else {
            deselectElement();
        }
        state.lastSelectedId = null;
    } else {
        deselectElement();
    }
    
    // Disable link navigation again for editor mode
    const links = state.iframeDoc.getElementsByTagName('a');
    for (const link of links) {
        link.style.pointerEvents = 'none';
    }
}


export function togglePreviewMode() {
    if (!state.iframeDoc || !state.iframeDoc.body) {
        state.previewModeActive = false;
        state.uiElements.previewModeBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
        state.uiElements.previewModeBtn.classList.remove('preview-active');
        return;
    }

    state.previewModeActive = !state.previewModeActive;

    if (state.previewModeActive) {
        // ENTERING PREVIEW MODE
        state.lastSelectedId = state.selectedElement ? state.selectedElement.getAttribute('data-n2l-id') : null;
        deselectElement();
        
        // Scenario 3: Fix Hover State Desync
        // Explicitly clean up editor classes BEFORE taking the snapshot
        const hoveredElements = state.iframeDoc.querySelectorAll('.N2L_EDITOR_HOVER');
        hoveredElements.forEach(el => el.classList.remove('N2L_EDITOR_HOVER'));
        
        const selectedElements = state.iframeDoc.querySelectorAll('.N2L_EDITOR_SELECTED');
        selectedElements.forEach(el => el.classList.remove('.N2L_EDITOR_SELECTED'));

        // 1. Snapshot the current DOM state, including all user edits
        state.prePreviewHTML = state.iframeDoc.body.innerHTML;

        // 2. Setup preview mode (enable links, run JS)
        setupPreviewMode();

    } else {
        // EXITING PREVIEW MODE
        
        // 1. Restore the DOM from snapshot
        if (state.prePreviewHTML) {
            state.iframeDoc.body.innerHTML = state.prePreviewHTML;
            state.prePreviewHTML = null;
        }
        
        // 2. Re-initialize editor state on the restored DOM
        reinitializeEditorState();

        // 3. Update UI
        state.uiElements.previewModeBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
        state.uiElements.previewModeBtn.classList.remove('preview-active');
        state.uiElements.previewIframe.classList.remove('preview-mode-frame');
        state.uiElements.previewModeIndicator.style.display = 'none';
    }
}

function setupPreviewMode() {
    state.iframeDoc.body.removeEventListener('click', handleIframeClick, true);
    
    const iconContainer = state.iframeDoc.getElementById('n2l-comment-icon-container');
    if (iconContainer) iconContainer.style.display = 'none';

    const links = state.iframeDoc.getElementsByTagName('a');
    for (const link of links) {
        link.style.pointerEvents = 'auto';
    }
    
    // Execute JavaScript
    if (state.originalJs && state.originalJs.trim() !== '') {
        try {
            // Remove any script tags we might have added in a previous preview
            const oldScripts = state.iframeDoc.querySelectorAll('script.n2l-preview-script');
            oldScripts.forEach(s => s.remove());

            const scriptElement = state.iframeDoc.createElement('script');
            scriptElement.className = 'n2l-preview-script';
            scriptElement.textContent = state.originalJs;
            state.iframeDoc.body.appendChild(scriptElement);
            
            const domLoadedEvent = new Event('DOMContentLoaded', {
                bubbles: true,
                cancelable: true
            });
            state.iframeDoc.dispatchEvent(domLoadedEvent);
            
        } catch (error) {
            console.error("Error executing user JavaScript in preview mode:", error);
        }
    }
    
    state.uiElements.previewModeBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Exit Preview';
    state.uiElements.previewModeBtn.classList.add('preview-active');
    state.uiElements.previewIframe.classList.add('preview-mode-frame');
    state.uiElements.previewModeIndicator.style.display = 'block';
}

export function refreshIframeStyles() {
    if (!state.iframeDoc) return;
    let styleTag = state.iframeDoc.head.querySelector('#n2l-styles');
    if (!styleTag) {
        styleTag = state.iframeDoc.createElement('style');
        styleTag.id = 'n2l-styles';
        state.iframeDoc.head.appendChild(styleTag);
    }
    
    const editorStyles = `
        /* Basic iframe body style */
        body { margin: 8px; padding: 0; font-family: 'Roboto', sans-serif; position: relative; /* For icon container */ }
        /* Editor selection style */
        .N2L_EDITOR_SELECTED { 
            outline: 2px dashed #384D68 !important; 
            box-shadow: 0 0 10px rgba(56, 77, 104, 0.5); 
            cursor: default; /* Indicate it's selectable */
        }
        /* Prevent link navigation in editor mode */
        a { pointer-events: none; } 

        /* Comment Indicator Icon Style */
        .n2l-comment-indicator {
            position: absolute; /* Will be positioned by JS */
            width: 20px;
            height: 20px;
            background-color: #2196F3; /* Blue */
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            cursor: pointer;
            z-index: 1002; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            border: 1px solid #0d47a1; /* Darker blue border */
            transition: transform 0.1s ease-out;
        }
        .n2l-comment-indicator:hover {
            transform: scale(1.1);
        }
        .n2l-comment-indicator i {
            pointer-events: none;
        }
    `;
    
    const generatedCss = state.cssManager.generateCss();
    let hoverCss = '';
    
    state.cssManager.cssRules.forEach(rule => {
        if (rule.selector !== '@raw' && rule.selector.includes(':hover')) {
            const newSelector = rule.selector
                .split(',')
                .map(s => s.trim())
                .map(s => {
                    if (s.includes(':hover')) {
                        return s.replace(/:hover/g, '.N2L_EDITOR_HOVER');
                    }
                    return null;
                })
                .filter(Boolean)
                .join(', ');

            if (newSelector) {
                hoverCss += `${newSelector} {\n    ${rule.properties}\n}\n\n`;
            }
        }
    });
    
    styleTag.textContent = editorStyles + generatedCss + hoverCss;
}

import state from './state.js';
import { selectElement, deselectElement, scanForExistingComments, updateAllCommentIconsPositions, createOrUpdateCommentIcon, rebuildOriginalElementsSnapshot, refreshIframeStyles } from './editor.js';
import { assignN2LIdsToDom } from './domUtils.js';

// Helper to add an element and its children to the snapshot
function addElementTreeToSnapshot(element) {
    if (!element || typeof element.querySelectorAll !== 'function') return;
    const elements = [element, ...element.querySelectorAll('*')];
    elements.forEach(el => {
        const id = el.getAttribute('data-n2l-id');
        if (id) {
            const cleanClasses = Array.from(el.classList)
                .filter(c => c !== 'N2L_EDITOR_SELECTED')
                .join(' ');
            state.originalElementsSnapshot.set(id, {
                className: cleanClasses,
                styleCssText: el.style.cssText
            });
        }
    });
}

// Helper to remove an element and its children from the snapshot
function removeElementTreeFromSnapshot(element) {
    if (!element || typeof element.querySelectorAll !== 'function') return;
    const elements = [element, ...element.querySelectorAll('*')];
    elements.forEach(el => {
        const id = el.getAttribute('data-n2l-id');
        if (id) {
            state.originalElementsSnapshot.delete(id);
        }
    });
}


// Command History System for Undo/Redo
export class CommandHistory {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistorySize = 100;
        this.isExecutingCommand = false;
    }
    
    execute(command) {
        if (this.isExecutingCommand) return; // Prevent recursion
        
        this.isExecutingCommand = true;
        try {
            command.execute();
            this.undoStack.push(command);
            this.redoStack = []; // Clear redo stack on new action
            
            // Limit history size
            if (this.undoStack.length > this.maxHistorySize) {
                this.undoStack.shift();
            }
            
            this.updateUI();
        } finally {
            this.isExecutingCommand = false;
        }
    }
    
    undo() {
        if (this.undoStack.length === 0) return;
        
        this.isExecutingCommand = true;
        try {
            const command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
            this.updateUI();
        } finally {
            this.isExecutingCommand = false;
        }
    }
    
    redo() {
        if (this.redoStack.length === 0) return;
        
        this.isExecutingCommand = true;
        try {
            const command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
            this.updateUI();
        } finally {
            this.isExecutingCommand = false;
        }
    }
    
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.updateUI();
    }
    
    updateUI() {
        // Update undo/redo button states
        const undoBtn = document.getElementById('n2l-undo-btn');
        const redoBtn = document.getElementById('n2l-redo-btn');
        
        if (undoBtn) undoBtn.disabled = this.undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
    }
}

// Base command class
class BaseCommand {
    constructor(description) {
        this.description = description;
        this.timestamp = Date.now();
    }

    toJSON() {
        return {
            description: this.description,
            timestamp: this.timestamp
        };
    }
}

export class FullCssChangeCommand extends BaseCommand {
    constructor(oldCss, newCss) {
        super('Change full CSS');
        this.oldCss = oldCss;
        this.newCss = newCss;
    }

    execute() {
        state.cssManager.parseCss(this.newCss);
        refreshIframeStyles();
        
        // FIX: Use this.newCss directly to preserve user's indentation/formatting
        // instead of regenerating it from the parsed rules.
        if (state.uiElements.cmSnapCss) {
            state.uiElements.cmSnapCss.setValue(this.newCss);
            setTimeout(() => state.uiElements.cmSnapCss.refresh(), 1);
        }
        if (state.uiElements.cmFullCssEditor) {
            state.uiElements.cmFullCssEditor.setValue(this.newCss);
            setTimeout(() => state.uiElements.cmFullCssEditor.refresh(), 1);
        }
    }

    undo() {
        state.cssManager.parseCss(this.oldCss);
        refreshIframeStyles();
        
        // Sync editors
        if (state.uiElements.cmSnapCss) {
            state.uiElements.cmSnapCss.setValue(this.oldCss);
        }
        if (state.uiElements.cmFullCssEditor) {
            state.uiElements.cmFullCssEditor.setValue(this.oldCss);
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'FullCssChangeCommand',
            oldCss: this.oldCss,
            newCss: this.newCss
        };
    }
}

// Command for text changes
export class TextChangeCommand extends BaseCommand {
    constructor(element, oldContent, newContent, isWYSIWYG = false) {
        super('Change text');
        this.element = element;
        this.elementId = element.getAttribute('data-n2l-id');
        this.oldContent = oldContent;
        this.newContent = newContent;
        this.isWYSIWYG = isWYSIWYG;
        this.tagName = element.tagName.toLowerCase();
    }
    
    execute() {
        const el = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementId}"]`);
        if (!el) return;
        
        if (this.tagName === 'textarea') {
            el.value = this.newContent;
        } else if (this.isWYSIWYG) {
            el.innerHTML = this.newContent;
            assignN2LIdsToDom(el);
            addElementTreeToSnapshot(el);
        } else {
            el.textContent = this.newContent;
        }
        
        // Re-select element if it was selected
        if (state.selectedElement && state.selectedElement.getAttribute('data-n2l-id') === this.elementId) {
            selectElement(el);
        }
    }
    
    undo() {
        const el = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementId}"]`);
        if (!el) return;
        
        if (this.tagName === 'textarea') {
            el.value = this.oldContent;
        } else if (this.isWYSIWYG) {
            el.innerHTML = this.oldContent;
            assignN2LIdsToDom(el);
            addElementTreeToSnapshot(el);
        } else {
            el.textContent = this.oldContent;
        }
        
        if (state.selectedElement && state.selectedElement.getAttribute('data-n2l-id') === this.elementId) {
            selectElement(el);
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'TextChangeCommand',
            elementId: this.elementId,
            oldContent: this.oldContent,
            newContent: this.newContent,
            isWYSIWYG: this.isWYSIWYG,
            tagName: this.tagName
        };
    }
}

// Command for CSS rule changes
export class CSSRuleChangeCommand extends BaseCommand {
    constructor(selector, oldProperties, newProperties, media) {
        super('Change CSS rule');
        this.selector = selector;
        this.oldProperties = oldProperties;
        this.newProperties = newProperties;
        this.media = media;
    }

    execute() {
        const ruleIndex = state.cssManager.cssRules.findIndex(rule => rule.selector === this.selector && rule.media === this.media);
        if (ruleIndex !== -1) {
            state.cssManager.cssRules[ruleIndex].properties = this.newProperties;
        }
    }

    undo() {
        const ruleIndex = state.cssManager.cssRules.findIndex(rule => rule.selector === this.selector && rule.media === this.media);
        if (ruleIndex !== -1) {
            state.cssManager.cssRules[ruleIndex].properties = this.oldProperties;
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'CSSRuleChangeCommand',
            selector: this.selector,
            oldProperties: this.oldProperties,
            newProperties: this.newProperties,
            media: this.media
        };
    }
}

// Command for adding CSS rules
export class AddCSSRuleCommand extends BaseCommand {
    constructor(selector, properties, elementId = null, applyToElement = false, media = null) {
        super('Add CSS rule');
        this.selector = selector;
        this.properties = properties;
        this.elementId = elementId;
        this.applyToElement = applyToElement;
        this.media = media;
        this.previousClasses = null;
        this.previousId = null;
    }
    
    execute() {
        state.cssManager.addRule(this.selector, this.properties, this.media);
        
        if (this.applyToElement && this.elementId) {
            const el = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementId}"]`);
            if (el) {
                this.previousClasses = el.className;
                this.previousId = el.id;
                
                if (this.selector.startsWith('.')) {
                    const className = this.selector.substring(1);
                    if (!el.classList.contains(className)) {
                        el.classList.add(className);
                    }
                } else if (this.selector.startsWith('#')) {
                    const idName = this.selector.substring(1);
                    el.id = idName;
                }
            }
        }
    }
    
    undo() {
        state.cssManager.deleteRule(this.selector, this.media);
        
        if (this.applyToElement && this.elementId) {
            const el = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementId}"]`);
            if (el) {
                el.className = this.previousClasses || '';
                el.id = this.previousId || '';
            }
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'AddCSSRuleCommand',
            selector: this.selector,
            properties: this.properties,
            elementId: this.elementId,
            applyToElement: this.applyToElement,
            media: this.media,
            previousClasses: this.previousClasses,
            previousId: this.previousId
        };
    }
}

// Command for removing CSS rules
export class RemoveCSSRuleCommand extends BaseCommand {
    constructor(selector, properties, media) {
        super('Remove CSS rule');
        this.selector = selector;
        this.properties = properties; // needed for undo
        this.media = media;
    }

    execute() {
        state.cssManager.deleteRule(this.selector, this.media);
    }

    undo() {
        state.cssManager.addRule(this.selector, this.properties, this.media);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'RemoveCSSRuleCommand',
            selector: this.selector,
            properties: this.properties,
            media: this.media
        };
    }
}

// Command for element removal
export class RemoveElementCommand extends BaseCommand {
    constructor(element) {
        super('Remove element');
        this.elementId = element.getAttribute('data-n2l-id');
        
        // Parent might not be an element (could be document fragment, etc)
        this.parentId = element.parentNode && element.parentNode.getAttribute ? 
            element.parentNode.getAttribute('data-n2l-id') : null;
        
        // Find next ELEMENT sibling, not just any sibling
        let nextElementSibling = element.nextElementSibling;
        this.nextSiblingId = nextElementSibling ? 
            nextElementSibling.getAttribute('data-n2l-id') : null;
        
        this.elementHtml = element.outerHTML;
        this.commentData = state.commentedElements.get(element);
    }
    
    execute() {
        const el = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementId}"]`);
        if (!el) return;
        
        // Remove comment if exists
        if (this.commentData) {
            if (this.commentData.commentNode.parentNode) {
                this.commentData.commentNode.remove();
            }
            if (this.commentData.iconElement.parentNode) {
                this.commentData.iconElement.remove();
            }
            state.commentedElements.delete(el);
        }
        
        el.remove();
    }
    
    undo() {
        const parent = state.iframeDoc.querySelector(`[data-n2l-id="${this.parentId}"]`);
        if (!parent) return;
        
        const temp = state.iframeDoc.createElement('div');
        temp.innerHTML = this.elementHtml;
        const restoredElement = temp.firstChild;
        
        if (this.nextSiblingId) {
            const nextSibling = state.iframeDoc.querySelector(`[data-n2l-id="${this.nextSiblingId}"]`);
            if (nextSibling && nextSibling.parentNode === parent) {
                parent.insertBefore(restoredElement, nextSibling);
            } else {
                // Next sibling no longer exists or moved, append to parent
                parent.appendChild(restoredElement);
            }
        } else {
            parent.appendChild(restoredElement);
        }
        
        // Restore comment if it existed
        if (this.commentData) {
            createOrUpdateCommentIcon(restoredElement, this.commentData.commentNode, this.commentData.position);
        }
    }

    toJSON() {
        // Note: commentData is not easily serializable as it contains DOM nodes.
        // On import, comments will be re-scanned from the HTML, so we don't need to store it.
        return {
            ...super.toJSON(),
            type: 'RemoveElementCommand',
            elementId: this.elementId,
            parentId: this.parentId,
            nextSiblingId: this.nextSiblingId,
            elementHtml: this.elementHtml
        };
    }
}

// Command for HTML changes
export class HTMLChangeCommand extends BaseCommand {
    constructor(element, oldHtml, newHtml) {
        super('Change HTML');
        this.elementId = element.getAttribute('data-n2l-id');
        
        // Parent might not be an element
        this.parentId = element.parentNode && element.parentNode.getAttribute ? 
            element.parentNode.getAttribute('data-n2l-id') : null;
        
        // Find next ELEMENT sibling
        let nextElementSibling = element.nextElementSibling;
        this.nextSiblingId = nextElementSibling ? 
            nextElementSibling.getAttribute('data-n2l-id') : null;
        
        this.oldHtml = oldHtml;
        this.newHtml = newHtml;
        this.oldCommentData = state.commentedElements.get(element);
    }
    
    execute() {
        const parent = state.iframeDoc.querySelector(`[data-n2l-id="${this.parentId}"]`);
        const oldElement = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementId}"]`);
        if (!parent || !oldElement) return;
        
        const temp = state.iframeDoc.createElement('div');
        temp.innerHTML = this.newHtml;
        const newElement = temp.firstElementChild;

        if (!newElement) {
            console.error("AI returned invalid HTML that doesn't contain an element. Aborting.");
            return;
        }

        removeElementTreeFromSnapshot(oldElement);
        
        // Preserve data-n2l-id
        newElement.setAttribute('data-n2l-id', this.elementId);
        
        parent.replaceChild(newElement, oldElement);
        
        assignN2LIdsToDom(newElement);
        addElementTreeToSnapshot(newElement);

        if (state.selectedElement) selectElement(newElement);
        scanForExistingComments();
        updateAllCommentIconsPositions();
    }
    
    undo() {
        const parent = state.iframeDoc.querySelector(`[data-n2l-id="${this.parentId}"]`);
        const currentElement = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementId}"]`);
        if (!parent || !currentElement) return;
        
        const temp = state.iframeDoc.createElement('div');
        temp.innerHTML = this.oldHtml;
        const oldElement = temp.firstElementChild;

        if (!oldElement) {
            console.error("Cannot undo HTMLChangeCommand: original HTML appears to be invalid.");
            return;
        }
        
        removeElementTreeFromSnapshot(currentElement);

        oldElement.setAttribute('data-n2l-id', this.elementId);
        
        parent.replaceChild(oldElement, currentElement);
        
        addElementTreeToSnapshot(oldElement);

        // Restore comment if it existed
        if (this.oldCommentData) {
            createOrUpdateCommentIcon(oldElement, this.oldCommentData.commentNode, this.oldCommentData.position);
        }
        
        if (state.selectedElement) selectElement(oldElement);
        updateAllCommentIconsPositions();
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'HTMLChangeCommand',
            elementId: this.elementId,
            parentId: this.parentId,
            nextSiblingId: this.nextSiblingId,
            oldHtml: this.oldHtml,
            newHtml: this.newHtml
        };
    }
}

// Command for copying elements
export class CopyElementCommand extends BaseCommand {
    constructor(element) {
        super('Copy element');
        this.elementToCopyId = element.getAttribute('data-n2l-id');
        this.parentId = element.parentNode.getAttribute('data-n2l-id');
        this.copiedElementId = null; // Will be set on execute
    }

    execute() {
        const elementToCopy = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementToCopyId}"]`);
        if (!elementToCopy) return;

        const clone = elementToCopy.cloneNode(true);
        clone.classList.remove('N2L_EDITOR_SELECTED');

        // Strip old IDs and assign new ones
        clone.removeAttribute('data-n2l-id');
        clone.querySelectorAll('[data-n2l-id]').forEach(child => child.removeAttribute('data-n2l-id'));
        assignN2LIdsToDom(clone);
        
        this.copiedElementId = clone.getAttribute('data-n2l-id');
        
        addElementTreeToSnapshot(clone);

        elementToCopy.parentNode.insertBefore(clone, elementToCopy.nextSibling);
        updateAllCommentIconsPositions();
        selectElement(clone);
    }

    undo() {
        const copiedElement = state.iframeDoc.querySelector(`[data-n2l-id="${this.copiedElementId}"]`);
        if (copiedElement) {
            removeElementTreeFromSnapshot(copiedElement);
            copiedElement.remove();
        }
        // Re-select original element
        const originalElement = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementToCopyId}"]`);
        if (originalElement) {
            selectElement(originalElement);
        } else {
            deselectElement();
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'CopyElementCommand',
            elementToCopyId: this.elementToCopyId,
            parentId: this.parentId,
            copiedElementId: this.copiedElementId
        };
    }
}

// Command for replacing the entire body HTML
export class FullHtmlChangeCommand extends BaseCommand {
    constructor(oldHtml, newHtml) {
        super('Change full HTML');
        this.oldHtml = oldHtml;
        this.newHtml = newHtml;
    }

    _applyHtml(html) {
        deselectElement();
        state.iframeDoc.body.innerHTML = html;
        
        // Re-initialize state based on the new DOM
        assignN2LIdsToDom(state.iframeDoc.body);
        scanForExistingComments();
        rebuildOriginalElementsSnapshot(); // This is the key: reset the "source of truth"
        updateAllCommentIconsPositions();
    }

    execute() {
        this._applyHtml(this.newHtml);
    }

    undo() {
        this._applyHtml(this.oldHtml);
        // Fix: Rebuild snapshot so subsequent individual edits work correctly
        rebuildOriginalElementsSnapshot(); 
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'FullHtmlChangeCommand',
            oldHtml: this.oldHtml,
            newHtml: this.newHtml
        };
    }
}

// Command for moving an element
export class MoveElementCommand extends BaseCommand {
    constructor(element, direction) {
        super(`Move element ${direction}`);
        this.elementId = element.getAttribute('data-n2l-id');
        this.direction = direction; // 'up' or 'down'

        this.parentId = element.parentNode.getAttribute('data-n2l-id');

        // Store original position
        this.originalNextSiblingId = element.nextElementSibling ? element.nextElementSibling.getAttribute('data-n2l-id') : null;
    }

    _moveAssociatedComments(element) {
        if (!element || !element.parentNode) return;
        const parent = element.parentNode;
        
        // Find comment data for the element by its persistent ID
        let commentData;
        for (const [key, value] of state.commentedElements.entries()) {
            if (key.getAttribute('data-n2l-id') === this.elementId) {
                commentData = value;
                break;
            }
        }
        
        if (commentData && commentData.commentNode && commentData.commentNode.parentNode) {
            if (commentData.position === 'above') {
                parent.insertBefore(commentData.commentNode, element);
            } else if (commentData.position === 'below') {
                parent.insertBefore(commentData.commentNode, element.nextSibling);
            }
        }
    }

    execute() {
        const element = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementId}"]`);
        if (!element || !element.parentNode) return;

        const parent = element.parentNode;

        if (this.direction === 'up') {
            const previousElement = element.previousElementSibling;
            if (previousElement) {
                parent.insertBefore(element, previousElement);
                this._moveAssociatedComments(element);
            }
        } else { // 'down'
            const nextElement = element.nextElementSibling;
            if (nextElement) {
                parent.insertBefore(element, nextElement.nextElementSibling);
                this._moveAssociatedComments(element);
            }
        }
        // Fix: Use requestAnimationFrame to wait for repaint before calculating positions
        requestAnimationFrame(() => {
            updateAllCommentIconsPositions();
            selectElement(element);
        });
    }

    undo() {
        const element = state.iframeDoc.querySelector(`[data-n2l-id="${this.elementId}"]`);
        const parent = state.iframeDoc.querySelector(`[data-n2l-id="${this.parentId}"]`);
        if (!element || !parent) return;

        const originalNextSibling = this.originalNextSiblingId ? state.iframeDoc.querySelector(`[data-n2l-id="${this.originalNextSiblingId}"]`) : null;
        
        parent.insertBefore(element, originalNextSibling); // If originalNextSibling is null, it appends to the end, which is correct.
        this._moveAssociatedComments(element);
        
        updateAllCommentIconsPositions();
        // Fix: Use requestAnimationFrame to wait for repaint before calculating positions
        requestAnimationFrame(() => {
            selectElement(element);
        });
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'MoveElementCommand',
            elementId: this.elementId,
            direction: this.direction,
            parentId: this.parentId,
            originalNextSiblingId: this.originalNextSiblingId
        };
    }
}

// Command for JavaScript changes
export class JSChangeCommand extends BaseCommand {
    constructor(oldJs, newJs) {
        super('Change JavaScript');
        this.oldJs = oldJs;
        this.newJs = newJs;
    }
    
    execute() {
        state.originalJs = this.newJs;
        state.userScriptHasRun = false;
        if(state.uiElements.cmFullJsEditor) {
            state.uiElements.cmFullJsEditor.setValue(state.originalJs);
        }
        if(state.uiElements.cmSnapJs) {
            state.uiElements.cmSnapJs.setValue(state.originalJs);
        }
    }
    
    undo() {
        state.originalJs = this.oldJs;
        state.userScriptHasRun = false;
        if(state.uiElements.cmFullJsEditor) {
            state.uiElements.cmFullJsEditor.setValue(state.originalJs);
        }
        if(state.uiElements.cmSnapJs) {
            state.uiElements.cmSnapJs.setValue(state.originalJs);
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'JSChangeCommand',
            oldJs: this.oldJs,
            newJs: this.newJs
        };
    }
}

// Command for a batch of CSS changes from AI
export class AiCssUpdateCommand extends BaseCommand {
    constructor(originalRules, newRules) {
        super('AI CSS Edit');
        this.originalRules = originalRules; // The subset of rules sent to AI
        this.newRules = newRules; // The rules returned by AI
        this.previousCssRules = null; // To store the entire cssRules array for undo
    }

    execute() {
        this.previousCssRules = JSON.parse(JSON.stringify(state.cssManager.cssRules));

        const originalRulesMap = new Map(this.originalRules.map(r => [`${r.selector}|${r.media || ''}`, r]));
        const newRulesMap = new Map(this.newRules.map(r => [`${r.selector}|${r.media || ''}`, r]));

        // Create a copy of the current rules to modify
        const updatedRules = [...state.cssManager.cssRules];

        // 1. Process removals and changes for rules that were IN THE CONTEXT
        for (let i = updatedRules.length - 1; i >= 0; i--) {
            const rule = updatedRules[i];
            const key = `${rule.selector}|${rule.media || ''}`;

            if (originalRulesMap.has(key)) {
                if (newRulesMap.has(key)) {
                    // It's a change. Update properties in place.
                    updatedRules[i].properties = newRulesMap.get(key).properties;
                    newRulesMap.delete(key); // Mark as processed so it's not added again
                } else {
                    // It's a removal (was in context, not in response). Splice it out.
                    updatedRules.splice(i, 1);
                }
            }
        }
        
        // 2. Process additions (rules remaining in newRulesMap)
        const additions = Array.from(newRulesMap.values());
        for (const newRule of additions) {
            const key = `${newRule.selector}|${newRule.media || ''}`;
            // Does a rule with this selector already exist in our updated stylesheet?
            const existingRuleIndex = updatedRules.findIndex(rule => `${rule.selector}|${rule.media || ''}` === key);
            
            if (existingRuleIndex !== -1) {
                // Yes, it exists. This is an unexpected modification of a rule outside the context.
                // Update it in place to avoid duplicates.
                updatedRules[existingRuleIndex].properties = newRule.properties;
            } else {
                // No, it's a genuinely new rule. Add it.
                updatedRules.push(newRule);
            }
        }
        
        state.cssManager.cssRules = updatedRules;
    }

    undo() {
        if (this.previousCssRules) {
            state.cssManager.cssRules = this.previousCssRules;
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'AiCssUpdateCommand',
            originalRules: this.originalRules,
            newRules: this.newRules,
            previousCssRules: this.previousCssRules
        };
    }
}

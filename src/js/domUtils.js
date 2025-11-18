import state from './state.js';

// Helper function to ensure an element has a data-n2l-id
export function ensureN2LId(element) {
    // Ensure element is a valid HTML element and not e.g. a text node
    if (!element || typeof element.setAttribute !== 'function') {
        return null;
    }
    if (!element.hasAttribute('data-n2l-id')) {
        const newId = `n2l-id-${state.nextN2LId++}`;
        element.setAttribute('data-n2l-id', newId);
        return newId;
    }
    return null;
}

// Helper function to assign data-n2l-id to all elements under a root
export function assignN2LIdsToDom(rootNode) {
    if (!rootNode || typeof rootNode.querySelectorAll !== 'function') return;

    const assignAndTrack = (el) => {
        ensureN2LId(el);
    };

    // If rootNode itself is an element (e.g. newElement in applyHtmlChanges), it needs an ID.
    if (rootNode.nodeType === Node.ELEMENT_NODE) {
        assignAndTrack(rootNode);
    }
    // Assign IDs to all children
    rootNode.querySelectorAll('*').forEach(el => assignAndTrack(el));
}

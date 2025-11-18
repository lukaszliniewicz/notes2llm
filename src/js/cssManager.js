import state from './state.js';
import { CSSRuleChangeCommand } from './commands.js';

export class Notes2LLMCssManager {
    constructor() {
        this.cssRules = [];
        this.originalCssText = '';
    }
    
    parseCss(cssText) {
        this.originalCssText = cssText;
        this.cssRules = [];

        // Use the browser's parser inside a safe context.
        // Always use a detached document to ensure consistency and avoid side effects on the live iframe.
        const targetDoc = document.implementation.createHTMLDocument("");
        const tempStyle = targetDoc.createElement('style');
        tempStyle.textContent = cssText;
        targetDoc.head.appendChild(tempStyle);

        try {
            const sheet = tempStyle.sheet;
            if (sheet) {
                // Use standard for loop as CSSRuleList might not be iterable in all environments
                for (let i = 0; i < sheet.cssRules.length; i++) {
                    const rule = sheet.cssRules[i];
                    if (rule instanceof CSSStyleRule) {
                        const selector = rule.selectorText;
                        const propertiesMatch = rule.cssText.match(/\{([\s\S]*)\}/);
                        const properties = propertiesMatch ? propertiesMatch[1].trim() : '';
                        this.cssRules.push({ selector, properties, media: null });
                    } else if (rule instanceof CSSMediaRule) {
                        const mediaText = `@media ${rule.conditionText}`;
                        for (let j = 0; j < rule.cssRules.length; j++) {
                            const innerRule = rule.cssRules[j];
                             if (innerRule instanceof CSSStyleRule) {
                                const selector = innerRule.selectorText;
                                const propertiesMatch = innerRule.cssText.match(/\{([\s\S]*)\}/);
                                const properties = propertiesMatch ? propertiesMatch[1].trim() : '';
                                this.cssRules.push({ selector, properties, media: mediaText });
                            }
                        }
                    }
                    else {
                        // For other rules like @keyframes, store the raw text
                        this.cssRules.push({ selector: '@raw', properties: rule.cssText, media: null });
                    }
                }
            }
        } catch (e) {
            console.error("Could not parse CSS:", e);
             // Fallback: if parsing fails, treat the whole block as raw to prevent data loss.
            this.cssRules.push({ selector: '@raw', properties: cssText });
        } finally {
            targetDoc.head.removeChild(tempStyle);
        }

        return this.cssRules;
    }
    
    getMatchingRules(element) {
        if (!element) return [];

        const isHoverSimulated = element.classList.contains('N2L_EDITOR_HOVER');
        const matchingRules = [];

        this.cssRules.forEach(rule => {
            if (rule.selector === '@raw') return; // Skip raw/at-rules

            try {
                const selectors = rule.selector.split(',').map(s => s.trim());

                for (const selector of selectors) {
                    try {
                        const isHoverSelector = selector.includes(':hover');

                        // Scenario 1: Selector is NOT a hover rule. Match normally.
                        if (!isHoverSelector) {
                            if (element.matches(selector)) {
                                matchingRules.push({ ...rule, matchedBy: selector });
                                break; // Found a match, move to next rule
                            }
                        }
                        // Scenario 2: Selector IS a hover rule, and we are simulating hover.
                        // Match against the base selector.
                        else if (isHoverSimulated && isHoverSelector) {
                            // A simple replace is generally safe for :hover, as it's a pseudo-class, not a pseudo-element.
                            const baseSelector = selector.replace(/:hover/g, '');
                            if (baseSelector && element.matches(baseSelector)) {
                                matchingRules.push({ ...rule, matchedBy: selector });
                                break; // Found a match, move to next rule
                            }
                        }
                    } catch (selectorError) {
                        // This can happen with complex or invalid selectors during matching.
                        // console.warn(`Invalid selector part "${selector}" in rule "${rule.selector}"`, selectorError);
                    }
                }
            } catch (error) {
                console.warn(`Error checking if element matches selector "${rule.selector}"`, error);
            }
        });

        return matchingRules;
    }
    
    updateRule(selector, newProperties, media = null) {
        // Modified to support command pattern
        if (state.commandHistory && state.commandHistory.isExecutingCommand) {
            const ruleIndex = this.cssRules.findIndex(rule => rule.selector === selector && rule.media === media);
            if (ruleIndex !== -1) {
                this.cssRules[ruleIndex].properties = newProperties;
            }
            return;
        }
        
        const oldRule = this.cssRules.find(rule => rule.selector === selector && rule.media === media);
        const oldProperties = oldRule ? oldRule.properties : '';
        
        const command = new CSSRuleChangeCommand(selector, oldProperties, newProperties, media);
        state.commandHistory.execute(command);
    }
    
    addRule(selector, properties, media = null) {
        // Check if rule with this selector and media already exists
        const existingRuleIndex = this.cssRules.findIndex(rule => rule.selector === selector && rule.media === media);
        
        if (existingRuleIndex !== -1) {
            this.cssRules[existingRuleIndex].properties = properties;
        } else {
            this.cssRules.push({
                selector: selector,
                properties: properties,
                media: media,
            });
        }
    }
    
    deleteRule(selector, media = null) {
        const ruleIndex = this.cssRules.findIndex(rule => rule.selector === selector && rule.media === media);
        
        if (ruleIndex !== -1) {
            this.cssRules.splice(ruleIndex, 1);
        }
    }
    
    generateCss() {
        const rulesByMedia = {};

        // Group rules by media query
        this.cssRules.forEach(rule => {
            const mediaKey = rule.media || 'no-media';
            if (!rulesByMedia[mediaKey]) {
                rulesByMedia[mediaKey] = [];
            }
            rulesByMedia[mediaKey].push(rule);
        });

        let cssText = '';

        const formatProperties = (properties) => {
            return properties
                .split(';')
                .map(prop => prop.trim())
                .filter(prop => prop)
                .map(prop => `    ${prop};`)
                .join('\n');
        };

        // Process non-media rules first
        if (rulesByMedia['no-media']) {
            rulesByMedia['no-media'].forEach(rule => {
                if (rule.selector === '@raw') {
                    cssText += `${rule.properties}\n\n`;
                } else {
                    cssText += `${rule.selector} {\n${formatProperties(rule.properties)}\n}\n\n`;
                }
            });
        }

        // Process media rules
        Object.keys(rulesByMedia).forEach(mediaKey => {
            if (mediaKey !== 'no-media') {
                cssText += `${mediaKey} {\n`;
                rulesByMedia[mediaKey].forEach(rule => {
                    const ruleCss = `    ${rule.selector} {\n${formatProperties(rule.properties).split('\n').map(line => `    ${line}`).join('\n')}\n    }`;
                    cssText += `${ruleCss}\n`;
                });
                cssText += '}\n\n';
            }
        });

        return cssText.trim();
    }
}

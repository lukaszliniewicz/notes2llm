export function initPromptGenerator() {
    const form = document.getElementById('prompt-gen-form');

    // --- START: Element Selectors ---
    const purposeSelect = document.getElementById('prompt-gen-purpose');
    const wordpressOptions = document.getElementById('prompt-gen-wordpress-options');
    const emailOptions = document.getElementById('prompt-gen-email-options');
    
    const generalStyleRadios = document.querySelectorAll('input[name="generalStyle"]');
    const generalStyleOtherText = document.getElementById('prompt-gen-style-other-text');

    const defineColorCheckbox = document.getElementById('prompt-gen-define-color');
    const colorOptions = document.getElementById('prompt-gen-color-options');
    const defineFontCheckbox = document.getElementById('prompt-gen-define-font');
    const fontOptions = document.getElementById('prompt-gen-font-options');
    
    const paletteChoiceRadios = document.querySelectorAll('input[name="paletteChoice"]');
    const mainAccentColor = document.getElementById('prompt-gen-main-accent-color');
    const secondaryAccentColor = document.getElementById('prompt-gen-secondary-accent-color');
    const textColorInput = document.getElementById('prompt-gen-text-color');
    const singleColorForPaletteInput = document.getElementById('prompt-gen-single-color-for-palette');

    const fontChoiceSelect = document.getElementById('prompt-gen-font-choice');
    const googleFontOptions = document.getElementById('prompt-gen-google-font-options');
    const allowFontAwesomeCheckbox = document.getElementById('prompt-gen-allow-font-awesome');
    const fontAwesomeImportOption = document.getElementById('prompt-gen-font-awesome-import-option');

    // Composition Elements
    const headerSection = document.getElementById('prompt-gen-header-section');
    const headerTypeSelect = document.getElementById('prompt-gen-header-type');
    const headerImageOptions = document.getElementById('prompt-gen-header-image-options');
    const imageSourceRadios = document.querySelectorAll('input[name="imageSource"]');
    const headerImageUrlInput = document.getElementById('prompt-gen-header-image-url-input');
    
    const logoOptionsContainer = document.getElementById('prompt-gen-logo-options-container');
    const logoChoiceRadios = document.querySelectorAll('input[name="logoChoice"]');
    const logoUrlInput = document.getElementById('prompt-gen-logo-url-input');

    const siteMenuOptionsContainer = document.getElementById('prompt-gen-site-menu-options-container');
    const siteMenuTypeSelect = document.getElementById('prompt-gen-site-menu-type');
    const siteMenuInstructionsTextarea = document.getElementById('prompt-gen-site-menu-instructions');

    const internalMenuContainer = document.getElementById('prompt-gen-internal-menu-container');
    const tocTypeSelect = document.getElementById('prompt-gen-toc-type');

    const picturesSection = document.getElementById('prompt-gen-pictures-section');
    const includePicturesCheckbox = document.getElementById('prompt-gen-include-pictures');
    const picturesOptions = document.getElementById('prompt-gen-pictures-options');
    const picturesSourceRadios = document.querySelectorAll('input[name="picturesSource"]');
    const picturesPlaceholderOptions = document.getElementById('prompt-gen-pictures-placeholder-options');
    const picturesUrlOptions = document.getElementById('prompt-gen-pictures-url-options');
    const lightboxWpNote = document.getElementById('prompt-gen-lightbox-wp-note');

    const sliderSection = document.getElementById('prompt-gen-slider-section');
    const includeSliderCheckbox = document.getElementById('prompt-gen-include-slider');
    const sliderOptions = document.getElementById('prompt-gen-slider-options');
    const sliderContentSourceRadios = document.querySelectorAll('input[name="sliderContentSource"]');
    const sliderPlaceholderOptions = document.getElementById('prompt-gen-slider-placeholder-options');
    const sliderUrlOptions = document.getElementById('prompt-gen-slider-url-options');
    
    const gallerySection = document.getElementById('prompt-gen-gallery-section');
    const includeGalleryCheckbox = document.getElementById('prompt-gen-include-gallery');
    const galleryOptions = document.getElementById('prompt-gen-gallery-options');
    const galleryContentSourceRadios = document.querySelectorAll('input[name="galleryContentSource"]');
    const galleryPlaceholderOptions = document.getElementById('prompt-gen-gallery-placeholder-options');
    const galleryUrlOptions = document.getElementById('prompt-gen-gallery-url-options');

    const listFormattingSection = document.getElementById('prompt-gen-list-formatting-section');
    
    // Text options
    const textTreatmentRadios = document.querySelectorAll('input[name="textTreatment"]');
    const textStyleOptions = document.getElementById('prompt-gen-text-style-options');
    const additionalTextInstructionsContainer = document.getElementById('prompt-gen-additional-text-instructions-container');
    
    // Other options
    const setClassNamePrefixCheckbox = document.getElementById('prompt-gen-set-class-name-prefix');
    const classNamePrefixOption = document.getElementById('prompt-gen-class-name-prefix-option');
    // --- END: Element Selectors ---


    // Color picker value displays
    const colorPickers = [
        {input: singleColorForPaletteInput, display: document.getElementById('prompt-gen-single-color-value')},
        {input: mainAccentColor, display: document.getElementById('prompt-gen-main-accent-value')},
        {input: secondaryAccentColor, display: document.getElementById('prompt-gen-secondary-accent-value')},
        {input: textColorInput, display: document.getElementById('prompt-gen-text-color-value')}
    ];

    colorPickers.forEach(picker => {
        if (picker.input && picker.display) { 
            picker.input.addEventListener('input', () => {
                picker.display.textContent = picker.input.value;
            });
        }
    });

    function toggleElement(element, show) {
        if (element) element.classList.toggle('prompt-gen-hidden', !show);
    }

    function toggleDisabled(elements, disable) {
        (Array.isArray(elements) ? elements : [elements]).forEach(el => {
            if (el) el.disabled = disable;
        });
    }
    
    // --- START: Event Listeners for UI changes ---
    if (purposeSelect) {
        purposeSelect.addEventListener('change', () => {
            const selectedPurposeValue = purposeSelect.value;
            
            // Wordpress/Email specific dropdowns
            toggleElement(wordpressOptions, selectedPurposeValue === 'wordpress');
            toggleElement(emailOptions, selectedPurposeValue === 'email');
            
            // Lightbox WP Note
            toggleElement(lightboxWpNote, selectedPurposeValue === 'wordpress' && includePicturesCheckbox.checked && document.getElementById('prompt-gen-pictures-lightbox').checked);
            
            // Header Section (standard one)
            const isFullSiteOrApp = selectedPurposeValue === 'full_website' || selectedPurposeValue === 'web_app';
            toggleElement(headerSection, !isFullSiteOrApp); // Hide standard header for full site/app
            if (isFullSiteOrApp) { 
                if(headerTypeSelect) headerTypeSelect.value = 'no'; 
                toggleElement(headerImageOptions, false); 
                toggleElement(headerImageUrlInput, false); 
                 if(document.getElementById('prompt-gen-image-placeholder')) { 
                    document.getElementById('prompt-gen-image-placeholder').checked = true;
                }
            }

            // Logo Options
            const showLogoOptions = selectedPurposeValue === 'full_website' || selectedPurposeValue === 'web_app' || selectedPurposeValue === 'email';
            toggleElement(logoOptionsContainer, showLogoOptions);
            if (!showLogoOptions) {
                document.getElementById('prompt-gen-logo-no').checked = true;
                toggleElement(logoUrlInput, false);
            } else {
                // Trigger change on logo choice to ensure URL input visibility is correct
                const checkedLogoChoice = document.querySelector('input[name="logoChoice"]:checked');
                if(checkedLogoChoice) checkedLogoChoice.dispatchEvent(new Event('change', {bubbles:true}));
            }

            // Site Menu Options
            const showSiteMenuOptions = selectedPurposeValue === 'full_website' || selectedPurposeValue === 'web_app';
            toggleElement(siteMenuOptionsContainer, showSiteMenuOptions);
            if (!showSiteMenuOptions) {
                if(siteMenuTypeSelect) siteMenuTypeSelect.value = 'none';
                if(siteMenuInstructionsTextarea) siteMenuInstructionsTextarea.value = '';
            }

            // Internal Menu/TOC
            const showInternalMenu = selectedPurposeValue === 'wordpress' || selectedPurposeValue === 'web_page';
            toggleElement(internalMenuContainer, showInternalMenu);
            if (!showInternalMenu && tocTypeSelect) {
                tocTypeSelect.value = 'no';
            }
            
            // Composition element visibility based on purpose
            const isGeneralHtmlCssJs = selectedPurposeValue === 'html_css_js';
            const isEmailPurpose = selectedPurposeValue === 'email';

            // Slider: hidden for general and email
            const showSlider = !isGeneralHtmlCssJs && !isEmailPurpose;
            toggleElement(sliderSection, showSlider);
            if (!showSlider) {
                if (includeSliderCheckbox) includeSliderCheckbox.checked = false;
                toggleElement(sliderOptions, false); // Also hide sub-options
            }
            
            // Gallery: hidden for general and email
            const showGallery = !isGeneralHtmlCssJs && !isEmailPurpose;
            toggleElement(gallerySection, showGallery);
            if (!showGallery) {
                if (includeGalleryCheckbox) includeGalleryCheckbox.checked = false;
                toggleElement(galleryOptions, false); // Also hide sub-options
            }

            // For general HTML/CSS/JS, specific composition elements are shown/hidden
            // Header (headerSection) is handled by isFullSiteOrApp logic above
            // Pictures (picturesSection) is always available
            // List Formatting (listFormattingSection) is always available
            // Internal Menu (internalMenuContainer) handled by its own wordpress/web_page logic
        });
    }


    generalStyleRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const otherRadio = document.getElementById('prompt-gen-style-other');
            if (otherRadio && generalStyleOtherText) {
                if (otherRadio.checked) {
                    generalStyleOtherText.style.display = 'inline-block';
                    generalStyleOtherText.focus();
                } else {
                    generalStyleOtherText.style.display = 'none';
                    generalStyleOtherText.value = ''; 
                }
            }
        });
    });

    if (defineColorCheckbox) {
        defineColorCheckbox.addEventListener('change', (e) => {
            toggleElement(colorOptions, e.target.checked);
        });
    }

    if (defineFontCheckbox) {
        defineFontCheckbox.addEventListener('change', (e) => {
            toggleElement(fontOptions, e.target.checked);
        });
    }

    paletteChoiceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const modelGenerates = document.getElementById('prompt-gen-model-palette').checked;
            toggleDisabled([mainAccentColor, secondaryAccentColor, textColorInput], modelGenerates);
            toggleDisabled(singleColorForPaletteInput, !modelGenerates);
            // Ensure manual color inputs sub-options visibility based on "Define manually" radio
            const manualColorInputs = document.getElementById('prompt-gen-manual-color-inputs');
            toggleElement(manualColorInputs, !modelGenerates);

        });
    });
     // Initialize manual color inputs visibility
    if (document.getElementById('prompt-gen-model-palette')) {
         toggleElement(document.getElementById('prompt-gen-manual-color-inputs'), !document.getElementById('prompt-gen-model-palette').checked);
    }


    if (fontChoiceSelect) {
        fontChoiceSelect.addEventListener('change', (e) => {
            toggleElement(googleFontOptions, e.target.value === 'google');
        });
    }
    
    if (allowFontAwesomeCheckbox) {
        allowFontAwesomeCheckbox.addEventListener('change', (e) => {
             toggleElement(fontAwesomeImportOption, e.target.checked);
        });
    }

    if (headerTypeSelect) {
        headerTypeSelect.addEventListener('change', (e) => {
            const showImageOptions = e.target.value === 'hero_image';
            toggleElement(headerImageOptions, showImageOptions);
            if (!showImageOptions) { 
                 toggleElement(headerImageUrlInput, false);
                 if(document.getElementById('prompt-gen-image-placeholder')) document.getElementById('prompt-gen-image-placeholder').checked = true;
            } else { 
                const imageURLRadio = document.getElementById('prompt-gen-image-url');
                if (imageURLRadio) toggleElement(headerImageUrlInput, imageURLRadio.checked);
            }
        });
    }

    imageSourceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const imageUrlRadio = document.getElementById('prompt-gen-image-url');
            if (imageUrlRadio) {
                toggleElement(headerImageUrlInput, imageUrlRadio.checked);
                 if(imageUrlRadio.checked) headerImageUrlInput.focus(); else headerImageUrlInput.value = '';
            }
        });
    });
    
    logoChoiceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isUrlChoice = document.getElementById('prompt-gen-logo-url').checked;
            toggleElement(logoUrlInput, isUrlChoice);
            if(isUrlChoice) logoUrlInput.focus(); else logoUrlInput.value = '';
        });
    });


    if (includePicturesCheckbox) {
        includePicturesCheckbox.addEventListener('change', (e) => {
            toggleElement(picturesOptions, e.target.checked);
            // Update WP lightbox note visibility
            const selectedPurposeValue = purposeSelect ? purposeSelect.value : 'html_css_js';
            toggleElement(lightboxWpNote, selectedPurposeValue === 'wordpress' && e.target.checked && document.getElementById('prompt-gen-pictures-lightbox').checked);
        });
    }
    if(document.getElementById('prompt-gen-pictures-lightbox')) {
        document.getElementById('prompt-gen-pictures-lightbox').addEventListener('change', (e) => {
             const selectedPurposeValue = purposeSelect ? purposeSelect.value : 'html_css_js';
             toggleElement(lightboxWpNote, selectedPurposeValue === 'wordpress' && includePicturesCheckbox.checked && e.target.checked);
        });
    }
    
    picturesSourceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isUrlSource = document.getElementById('prompt-gen-pictures-url').checked;
            toggleElement(picturesPlaceholderOptions, !isUrlSource);
            toggleElement(picturesUrlOptions, isUrlSource);
            if(isUrlSource) document.getElementById('prompt-gen-pictures-urls').focus(); else document.getElementById('prompt-gen-pictures-urls').value = '';
        });
    });

    if (includeSliderCheckbox) {
        includeSliderCheckbox.addEventListener('change', (e) => {
            toggleElement(sliderOptions, e.target.checked);
        });
    }
    
    sliderContentSourceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isUrlSource = document.getElementById('prompt-gen-slider-url').checked;
            toggleElement(sliderPlaceholderOptions, !isUrlSource);
            toggleElement(sliderUrlOptions, isUrlSource);
             if(isUrlSource) document.getElementById('prompt-gen-slider-urls').focus(); else document.getElementById('prompt-gen-slider-urls').value = '';
        });
    });
    
    if (includeGalleryCheckbox) {
        includeGalleryCheckbox.addEventListener('change', (e) => {
            toggleElement(galleryOptions, e.target.checked);
        });
    }
    
    galleryContentSourceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isUrlSource = document.getElementById('prompt-gen-gallery-url').checked;
            toggleElement(galleryPlaceholderOptions, !isUrlSource);
            toggleElement(galleryUrlOptions, isUrlSource);
            if(isUrlSource) document.getElementById('prompt-gen-gallery-urls').focus(); else document.getElementById('prompt-gen-gallery-urls').value = '';
        });
    });

    textTreatmentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const improveStylingRadio = document.getElementById('prompt-gen-text-improve-styling');
            const doNotSpecifyRadio = document.getElementById('prompt-gen-text-do-not-specify');

            if (doNotSpecifyRadio.checked) {
                toggleElement(textStyleOptions, false);
                toggleElement(additionalTextInstructionsContainer, false);
            } else {
                toggleElement(textStyleOptions, improveStylingRadio.checked);
                toggleElement(additionalTextInstructionsContainer, true);
            }
        });
    });

    if (setClassNamePrefixCheckbox) {
        setClassNamePrefixCheckbox.addEventListener('change', (e) => {
            toggleElement(classNamePrefixOption, e.target.checked);
            if(e.target.checked) document.getElementById('prompt-gen-class-name-prefix-input').focus(); else document.getElementById('prompt-gen-class-name-prefix-input').value = '';
        });
    }
    // --- END: Event Listeners for UI changes ---

    function processFullHtmlReference(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        let bodyHtml = '';
        if (doc.body) {
            const tempBody = doc.body.cloneNode(true); 
            tempBody.querySelectorAll('script').forEach(script => script.remove());
            bodyHtml = tempBody.innerHTML;
        }
        let styleTagContent = '';
        doc.querySelectorAll('style').forEach(styleElement => {
            styleTagContent += styleElement.innerHTML.trim() + '\n\n/* --- End of a style block --- */\n\n';
        });
        return {
            processedBodyHtml: bodyHtml.trim(),
            extractedStyleTagContent: styleTagContent.trim()
        };
    }

    const copyButton = document.getElementById('prompt-gen-copy-button');
    const outputElement = document.getElementById('prompt-gen-output');
    const sendToAiButton = document.getElementById('prompt-gen-send-to-ai-btn');
    
    if (sendToAiButton && outputElement) {
        sendToAiButton.addEventListener('click', function() {
            const promptText = outputElement.textContent;
            if (promptText && window.handleAiGeneration) {
                window.handleAiGeneration(promptText);
            } else {
                console.error('handleAiGeneration function not found on window object.');
                alert('Error: Could not send prompt to AI.');
            }
        });
    }

    if (copyButton && outputElement) {
        copyButton.addEventListener('click', function() {
            if (outputElement.textContent) {
                navigator.clipboard.writeText(outputElement.textContent)
                    .then(() => {
                        const originalText = copyButton.textContent;
                        copyButton.textContent = 'Copied!';
                        setTimeout(() => { copyButton.textContent = originalText; }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                        alert('Failed to copy to clipboard. Please try again or manually select and copy the text.');
                    });
            }
        });
    }

    const generateButton = document.getElementById('prompt-gen-generate-button');
    const outputContainer = document.getElementById('prompt-gen-output-container');
    if (generateButton && outputContainer && outputElement) {
        generateButton.addEventListener('click', () => {
            const data = {};
            for (const element of form.elements) {
                if (!element.name) continue; 

                const name = element.name;
                switch (element.type) {
                    case 'checkbox':
                        data[name] = element.checked;
                        break;
                    case 'radio':
                        if (element.checked) {
                            data[name] = element.value;
                        }
                        break;
                    default: 
                        data[name] = element.value;
                        break;
                }
            }

            let prompt = "Generate code based on the following specifications that were generated from a form filled in by a person. Follow each instruction carefully and balance all requirements to create the best possible solution:\n\n";
            
            prompt += "## PURPOSE OF CODE GENERATION:\n";
            const purpose = data.purpose;
            if (purpose === 'html_css_js') prompt += "- Type: General HTML, CSS, and JavaScript (if JS is necessary/useful) component/snippet.\n";
            if (purpose === 'wordpress') {
                prompt += `- Type: Wordpress Element (${data.wordpressType}).\n`;
                prompt += "- Instruction: Output a single block of code suitable for a WordPress custom HTML widget or block. Exclude <html>, <head>, <body> tags etc. as they are not needed here. The code should work within the WordPress ecosystem and follow WordPress coding best practices.\n";
            }
            if (purpose === 'email') {
                prompt += `- Type: Email (${data.emailType}).\n`;
                prompt += "- Instruction: Ensure compatibility with major email clients. Use inline CSS and table-based layouts where appropriate for maximum compatibility. Avoid advanced CSS features that are inconsistently supported in email clients.\n";
            }
            if (purpose === 'full_website' || purpose === 'web_app') {
                prompt += `- Type: ${purpose === 'full_website' ? 'Full Website' : 'Full Web App'}.\n`;
                prompt += "- Instruction: Include complete structure with semantically correct HTML5 tags. Create relevant SEO meta tags in the <head> (title, description, keywords) derived from the provided content. Structure for good SEO practices (semantic HTML, logical heading structure). Ensure all necessary components for a complete site solution.\n";
            }
             if (purpose === 'web_page') {
                prompt += "- Type: Web Page for an existing website.\n";
                prompt += "- Instruction: Generate the content for the <body> tag that can be inserted into an existing site. Create self-contained styles that won't conflict with parent site. If SEO aspects are relevant for this specific page, consider how to advise on title/meta description based on content.\n";
            }
            if (data.summary && data.summary.trim() !== '') {
                prompt += `- Summary of what to create: ${data.summary.trim()}\n`;
            }
            prompt += "\n";

            prompt += "## STYLING:\n";
            
            let generalStyleValue = data.generalStyle;
            if (data.generalStyle === 'other' && data.generalStyleOtherText && data.generalStyleOtherText.trim() !== '') {
                generalStyleValue = `Other: ${data.generalStyleOtherText.trim()}`;
            } else if (data.generalStyle === 'other') {
                generalStyleValue = 'Other (not specified, use your best judgement or a neutral style)';
            }
            prompt += `- General Style: ${generalStyleValue}.\n`;

            if (data.generalStyle && data.generalStyle !== 'other') {
                prompt += `  - For "${data.generalStyle}" style, here's what that means:\n`;
                if (data.generalStyle === 'modern') {
                    prompt += `    - Clean, minimalist approach with ample whitespace\n    - Subtle shadows and rounded corners where appropriate\n    - Smooth transitions/animations for interactive elements\n    - Contemporary typography with good readability\n    - Flat design elements with subtle depth cues\n`;
                } else if (data.generalStyle === 'retro') {
                    prompt += `    - Nostalgic design elements from a specific era (70s, 80s, 90s, etc.)\n    - Typography characteristic of the period\n    - Color schemes reminiscent of vintage design\n    - Possibly include design artifacts like mild distressing or analog-inspired elements\n`;
                } else if (data.generalStyle === 'visually_striking') {
                    prompt += `    - Bold, high-contrast design elements\n    - Attention-grabbing typography or color combinations\n    - Creative layout that catches the eye\n    - May include unusual or unexpected visual elements\n    - Strong visual hierarchy to direct attention\n`;
                } else if (data.generalStyle === 'professional') {
                    prompt += `    - Clean, business-appropriate aesthetics\n    - Subdued color palette with strategic accent colors\n    - Consistent, organized layout structure\n    - Typography focused on clarity and readability\n    - Polished, refined interactive elements\n`;
                }
            } else if (data.generalStyle === 'other' && data.generalStyleOtherText && data.generalStyleOtherText.trim() !== '') {
                 prompt += `  - For "Other: ${data.generalStyleOtherText.trim()}" style, interpret and apply the user's specified style.\n`;
            }
            
            if (data.additionalStyle && data.additionalStyle.trim() !== '') {
                prompt += `- Additional Style Instructions: ${data.additionalStyle.trim()}.\n`;
            }


            if (data.referenceCode && data.referenceCode.trim() !== '') {
                const refCode = data.referenceCode.trim();
                if (refCode.toLowerCase().includes('<html') && (refCode.toLowerCase().includes('<body') || refCode.toLowerCase().includes('</head>'))) {
                    const processed = processFullHtmlReference(refCode);
                    prompt += `- Reference "View Source" Output Provided:\n`;
                    if (processed.extractedStyleTagContent) {
                        prompt += `  - Internal CSS from <style> tags (from head and body):\n\`\`\`css\n${processed.extractedStyleTagContent}\n\`\`\`\n`;
                    } else {
                        prompt += `  - No internal <style> tags found or extracted from the reference.\n`;
                    }
                    if (processed.processedBodyHtml) {
                        prompt += `  - Body HTML Structure (scripts removed, other non-renderable head elements like meta/link are excluded from this body extraction):\n\`\`\`html\n${processed.processedBodyHtml}\n\`\`\`\n`;
                    } else {
                        prompt += `  - Body HTML could not be reliably extracted from the reference.\n`;
                    }
                    prompt += `  - LLM Instruction for this reference: Analyze the provided HTML structure and any accompanying internal CSS as a strong style reference. Focus on elements likely visible on a page: their colors, fonts, spacing, layout tendencies, and overall component appearance. Be aware that styles from external stylesheets (<link rel="stylesheet">) and JavaScript-applied styles are NOT included in this extraction. Infer the overall style and apply it to the new code you generate.\n`;
                } else {
                    prompt += `- Reference Code Snippet Provided: Yes. Analyze the following code for style (colors, fonts, layout tendencies, component styling) and apply similar styling. This could be HTML, CSS, or a mix. Extract key style elements rather than a wholesale copy.\n\`\`\`\n${refCode}\n\`\`\`\n`;
                }
            } else {
                prompt += "- No reference code provided. Create styling based on the instructions above/below.\n";
            }

            if (data.defineColor) {
                prompt += "- Custom Colors Defined:\n";
                if (data.paletteChoice === 'model_generates') {
                    prompt += `  - Palette: Generate a harmonious color palette based on the primary color: ${data.singleColorForPalette}.\n`;
                    prompt += `  - Create a coordinated scheme with appropriate complementary and accent colors.\n`;
                    prompt += `  - Text Color: Choose an appropriate text color for readability against the generated palette, ensuring WCAG AA or better contrast ratios.\n`;
                } else {
                    prompt += `  - Main Accent Color: ${data.mainAccentColor} - Use for primary UI elements and key visual anchors.\n`;
                    prompt += `  - Secondary Accent Color: ${data.secondaryAccentColor} - Use for supporting elements, highlights, or to create visual interest.\n`;
                    prompt += `  - Text Color: ${data.textColor} - Use for main body text and ensure appropriate contrast with background elements.\n`;
                }
            }

            if (data.defineFont) {
                prompt += "- Custom Fonts Defined:\n";
                prompt += `  - Font Choice: ${data.fontChoice}.\n`;
                if (data.fontChoice === 'standard') {
                    prompt += `    - Use widely-supported system fonts like Arial, Helvetica, Verdana, etc. Consider using modern font stacks for better typography.\n`;
                }
                if (data.fontChoice === 'google' && data.googleFontName && data.googleFontName.trim() !== '') {
                    prompt += `    - Google Font(s): ${data.googleFontName.trim()}.\n`;
                    if (data.includeGoogleFontImport) {
                        prompt += "    - Instruction: Include CSS @import or <link> tag for the specified Google Font(s). Use the most efficient way to load these fonts.\n";
                    }
                }
                if (data.allowFontAwesome) {
                    prompt += "  - Font Awesome: Allowed.\n";
                    prompt += "    - You may use Font Awesome icons where appropriate to enhance the design.\n";
                    if (data.importFontAwesome) {
                        prompt += "    - Instruction: If Font Awesome icons are used, include the necessary CDN link for Font Awesome (prefer the latest version).\n";
                    }
                } else {
                    prompt += "  - Font Awesome: Not allowed. Use alternative methods for icons if needed (SVG, Unicode, etc.).\n";
                }
            }
            prompt += "\n";

            prompt += "## COMPOSITION / ELEMENTS:\n";
            let compositionSpecified = false;
            const isFullSiteOrApp = purpose === 'full_website' || purpose === 'web_app';
            
            // Standard Header (not for full_website/web_app)
            if (!isFullSiteOrApp && data.headerType !== 'no') {
                compositionSpecified = true;
                prompt += `- Header/Title: ${data.headerType}.\n`;
                if (data.headerType === 'title_only') {
                    prompt += `  - Include a simple, well-styled title element appropriate for the purpose and content.\n`;
                } else if (data.headerType === 'simple_header') {
                    prompt += `  - Create a header section with title and potentially supporting elements like subtitles or navigation as appropriate.\n`;
                } else if (data.headerType === 'hero_image') {
                    prompt += `  - Create a hero section with title overlaid on a background image.\n`;
                    prompt += `  - Hero Image Source: ${data.imageSource}.\n`;
                    if (data.imageSource === 'url' && data.headerImageUrlInput && data.headerImageUrlInput.trim() !== '') {
                        prompt += `    - Image URL: ${data.headerImageUrlInput.trim()}.\n`;
                    } else {
                        prompt += `    - Image URL: Use a relevant placeholder image (e.g., from placeholder.com or similar, with appropriate dimensions). Suggest a specific placeholder that would work well for the content.\n`;
                    }
                }
            }

            // Logo (for full_website, web_app, email)
            const showLogoOptions = purpose === 'full_website' || purpose === 'web_app' || purpose === 'email';
            if (showLogoOptions && data.logoChoice && data.logoChoice !== 'no') {
                compositionSpecified = true;
                prompt += "- Logo:\n";
                if (data.logoChoice === 'placeholder') {
                    prompt += "  - Include a placeholder logo suitable for the design.\n";
                } else if (data.logoChoice === 'url' && data.logoUrlInput && data.logoUrlInput.trim() !== '') {
                    prompt += `  - Use logo from URL: ${data.logoUrlInput.trim()}\n`;
                } else if (data.logoChoice === 'url') {
                     prompt += "  - User selected 'Provide Logo URL' but did not provide a URL. If a logo is critical, use a placeholder or note its absence.\n";
                }
            }
            
            // Main Navigation Menu (for full_website, web_app)
            const showSiteMenuOptions = purpose === 'full_website' || purpose === 'web_app';
            if (showSiteMenuOptions && data.siteMenuType && data.siteMenuType !== 'none') {
                compositionSpecified = true;
                prompt += `- Main Navigation Menu:\n`;
                prompt += `  - Style: ${data.siteMenuType.replace(/_/g, ' ')}.\n`;
                if (data.siteMenuInstructions && data.siteMenuInstructions.trim() !== '') {
                    prompt += `  - Additional Instructions: ${data.siteMenuInstructions.trim()}\n`;
                }
            }
            
            // Internal Menu/TOC (for wordpress, web_page)
            const showInternalMenu = purpose === 'wordpress' || purpose === 'web_page';
            if (showInternalMenu && data.tocType !== 'no') {
                compositionSpecified = true;
                prompt += `- Internal Menu/TOC: ${data.tocType}. Base on heading IDs if applicable.\n`;
                if (data.tocType === 'top') {
                    prompt += `  - Create a table of contents/internal navigation menu positioned at the top of the content.\n`;
                } else if (data.tocType === 'top_scrolling') {
                    prompt += `  - Create a table of contents/internal navigation menu that remains visible as the user scrolls down.\n`;
                } else if (data.tocType === 'floating_left') {
                    prompt += `  - Create a floating table of contents/internal navigation menu positioned on the left side.\n`;
                }
            }
            
            // Pictures (always available to choose)
            if (data.includePictures) {
                compositionSpecified = true;
                prompt += `- Pictures: Include pictures/images.\n`;
                prompt += `  - Source: ${data.picturesSource === 'placeholder' ? 'Use placeholder images' : 'Use provided URLs'}.\n`;
                if (data.picturesSource === 'placeholder') {
                    prompt += `  - Number of placeholders: ${data.picturesPlaceholderCount}.\n`;
                } else if (data.picturesUrls && data.picturesUrls.trim() !== '') {
                    const urls = data.picturesUrls.trim().split('\n').filter(url => url.trim() !== '');
                    prompt += `  - Image URLs (${urls.length}):\n`;
                    urls.forEach(url => { prompt += `    - ${url.trim()}\n`; });
                }
                prompt += `  - Display Method: ${data.picturesDisplayMethod === 'as_is' ? 'Add as regular images' : 'Use as background in styled frames'}.\n`;
                if (data.picturesLightbox) {
                    prompt += `  - Include lightbox functionality: Yes.\n`;
                     if (purpose === 'wordpress') {
                        prompt += `    - Note: For WordPress, if a native solution is preferred, you can skip implementing custom JS for lightbox but ensure images are set up to work with WP's lightbox.\n`;
                    }
                }
            }
            
            // Slider (not for general html/css/js or email)
            const showSlider = purpose !== 'html_css_js' && purpose !== 'email';
            if (showSlider && data.includeSlider) {
                compositionSpecified = true;
                prompt += `- Slider: Include a slider.\n`;
                prompt += `  - Type: ${data.sliderType}.\n`;
                prompt += `  - Content Source: ${data.sliderContentSource === 'placeholder' ? 'Use placeholder images' : 'Use provided URLs'}.\n`;
                if (data.sliderContentSource === 'placeholder') {
                    prompt += `  - Number of slides: ${data.sliderPlaceholderCount}.\n`;
                } else if (data.sliderUrls && data.sliderUrls.trim() !== '') {
                    const urls = data.sliderUrls.trim().split('\n').filter(url => url.trim() !== '');
                    prompt += `  - Slide Image URLs (${urls.length}):\n`;
                    urls.forEach(url => { prompt += `    - ${url.trim()}\n`; });
                }
                if (data.sliderInstructions && data.sliderInstructions.trim() !== '') {
                    prompt += `  - Custom Instructions: ${data.sliderInstructions.trim()}.\n`;
                }
            }
            
            // Gallery (not for general html/css/js or email)
            const showGallery = purpose !== 'html_css_js' && purpose !== 'email';
            if (showGallery && data.includeGallery) {
                compositionSpecified = true;
                prompt += `- Photo Gallery: Include a photo gallery.\n`;
                prompt += `  - Type: ${data.galleryType}.\n`;
                prompt += `  - Content Source: ${data.galleryContentSource === 'placeholder' ? 'Use placeholder images' : 'Use provided URLs'}.\n`;
                if (data.galleryContentSource === 'placeholder') {
                    prompt += `  - Number of images: ${data.galleryPlaceholderCount}.\n`;
                } else if (data.galleryUrls && data.galleryUrls.trim() !== '') {
                    const urls = data.galleryUrls.trim().split('\n').filter(url => url.trim() !== '');
                    prompt += `  - Gallery Image URLs (${urls.length}):\n`;
                    urls.forEach(url => { prompt += `    - ${url.trim()}\n`; });
                }
                if (data.galleryInstructions && data.galleryInstructions.trim() !== '') {
                    prompt += `  - Custom Instructions: ${data.galleryInstructions.trim()}.\n`;
                }
            }
            
            // Lists Formatting (always available to choose)
            if (data.listFormat !== 'default') {
                compositionSpecified = true;
                prompt += `- Lists Formatting: ${data.listFormat}.\n`;
                if (data.listCustomInstructions && data.listCustomInstructions.trim() !== '') {
                    prompt += `  - Custom List Instructions: ${data.listCustomInstructions.trim()}.\n`;
                }
            }
            
            if (!compositionSpecified) {
                prompt += "- No specific pre-defined elements selected from the 'Composition' section. Refer to 'Content Instructions' for any element requirements.\n";
            }
            prompt += "\n";

            prompt += "## CONTENT:\n";
            if (data.contentInstructions && data.contentInstructions.trim() !== '') {
                prompt += `- Main Content & Instructions:\n\`\`\`\n${data.contentInstructions.trim()}\n\`\`\`\n`;
                prompt += "- IMPORTANT: If instructions in the 'Main Content & Instructions' section above conflict with choices/styles defined earlier, the 'Main Content & Instructions' take precedence.\n";
            } else {
                prompt += "- No specific content or detailed instructions provided. Generate placeholder content that's appropriate for the purpose and structure of the code.\n";
            }
            
            if (data.textTreatment && data.textTreatment !== 'do_not_specify') {
                prompt += `- Text Treatment: ${data.textTreatment.replace(/_/g, ' ')}.\n`;
                if (data.textTreatment === 'preserve') {
                    prompt += `  - Explanation: Keep the exact wording provided. HTML formatting may be added, but the text itself should remain unchanged.\n`;
                } else if (data.textTreatment === 'improve_mistakes') {
                    prompt += `  - Explanation: Correct obvious typos, grammatical errors, and formatting issues while preserving the overall message and tone.\n`;
                } else if (data.textTreatment === 'improve_styling') {
                    prompt += `  - Explanation: Rephrase, restructure, and enhance the provided text for flow, clarity, and impact. Maintain core message.\n`;
                    prompt += `  - Desired Text Style/Tone: ${data.textStyleTone.replace(/_/g, ' ')}.\n`;
                    if (data.textStyleReference && data.textStyleReference.trim() !== '') {
                        prompt += `  - Text Style Reference (use for style/tone only):\n\`\`\`\n${data.textStyleReference.trim()}\n\`\`\`\n`;
                    }
                }
                if (data.additionalTextInstructions && data.additionalTextInstructions.trim() !== '') {
                     prompt += `- Additional Text Treatment Instructions:\n${data.additionalTextInstructions.trim()}\n`;
                }
            } else {
                prompt += "- Text Treatment: Not specified by user. Use your best judgment based on the content context (e.g., preserve if it looks like specific copy, improve if it looks like rough notes).\n";
            }
            prompt += "\n";
            
            prompt += "## RESPONSIVENESS AND ACCESSIBILITY:\n";
            if (data.mobileFirst) prompt += "- Use Mobile-First Design approach.\n";
            else prompt += "- Use a standard responsive design approach.\n";
            if (data.includeDarkMode) prompt += "- Include Dark Mode with system preference detection (prefers-color-scheme).\n";
            if (data.includeHighContrast) prompt += "- Include High Contrast Mode option (e.g., via toggle or prefers-contrast).\n";
            if (data.includeFontSizing) prompt += "- Include Font Size adjustment controls.\n";
            if (data.ensureAria) prompt += "- Ensure proper ARIA attributes for accessibility.\n";
            if (data.additionalAccessibility && data.additionalAccessibility.trim() !== '') {
                prompt += `- Additional Accessibility Requirements:\n${data.additionalAccessibility.trim()}\n`;
            }
            prompt += "\n";

            prompt += "## OTHER REQUIREMENTS:\n";
            if (data.specificStyling) prompt += "- Style all standard HTML tags very specifically to override theme styles. All elements should get specific class names.\n";
            if (data.addImportant) prompt += "- Add '!important' to CSS rules (unless conflicting with JS functionality).\n";
            if (data.setClassNamePrefix) {
                if (data.classNamePrefixInput && data.classNamePrefixInput.trim() !== '') {
                    prompt += `- Class Name Prefix: Use "${data.classNamePrefixInput.trim()}" for all CSS classes.\n`;
                } else {
                    prompt += "- Use class names/IDs derived from content (user wanted prefix but didn't specify).\n";
                }
            } else {
                prompt += "- Use class names/IDs derived from content.\n";
            }
            prompt += `- Code Comments Level: ${data.commentsLevel}.\n`;
            prompt += "\n";
            
            prompt += "## FINAL OUTPUT EXPECTATIONS:\n";
            prompt += "- Provide HTML, CSS, and JavaScript in a SINGLE code block unless the purpose dictates otherwise (e.g. WordPress might just be HTML/PHP with inline styles or enqueued assets).\n";
            prompt += "- If CSS is separate, place it in <style> tags. If JS is separate, place it in <script> tags.\n";
            prompt += "- Aim for accessible, responsive design following best practices.\n";
            
            outputElement.textContent = prompt;
            toggleElement(outputContainer, true);
            outputElement.scrollTop = 0; // Scroll to top of prompt
        });
    }

    const saveProfileButton = document.getElementById('prompt-gen-save-profile-button');
    const loadProfileInput = document.getElementById('prompt-gen-load-profile-input');

    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', () => {
            const profileData = {};
            for (const element of form.elements) {
                if (element.name) {
                    switch (element.type) {
                        case 'checkbox':
                            profileData[element.name] = element.checked;
                            break;
                        case 'radio':
                            if (element.checked) {
                                profileData[element.name] = element.value;
                            }
                            break;
                        default: 
                            profileData[element.name] = element.value;
                            break;
                    }
                }
            }

            const jsonString = JSON.stringify(profileData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `Notes2LLM_Profile_${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    if (loadProfileInput) {
        loadProfileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const profileData = JSON.parse(e.target.result);
                        for (const name in profileData) {
                            if (profileData.hasOwnProperty(name)) {
                                const formElementOrNodeList = form.elements[name];
                                const value = profileData[name];

                                if (!formElementOrNodeList) {
                                    console.warn(`No form element found for profile key: ${name}`);
                                    continue;
                                }

                                if (formElementOrNodeList.constructor === RadioNodeList) { 
                                    formElementOrNodeList.forEach(radio => {
                                        radio.checked = (radio.value === value);
                                    });
                                } else { 
                                    const element = formElementOrNodeList;
                                    if (element.type === 'checkbox') {
                                        element.checked = Boolean(value);
                                    } else { 
                                        element.value = value;
                                    }
                                }
                            }
                        }
                        updateDependentUI(); 
                        loadProfileInput.value = ''; 
                    } catch (error) {
                        console.error('Error parsing JSON profile:', error);
                        alert('Failed to load profile: Invalid JSON file.');
                        loadProfileInput.value = '';
                    }
                };
                reader.onerror = () => {
                    alert('Failed to read the profile file.');
                    loadProfileInput.value = '';
                };
                reader.readAsText(file);
            }
        });
    }

    function updateDependentUI() {
        // Trigger change event for purpose select to update all dependent sections
        if (purposeSelect) purposeSelect.dispatchEvent(new Event('change', { bubbles: true }));

        // General Style "Other" text field
        const checkedGeneralStyleRadio = document.querySelector('input[name="generalStyle"]:checked');
        if (checkedGeneralStyleRadio) {
            checkedGeneralStyleRadio.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (generalStyleOtherText) { // Fallback if somehow no radio is checked
             toggleElement(generalStyleOtherText, false); generalStyleOtherText.value = '';
        }

        // Colors
        if (defineColorCheckbox) defineColorCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        const checkedPaletteChoiceRadio = document.querySelector('input[name="paletteChoice"]:checked');
        if (checkedPaletteChoiceRadio) checkedPaletteChoiceRadio.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Fonts
        if (defineFontCheckbox) defineFontCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        if (fontChoiceSelect) fontChoiceSelect.dispatchEvent(new Event('change', { bubbles: true }));
        if (allowFontAwesomeCheckbox) allowFontAwesomeCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

        // Composition - Header related
        if (headerTypeSelect) headerTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        // Image source radios within header are handled by headerTypeSelect change
        // Logo choice radios are handled by purposeSelect change initially

        // Composition - Pictures, Slider, Gallery checkboxes
        if (includePicturesCheckbox) includePicturesCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        // picturesSourceRadios are handled by includePicturesCheckbox change
        if (document.getElementById('prompt-gen-pictures-lightbox')) document.getElementById('prompt-gen-pictures-lightbox').dispatchEvent(new Event('change', {bubbles:true}));


        if (includeSliderCheckbox) includeSliderCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        // sliderContentSourceRadios are handled by includeSliderCheckbox change

        if (includeGalleryCheckbox) includeGalleryCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        // galleryContentSourceRadios are handled by includeGalleryCheckbox change
        
        // Text Treatment
        const checkedTextTreatmentRadio = document.querySelector('input[name="textTreatment"]:checked');
        if (checkedTextTreatmentRadio) checkedTextTreatmentRadio.dispatchEvent(new Event('change', { bubbles: true }));

        // Other
        if (setClassNamePrefixCheckbox) setClassNamePrefixCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

        // Update color picker displays
        colorPickers.forEach(picker => {
            if (picker.input && picker.display) {
                 picker.display.textContent = picker.input.value;
            }
        });
    }
    
    // Initial UI setup based on default values
    updateDependentUI();
}

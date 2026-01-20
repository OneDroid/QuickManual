/**
 * Monitask Auto Time Filler - Content Script
 * Adds "Add Manual" button to inactive time blocks
 */

(function () {
    'use strict';

    console.log('[MATF] Monitask Auto Time Filler v2.1 loaded');

    // Parse time from tooltip text
    // Example: "Full note name: Started on 9:28:43 AM Ending on 9:38:53 AM"
    function parseTimeFromTooltip(tooltipText) {
        if (!tooltipText) return null;

        console.log('[MATF] Parsing tooltip:', tooltipText);

        // Pattern: "Started on X:XX:XX AM/PM Ending on X:XX:XX AM/PM"
        const regex = /Started\s+on\s*\n?\s*([\d:]+\s*[APap][Mm])\s*\n?\s*Ending\s+on\s*\n?\s*([\d:]+\s*[APap][Mm])/i;
        const match = tooltipText.match(regex);

        if (match) {
            return {
                startTime: match[1].trim(),
                endTime: match[2].trim()
            };
        }
        return null;
    }

    // Convert time with seconds to time without
    // "9:28:43 AM" -> "9:28 AM"
    function formatTimeForForm(timeStr) {
        const parts = timeStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*([APap][Mm])/i);
        if (parts) {
            return `${parts[1]}:${parts[2]} ${parts[3].toUpperCase()}`;
        }
        return timeStr;
    }

    // Set input value and trigger events
    function setInputValue(input, value) {
        if (!input) return false;

        input.value = value;
        input.dispatchEvent(new Event('focus', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        // For bootstrap-timepicker
        if (typeof jQuery !== 'undefined') {
            try {
                const $input = jQuery(input);
                if ($input.data('timepicker')) {
                    $input.timepicker('setTime', value);
                }
            } catch (e) { }
        }

        input.dispatchEvent(new Event('blur', { bubbles: true }));
        return true;
    }

    // Fill the manual time form
    function fillManualTimeForm(startTime, endTime) {
        console.log('[MATF] Filling form:', startTime, '-', endTime);

        const formattedStart = formatTimeForForm(startTime);
        const formattedEnd = formatTimeForForm(endTime);

        const startInput = document.getElementById('startDateManualTime');
        const endInput = document.getElementById('endDateManualTime');

        if (startInput && endInput) {
            setInputValue(startInput, formattedStart);
            setInputValue(endInput, formattedEnd);
            console.log('[MATF] Form filled!');
            return true;
        }
        return false;
    }

    // Open the Add Manual dialog
    function openAddManualDialog(callback) {
        console.log('[MATF] Opening Add Manual dialog...');

        // Method 1: Find and click the link
        const addManualLink = document.querySelector('a[href="#form-add-manual"]');
        if (addManualLink) {
            addManualLink.click();
            setTimeout(callback, 600);
            return;
        }

        // Method 2: Use jQuery magnificPopup
        if (typeof jQuery !== 'undefined' && jQuery.magnificPopup) {
            jQuery.magnificPopup.open({
                items: { src: '#form-add-manual' },
                type: 'inline'
            });
            setTimeout(callback, 600);
            return;
        }

        // Method 3: Show form directly
        const form = document.getElementById('form-add-manual');
        if (form) {
            form.classList.remove('mfp-hide');
            form.style.display = 'block';
            form.style.position = 'fixed';
            form.style.top = '50%';
            form.style.left = '50%';
            form.style.transform = 'translate(-50%, -50%)';
            form.style.zIndex = '99999';
            form.style.background = 'white';
            form.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
            setTimeout(callback, 300);
            return;
        }

        alert('Please click "Add Manual" button first, then click the inactive time block.');
    }

    // Handle button click
    function handleAddManualClick(event, startTime, endTime) {
        event.preventDefault();
        event.stopPropagation();

        console.log('[MATF] Add Manual clicked:', startTime, '-', endTime);

        // Check if form is already open
        const form = document.getElementById('form-add-manual');
        const isFormVisible = form && form.offsetParent !== null && !form.classList.contains('mfp-hide');

        if (isFormVisible) {
            fillManualTimeForm(startTime, endTime);
        } else {
            openAddManualDialog(() => {
                let attempts = 0;
                const tryFill = () => {
                    if (fillManualTimeForm(startTime, endTime)) {
                        console.log('[MATF] Success!');
                    } else if (attempts < 5) {
                        attempts++;
                        setTimeout(tryFill, 300);
                    }
                };
                tryFill();
            });
        }
    }

    // Create the "Add Manual" button
    function createAddManualButton(startTime, endTime) {
        const btn = document.createElement('button');
        btn.className = 'matf-add-btn';
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" style="fill: currentColor; margin-right: 4px;">
                <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            Add Manual
        `;

        btn.addEventListener('click', (e) => {
            handleAddManualClick(e, startTime, endTime);
        });

        return btn;
    }

    // Check if element is an inactive block
    function isInactiveBlock(element) {
        if (!element.classList.contains('note-element')) return false;

        const body = element.querySelector('.note-element-body');
        if (!body) return false;

        const bodyText = body.textContent.trim();
        const bodyStyle = body.getAttribute('style') || '';

        // Check for passive/empty blocks
        const isPassive = bodyText === '' ||
            bodyText === ' ' ||
            bodyStyle.includes('--passive');

        // Check for inactive time (pink color)
        const isInactiveTime = bodyText.includes('(Inactive Time)') ||
            (bodyStyle.includes('255') && bodyStyle.includes('164'));

        return isPassive || isInactiveTime;
    }

    // Enhance an inactive block with button
    function enhanceInactiveBlock(element) {
        // Skip if already enhanced
        if (element.querySelector('.matf-add-btn')) return;

        const tooltip = element.getAttribute('data-original-title') ||
            element.getAttribute('title') || '';

        const timeInfo = parseTimeFromTooltip(tooltip);
        if (!timeInfo) return;

        console.log('[MATF] Enhancing block:', timeInfo.startTime, '-', timeInfo.endTime);

        // Make container relative
        element.style.position = 'relative';

        // Create button container
        const btnContainer = document.createElement('div');
        btnContainer.className = 'matf-btn-container';

        // Create button
        const btn = createAddManualButton(timeInfo.startTime, timeInfo.endTime);
        btnContainer.appendChild(btn);

        // Add to element
        element.appendChild(btnContainer);
    }

    // Inject styles
    function injectStyles() {
        if (document.getElementById('matf-styles')) return;

        const style = document.createElement('style');
        style.id = 'matf-styles';
        style.textContent = `
            /* Button container - hidden by default, shown on hover */
            .matf-btn-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease;
            }

            .note-element:hover .matf-btn-container {
                opacity: 1;
                visibility: visible;
            }

            /* The Add Manual button */
            .matf-add-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
                transition: all 0.2s ease;
            }

            .matf-add-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
            }

            .matf-add-btn:active {
                transform: scale(0.98);
            }

            /* Highlight inactive block on hover */
            .note-element:has(.matf-btn-container):hover {
                outline: 2px dashed #667eea;
                outline-offset: -2px;
            }

            .note-element:has(.matf-btn-container):hover .note-element-body {
                opacity: 0.7;
            }
        `;

        document.head.appendChild(style);
        console.log('[MATF] Styles injected');
    }

    // Scan and enhance all inactive blocks
    function scanAndEnhance() {
        console.log('[MATF] Scanning for inactive blocks...');

        const noteElements = document.querySelectorAll('.note-element');
        let count = 0;

        noteElements.forEach((element) => {
            if (isInactiveBlock(element)) {
                enhanceInactiveBlock(element);
                count++;
            }
        });

        console.log(`[MATF] Enhanced ${count} blocks`);
    }

    // Initialize
    function init() {
        console.log('[MATF] Initializing...');

        // Inject styles
        injectStyles();

        // Initial scan (with delay for page to load)
        setTimeout(scanAndEnhance, 1000);

        // Watch for dynamic changes
        const observer = new MutationObserver(() => {
            clearTimeout(window._matfTimeout);
            window._matfTimeout = setTimeout(scanAndEnhance, 500);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[MATF] Ready!');
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Listen for messages
    if (typeof browser !== 'undefined') {
        browser.runtime.onMessage.addListener((request) => {
            if (request.action === 'fillTimeFromSelection') {
                const text = request.selectionText;
                const regex = /(\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\s*[-–to]+\s*(\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])/;
                const match = text.match(regex);
                if (match) {
                    openAddManualDialog(() => {
                        fillManualTimeForm(match[1].trim(), match[2].trim());
                    });
                }
            }
            return true;
        });
    }

})();

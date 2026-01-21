/**
 * QuickManual - Content Script
 * Optimized for Production (Chrome & Firefox)
 */

(function () {
    'use strict';

    // Cross-browser compatibility
    const ext = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);
    if (!ext) return;

    // --- Configuration ---
    const CONFIG = {
        SCAN_INTERVAL: 1000,
        DEBOUNCE_TIME: 500,
        SELECTORS: {
            NOTE_ELEMENT: '.note-element',
            NOTE_BODY: '.note-element-body',
            ADD_MANUAL_LINK: 'a[href="#form-add-manual"]',
            FORM: '#form-add-manual',
            START_INPUT: '#startDateManualTime',
            END_INPUT: '#endDateManualTime'
        }
    };

    // --- Time Parsing & Formatting ---

    function parseTimeFromTooltip(tooltipText) {
        if (!tooltipText) return null;
        const cleanText = tooltipText.replace(/\s+/g, ' ');
        const regex = /Started\s+on\s+([\d:]+\s*[APap][Mm])\s+Ending\s+on\s+([\d:]+\s*[APap][Mm])/i;
        const match = cleanText.match(regex);
        return match ? { startTime: match[1].trim(), endTime: match[2].trim() } : null;
    }

    function formatTimeForForm(timeStr, isEndTime) {
        const parts = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([APap][Mm])/i);
        if (!parts) return timeStr;

        let hours = parseInt(parts[1]);
        let minutes = parseInt(parts[2]);
        const seconds = parts[3] ? parseInt(parts[3]) : 0;
        const ampm = parts[4].toUpperCase();

        if (isEndTime && seconds > 0) minutes++;

        const d = new Date(2000, 0, 1);
        let h24 = hours;
        if (ampm === 'PM' && h24 < 12) h24 += 12;
        if (ampm === 'AM' && h24 === 12) h24 = 0;
        d.setHours(h24, minutes, 0, 0);

        let resHours = d.getHours();
        const resAmPm = resHours >= 12 ? 'PM' : 'AM';
        resHours = resHours % 12 || 12;
        const resMins = d.getMinutes().toString().padStart(2, '0');

        return `${resHours}:${resMins} ${resAmPm}`;
    }

    // --- DOM Interaction ---

    function setInputValue(input, value) {
        if (!input) return false;
        input.value = value;
        ['focus', 'input', 'change', 'blur'].forEach(name => {
            input.dispatchEvent(new Event(name, { bubbles: true }));
        });

        if (typeof jQuery !== 'undefined') {
            try {
                const $input = jQuery(input);
                if ($input.data('timepicker')) {
                    $input.timepicker('setTime', value);
                }
            } catch (e) { }
        }
        return true;
    }

    function fillForm(startTime, endTime) {
        const formattedStart = formatTimeForForm(startTime, false);
        const formattedEnd = formatTimeForForm(endTime, true);
        const startInput = document.querySelector(CONFIG.SELECTORS.START_INPUT);
        const endInput = document.querySelector(CONFIG.SELECTORS.END_INPUT);

        if (startInput && endInput) {
            setInputValue(startInput, formattedStart);
            setInputValue(endInput, formattedEnd);
            return true;
        }
        return false;
    }

    function openDialog(callback) {
        const link = document.querySelector(CONFIG.SELECTORS.ADD_MANUAL_LINK);
        if (link) {
            link.click();
            setTimeout(callback, 600);
            return;
        }

        if (typeof jQuery !== 'undefined' && jQuery.magnificPopup) {
            jQuery.magnificPopup.open({ items: { src: CONFIG.SELECTORS.FORM }, type: 'inline' });
            setTimeout(callback, 600);
            return;
        }

        const form = document.querySelector(CONFIG.SELECTORS.FORM);
        if (form) {
            form.classList.remove('mfp-hide');
            Object.assign(form.style, {
                display: 'block',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: '99999',
                background: 'white',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                padding: '20px',
                borderRadius: '8px'
            });
            setTimeout(callback, 300);
            return;
        }

        alert('Please open the "Add Manual" form first.');
    }

    // --- Main Logic ---

    function handleAction(startTime, endTime) {
        const form = document.querySelector(CONFIG.SELECTORS.FORM);
        const isVisible = form && form.offsetParent !== null && !form.classList.contains('mfp-hide');

        if (isVisible) {
            fillForm(startTime, endTime);
        } else {
            openDialog(() => {
                let attempts = 0;
                const tryFill = () => {
                    if (fillForm(startTime, endTime)) return;
                    if (attempts++ < 5) setTimeout(tryFill, 300);
                };
                tryFill();
            });
        }
    }

    function createButton(startTime, endTime) {
        const btn = document.createElement('button');
        btn.className = 'qm-add-btn';
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" style="fill: currentColor; margin-right: 6px;">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add Manual
        `;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAction(startTime, endTime);
        });
        return btn;
    }

    function isInactive(el) {
        const body = el.querySelector(CONFIG.SELECTORS.NOTE_BODY);
        if (!body) return false;
        const text = body.textContent.trim();
        const style = body.getAttribute('style') || '';
        return text === '' || text === '(Inactive Time)' || style.includes('--passive') || (style.includes('255') && style.includes('164'));
    }

    function applySegments(el, manualRequests) {
        // Clear existing segments
        el.querySelectorAll('.qm-manual-segment').forEach(s => s.remove());

        const tooltip = el.getAttribute('data-original-title') || el.getAttribute('title') || '';
        const time = parseTimeFromTooltip(tooltip);
        if (!time) return 0;

        const blockStart = parseTimeToDate(time.startTime);
        const blockEnd = parseTimeToDate(time.endTime);
        const duration = blockEnd - blockStart;
        if (duration <= 0) return 0;

        let totalOverlap = 0;
        let segmentsCreated = 0;

        manualRequests.forEach(req => {
            const overlapStart = Math.max(blockStart, req.start);
            const overlapEnd = Math.min(blockEnd, req.end);

            if (overlapStart < overlapEnd) {
                const offset = ((overlapStart - blockStart) / duration) * 100;
                const width = ((overlapEnd - overlapStart) / duration) * 100;

                const segment = document.createElement('div');
                segment.className = 'qm-manual-segment';
                segment.style.left = offset.toFixed(4) + '%';
                segment.style.width = width.toFixed(4) + '%';

                el.appendChild(segment);
                totalOverlap += (overlapEnd - overlapStart);
                segmentsCreated++;
            }
        });

        // If block is heavily covered, hide the add button
        const btnContainer = el.querySelector('.qm-btn-container');
        if (btnContainer) {
            if (totalOverlap > (duration * 0.9)) {
                btnContainer.style.display = 'none';
            } else {
                btnContainer.style.display = '';
            }
        }

        return segmentsCreated;
    }

    function enhance() {
        const manualRequests = getManualRequests();
        const elements = document.querySelectorAll(CONFIG.SELECTORS.NOTE_ELEMENT);

        elements.forEach(el => {
            el.classList.add('qm-processed');

            // Add button if inactive and not already there
            if (isInactive(el) && !el.querySelector('.qm-btn-container')) {
                const tooltip = el.getAttribute('data-original-title') || el.getAttribute('title') || '';
                const time = parseTimeFromTooltip(tooltip);
                if (time) {
                    const container = document.createElement('div');
                    container.className = 'qm-btn-container';
                    container.appendChild(createButton(time.startTime, time.endTime));
                    el.appendChild(container);
                }
            }

            // Apply manual segments
            applySegments(el, manualRequests);
        });

        updateSummaryTable(manualRequests);
    }

    function getManualRequests() {
        const summary = Array.from(document.querySelectorAll('summary')).find(s => s.textContent.includes('Manual time requests'));
        if (!summary) return [];

        const table = summary.parentElement.querySelector('table.mt-table');
        if (!table) return [];

        const requests = [];
        table.querySelectorAll('tbody tr:not(.qm-total-row)').forEach(row => {
            const timeCell = row.cells[3];
            if (!timeCell) return;
            const times = timeCell.textContent.trim().split(/\s*-\s*/);
            if (times.length === 2) {
                const start = parseTimeToDate(times[0]);
                const end = parseTimeToDate(times[1]);
                if (start && end) requests.push({ start, end });
            }
        });
        return requests;
    }

    function updateSummaryTable(requests) {
        if (requests.length === 0) return;

        const summary = Array.from(document.querySelectorAll('summary')).find(s => s.textContent.includes('Manual time requests'));
        const table = summary.parentElement.querySelector('table.mt-table');

        let totalMinutes = 0;
        requests.forEach(req => {
            let diff = (req.end - req.start) / 60000;
            if (diff < 0) diff += 1440;
            totalMinutes += diff;
        });

        if (totalMinutes > 0) {
            let totalRow = table.querySelector('.qm-total-row');
            if (!totalRow) {
                totalRow = document.createElement('tr');
                totalRow.className = 'qm-total-row';
                totalRow.style.cssText = 'font-weight: bold; background: #f0f7ff; color: #667eea;';
                table.querySelector('tbody').appendChild(totalRow);
            }
            const hours = Math.floor(totalMinutes / 60);
            const mins = Math.round(totalMinutes % 60);
            totalRow.innerHTML = `<td colspan="4" style="text-align: center; padding: 10px;">Total Manual Time: ${hours}h ${mins}m</td>`;
        }
    }

    function parseTimeToDate(timeStr) {
        const match = timeStr.trim().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([APap][Mm])/i);
        if (!match) return null;
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const s = match[3] ? parseInt(match[3]) : 0;
        const p = match[4].toUpperCase();
        if (p === 'PM' && h < 12) h += 12;
        if (p === 'AM' && h === 12) h = 0;
        return new Date(2000, 0, 1, h, m, s).getTime();
    }

    // --- Initialization ---

    let scanTimeout;
    const observer = new MutationObserver(() => {
        clearTimeout(scanTimeout);
        scanTimeout = setTimeout(enhance, CONFIG.DEBOUNCE_TIME);
    });

    function init() {
        enhance();
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    if (ext.runtime && ext.runtime.onMessage) {
        ext.runtime.onMessage.addListener(request => {
            if (request.action === 'fillTimeFromSelection' && request.selectionText) {
                const regex = /(\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\s*[-–to]+\s*(\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])/;
                const match = request.selectionText.match(regex);
                if (match) {
                    openDialog(() => fillForm(match[1].trim(), match[2].trim()));
                }
            }
            return true;
        });
    }

})();

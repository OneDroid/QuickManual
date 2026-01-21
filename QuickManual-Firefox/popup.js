/**
 * QuickManual - Popup Script
 * Optimized for Production (Chrome & Firefox)
 */

const ext = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);

document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openTimeline');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status span');

    // Open Monitask button
    openBtn.addEventListener('click', () => {
        ext.tabs.create({ url: 'https://app.monitask.com/report/' });
        window.close();
    });

    // Update status based on current tab
    async function updateStatus() {
        try {
            const tabs = await ext.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs[0]) {
                const isMonitask = tabs[0].url && tabs[0].url.includes('monitask.com');

                if (isMonitask) {
                    statusDot.style.background = '#38ef7d';
                    statusText.textContent = 'Active on Monitask';
                } else {
                    statusDot.style.background = '#ffd700';
                    statusText.textContent = 'Open Monitask to use';
                }
            }
        } catch (err) {
            console.error('QuickManual: Error checking tab status', err);
        }
    }

    if (ext && ext.tabs) {
        updateStatus();
    }
});

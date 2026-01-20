/**
 * QuickManual - Popup Script for Chrome
 */

document.addEventListener('DOMContentLoaded', () => {
    // Open Timeline button
    document.getElementById('openTimeline').addEventListener('click', () => {
        chrome.tabs.create({
            url: 'https://app.monitask.com/report/'
        });
        window.close();
    });

    // Update status based on current tab
    updateStatus();
});

async function updateStatus() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            const url = tab.url || '';
            const isMonitask = url.includes('monitask.com');

            const statusDot = document.querySelector('.status-dot');
            const statusText = document.querySelector('.status span');

            if (isMonitask) {
                statusDot.style.background = '#00ff88';
                statusText.textContent = 'Active on Monitask';
            } else {
                statusDot.style.background = '#ffcc00';
                statusText.textContent = 'Open Monitask to use';
            }
        }
    } catch (err) {
        console.error('Error updating status:', err);
    }
}

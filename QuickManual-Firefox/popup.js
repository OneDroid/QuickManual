/**
 * Monitask Auto Time Filler - Popup Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // Open Timeline button
    document.getElementById('openTimeline').addEventListener('click', () => {
        browser.tabs.create({
            url: 'https://app.monitask.com/report/'
        });
        window.close();
    });

    // Rescan Page button
    document.getElementById('scanPage').addEventListener('click', async () => {
        try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
                await browser.tabs.sendMessage(tabs[0].id, { action: 'scanPage' });
            }
            window.close();
        } catch (err) {
            console.error('Error sending scan message:', err);
        }
    });

    // Update status based on current tab
    updateStatus();
});

async function updateStatus() {
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            const url = tabs[0].url || '';
            const isMonitask = url.includes('monitask.com');

            const statusDot = document.querySelector('.status-dot');
            const statusText = document.querySelector('.status span');

            if (isMonitask) {
                statusDot.style.background = '#38ef7d';
                statusText.textContent = 'Active on Monitask';
            } else {
                statusDot.style.background = '#ffd700';
                statusText.textContent = 'Open Monitask Timeline to use';
            }
        }
    } catch (err) {
        console.error('Error updating status:', err);
    }
}

/**
 * Monitask Auto Time Filler - Background Script
 */

// Create context menu item on install
browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
        id: "matf-fill-time",
        title: "Fill Manual Time Entry",
        contexts: ["selection"]
    });

    console.log('[MATF] Extension installed');
});

// Handle context menu click
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "matf-fill-time" && info.selectionText) {
        // Send message to content script
        browser.tabs.sendMessage(tab.id, {
            action: "fillTimeFromSelection",
            selectionText: info.selectionText
        }).catch(err => {
            console.error('[MATF] Error sending message:', err);
        });
    }
});

// Handle messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openTimeline") {
        browser.tabs.create({
            url: "https://app.monitask.com/report/timeline"
        });
    }
    return true;
});

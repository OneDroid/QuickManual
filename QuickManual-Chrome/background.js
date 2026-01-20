/**
 * QuickManual - Background Service Worker for Chrome
 */

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "qm-fill-time",
        title: "Fill Manual Time Entry",
        contexts: ["selection"]
    });
    console.log('[QuickManual] Extension installed');
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "qm-fill-time" && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
            action: "fillTimeFromSelection",
            selectionText: info.selectionText
        });
    }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openTimeline") {
        chrome.tabs.create({
            url: "https://app.monitask.com/report/timeline"
        });
    }
    return true;
});

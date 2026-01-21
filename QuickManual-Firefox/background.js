/**
 * QuickManual - Background Script
 * Optimized for Production (Chrome & Firefox)
 */

const ext = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);

if (ext) {
    // Create context menu on install
    ext.runtime.onInstalled.addListener(() => {
        ext.contextMenus.create({
            id: "qm-fill-time",
            title: "Fill Manual Time Entry",
            contexts: ["selection"]
        });
    });

    // Handle context menu click
    ext.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === "qm-fill-time" && info.selectionText) {
            ext.tabs.sendMessage(tab.id, {
                action: "fillTimeFromSelection",
                selectionText: info.selectionText
            }).catch(() => {
                // Ignore errors if content script is not injected
            });
        }
    });

    // Handle messages
    ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "openTimeline") {
            ext.tabs.create({
                url: "https://app.monitask.com/report/timeline"
            });
        }
        return true;
    });
}

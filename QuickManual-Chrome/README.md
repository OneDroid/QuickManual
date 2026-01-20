# QuickManual - Chrome Extension for Monitask

A Chrome browser extension that adds "Add Manual" buttons to inactive time blocks on the Monitask Timeline page.

## Features

- 🔵 **Blue-themed UI** - Clean, modern design
- ⏱️ **Hover to reveal** - "Add Manual" button appears when you hover over inactive blocks
- 🎯 **One-click fill** - Automatically opens dialog and fills start/end times
- 📋 **Context menu** - Right-click on selected time text to fill manually

## Installation

### Method 1: Load Unpacked (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `QuickManual` folder
5. The extension is now installed!

### Method 2: Pack Extension

1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Pack extension"
4. Select the `QuickManual` folder
5. This creates a `.crx` file you can share

## Usage

1. Go to your **Monitask Timeline** page (`https://app.monitask.com/report/timeline`)
2. **Hover** over any gray or pink inactive time block
3. A blue **"Add Manual"** button will appear
4. **Click** the button
5. The "Add Manual Time" dialog opens with times auto-filled!
6. Fill in project, task, and comment, then Save

## Files

```
QuickManual/
├── manifest.json      # Chrome Manifest V3 config
├── background.js      # Service worker for context menu
├── content.js         # Main script that adds buttons
├── styles.css         # Button and highlight styles
├── popup.html         # Extension popup
├── popup.js           # Popup logic
├── icons/
│   ├── icon-16.svg
│   ├── icon-48.svg
│   └── icon-128.svg
└── README.md
```

## Detected Inactive Blocks

The extension detects:
- **Gray blocks** - Offline/gap periods (empty content)
- **Pink blocks** - Marked as "(Inactive Time)"
- Blocks with tooltip format: `"Started on X:XX:XX AM Ending on X:XX:XX AM"`

## Permissions

- `activeTab` - Access current tab
- `storage` - Save preferences
- `contextMenus` - Right-click menu
- `host_permissions` - Run on Monitask pages

## Troubleshooting

**Button not appearing?**
1. Make sure you're on app.monitask.com
2. Refresh the page
3. Check console for `[QuickManual]` logs

**Form not filling?**
1. Make sure the Add Manual dialog is open
2. Check if timepicker initialized properly

## Version

- **v1.0** - Initial release

---

Made for Monitask users 🚀

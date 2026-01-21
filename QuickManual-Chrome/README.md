# QuickManual - Chrome Extension for Monitask

A Chrome browser extension that adds "Add Manual" buttons to inactive time blocks on the Monitask Timeline page.

## Features

- Blue-themed UI - Clean, modern design
- Hover to reveal - "Add Manual" button appears when you hover over inactive blocks
- One-click fill - Automatically opens dialog and fills start/end times
- Context menu - Right-click on selected time text to fill manually
- Auto-calculate Manual Time - Automatically sums all manual time requests and shows the total at the bottom of the table

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `QuickManual-Chrome` folder
5. The extension is now installed!

## Usage

1. Go to your **Monitask Timeline** page (`https://app.monitask.com/report/timeline`)
2. **Hover** over any gray or pink inactive time block
3. An **"Add Manual"** button will appear
4. **Click** the button
5. The "Add Manual Time" dialog opens with times auto-filled!
6. Fill in project, task, and comment, then Save

## Files

```
QuickManual-Chrome/
├── manifest.json      # Chrome Manifest V3 config
├── background.js      # Service worker
├── content.js         # Main script
├── styles.css         # Styles
├── popup.html         # Popup
├── popup.js           # Popup logic
├── icons/
│   ├── icon-16.svg
│   ├── icon-48.svg
│   └── icon-128.svg
└── README.md
```

## Permissions

- `activeTab` - Access current tab
- `storage` - Save preferences
- `contextMenus` - Right-click menu
- `host_permissions` - Run on Monitask pages

---

Made for Monitask users

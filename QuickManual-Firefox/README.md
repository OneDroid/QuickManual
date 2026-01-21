# QuickManual - Firefox Extension for Monitask

A Firefox browser extension that adds "Add Manual" buttons to inactive time blocks on the Monitask Timeline page.

## Features

- Purple-themed UI - Clean, modern design
- Hover to reveal - "Add Manual" button appears when you hover over inactive blocks
- One-click fill - Automatically opens dialog and fills start/end times
- Context menu - Right-click on selected time text to fill manually
- Auto-calculate Manual Time - Automatically sums all manual time requests and shows the total at the bottom of the table

## Installation

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on"**
3. Select the `manifest.json` file in the `QuickManual-Firefox` folder
4. The extension is now installed!

## Usage

1. Go to your **Monitask Timeline** page (`https://app.monitask.com/report/timeline`)
2. **Hover** over any gray or pink inactive time block
3. An **"Add Manual"** button will appear
4. **Click** the button
5. The "Add Manual Time" dialog opens with times auto-filled!
6. Fill in project, task, and comment, then Save

## Files

```
QuickManual-Firefox/
├── manifest.json      # Firefox Manifest V3 config
├── background.js      # Background script
├── content.js         # Main script that adds buttons
├── styles.css         # Button and highlight styles
├── popup.html         # Extension popup
├── popup.js           # Popup logic
├── icons/
│   ├── icon-48.svg
│   └── icon-96.svg
└── README.md
```

## Permissions

- `activeTab` - Access current tab
- `storage` - Save preferences
- `contextMenus` - Right-click menu
- `host_permissions` - Run on Monitask pages

## Version

- **v1.0** - Initial release

---

Made for Monitask users

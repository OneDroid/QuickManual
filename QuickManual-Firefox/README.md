# Monitask Auto Time Filler

A Firefox browser extension that automatically detects inactivity gaps on the Monitask Timeline page and allows you to fill manual time entries with just one click.

## Features

- 🔍 **Auto-Detection**: Automatically scans the Monitask Timeline page for inactive/gap periods
- ⏱️ **One-Click Fill**: Click on any inactive period to automatically fill the manual time entry form
- 🎯 **Hover Buttons**: Hover over inactive time blocks to see a quick "Add Manual" button
- 📋 **Floating Panel**: View all inactive periods in a convenient floating panel
- 📝 **Context Menu**: Right-click on selected time text to fill the form (e.g., "10:00 AM - 11:30 AM")
- 🎨 **Beautiful UI**: Modern, gradient-styled interface

## Installation

### Method 1: Temporary Installation (for testing)

1. Open Firefox and navigate to `about:debugging`
2. Click on "This Firefox" in the left panel
3. Click "Load Temporary Add-on..."
4. Navigate to the extension folder and select `manifest.json`

### Method 2: Permanent Installation

1. Package the extension:
   - Zip all files in the `MonitaskAutoFiller` folder
   - Rename the `.zip` to `.xpi`
2. Open Firefox and navigate to `about:addons`
3. Click the gear icon and select "Install Add-on From File..."
4. Select the `.xpi` file

## Usage

### On the Monitask Timeline Page:

1. **Floating Button**: Look for the clock button (⏱️) at the bottom-right corner
   - Click it to open a panel showing all detected inactive periods
   - Click "Fill" next to any period to auto-fill the manual time form

2. **Hover Buttons**: Hover over any gray/pink inactive time block in the timeline
   - A purple "Add Manual" button will appear
   - Click it to fill the form with that time period

3. **Context Menu**: Select any time range text on the page (e.g., "9:28:43 AM Ending on 9:38:53 AM")
   - Right-click the selection
   - Choose "Fill Manual Time Entry"

### Detected Inactive Periods:

The extension detects the following types of inactive time:

- **Gray blocks**: Offline/gap periods with no activity
- **Pink blocks**: Marked as "(Inactive Time)" by Monitask
- **Tooltip times**: Reads "Started on X:XX:XX AM Ending on X:XX:XX AM" from tooltips

## Files Structure

```
MonitaskAutoFiller/
├── manifest.json        # Extension configuration
├── background.js        # Background script for context menu
├── content.js           # Main content script for timeline page
├── styles.css           # Styling for overlays and buttons
├── popup.html           # Extension popup UI
├── popup.js             # Popup script
├── icons/
│   ├── icon-48.svg      # 48px icon
│   └── icon-96.svg      # 96px icon
└── README.md            # This file
```

## Form Fields Filled

When you click to fill, the extension automatically populates:

- **From Time**: Start time of the inactive period
- **To Time**: End time of the inactive period

You will still need to:
- Select a Project (if not already selected)
- Select or add a Task
- Optionally add a Comment
- Click "Save" to submit

## Permissions Required

- `activeTab`: To access the current tab's content
- `storage`: To save extension preferences
- `https://app.monitask.com/*`: To run on Monitask pages
- `https://www.monitask.com/*`: To run on Monitask pages
- `https://monitask.com/*`: To run on Monitask pages

## Troubleshooting

### Extension not detecting inactive periods?

1. Make sure you're on the Monitask Timeline page
2. Wait for the page to fully load
3. Click the floating clock button and click "Rescan Page"

### Form not filling correctly?

1. Make sure the "Add Manual Time" dialog is open
2. If the timepicker has issues, try manually clicking the time fields after auto-fill

### Button not appearing on inactive blocks?

Some inactive blocks may be too small to show the button. Use the floating panel instead.

## Development

To modify this extension:

1. Edit the source files
2. Go to `about:debugging` in Firefox
3. Click "Reload" next to the extension

## Version History

- **v2.0**: Complete rewrite with floating panel, hover buttons, and improved detection
- **v1.0**: Initial version with context menu support

## License

MIT License - Feel free to modify and distribute.

---

Made with ❤️ for Monitask users

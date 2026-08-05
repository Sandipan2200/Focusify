# FocusTube Chrome Extension

FocusTube is a Chrome extension that removes **brain rot**, **green screen**, and **AI-generated** videos from YouTube.

## Features

- **Brain Rot filter** — hides Skibidi, Sigma, Rizz, "aura" edits and similar low-effort meme content
- **AI-Generated filter** — hides "AI generated" videos, Sora/Veo/Runway clips, AI voiceovers, AI slop
- **Green Screen filter** — hides gameplay-footage-voiceover content (Subway Surfers / Minecraft parkour style)
- **Fully editable keyword lists** per category in the options page
- **Blocked channels** — hide every video from specific channels
- **Statistics** — per-category daily and weekly counts
- **Watch-page warning banner** with one-click channel blocking

Detection matches video titles and channel names against keyword lists. Works on Home, Search, the suggested-videos sidebar, Shorts grids, and the watch page.

## Pages

### Popup
- Quick on/off toggles for: Brain Rot, Green Screen, AI-Generated
- Today's stats
- Open Settings / Reset Statistics buttons

### Options Page
- Filters (global toggles)
- Brain Rot / AI-Generated / Green Screen keyword editors (add + remove)
- Blocked Channels (list, search, add, remove)
- Statistics (daily + weekly per category)
- About

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click **Load unpacked**
4. Select the `FocusTube` folder

## Folder Structure

```
FocusTube/
├── manifest.json
├── background.js
├── content.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/
│   ├── options.html
│   ├── options.css
│   └── options.js
├── styles/
│   └── content.css
├── utils/
├── assets/
│   └── icons/
└── README.md
```

## Notes on detection limits

Video content itself cannot be inspected from a content script. Detection is heuristic:
- Brain rot and green screen titles/patterns are usually caught well via keywords
- AI-generated content that never mentions AI in the title or channel name may slip through
If you spot content that is not being filtered, add its characteristic term to the matching keyword list in the options page.
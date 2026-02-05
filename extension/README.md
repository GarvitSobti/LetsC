# Steady Assist - AI-Powered Accessibility Assistant

> Making the web accessible for users with motor impairments through intelligent cursor assistance

## Installation

### Prerequisites

The extension icons are already included in the `icons/` folder. No additional setup needed!

### Loading the Extension

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - OR click the puzzle icon → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to and select: `c:\Users\GARVIT\LetsC\extension`
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "Steady Assist" in your extensions list
   - The extension icon should appear in your toolbar
   - Status should show "Errors: 0"

### First-Time Setup

1. **Pin the Extension** (optional)
   - Click the puzzle icon in Chrome toolbar
   - Find "Steady Assist" and click the pin icon

2. **Configure Settings**
   - Click the Steady Assist icon
   - Ensure "Enable Assistance" is ON (green)
   - Adjust sensitivity (1-5, default is 3)
   - Enable visual feedback for better visibility

3. **Test It Out**
   - Go to any website with buttons (e.g., Google, Amazon)
   - **IMPORTANT:** Refresh the page (F5) after loading extension
   - Hover slowly over a button for 2 seconds
   - Watch it expand and highlight automatically!

## Troubleshooting

### Extension Not Working?

**Problem:** Buttons not expanding, no visual feedback

**Solution:**
1. Go to `chrome://extensions/`
2. Find "Steady Assist" and click the **Reload** button (circular arrow)
3. Go to your test website and **refresh the page** (F5)
4. Open Console (F12 → Console tab)
5. Look for: `✅ Steady Assist: Ready and listening!`

**If you don't see console messages:**
- The page was loaded BEFORE the extension was installed
- Content scripts only inject on pages loaded AFTER extension installation
- Solution: Always refresh pages after loading/reloading the extension

### "Could not establish connection" Error?

**This is normal!** The error occurs when:
- The popup tries to send messages but the content script isn't ready yet
- The background script tries to message a popup that's closed
- These errors are safely handled and won't affect functionality

**To verify it's working:**
- Check if buttons still expand when you hover
- Check console for success messages (not errors in background)
- The extension works even if you see these errors

### Extension Shows Errors?

1. **Check manifest.json** - Must be valid JSON
2. **Check icons exist** - All three sizes must be present
3. **Reload extension** - Click reload button in chrome://extensions/
4. **Check console** - Look for JavaScript errors in red

## Current Features Implemented

### ✅ Working Now

- Cursor movement tracking
- Hesitation detection (hovering over buttons)
- Visual feedback (highlights, spacing)
- Click area expansion
- Surrounding area simplification
- Confidence scoring
- Settings persistence
- Stats tracking

### 🔄 AI Implementation (Next Step)

The current code uses **rule-based heuristics** for:

- Slow cursor = hesitation
- Hover time > threshold = uncertainty
- Speed analysis for prediction

**Where AI comes in:**

1. **Cursor trajectory prediction** - Predict which button user is aiming for
2. **Tremor pattern learning** - Learn individual tremor patterns
3. **Adaptive thresholds** - Auto-adjust sensitivity per user
4. **Click success prediction** - Prevent mis-clicks before they happen

This is STRONG AI justification because:

- Elderly users have unique patterns
- AI learns individual tremor characteristics
- Improves over time with usage
- Impossible with static rules

## Project Structure

```
extension/
├── manifest.json       # Extension config
├── popup.html         # UI you see when clicking icon
├── popup.css          # Popup styling
├── popup.js           # Popup logic
├── content.js         # Main magic (runs on every page)
├── content.css        # Injected styles
├── background.js      # Background service worker
└── icons/            # Extension icons (you need to add)
```

## How It Works

1. **Content Script** (`content.js`) runs on every webpage
2. Tracks your mouse movements constantly
3. Detects when you're hesitating (slow movement, hovering)
4. Automatically:
   - Expands button click areas
   - Fades non-essential elements
   - Adds visual highlights
   - Makes clicking easier
5. Gradually restores normal UI after successful click

## Next Steps for AI

### Option 1: TensorFlow.js (Client-Side, Privacy-First)

```javascript
// Add to content.js
import * as tf from '@tensorflow/tfjs';

// Train model on cursor patterns
const model = await trainTremorModel(userClickHistory);

// Predict intended target
const prediction = model.predict(cursorTrajectory);
```

### Option 2: OpenAI API (Faster to Implement)

```javascript
// Send cursor data to API
const prediction = await fetch('/api/predict-target', {
  method: 'POST',
  body: JSON.stringify({ cursorHistory, visibleButtons }),
});
```

## For Your Team

**Person 1 (Frontend):** Improve popup UI, add more controls
**Person 2 (Content Script):** Refine detection algorithms  
**Person 3 (AI):** Implement prediction model
**Person 4 (Testing):** Test on various websites, gather metrics
**Person 5 (Docs):** Document features, create demo script

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and shows controls
- [ ] Toggle switch enables/disables assistance
- [ ] Moving mouse slowly triggers highlights
- [ ] Clicking buttons works normally
- [ ] Stats update in popup
- [ ] Settings persist after closing

## Common Issues

**Extension won't load:**

- Check console in `chrome://extensions/` for errors
- Make sure all files exist
- Icons must be present

**Not working on pages:**

- Refresh page after loading extension
- Check browser console (F12) for errors
- Some sites block extensions (banking sites)

**No visual feedback:**

- Check "Show visual feedback" is ON in settings
- Try increasing sensitivity

---

**You now have a working foundation!** Test it, then we'll add AI prediction next.

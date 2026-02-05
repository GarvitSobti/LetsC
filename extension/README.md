# Steady Assist - Chrome Extension

## Quick Start (Load the Extension)

### Step 1: Create Icons

You need 3 icon sizes. For now, use any simple icon or create colored squares:

- `icons/icon16.png` (16x16px)
- `icons/icon48.png` (48x48px)
- `icons/icon128.png` (128x128px)

**Quick fix:** Visit https://www.favicon-generator.org/ and upload any simple image to generate all sizes.

### Step 2: Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder: `c:\Users\GARVIT\LetsC\extension`
5. Extension should appear in your toolbar!

### Step 3: Test It

1. Go to any website (try a pharmacy site or complex form)
2. Click the extension icon to open popup
3. Make sure "Enable Assistance" is ON
4. Move your mouse slowly over buttons - watch the magic happen!

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

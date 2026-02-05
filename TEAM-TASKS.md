# Team Task Assignments - Steady Assist

**Status:** Ready for parallel development
**Date:** February 5, 2026
**Team Size:** 5 people (including you)

## Branch Naming Convention

```
feature/[task-number]-[short-description]

Examples:
- feature/1-metrics-dashboard
- feature/2-cursor-prediction
- feature/3-demo-mode
```

## Git Workflow

```bash
# Create your branch
git checkout -b feature/[your-task-number]-[description]

# Work on your feature
# ... make changes ...

# Commit your work
git add .
git commit -m "feat: [describe what you did]"

# Push to remote
git push origin feature/[your-task-number]-[description]

# When done, create Pull Request for review
```

---

## TASK 1: Metrics Dashboard (Frontend)

**Assignee:** Frontend Developer
**Branch:** `feature/1-metrics-dashboard`
**Priority:** HIGH
**Estimated Time:** 3-4 hours

### Objective

Create a comprehensive metrics dashboard in the popup to show before/after statistics and prove impact.

### Requirements

1. **Add New Section to popup.html**
   - Create "Metrics" tab/section below current stats
   - Add containers for charts and graphs

2. **Track Additional Metrics in content.js**
   - Click accuracy (successful clicks vs. mis-clicks)
   - Time-to-click (seconds from hover start to click)
   - Hesitation duration (total time spent hovering)
   - Assisted vs. unassisted clicks ratio

3. **Create Visualizations in popup.js**
   - Bar chart: Clicks saved per session
   - Line graph: Confidence level over time
   - Percentage: Click accuracy improvement
   - Timer: Total time saved

4. **Add Export Feature**
   - "Export Stats" button
   - Download CSV with all metrics
   - For presentation and analysis

### Files to Modify

- `extension/popup.html` - Add metrics section HTML
- `extension/popup.css` - Style charts and graphs
- `extension/popup.js` - Implement chart rendering logic
- `extension/content.js` - Add new metric tracking (lines 170-195)

### Acceptance Criteria

- [ ] Popup shows at least 4 different metrics
- [ ] Visualizations update in real-time
- [ ] Export button downloads valid CSV
- [ ] Mobile-friendly responsive design
- [ ] No performance impact on popup load time

### Bonus Points

- Animated number counters
- Color-coded success/warning indicators
- Weekly/monthly trend analysis

---

## TASK 2: AI Cursor Prediction (Backend/AI)

**Assignee:** Backend/AI Specialist
**Branch:** `feature/2-cursor-prediction`
**Priority:** HIGH
**Estimated Time:** 4-5 hours

### Objective

Integrate machine learning functions from ml-helpers.js to predict intended targets and prevent mis-clicks.

### Requirements

1. **Copy ML Functions into content.js**
   - `predictIntendedTarget()` - Predict which button user wants
   - `analyzeTremorPattern()` - Detect tremor characteristics
   - `calculateSnapPosition()` - Magnetic cursor positioning
   - `willClickMiss()` - Predict if click will miss target

2. **Integrate into Cursor Tracking**
   - Call prediction on every cursor movement
   - Score nearby buttons by likelihood
   - Pre-assist the predicted target (subtle hint)

3. **Implement Tremor Learning**
   - Store user's tremor pattern in chrome.storage
   - Update pattern after each session
   - Adjust assistance based on learned severity

4. **Add Snap-to-Target**
   - When cursor within 20px of predicted button
   - Subtly nudge cursor toward center (5-10px max)
   - Smooth animation (not jarring)

### Files to Modify

- `extension/content.js` - Add ML functions (after line 100)
- `extension/content.js` - Integrate into `analyzeCursorBehavior()` (line 193)
- `extension/background.js` - Store learned patterns

### Acceptance Criteria

- [ ] Cursor prediction working on button hover
- [ ] Tremor pattern stored and persists across sessions
- [ ] Snap-to-target activates within 20px radius
- [ ] No false positives (wrong button predicted)
- [ ] Performance: < 50ms prediction time

### Testing Checklist

- [ ] Test on pharmacy site with multiple buttons
- [ ] Verify prediction accuracy > 80%
- [ ] Check snap doesn't interfere with normal clicks
- [ ] Ensure patterns don't consume > 5KB storage

---

## TASK 3: Demo Mode (Full-Stack)

**Assignee:** Full-Stack Developer
**Branch:** `feature/3-demo-mode`
**Priority:** MEDIUM
**Estimated Time:** 3 hours

### Objective

Create a demo mode that simulates tremor movements for presentation purposes.

### Requirements

1. **Add Demo Toggle to Popup**
   - "Demo Mode" toggle switch
   - "Simulate Tremor" checkbox
   - Tremor severity slider (mild/moderate/severe)

2. **Create Tremor Simulator**
   - Override real mouse position with simulated tremor
   - Add random offset to cursor (2-15px based on severity)
   - Frequency: 8-12 Hz (realistic tremor frequency)
   - Visual cursor trail showing actual vs. intended path

3. **Side-by-Side Comparison**
   - Split screen: "Without Assist" vs. "With Assist"
   - Auto-record metrics for both scenarios
   - Generate comparison report

4. **Auto-Scenario Player**
   - Predefined test scenario (pharmacy form fill)
   - Auto-hover over buttons with simulated tremor
   - Show before/after metrics at the end

### Files to Modify

- `extension/popup.html` - Add demo controls
- `extension/popup.js` - Handle demo mode toggling
- `extension/content.js` - Add tremor simulation overlay
- NEW: `extension/demo-mode.js` - Demo logic

### Acceptance Criteria

- [ ] Toggle activates simulated tremor overlay
- [ ] Tremor looks realistic (not random jitter)
- [ ] Comparison mode works without page refresh
- [ ] Metrics clearly show improvement percentage
- [ ] Can screenshot/record for presentation

### Demo Script Features

- Auto-run button that executes full demo
- Pause/resume controls
- Adjustable playback speed
- Export results as JSON

---

## TASK 4: Enhanced Visual Feedback (Frontend/UX)

**Assignee:** Frontend Developer #2
**Branch:** `feature/4-visual-feedback`
**Priority:** MEDIUM
**Estimated Time:** 2-3 hours

### Objective

Improve visual feedback with better animations, indicators, and accessibility features.

### Requirements

1. **Better Button Expansion Animation**
   - Smooth spring animation (not linear)
   - Pulse effect when assistance triggers
   - Ripple effect on click

2. **Add Directional Hints**
   - Arrow pointing to assisted element
   - Subtle cursor trail showing intended path
   - Distance indicator (e.g., "12px away")

3. **Accessibility Improvements**
   - High contrast mode option
   - Larger text option for settings
   - Screen reader announcements
   - Keyboard navigation support

4. **Sound Feedback (Optional)**
   - Gentle "ping" when assistance activates
   - Success sound on click
   - Mute option in settings

### Files to Modify

- `extension/content.css` - Add new animations
- `extension/content.js` - Implement directional hints
- `extension/popup.html` - Add accessibility settings
- `extension/popup.css` - High contrast styles

### Acceptance Criteria

- [ ] Animations feel natural and smooth
- [ ] Visual hints don't obstruct content
- [ ] High contrast mode passes WCAG AA standards
- [ ] Keyboard navigation works in popup
- [ ] Sound can be toggled on/off

### Animation Ideas

- Scale + glow (current)
- Breathing pulse effect
- Magnetic pull visualization
- Success confetti (subtle)

---

## TASK 5: Testing & Documentation (QA)

**Assignee:** QA/Testing Specialist
**Branch:** `feature/5-testing-docs`
**Priority:** HIGH
**Estimated Time:** 3-4 hours

### Objective

Comprehensive testing across multiple websites and documenting results for demo.

### Requirements

1. **Test on 10+ Websites**
   - CVS.com (prescription refill)
   - Walgreens.com (account management)
   - Amazon.com (checkout process)
   - eBay.com (bidding interface)
   - Google.com (search and Gmail)
   - Facebook.com (post interaction)
   - YouTube.com (video controls)
   - Government sites (SSA, IRS forms)
   - Banking sites (Wells Fargo, Chase)
   - News sites (CNN, BBC)

2. **Collect Metrics for Each Site**
   - Number of buttons detected
   - Assistance trigger rate
   - False positive rate
   - Click success rate
   - Time-to-click average

3. **Document Bugs and Issues**
   - Create bug reports in GitHub Issues
   - Priority level (Critical/Major/Minor)
   - Steps to reproduce
   - Screenshots/screen recordings

4. **Create Test Report**
   - Summary table of all sites tested
   - Success rate per site category
   - Known limitations and workarounds
   - Recommendations for improvement

### Deliverables

- `TESTING-REPORT.md` - Comprehensive test results
- `KNOWN-ISSUES.md` - Bug tracker
- `DEMO-SITES.md` - Best sites for demo
- Screen recordings of successful tests

### Acceptance Criteria

- [ ] At least 10 different sites tested
- [ ] Metrics collected for all tests
- [ ] At least 5 bugs documented
- [ ] Test report formatted professionally
- [ ] Demo-ready site list with reasons

### Testing Scenarios

1. **Happy Path** - Normal usage, everything works
2. **Edge Cases** - Tiny buttons, overlapping elements
3. **Stress Test** - Page with 100+ buttons
4. **Performance** - Memory and CPU usage
5. **Compatibility** - Different screen sizes

---

## TASK 6: Onboarding Tutorial (Frontend/UX)

**Assignee:** Frontend Developer (can be combined with Task 1 or 4)
**Branch:** `feature/6-onboarding-tutorial`
**Priority:** LOW
**Estimated Time:** 2 hours

### Objective

Create first-time user tutorial overlay to explain features.

### Requirements

1. **Welcome Overlay**
   - Shows on first extension install
   - 3-4 step tutorial highlighting features
   - "Skip" and "Next" buttons
   - Progress dots indicator

2. **Interactive Walkthrough**
   - Step 1: "This is how we detect hesitation"
   - Step 2: "Watch the button expand"
   - Step 3: "Check your stats here"
   - Step 4: "Adjust settings to your preference"

3. **Help Button in Popup**
   - Question mark icon
   - Re-triggers tutorial on click
   - Quick tips tooltips

### Files to Modify

- NEW: `extension/tutorial.html` - Tutorial overlay
- NEW: `extension/tutorial.css` - Tutorial styles
- NEW: `extension/tutorial.js` - Tutorial logic
- `extension/background.js` - Detect first install
- `extension/popup.html` - Add help button

### Acceptance Criteria

- [ ] Tutorial shows automatically on first install
- [ ] Can skip or complete tutorial
- [ ] Tutorial can be replayed from popup
- [ ] Mobile-friendly overlay
- [ ] Doesn't interfere with regular usage

---

## TASK 7: Performance Optimization (Backend)

**Assignee:** Backend/Performance Specialist
**Branch:** `feature/7-performance-optimization`
**Priority:** MEDIUM
**Estimated Time:** 2-3 hours

### Objective

Optimize cursor tracking and DOM manipulation for better performance.

### Requirements

1. **Throttle Event Listeners**
   - Reduce mousemove handler frequency
   - Use requestAnimationFrame for smooth updates
   - Debounce expensive calculations

2. **Optimize DOM Queries**
   - Cache element references
   - Use event delegation instead of multiple listeners
   - Minimize reflows and repaints

3. **Memory Management**
   - Limit cursor history to 10 points (already done)
   - Clean up event listeners on disable
   - Remove data attributes after restoration

4. **Lazy Loading**
   - Don't track cursor until near interactive element
   - Activate assistance zone-by-zone
   - Sleep mode when no interaction for 30s

### Files to Modify

- `extension/content.js` - All performance optimizations
- `extension/background.js` - Memory cleanup

### Acceptance Criteria

- [ ] Memory usage < 10MB per tab
- [ ] CPU usage < 5% during tracking
- [ ] 60fps maintained during animations
- [ ] No jank or stuttering
- [ ] Page load time unchanged

### Benchmarks to Beat

- Event handler execution: < 16ms (60fps)
- Assistance trigger delay: < 100ms
- DOM query time: < 5ms
- Total memory footprint: < 15MB

---

## TASK 8: Settings Presets (Frontend)

**Assignee:** Frontend Developer
**Branch:** `feature/8-settings-presets`
**Priority:** LOW
**Estimated Time:** 1-2 hours

### Objective

Add preset configurations for different user needs.

### Requirements

1. **Preset Buttons in Popup**
   - "Mild Tremor" preset
   - "Moderate Tremor" preset
   - "Severe Tremor" preset
   - "Custom" (current settings)

2. **Preset Configurations**

   ```javascript
   PRESETS = {
     mild: { sensitivity: 2, visualFeedback: true, autoAdapt: true },
     moderate: { sensitivity: 3, visualFeedback: true, autoAdapt: true },
     severe: { sensitivity: 5, visualFeedback: true, autoAdapt: true },
   };
   ```

3. **One-Click Apply**
   - Click preset button to apply instantly
   - Show confirmation toast
   - Highlight active preset

### Files to Modify

- `extension/popup.html` - Add preset buttons
- `extension/popup.css` - Style presets
- `extension/popup.js` - Preset logic

### Acceptance Criteria

- [ ] 3 presets available
- [ ] Clicking applies immediately
- [ ] Visual indication of active preset
- [ ] Can revert to custom settings
- [ ] Presets explained in tooltip

---

## Integration Plan (When Team Lead Returns)

### Order of Merging

1. **TASK 7** - Performance Optimization (base improvements)
2. **TASK 2** - AI Cursor Prediction (core feature)
3. **TASK 1** - Metrics Dashboard (proof of impact)
4. **TASK 4** - Enhanced Visual Feedback (UX polish)
5. **TASK 3** - Demo Mode (presentation tool)
6. **TASK 8** - Settings Presets (nice-to-have)
7. **TASK 6** - Onboarding Tutorial (final polish)
8. **TASK 5** - Testing Results (documentation)

### Merge Conflict Prevention

- Each task works on different files primarily
- Communicate in team chat before modifying shared files
- Pull latest main branch before starting work
- Keep changes focused on assigned task

### Code Review Checklist

- [ ] Code runs without console errors
- [ ] No performance degradation
- [ ] Comments added for complex logic
- [ ] Follows existing code style
- [ ] Tested on at least 3 websites
- [ ] No hardcoded values (use config/constants)

---

## Communication Protocol

### Daily Standup (Quick Check-in)

**Share in team chat:**

1. What I did yesterday
2. What I'm doing today
3. Any blockers

### When Stuck (More Than 30 Minutes)

1. Check documentation
2. Search error in Google
3. Ask team chat
4. Pair program with teammate

### Before Pushing Code

1. Test locally (reload extension)
2. Check console for errors
3. Verify on 2-3 different websites
4. Commit with clear message

### Pull Request Template

```markdown
## What Changed

Brief description of your feature

## Testing Done

- Tested on [list websites]
- Metrics: [any numbers]
- Screenshots: [if applicable]

## Checklist

- [ ] Code runs without errors
- [ ] Tested on 3+ sites
- [ ] Comments added
- [ ] Performance checked
```

---

## Emergency Contacts

**Team Lead (You):** Will check in periodically
**Git Issues:** Create GitHub issue with "blocked" label
**Urgent:** Message team lead directly

---

## Success Metrics (Hackathon Goals)

By the end of development sprint:

- [ ] Extension works on 10+ major websites
- [ ] AI prediction accuracy > 75%
- [ ] Measurable metrics showing impact
- [ ] Demo mode ready for presentation
- [ ] Zero critical bugs
- [ ] Professional documentation
- [ ] 5-minute demo script prepared

**Target:** Winning solution with strong AI justification and measurable impact!

---

**Good luck team! Build something amazing! 🚀**

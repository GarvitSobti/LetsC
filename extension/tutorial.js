// Tutorial Mode: First-time user onboarding
(function () {
  'use strict';

  console.log('📚 Tutorial: Script loaded');

  let currentStep = 0;
  let tutorialActive = false;
  let backdrop = null;
  let card = null;
  let arrow = null;
  let testButton = null;
  let hasHoveredTestButton = false;

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Steady Assist! 👋',
      content: `We make the web easier to use for people with motor challenges.
      
Steady Assist automatically detects when you're struggling to click and makes buttons easier to reach.

Let's take a quick 1-minute tour!`,
      buttons: [
        { text: 'Skip', action: 'skip', style: 'secondary' },
        { text: 'Start Tour →', action: 'next', style: 'primary' },
      ],
    },
    {
      id: 'detection',
      title: 'Step 1: Hesitation Detection',
      content: `When you hover slowly over buttons, we detect hesitation and automatically make them easier to click.

Try it now! Hover your mouse over the button below.`,
      interactive: true,
      buttons: [
        { text: '← Back', action: 'back', style: 'secondary' },
        { text: 'Next →', action: 'next', style: 'primary', disabled: true },
      ],
    },
    {
      id: 'feedback',
      title: 'Step 2: Visual Feedback ✓',
      content: `Did you see the button expand with a blue glow?

That's Steady Assist helping you! The button got bigger and easier to click.

This happens automatically whenever you need help.`,
      buttons: [
        { text: '← Back', action: 'back', style: 'secondary' },
        { text: 'Next →', action: 'next', style: 'primary' },
      ],
    },
    {
      id: 'settings',
      title: 'Step 3: Your Control Panel',
      content: `Click the Steady Assist icon in your browser toolbar to access settings:

• **Enable/Disable**: Turn assistance on or off
• **Sensitivity**: How quickly we help (1-5)
• **Stats**: See how much we've helped you
• **Visual Feedback**: Toggle the blue glow

Adjust these anytime to match your needs!`,
      showArrow: true,
      buttons: [
        { text: '← Back', action: 'back', style: 'secondary' },
        { text: 'Next →', action: 'next', style: 'primary' },
      ],
    },
    {
      id: 'complete',
      title: "You're All Set! 🎉",
      content: `Steady Assist is now working in the background.

**How it works:**
• Hover slowly over buttons to trigger help
• Watch for the blue glow when we assist you
• Check your stats to see progress

**Need help later?**
Click the extension icon and look for the help (?) button to replay this tutorial.

Happy browsing!`,
      buttons: [
        { text: 'Replay Tutorial', action: 'restart', style: 'secondary' },
        { text: 'Finish', action: 'finish', style: 'primary' },
      ],
    },
  ];

  function createBackdrop() {
    if (backdrop) return backdrop;

    backdrop = document.createElement('div');
    backdrop.id = 'steady-tutorial-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      z-index: 2147483645;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    `;

    document.body.appendChild(backdrop);
    return backdrop;
  }

  function removeBackdrop() {
    if (backdrop && backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
      backdrop = null;
    }
  }

  function createCard(step) {
    if (card && card.parentNode) {
      card.parentNode.removeChild(card);
    }

    card = document.createElement('div');
    card.id = 'steady-tutorial-card';
    card.style.cssText = `
      background: white;
      padding: 32px;
      border-radius: 16px;
      max-width: 480px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const title = document.createElement('h2');
    title.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    `;
    title.textContent = step.title;

    const content = document.createElement('p');
    content.style.cssText = `
      margin: 0 0 24px 0;
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      white-space: pre-line;
    `;
    content.textContent = step.content;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    step.buttons.forEach((btnConfig, index) => {
      const btn = document.createElement('button');
      btn.textContent = btnConfig.text;
      btn.disabled = btnConfig.disabled || false;
      btn.style.cssText = `
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: ${btnConfig.disabled ? 'not-allowed' : 'pointer'};
        transition: all 0.2s;
        ${
          btnConfig.style === 'primary'
            ? 'background: #3b82f6; color: white;'
            : 'background: #e5e7eb; color: #374151;'
        }
        ${btnConfig.disabled ? 'opacity: 0.5;' : ''}
      `;

      if (!btnConfig.disabled) {
        btn.onmouseenter = () => {
          btn.style.transform = 'translateY(-2px)';
          btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        };
        btn.onmouseleave = () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = 'none';
        };
        btn.onclick = () => handleAction(btnConfig.action, index);
      }

      buttonContainer.appendChild(btn);
    });

    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(buttonContainer);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(-10px); opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);

    return card;
  }

  function createTestButton() {
    if (testButton) return;

    testButton = document.createElement('button');
    testButton.id = 'steady-tutorial-test-button';
    testButton.textContent = 'Hover Over Me!';
    testButton.style.cssText = `
      position: fixed;
      top: 200px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483646;
      padding: 16px 32px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
      transition: all 0.3s;
    `;

    // Make it interactive for the extension
    testButton.setAttribute('role', 'button');
    testButton.setAttribute('tabindex', '0');

    // Listen for hover - triggers immediately
    let hoverTimer = null;
    testButton.addEventListener('mouseenter', () => {
      // Trigger immediately on first hover
      if (!hasHoveredTestButton) {
        hasHoveredTestButton = true;
        enableNextButton();
        // Remove button immediately after hover
        setTimeout(() => {
          removeTestButton();
        }, 100);
      }
    });

    testButton.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
    });

    document.body.appendChild(testButton);
  }

  function removeTestButton() {
    if (testButton && testButton.parentNode) {
      testButton.parentNode.removeChild(testButton);
      testButton = null;
    }
  }

  function createArrow() {
    if (arrow) return;

    arrow = document.createElement('div');
    arrow.style.cssText = `
      position: fixed;
      top: 20px;
      right: 80px;
      width: 0;
      height: 0;
      border-left: 15px solid transparent;
      border-right: 15px solid transparent;
      border-bottom: 20px solid #3b82f6;
      z-index: 2147483647;
      animation: pulse 1.5s infinite;
    `;

    const label = document.createElement('div');
    label.textContent = 'Click here';
    label.style.cssText = `
      position: absolute;
      top: 25px;
      left: 50%;
      transform: translateX(-50%);
      background: #3b82f6;
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    arrow.appendChild(label);
    document.body.appendChild(arrow);
  }

  function removeArrow() {
    if (arrow && arrow.parentNode) {
      arrow.parentNode.removeChild(arrow);
      arrow = null;
    }
  }

  function enableNextButton() {
    if (!card) return;

    const buttons = card.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.textContent.includes('Next')) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });
  }

  function showStep(stepIndex) {
    const step = steps[stepIndex];
    currentStep = stepIndex;

    // Clean up previous step
    removeTestButton();
    removeArrow();

    // Create backdrop
    const bd = createBackdrop();

    // Clear previous card content
    if (card && card.parentNode) {
      card.parentNode.removeChild(card);
      card = null;
    }

    // Create new card
    const newCard = createCard(step);
    bd.appendChild(newCard);

    // Handle special step types
    if (step.interactive) {
      createTestButton();
      hasHoveredTestButton = false;
    }

    if (step.showArrow) {
      createArrow();
    }

    console.log('📚 Tutorial: Showing step', stepIndex + 1, 'of', steps.length);
  }

  function handleAction(action, buttonIndex) {
    switch (action) {
      case 'next':
        if (currentStep < steps.length - 1) {
          showStep(currentStep + 1);
        }
        break;

      case 'back':
        if (currentStep > 0) {
          showStep(currentStep - 1);
        }
        break;

      case 'skip':
      case 'finish':
        closeTutorial();
        chrome.storage.local.set({ tutorialCompleted: true });
        break;

      case 'restart':
        showStep(0);
        break;
    }
  }

  function closeTutorial() {
    tutorialActive = false;
    removeBackdrop();
    removeTestButton();
    removeArrow();
  }

  function startTutorial() {
    if (tutorialActive) return;
    tutorialActive = true;
    showStep(0);
  }

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'START_TUTORIAL') {
      startTutorial();
      sendResponse({ success: true });
    } else if (request.type === 'CLOSE_TUTORIAL') {
      closeTutorial();
      sendResponse({ success: true });
    }
    return true;
  });

  // Auto-start on first install
  chrome.storage.local.get(
    ['tutorialCompleted', 'showTutorialOnNextPage'],
    result => {
      if (!result.tutorialCompleted && result.showTutorialOnNextPage) {
        // Delay to let page load
        setTimeout(() => {
          startTutorial();
          chrome.storage.local.set({ showTutorialOnNextPage: false });
        }, 1500);
      }
    }
  );

  // Expose global for debugging
  try {
    window.__STEADY_TUTORIAL__ = {
      start: startTutorial,
      close: closeTutorial,
      restart: () => showStep(0),
    };
  } catch (e) {
    // ignore
  }

  console.log('✅ Tutorial: Ready');
})();

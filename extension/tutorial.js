// Tutorial Mode: First-time user onboarding
(function () {
  'use strict';

  console.log('📚 Tutorial: Script loaded');

  let currentStep = 0;
  let tutorialActive = false;
  let overlay = null;
  let testButtonHovered = false;

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Steady Assist! 👋',
      message:
        'We make clicking buttons easier for you.\n\nWould you like to see how it works?\n\nThis will only take 1 minute.',
      buttons: [
        { text: 'Not Now', action: 'skip' },
        { text: 'Yes, Show Me', action: 'next', primary: true },
      ],
    },
    {
      id: 'hover-demo',
      title: 'Step 1 of 3',
      message:
        'When you move your mouse slowly over a button,\nwe help you by making it bigger.\n\nTry it now: Move your mouse over this button.',
      showTestButton: true,
      buttons: [
        { text: 'Skip', action: 'skip' },
        { text: 'Next', action: 'next', primary: true, disabled: true },
      ],
    },
    {
      id: 'feedback',
      title: 'Step 2 of 3',
      message:
        "Great job! 🎉\n\nDid you see the button get bigger?\n\nThat's Steady Assist helping you click more easily.",
      buttons: [
        { text: 'Back', action: 'back' },
        { text: 'Next', action: 'next', primary: true },
      ],
    },
    {
      id: 'settings',
      title: 'Step 3 of 3',
      message:
        "You're all set! ✓\n\nSteady Assist is now working.\n\nTo turn it on or off, click the extension icon\nin your browser toolbar.",
      buttons: [
        { text: 'Back', action: 'back' },
        { text: 'Done', action: 'finish', primary: true },
      ],
    },
  ];

  function createOverlay() {
    // Remove any existing overlay
    if (overlay) {
      overlay.remove();
    }

    overlay = document.createElement('div');
    overlay.id = 'steady-tutorial-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2147483645;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  function showStep(stepIndex) {
    console.log('📚 Showing step', stepIndex + 1);

    if (stepIndex < 0 || stepIndex >= steps.length) {
      console.log('📚 Invalid step index');
      return;
    }

    currentStep = stepIndex;
    const step = steps[stepIndex];
    testButtonHovered = false;

    // Create fresh overlay
    const container = createOverlay();
    container.innerHTML = ''; // Clear everything

    // Create card
    const card = document.createElement('div');
    card.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 450px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      position: relative;
    `;

    // Title
    const title = document.createElement('h2');
    title.textContent = step.title;
    title.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    `;
    card.appendChild(title);

    // Message
    const message = document.createElement('p');
    message.textContent = step.message;
    message.style.cssText = `
      margin: 0 0 24px 0;
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      white-space: pre-line;
    `;
    card.appendChild(message);

    // Test button (if needed)
    if (step.showTestButton) {
      const testBtn = document.createElement('button');
      testBtn.textContent = 'Hover Over Me!';
      testBtn.style.cssText = `
        display: block;
        margin: 0 auto 24px;
        padding: 16px 32px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      `;

      testBtn.addEventListener('mouseenter', () => {
        if (!testButtonHovered) {
          testButtonHovered = true;
          testBtn.textContent = '✓ Great!';
          testBtn.style.background = '#10b981';

          // Enable Next button
          const nextBtn = card.querySelector('.btn-next');
          if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
          }

          // Remove test button after a moment
          setTimeout(() => {
            testBtn.style.opacity = '0';
            setTimeout(() => testBtn.remove(), 300);
          }, 800);
        }
      });

      card.appendChild(testBtn);
    }

    // Buttons
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    step.buttons.forEach(btnConfig => {
      const btn = document.createElement('button');
      btn.textContent = btnConfig.text;
      btn.className = btnConfig.action === 'next' ? 'btn-next' : '';
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
          btnConfig.primary
            ? 'background: #3b82f6; color: white;'
            : 'background: #e5e7eb; color: #374151;'
        }
        ${btnConfig.disabled ? 'opacity: 0.5;' : 'opacity: 1;'}
      `;

      if (!btnConfig.disabled) {
        btn.addEventListener('click', () => handleAction(btnConfig.action));
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
        });
      }

      btnContainer.appendChild(btn);
    });

    card.appendChild(btnContainer);
    container.appendChild(card);
  }

  function handleAction(action) {
    console.log('📚 Action:', action);

    switch (action) {
      case 'next':
        if (currentStep < steps.length - 1) {
          showStep(currentStep + 1);
        } else {
          closeTutorial();
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
    console.log('📚 Closing tutorial');
    tutorialActive = false;
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  function startTutorial() {
    if (tutorialActive) return;
    console.log('📚 Starting tutorial');
    tutorialActive = true;
    currentStep = 0;
    showStep(0);
  }

  // Listen for messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'START_TUTORIAL') {
      startTutorial();
      sendResponse({ success: true });
    }
    return true;
  });

  // Auto-start on first install - shows on current page
  chrome.storage.local.get(
    ['tutorialCompleted', 'showTutorialOnNextPage'],
    result => {
      console.log('📚 Tutorial check:', result);
      if (!result.tutorialCompleted && result.showTutorialOnNextPage) {
        console.log('📚 Starting tutorial in 1 second...');
        setTimeout(() => {
          startTutorial();
          chrome.storage.local.set({ showTutorialOnNextPage: false });
        }, 1000);
      } else {
        console.log('📚 Skipping tutorial');
      }
    }
  );

  // Debug helper
  window.__STEADY_TUTORIAL__ = { start: startTutorial, close: closeTutorial };

  console.log('✅ Tutorial: Ready');
})();

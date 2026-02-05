// Main JavaScript file for Team LetsC Hackathon Project

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Team LetsC - Project Initialized!');
  
  // Initialize all components
  initNavigation();
  initButtons();
});

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Initialize button interactions
 */
function initButtons() {
  const ctaButton = document.querySelector('.cta-button');
  
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      alert('Ready to start building! 🚀');
      // Add your button functionality here
    });
  }
}

/**
 * Utility function to make API calls
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options
 */
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
  // You can implement a custom notification system here
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// Export functions for use in other modules (if using modules)
// export { apiCall, showNotification };

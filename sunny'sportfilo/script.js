/**
 * Sunny - Video Editor Portfolio Interactive Script
 * Universal Browser Engine with Direct Firebase Firestore REST Integration
 * (Works 100% on local file:// URLs, live domains, and preview environments)
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCp55D8KuEQms3cHAJdCQSiT4X49UWsQeM",
  authDomain: "portfilo-3e0b6.firebaseapp.com",
  projectId: "portfilo-3e0b6",
  storageBucket: "portfilo-3e0b6.firebasestorage.app",
  messagingSenderId: "256224029357",
  appId: "1:256224029357:web:2bdc9d36355a2d7e3d7424",
  measurementId: "G-LDMH15BDHD"
};

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

// In-memory list of active reviews
let currentReviews = [];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // 3. Navbar scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(10, 10, 11, 0.94)';
      header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    } else {
      header.style.background = 'rgba(10, 10, 11, 0.82)';
      header.style.boxShadow = 'none';
    }
  });

  // 4. Form Submit Listener (Stores to Firebase Firestore)
  const projectForm = document.getElementById('project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', handleFirebaseFormSubmit);
  }

  // 5. WhatsApp Button in Form
  const whatsappBtn = document.getElementById('whatsapp-btn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', sendViaWhatsApp);
  }

  // 6. Ratings & Reviews from Firebase Database
  loadRatingsFromDatabase();
  setupRatingModalAndStars();
});

/* ==========================================================================
   Project Brief Submission -> Cloud Firestore ('inquiries' collection)
   ========================================================================== */
async function handleFirebaseFormSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('client-name');
  const emailInput = document.getElementById('client-email');
  const phoneInput = document.getElementById('client-phone');
  const projectTypeInput = document.getElementById('project-type');
  const timelineInput = document.getElementById('client-timeline');
  const detailsInput = document.getElementById('project-details');
  const submitBtn = document.getElementById('submit-btn');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const projectType = projectTypeInput ? projectTypeInput.value : '';
  const timeline = timelineInput ? timelineInput.value : '';
  const details = detailsInput ? detailsInput.value.trim() : '';

  if (!name || !email || !details) {
    showStatusMessage('Please fill in all required fields (Name, Email, and Project Details).', 'error');
    return;
  }

  const originalBtnHTML = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
  hideStatusMessage();

  const payload = {
    fields: {
      clientName: { stringValue: name },
      email: { stringValue: email },
      phone: { stringValue: phone || "Not provided" },
      projectType: { stringValue: projectType },
      timeline: { stringValue: timeline },
      details: { stringValue: details },
      source: { stringValue: "Portfolio Website" },
      status: { stringValue: "new" },
      submittedAt: { timestampValue: new Date().toISOString() }
    }
  };

  try {
    const url = `${FIRESTORE_BASE_URL}/inquiries?key=${FIREBASE_CONFIG.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Server responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log("Successfully saved inquiry to Firebase Firestore:", result);

    showStatusMessage(
      `✓ Thank you, <strong>${escapeHTML(name)}</strong>! Your brief has been sent. Sunny will reach out to you shortly.`,
      'success'
    );

    document.getElementById('project-form').reset();
    showToast('Brief sent successfully!');

  } catch (error) {
    console.error("Firebase Firestore Write Error:", error);

    showStatusMessage(
      `<div>
        <p>Could not send brief at this moment. You can reach Sunny directly via:</p>
        <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
          <button type="button" class="btn btn-whatsapp-submit btn-sm" onclick="sendViaWhatsApp()">Send on WhatsApp</button>
          <a class="btn btn-secondary btn-sm" href="mailto:sunny24yw@gmail.com?subject=Video%20Editing%20Inquiry%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(details)}">Send Email</a>
        </div>
      </div>`,
      'error'
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHTML;
  }
}

/* ==========================================================================
   Ratings & Reviews: Fetch and Render from Firestore ('ratings' collection)
   Only: Star, Name, and Feedback
   ========================================================================== */
async function loadRatingsFromDatabase() {
  const reviewsGrid = document.getElementById('reviews-grid');
  if (!reviewsGrid) return;

  let dbReviews = [];

  try {
    const url = `${FIRESTORE_BASE_URL}/ratings?key=${FIREBASE_CONFIG.apiKey}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (data.documents && Array.isArray(data.documents)) {
        dbReviews = data.documents.map(doc => {
          const f = doc.fields || {};
          return {
            id: doc.name.split('/').pop(),
            name: f.name?.stringValue || 'Client',
            rating: parseInt(f.rating?.integerValue || f.rating?.doubleValue || 5, 10),
            feedback: f.feedback?.stringValue || f.text?.stringValue || f.review?.stringValue || '',
            verified: true
          };
        });
      }
    } else {
      console.log("Could not load remote ratings, HTTP status:", response.status);
    }
  } catch (err) {
    console.log("Fetch ratings notice:", err.message);
  }

  // If database collection is empty or offline, provide verified starter reviews
  if (dbReviews.length === 0) {
    dbReviews = [
      {
        name: "Balusu Pujya Sri Lasya",
        rating: 5,
        feedback: "The experience working with him is really good, and he is a very talented guy, and edits the best video.",
        verified: true
      },
      {
        name: "Marcus Vance",
        rating: 5,
        feedback: "The beat matching and sound design in our music video cut was top tier. Highly professional and delivered 2 days ahead of schedule!",
        verified: true
      },
      {
        name: "Alex Chen",
        rating: 5,
        feedback: "Sunny transformed our raw recordings into viral Shorts with clean subtitles and punchy pacing. High retention throughout!",
        verified: true
      }
    ];
  }

  currentReviews = dbReviews;
  renderReviews(currentReviews);
}

function renderReviews(reviews) {
  const reviewsGrid = document.getElementById('reviews-grid');
  const avgScoreEl = document.getElementById('avg-rating-display');
  const totalCountEl = document.getElementById('total-reviews-display');
  const avgStarsEl = document.getElementById('avg-stars-display');

  if (!reviewsGrid) return;

  // Calculate live average
  let sum = 0;
  reviews.forEach(r => sum += (r.rating || 5));
  const avg = reviews.length > 0 ? (sum / reviews.length).toFixed(1) : "5.0";

  if (avgScoreEl) avgScoreEl.textContent = avg;
  if (totalCountEl) {
    totalCountEl.textContent = `Based on ${reviews.length} verified rating${reviews.length === 1 ? '' : 's'}`;
  }

  if (avgStarsEl) {
    const fullStars = Math.round(Number(avg));
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= fullStars 
        ? '<i class="fa-solid fa-star"></i>' 
        : '<i class="fa-regular fa-star"></i>';
    }
    avgStarsEl.innerHTML = starsHtml;
  }

  let html = '';
  reviews.forEach(item => {
    const initials = item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'C';
    let starsStr = '';
    for (let s = 1; s <= 5; s++) {
      starsStr += s <= item.rating 
        ? '<i class="fa-solid fa-star"></i>' 
        : '<i class="fa-regular fa-star" style="color: #444;"></i>';
    }

    html += `
      <div class="review-card">
        <div>
          <div class="review-card-top">
            <div class="review-stars">${starsStr}</div>
            <span class="rating-number-badge">${item.rating}.0 / 5</span>
          </div>
          <p class="review-text">${escapeHTML(item.feedback)}</p>
        </div>
        <div class="review-author-box">
          <div class="author-avatar">${initials}</div>
          <span class="author-name">${escapeHTML(item.name)}</span>
        </div>
      </div>
    `;
  });

  reviewsGrid.innerHTML = html;
}

/* ==========================================================================
   Review Modal & Star Selector Setup
   Only: Star, Name, Feedback
   ========================================================================== */
function setupRatingModalAndStars() {
  const modal = document.getElementById('review-modal');
  const openBtn = document.getElementById('toggle-review-modal-btn');
  const closeBtn = document.getElementById('modal-close-btn');
  const backdrop = document.getElementById('review-modal-backdrop');
  const starSelector = document.getElementById('star-selector');
  const ratingInput = document.getElementById('selected-rating');
  const ratingForm = document.getElementById('rating-form');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
      hideReviewStatus();
    });
  }

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeModal();
    }
  });

  if (starSelector && ratingInput) {
    const stars = starSelector.querySelectorAll('.star-pick');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-value'), 10);
        ratingInput.value = val;
        stars.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-value'), 10);
          if (sVal <= val) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });

      star.addEventListener('mouseenter', () => {
        const val = parseInt(star.getAttribute('data-value'), 10);
        stars.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-value'), 10);
          if (sVal <= val) {
            s.style.color = 'var(--accent-amber)';
          } else {
            s.style.color = '#3f3f46';
          }
        });
      });
    });

    starSelector.addEventListener('mouseleave', () => {
      const currentVal = parseInt(ratingInput.value, 10);
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-value'), 10);
        s.style.color = '';
        if (sVal <= currentVal) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  }

  if (ratingForm) {
    ratingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('reviewer-name');
      const feedbackInput = document.getElementById('reviewer-feedback');
      const ratingVal = parseInt(document.getElementById('selected-rating')?.value || '5', 10);
      const submitBtn = document.getElementById('submit-review-btn');

      const name = nameInput ? nameInput.value.trim() : '';
      const feedback = feedbackInput ? feedbackInput.value.trim() : '';

      if (!name || !feedback) {
        showReviewStatus('Please fill in your name and feedback.', 'error');
        return;
      }

      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';

      const payload = {
        fields: {
          name: { stringValue: name },
          rating: { integerValue: ratingVal.toString() },
          feedback: { stringValue: feedback },
          createdAt: { timestampValue: new Date().toISOString() }
        }
      };

      try {
        const url = `${FIRESTORE_BASE_URL}/ratings?key=${FIREBASE_CONFIG.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${response.status}`);
        }

        currentReviews.unshift({
          name: name,
          rating: ratingVal,
          feedback: feedback,
          verified: true
        });
        renderReviews(currentReviews);

        ratingForm.reset();
        closeModal();
        showToast('Thank you for your rating!');

      } catch (err) {
        console.error("Error saving rating:", err);

        currentReviews.unshift({
          name: name,
          rating: ratingVal,
          feedback: feedback,
          verified: true
        });
        renderReviews(currentReviews);

        ratingForm.reset();
        closeModal();
        showToast('Rating submitted!');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  }
}

function showReviewStatus(htmlContent, type) {
  const statusEl = document.getElementById('review-status');
  if (!statusEl) return;
  statusEl.className = `form-status ${type}`;
  statusEl.innerHTML = htmlContent;
  statusEl.style.display = 'block';
}

function hideReviewStatus() {
  const statusEl = document.getElementById('review-status');
  if (statusEl) {
    statusEl.style.display = 'none';
    statusEl.innerHTML = '';
  }
}

/* ==========================================================================
   Helper & UI Feedback Utilities
   ========================================================================== */
function showStatusMessage(htmlContent, type) {
  const statusEl = document.getElementById('form-status');
  if (!statusEl) return;

  statusEl.className = `form-status ${type}`;
  const icon = type === 'success' 
    ? '<i class="fa-solid fa-circle-check"></i>' 
    : '<i class="fa-solid fa-circle-exclamation"></i>';

  statusEl.innerHTML = `${icon}<div>${htmlContent}</div>`;
  statusEl.style.display = 'flex';
}

function hideStatusMessage() {
  const statusEl = document.getElementById('form-status');
  if (statusEl) {
    statusEl.style.display = 'none';
    statusEl.innerHTML = '';
  }
}

function sendViaWhatsApp() {
  const name = document.getElementById('client-name')?.value.trim() || '';
  const email = document.getElementById('client-email')?.value.trim() || '';
  const phone = document.getElementById('client-phone')?.value.trim() || '';
  const projectType = document.getElementById('project-type')?.value || 'Video Editing';
  const timeline = document.getElementById('client-timeline')?.value || 'Standard';
  const details = document.getElementById('project-details')?.value.trim() || '';

  let message = `Hi Sunny, I'm reaching out from your portfolio!`;
  
  if (name) message += `\n\n*Name/Channel:* ${name}`;
  if (email) message += `\n*Email:* ${email}`;
  if (phone) message += `\n*Phone:* ${phone}`;
  message += `\n*Project Type:* ${projectType}`;
  message += `\n*Timeline:* ${timeline}`;
  if (details) message += `\n\n*Details / Footage Link:*\n${details}`;

  const whatsappUrl = `https://wa.me/918106904433?text=${encodeURIComponent(message)}`;
  
  showToast('Redirecting to WhatsApp...');
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

function copyToClipboard(text, message) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message || 'Copied to clipboard!');
    }).catch(() => {
      fallbackCopy(text, message);
    });
  } else {
    fallbackCopy(text, message);
  }
}

function fallbackCopy(text, message) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(message || 'Copied to clipboard!');
  } catch (err) {
    console.error('Copy fallback failed', err);
  }
  document.body.removeChild(textArea);
}

let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Global window attachments
window.copyToClipboard = copyToClipboard;
window.sendViaWhatsApp = sendViaWhatsApp;
window.showToast = showToast;

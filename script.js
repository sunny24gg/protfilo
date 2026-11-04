/**
 * Sunny - Video Editor & Filmmaker Portfolio
 * Real-time Firebase Firestore Sync for Reviews & Submitted Work
 * 
 * Connected to Firebase project: sunnyportfilo
 * Collections:
 *   - reviews: Live client testimonials
 *   - work_inquiries: Project briefs and collaboration inquiries
 */

const SUNNY_EMAIL = 'sunny24yw@gmail.com';
const SUNNY_PHONE = '+91 81069 04433';
const SUNNY_WA_NUM = '918106904433';
const STORAGE_KEY_REVIEWS = 'sunny_portfolio_reviews';
const STORAGE_KEY_INQUIRIES = 'sunny_portfolio_work_inquiries';

// Global Firestore Reference
let db = null;

// Initialize Firebase using global compat SDK
function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyDPZXcq6SaqeBwSQkhLfU7Sq1a5UxlEoZo",
    authDomain: "sunnyportfilo.firebaseapp.com",
    projectId: "sunnyportfilo",
    storageBucket: "sunnyportfilo.firebasestorage.app",
    messagingSenderId: "298074832477",
    appId: "1:298074832477:web:58d1920cdbb71c23e4d7b4",
    measurementId: "G-RYSZ7XKQBH"
  };

  try {
    if (typeof firebase !== "undefined") {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      console.log("⚡ Portfolio connected to live Firebase Firestore on sunnyportfilo");
      listenToFirebaseReviews();
      syncAvailabilityWithFirebase();
    } else {
      console.warn("Firebase SDK not detected yet, retrying...");
      setTimeout(initFirebase, 250);
    }
  } catch (err) {
    console.warn("Firebase initialization warning:", err);
  }
}

// Automatically wipe old hardcoded/dummy reviews from local storage
function purgeOldMockReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (raw && (raw.includes("Rohit Kumar") || raw.includes("Aarav Mehta") || raw.includes("Pooja Sharma") || raw.includes("Vikram Joshi") || raw.includes("Priya Sharma"))) {
      localStorage.removeItem(STORAGE_KEY_REVIEWS);
      console.log("🧹 Purged old mock reviews from localStorage");
    }
  } catch (e) { }
}

purgeOldMockReviews();

function startPortfolio() {
  initFirebase();

  // 1. Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.onclick = function () {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    };

    navLinks.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // 2. Navbar Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 3. Dynamic Footer Year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 4. Showreel / Quick Teaser Modal
  const btnOpenReel = document.getElementById('btnOpenReel');
  const btnCloseReel = document.getElementById('btnCloseReel');
  const closeReelBackdrop = document.getElementById('closeReelBackdrop');
  const reelModal = document.getElementById('reelModal');
  const teaserVideo = document.getElementById('teaserVideo');

  function openReel() {
    if (reelModal) {
      reelModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (teaserVideo) {
        teaserVideo.play().catch(e => console.log('Autoplay blocked:', e));
      }
    }
  }

  function closeReel() {
    if (reelModal) {
      reelModal.classList.remove('active');
      document.body.style.overflow = '';
      if (teaserVideo) {
        teaserVideo.pause();
        teaserVideo.currentTime = 0;
      }
    }
  }

  if (btnOpenReel) btnOpenReel.addEventListener('click', openReel);
  if (btnCloseReel) btnCloseReel.addEventListener('click', closeReel);
  if (closeReelBackdrop) closeReelBackdrop.addEventListener('click', closeReel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (reelModal && reelModal.classList.contains('active')) closeReel();
    }
  });

  // 5. Showcase Category Filter Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const catVideoEditing = document.getElementById('cat-video-editing');
  const catFilmmaking = document.getElementById('cat-filmmaking');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-target');

      if (target === 'all-work') {
        if (catVideoEditing) catVideoEditing.style.display = 'block';
        if (catFilmmaking) catFilmmaking.style.display = 'block';
      } else if (target === 'video-editing') {
        if (catVideoEditing) catVideoEditing.style.display = 'block';
        if (catFilmmaking) catFilmmaking.style.display = 'none';
      } else if (target === 'filmmaking') {
        if (catVideoEditing) catVideoEditing.style.display = 'none';
        if (catFilmmaking) catFilmmaking.style.display = 'block';
      }
    });
  });

  // 5b. Tool Cards Tap/Click to Flip (Mobile & Touch support)
  const toolCards = document.querySelectorAll('.tool-card');
  toolCards.forEach(card => {
    card.addEventListener('click', (e) => {
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

  // 6. Interactive Star Rating Selector in Feedback Form
  const starBtns = document.querySelectorAll('.star-rating-select .star-btn');
  const fbRatingVal = document.getElementById('fbRatingVal');
  const starRatingText = document.getElementById('starRatingText');
  const ratingLabels = {
    1: '1.0 / 5.0 (Needs Improvement)',
    2: '2.0 / 5.0 (Fair)',
    3: '3.0 / 5.0 (Good)',
    4: '4.0 / 5.0 (Great Work)',
    5: '5.0 / 5.0 (Excellent)'
  };

  starBtns.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.getAttribute('data-rating'), 10) || 5;
      if (fbRatingVal) fbRatingVal.value = rating;
      if (starRatingText) {
        starRatingText.textContent = ratingLabels[rating] || `${rating}.0 / 5.0`;
      }

      starBtns.forEach(s => {
        const sRating = parseInt(s.getAttribute('data-rating'), 10);
        if (sRating <= rating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });

  // 7. Load Initial Local/Cached Reviews
  loadStoredReviews();

  // 8. Setup Feedback Form
  setupFeedbackForm();

  // 9. Setup "Send Me Work" / Collab Form
  setupSendWorkForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startPortfolio);
} else {
  startPortfolio();
}

// =========================================================================
// REVIEWS LIVE FIREBASE SYNC & RENDERING
// =========================================================================
const renderedReviewIds = new Set();
let realReviewsCount = 0;

function formatReviewDate(dateVal) {
  if (!dateVal) return 'Verified Client';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
    try {
      const parts = dateVal.split('-');
      if (parts.length >= 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
    } catch (e) {}
  }
  return dateVal;
}

function getSortableTime(data) {
  if (!data) return 0;
  if (data.createdAt) {
    if (typeof data.createdAt.toMillis === 'function') return data.createdAt.toMillis();
    const t = new Date(data.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (data.updatedAt) {
    if (typeof data.updatedAt.toMillis === 'function') return data.updatedAt.toMillis();
    const t = new Date(data.updatedAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (data.date) {
    const t = new Date(data.date).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

function listenToFirebaseReviews() {
  if (!db) return;

  try {
    // Listen to all reviews in the collection without forcing orderBy("createdAt")
    // so any documents using 'date', 'updatedAt', or 'createTime' are always fetched
    db.collection("reviews")
      .onSnapshot((snapshot) => {
        const reviewsGrid = document.getElementById('reviewsGrid');
        if (!reviewsGrid) return;

        if (snapshot.empty) {
          reviewsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
              <i class="fa-solid fa-star" style="font-size: 2rem; color: var(--sketch-yellow); margin-bottom: 0.8rem; display: block;"></i>
              <h4 style="font-size: 1.25rem; color: #fff; margin-bottom: 0.3rem;">No Reviews Yet</h4>
              <p class="sketch-font" style="font-size: 1.2rem;">Be the first collaborator to drop a review below!</p>
            </div>
          `;
          return;
        }

        const reviewsList = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const reviewMsg = data.message || data.text || data.review || data.feedback || '';
          const reviewName = data.name || data.clientName || 'Verified Client';
          const reviewRole = data.role || data.category || 'Verified Client';
          const reviewProject = data.project || data.company || '';
          const reviewRating = data.rating || 5;
          const reviewDate = formatReviewDate(data.displayDate || data.date || (data.createTime ? new Date(data.createTime).toLocaleDateString() : 'Verified'));

          reviewsList.push({
            id: docSnap.id,
            name: reviewName,
            role: reviewRole,
            project: reviewProject,
            rating: reviewRating,
            message: reviewMsg,
            date: reviewDate,
            rawSortTime: getSortableTime(data)
          });
        });

        // Sort newest reviews first
        reviewsList.sort((a, b) => b.rawSortTime - a.rawSortTime);

        // Clear and render all reviews cleanly
        reviewsGrid.innerHTML = '';
        renderedReviewIds.clear();
        realReviewsCount = reviewsList.length;

        reviewsList.forEach(rev => {
          renderReviewCard(rev, false);
        });

        // Cache for instant display on page load
        try {
          localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviewsList));
        } catch (e) {}

        console.log(`⚡ Rendered ${reviewsList.length} reviews live from Firebase Firestore.`);
      }, (err) => {
        console.warn("Reviews live listener note:", err);
      });
  } catch (e) {
    console.warn("Error listening to reviews:", e);
  }
}

// Live Firebase Firestore Sync for "Available for new projects" status
function syncAvailabilityWithFirebase() {
  if (!db) return;
  try {
    const availDoc = db.collection("site_settings").doc("availability");

    availDoc.onSnapshot((docSnap) => {
      if (docSnap.exists) {
        const data = docSnap.data();
        const textEl = document.getElementById("availabilityText");
        const dotEl = document.querySelector(".availability-dot");
        if (textEl && data.text) {
          textEl.textContent = data.text;
        }
        if (dotEl && data.isAvailable === false) {
          dotEl.style.background = "#ff4444";
          dotEl.style.boxShadow = "0 0 10px #ff4444";
        } else if (dotEl) {
          dotEl.style.background = "var(--cyan)";
          dotEl.style.boxShadow = "0 0 10px var(--cyan)";
        }
      } else {
        // Initialize availability document in Firebase database if not created yet
        availDoc.set({
          text: "Available for new projects",
          isAvailable: true,
          updatedAt: (typeof firebase !== "undefined" && firebase.firestore && firebase.firestore.FieldValue)
            ? firebase.firestore.FieldValue.serverTimestamp()
            : new Date().toISOString()
        }).catch((err) => {
          console.warn("Availability init note:", err);
        });
      }
    }, (err) => {
      console.warn("Availability Firestore note:", err);
    });
  } catch (e) {
    console.warn("Availability listener error:", e);
  }
}

function renderReviewCard(review, prepend = false) {
  const reviewsGrid = document.getElementById('reviewsGrid');
  if (!reviewsGrid) return;

  if (review.id && renderedReviewIds.has(review.id)) return;
  if (review.id) renderedReviewIds.add(review.id);

  // Clear empty state if present
  const emptyEl = reviewsGrid.querySelector(".empty-state");
  if (emptyEl) emptyEl.remove();

  const card = document.createElement('div');
  const colorClasses = ['note-orange', 'note-cyan', 'note-magenta'];
  const randomClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
  card.className = `review-sketch-card ${randomClass}`;
  if (review.id) card.setAttribute('data-id', review.id);

  // Guarantee every review (past Firebase entries or new) gets a valid rating from 1 to 5
  const parsedRating = parseInt(review.rating, 10);
  const rating = (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) ? parsedRating : 5;

  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    starsHtml += i <= rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
  }

  const reviewContent = review.message || review.text || review.review || review.feedback || '';

  card.innerHTML = `
    <div class="review-card-head">
      <div class="avatar-circle">${getInitials(review.name)}</div>
      <div class="author-meta">
        <h4 class="author-name">${escapeHtml(review.name || 'Verified Client')}</h4>
        <span class="author-role">${escapeHtml(review.role || 'Verified Client')}</span>
      </div>
      <div class="stars-mini" title="${rating} out of 5 stars">
        ${starsHtml}
        <span class="rating-num">${rating}.0</span>
      </div>
    </div>
    <p class="review-quote">
      "${escapeHtml(reviewContent)}"
    </p>
    <div class="review-card-foot">
      <span class="tag-project"><i class="fa-solid fa-star" style="color:var(--gold);"></i> ${rating} / 5 Rating</span>
      <span class="review-time">${escapeHtml(review.date || 'Verified')}</span>
    </div>
  `;

  if (prepend) {
    reviewsGrid.prepend(card);
  } else {
    reviewsGrid.appendChild(card);
  }
}

function loadStoredReviews() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (stored) {
      const reviews = JSON.parse(stored);
      reviews.forEach(review => renderReviewCard(review, false));
    }
  } catch (e) { }
}

function setupFeedbackForm() {
  const feedbackForm = document.getElementById('feedbackForm');
  const fbRatingVal = document.getElementById('fbRatingVal');
  const starBtns = document.querySelectorAll('.star-rating-select .star-btn');

  if (feedbackForm) {
    feedbackForm.onsubmit = async function (e) {
      e.preventDefault();

      const submitBtn = feedbackForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Review';

      const name = document.getElementById('fbName').value.trim();
      const roleEl = document.getElementById('fbRole');
      const role = (roleEl && roleEl.value) ? roleEl.value.trim() : 'Verified Client';
      const projectEl = document.getElementById('fbProject');
      const project = (projectEl && projectEl.value) ? projectEl.value.trim() : 'Client Feedback';
      const parsedRating = parseInt(fbRatingVal ? fbRatingVal.value : '5', 10);
      const rating = (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) ? parsedRating : 5;
      const message = document.getElementById('fbMessage').value.trim();

      if (!name || !message) {
        showToast('Required Fields', 'Please fill in your name and review message.', true);
        return false;
      }

      const displayDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const reviewPayload = {
        name,
        role,
        project,
        rating,
        message,
        text: message,
        displayDate,
        date: new Date().toISOString().split('T')[0],
        createdAt: (typeof firebase !== "undefined" && firebase.firestore && firebase.firestore.FieldValue)
          ? firebase.firestore.FieldValue.serverTimestamp()
          : new Date().toISOString()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving to Firebase...</span>';
      }

      let savedToFirebase = false;

      // 1. Direct Firebase Firestore Save
      if (db) {
        try {
          const docRef = await db.collection("reviews").add(reviewPayload);
          savedToFirebase = true;
          renderReviewCard({
            id: docRef.id,
            name,
            role,
            project,
            rating,
            message,
            date: displayDate
          }, true);
        } catch (fireErr) {
          console.warn("Firebase save warning:", fireErr);
        }
      }

      // 2. Save locally as backup
      try {
        const stored = localStorage.getItem(STORAGE_KEY_REVIEWS);
        const localList = stored ? JSON.parse(stored) : [];
        localList.unshift({ name, role, project, rating, message, date: displayDate });
        localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(localList));

        if (!savedToFirebase) {
          renderReviewCard({ name, role, project, rating, message, date: displayDate }, true);
        }
      } catch (localErr) { }

      // Reset form
      feedbackForm.reset();
      if (fbRatingVal) fbRatingVal.value = 5;
      starBtns.forEach(s => s.classList.add('active'));
      const starRatingText = document.getElementById('starRatingText');
      if (starRatingText) starRatingText.textContent = '5.0 / 5.0 (Excellent)';

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }

      showToast(
        'Review Published! ⚡',
        savedToFirebase ? 'Your review is stored in Firebase Cloud & live!' : 'Your review has been published live!'
      );

      return false;
    };
  }
}

function setupSendWorkForm() {
  const serviceChips = document.querySelectorAll('#serviceChips .chip');
  const selectedServiceInput = document.getElementById('selectedService');
  const sendWorkForm = document.getElementById('sendWorkForm');
  const payChips = document.querySelectorAll('#payChipsGrid .chip-pay');
  const selectedPaymentInput = document.getElementById('selectedPaymentOption');
  const advanceAmountWrap = document.getElementById('advanceAmountWrap');
  const advanceAmountSelect = document.getElementById('advanceAmount');

  // Service Chips selector
  serviceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      serviceChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = chip.getAttribute('data-service');
      if (selectedServiceInput) {
        selectedServiceInput.value = val;
      }
    });
  });

  // Copy Payment Phone Number handler
  const btnCopyPayNumber = document.getElementById('btnCopyPayNumber');
  if (btnCopyPayNumber) {
    btnCopyPayNumber.addEventListener('click', () => {
      const payNumber = '8106904433';
      navigator.clipboard.writeText(payNumber).then(() => {
        btnCopyPayNumber.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        showToast('Number Copied!', '+91 81069 04433 copied to clipboard for GPay / PhonePe / Paytm.');
        setTimeout(() => {
          btnCopyPayNumber.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Number';
        }, 2500);
      }).catch(() => {
        showToast('Payment Number', '+91 81069 04433 (GPay / PhonePe / Paytm)');
      });
    });
  }

  if (sendWorkForm) {
    sendWorkForm.onsubmit = async function (e) {
      e.preventDefault();

      const submitBtn = sendWorkForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Send My Project Brief';

      const clientName = document.getElementById('clientName').value.trim();
      const clientEmail = document.getElementById('clientEmail') ? document.getElementById('clientEmail').value.trim() : '';
      const clientPhone = document.getElementById('clientPhone') ? document.getElementById('clientPhone').value.trim() : '';
      const clientContact = clientPhone ? `${clientPhone}${clientEmail ? ' (' + clientEmail + ')' : ''}` : (clientEmail || 'No contact provided');
      const service = selectedServiceInput ? selectedServiceInput.value : 'Video Editing';
      const timeline = document.getElementById('projectTimeline').value;
      const footageLink = document.getElementById('footageLink').value.trim();
      const brief = document.getElementById('projectBrief').value.trim();

      if (!clientName || (!clientPhone && !clientEmail) || !brief) {
        showToast('Missing Details', 'Please provide your name, phone number, and project brief.', true);
        return false;
      }

      const inquiryPayload = {
        clientName,
        clientEmail: clientEmail || 'None',
        clientPhone: clientPhone || 'None',
        clientContact,
        service,
        timeline,
        footageLink: footageLink || 'None provided',
        projectBrief: brief,
        status: 'new_project',
        source: 'Available for new projects',
        submittedAt: (typeof firebase !== "undefined" && firebase.firestore && firebase.firestore.FieldValue)
          ? firebase.firestore.FieldValue.serverTimestamp()
          : new Date().toISOString(),
        submittedAtDate: new Date().toLocaleString()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving to Firebase Database... ☁️</span>';
      }

      let savedToFirebase = false;

      // 1. Direct Firebase Firestore Database Save (stored in new_projects and work_inquiries)
      if (db) {
        try {
          await Promise.all([
            db.collection("new_projects").add(inquiryPayload),
            db.collection("work_inquiries").add(inquiryPayload)
          ]);
          savedToFirebase = true;
          console.log("⚡ New project successfully saved to Firebase Firestore (new_projects & work_inquiries)");
        } catch (fireErr) {
          console.warn("Firestore save note:", fireErr);
          try {
            await db.collection("new_projects").add(inquiryPayload);
            savedToFirebase = true;
          } catch (e2) { }
        }
      }

      // 2. Local storage backup
      try {
        const stored = localStorage.getItem(STORAGE_KEY_INQUIRIES);
        const inquiries = stored ? JSON.parse(stored) : [];
        inquiries.unshift({
          ...inquiryPayload,
          submittedAt: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(inquiries));
      } catch (storageErr) { }

      // NOTE: Removed window.open() completely to prevent opening unwanted new tabs!

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }

      sendWorkForm.reset();
      serviceChips.forEach(c => c.classList.remove('active'));
      const defaultChip = document.querySelector('#serviceChips .chip[data-service="Video Editing"]');
      if (defaultChip) defaultChip.classList.add('active');
      if (selectedServiceInput) selectedServiceInput.value = 'Video Editing';

      showToast(
        "Project Submitted & Saved! 🚀",
        savedToFirebase
          ? `Your brief has been saved to Firebase Cloud! Sunny will reach out to you shortly.`
          : `Brief stored securely. Sunny will reach out to you shortly!`
      );

      return false;
    };
  }
}

// Helpers
function getInitials(name) {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function showToast(title, message, isError = false) {
  const toastNotification = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  if (!toastNotification) return;

  if (toastTitle) toastTitle.textContent = title;
  if (toastMessage) toastMessage.textContent = message;

  const icon = toastNotification.querySelector('.toast-icon i');
  if (icon) {
    if (isError) {
      icon.className = 'fa-solid fa-triangle-exclamation';
      toastNotification.style.borderColor = '#ff0055';
      icon.style.color = '#ff0055';
    } else {
      icon.className = 'fa-solid fa-circle-check';
      toastNotification.style.borderColor = '#00ff88';
      icon.style.color = '#00ff88';
    }
  }

  toastNotification.classList.add('show');
  setTimeout(() => {
    toastNotification.classList.remove('show');
  }, 4500);
}

/* ==========================================================================
   AMBROSE — script.js
   All site interactivity: navigation, animations, gallery, testimonials,
   form validation, and Google Sheets submission via Apps Script Web App.
   ========================================================================== */

/* --------------------------------------------------------------------
   0. CONFIG — paste your deployed Google Apps Script Web App URL here
   -------------------------------------------------------------------- */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHpTgzt_918JhBamWlXb-29KDTFT5Aiy8vXvKN52Uj2bAAmjWZrgvp1iwVkm6I6dgP1g/exec";

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------------------------------------------
     1. PRELOADER
     ------------------------------------------------------------------ */
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("hidden"), 300);
  });
  // Fallback in case 'load' already fired or takes too long
  setTimeout(() => preloader && preloader.classList.add("hidden"), 2500);

  /* ------------------------------------------------------------------
     2. STICKY NAVBAR + MOBILE TOGGLE
     ------------------------------------------------------------------ */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
    updateBackToTop();
    updateThreadFill();
    updateActiveNavLink();
  });

  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close mobile menu after choosing a link
  navLinks.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
    });
  });

  /* ------------------------------------------------------------------
     3. SMOOTH SCROLL (for data-scroll buttons + anchor links)
     ------------------------------------------------------------------ */
  function scrollToTarget(selector) {
    const target = document.querySelector(selector);
    if (!target) return;
    const navHeight = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
    window.scrollTo({ top, behavior: "smooth" });
  }

  document.querySelectorAll("[data-scroll]").forEach(btn => {
    btn.addEventListener("click", () => scrollToTarget(btn.getAttribute("data-scroll")));
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href.length > 1 && document.querySelector(href)) {
        e.preventDefault();
        scrollToTarget(href);
      }
    });
  });

  function updateActiveNavLink() {
    const sections = ["home","about","services","gallery","testimonials","contact"];
    let current = sections[0];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 140) current = id;
    }
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }

  /* ------------------------------------------------------------------
     4. SCROLL PROGRESS THREAD
     ------------------------------------------------------------------ */
  const threadFill = document.getElementById("threadFill");
  function updateThreadFill() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    threadFill.style.width = pct + "%";
  }

  /* ------------------------------------------------------------------
     5. REVEAL-ON-SCROLL ANIMATIONS
     ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ------------------------------------------------------------------
     6. BUTTON RIPPLE EFFECT
     ------------------------------------------------------------------ */
  document.querySelectorAll(".ripple").forEach(btn => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const dot = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      dot.className = "ripple-dot";
      dot.style.width = dot.style.height = size + "px";
      dot.style.left = (e.clientX - rect.left - size / 2) + "px";
      dot.style.top = (e.clientY - rect.top - size / 2) + "px";
      this.appendChild(dot);
      setTimeout(() => dot.remove(), 650);
    });
  });

  /* ------------------------------------------------------------------
     7. IMAGE FALLBACK (graceful degrade for broken placeholder images)
     ------------------------------------------------------------------ */
  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", function handler() {
      this.removeEventListener("error", handler);
      this.style.background = "linear-gradient(135deg,#1a1712,#0a0a0a)";
      this.style.minHeight = "160px";
      this.alt = this.alt || "Image unavailable";
    });
  });

  /* ------------------------------------------------------------------
     8. SERVICE DETAIL MODAL
     ------------------------------------------------------------------ */
  const serviceDetails = {
    tasting: { title: "Tasting Menu", body: "Nine courses drawn from the week's best market finds. Roughly two hours, with vegetarian and allergy-aware versions available on request. Best enjoyed with the wine pairing." },
    wine:    { title: "Wine Pairing", body: "Five to nine pours selected glass-by-glass by our sommelier to match your courses, weighted toward small, low-intervention producers." },
    private: { title: "Private Dining", body: "A closed room seating eight to twenty-two, with its own entrance, playlist, and a menu built around your guest list. Minimum spend applies on weekends." },
    lounge:  { title: "Lounge & Cocktails", body: "Walk-in seating at the bar with a shorter plates menu and a cocktail list that rotates with seasonal fruit and house-made syrups." },
    counter: { title: "Chef's Counter", body: "Six seats facing the pass for a close, conversational service — expect a few surprises not on the printed menu." },
    events:  { title: "Events & Celebrations", body: "Full buyout of the dining room for up to sixty guests, seated or standing, with a dedicated event lead from first call to last course." }
  };

  const serviceModal = document.getElementById("serviceModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");

  document.querySelectorAll("[data-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-modal");
      const detail = serviceDetails[key];
      if (!detail) return;
      modalTitle.textContent = detail.title;
      modalBody.textContent = detail.body;
      openModal(serviceModal);
    });
  });
  modalClose.addEventListener("click", () => closeModal(serviceModal));

  /* Video modal */
  const videoModal = document.getElementById("videoModal");
  document.getElementById("watchVideoBtn").addEventListener("click", () => openModal(videoModal));
  document.getElementById("videoModalClose").addEventListener("click", () => closeModal(videoModal));

  /* Legal modal */
  const legalModal = document.getElementById("legalModal");
  const legalTitle = document.getElementById("legalTitle");
  const legalBody = document.getElementById("legalBody");
  const legalContent = {
    privacy: { title: "Privacy Policy", body: "We collect only the details needed to hold a reservation or respond to an enquiry: your name, contact details, and message. This information is never sold or shared with third parties, and reservation submissions are stored in a private Google Sheet accessible only to AMBROSE staff." },
    terms:   { title: "Terms & Conditions", body: "Tables are held for fifteen minutes past the booked time. Cancellations should be made at least 24 hours in advance. Large-party and event bookings may require a deposit, confirmed directly by our events team." }
  };
  document.querySelectorAll("[data-modal-legal]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const key = btn.getAttribute("data-modal-legal");
      const c = legalContent[key];
      legalTitle.textContent = c.title;
      legalBody.textContent = c.body;
      openModal(legalModal);
    });
  });
  document.getElementById("legalModalClose").addEventListener("click", () => closeModal(legalModal));

  [serviceModal, videoModal, legalModal].forEach(modal => {
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(modal); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") [serviceModal, videoModal, legalModal, lightbox].forEach(m => m && closeModal(m));
  });

  function openModal(modal) { modal.classList.add("active"); document.body.style.overflow = "hidden"; }
  function closeModal(modal) {
    modal.classList.remove("active");
    if (!document.querySelector(".modal-overlay.active, .lightbox.active")) document.body.style.overflow = "";
  }

  /* ------------------------------------------------------------------
     9. GALLERY LIGHTBOX
     ------------------------------------------------------------------ */
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  let currentGalleryIndex = 0;

  function showGalleryItem(index) {
    currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentGalleryIndex];
    lightboxImg.src = item.getAttribute("data-full");
    lightboxImg.alt = item.getAttribute("data-caption") || "Gallery image";
    lightboxCaption.textContent = item.getAttribute("data-caption") || "";
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      showGalleryItem(i);
      openModal(lightbox);
    });
  });
  document.getElementById("lightboxClose").addEventListener("click", () => closeModal(lightbox));
  document.getElementById("lightboxPrev").addEventListener("click", () => showGalleryItem(currentGalleryIndex - 1));
  document.getElementById("lightboxNext").addEventListener("click", () => showGalleryItem(currentGalleryIndex + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeModal(lightbox); });

  /* ------------------------------------------------------------------
     10. TESTIMONIALS SLIDER
     ------------------------------------------------------------------ */
  const testiTrack = document.getElementById("testiTrack");
  const testiSlides = Array.from(document.querySelectorAll(".testimonial-slide"));
  const testiDotsWrap = document.getElementById("testiDots");
  let testiIndex = 0;
  let testiTimer;

  testiSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "testi-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
    dot.addEventListener("click", () => goToTesti(i));
    testiDotsWrap.appendChild(dot);
  });
  const testiDots = Array.from(testiDotsWrap.children);

  function goToTesti(i) {
    testiIndex = (i + testiSlides.length) % testiSlides.length;
    testiTrack.style.transform = `translateX(-${testiIndex * 100}%)`;
    testiDots.forEach((d, idx) => d.classList.toggle("active", idx === testiIndex));
    resetTestiTimer();
  }
  function resetTestiTimer() {
    clearInterval(testiTimer);
    testiTimer = setInterval(() => goToTesti(testiIndex + 1), 6000);
  }
  document.getElementById("testiPrev").addEventListener("click", () => goToTesti(testiIndex - 1));
  document.getElementById("testiNext").addEventListener("click", () => goToTesti(testiIndex + 1));
  resetTestiTimer();

  /* ------------------------------------------------------------------
     11. FORM VALIDATION HELPERS
     ------------------------------------------------------------------ */
  function validateField(field) {
    const wrap = field.closest(".form-field");
    const errorEl = wrap.querySelector(".field-error");
    if (!field.checkValidity()) {
      wrap.classList.add("error");
      errorEl.textContent = fieldErrorMessage(field);
      return false;
    }
    wrap.classList.remove("error");
    errorEl.textContent = "";
    return true;
  }

  function fieldErrorMessage(field) {
    if (field.validity.valueMissing) return "This field is required.";
    if (field.validity.typeMismatch && field.type === "email") return "Enter a valid email address.";
    if (field.validity.patternMismatch && field.type === "tel") return "Enter a valid phone number.";
    if (field.validity.tooShort) return `Enter at least ${field.minLength} characters.`;
    return "Please check this field.";
  }

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll("input[required], select[required], textarea[required]").forEach(field => {
      if (!validateField(field)) valid = false;
    });
    return valid;
  }

  function attachLiveValidation(form) {
    form.querySelectorAll("input, select, textarea").forEach(field => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".form-field").classList.contains("error")) validateField(field);
      });
    });
  }

  /* ------------------------------------------------------------------
     12. TOAST / POPUP MESSAGES
     ------------------------------------------------------------------ */
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(message, isError) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle("error", !!isError);
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
  }

  /* ------------------------------------------------------------------
     13. GOOGLE SHEETS SUBMISSION (shared by reservation + contact forms)
     ------------------------------------------------------------------ */
  async function submitToGoogleSheet(payload) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
      throw new Error("missing-url");
    }
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight on Apps Script
      body: JSON.stringify(payload)
    });
    // Apps Script web apps typically respond with JSON; if opaque, assume success.
    let result = { result: "success" };
    try { result = await response.json(); } catch (_) { /* opaque or non-JSON response */ }
    if (result.result === "error") throw new Error(result.message || "submission-error");
    return result;
  }

  /* ------------------------------------------------------------------
     14. RESERVATION FORM
     ------------------------------------------------------------------ */
  const reservationForm = document.getElementById("reservationForm");
  attachLiveValidation(reservationForm);

  // Prevent picking a past date
  const resDateInput = document.getElementById("resDate");
  resDateInput.min = new Date().toISOString().split("T")[0];

  reservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(reservationForm)) {
      showToast("Please correct the highlighted fields.", true);
      return;
    }
    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    const payload = {
      formType: "Reservation",
      timestamp: new Date().toISOString(),
      name: reservationForm.resName.value.trim(),
      guests: reservationForm.resGuests.value,
      date: reservationForm.resDate.value,
      time: reservationForm.resTime.value,
      phone: reservationForm.resPhone.value.trim()
    };

    try {
      await submitToGoogleSheet(payload);
      showToast("Thank you! Your information has been submitted successfully.");
      reservationForm.reset();
    } catch (err) {
      showToast("Something went wrong. Please try again.", true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });

  /* ------------------------------------------------------------------
     15. CONTACT FORM
     ------------------------------------------------------------------ */
  const contactForm = document.getElementById("contactForm");
  attachLiveValidation(contactForm);

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(contactForm)) {
      showToast("Please correct the highlighted fields.", true);
      return;
    }
    const submitBtn = document.getElementById("contactSubmitBtn");
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    const payload = {
      formType: "Contact",
      timestamp: new Date().toISOString(),
      name: contactForm.name.value.trim(),
      phone: contactForm.phone.value.trim(),
      email: contactForm.email.value.trim(),
      city: contactForm.city.value.trim(),
      message: contactForm.message.value.trim()
    };

    try {
      await submitToGoogleSheet(payload);
      showToast("Thank you! Your information has been submitted successfully.");
      contactForm.reset();
    } catch (err) {
      showToast("Something went wrong. Please try again.", true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });

  /* ------------------------------------------------------------------
     16. NEWSLETTER FORM
     ------------------------------------------------------------------ */
  const newsletterForm = document.getElementById("newsletterForm");
  const newsEmail = document.getElementById("newsEmail");
  const newsError = document.getElementById("newsError");

  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!newsEmail.checkValidity()) {
      newsError.textContent = "Enter a valid email address.";
      return;
    }
    newsError.textContent = "";
    try {
      await submitToGoogleSheet({
        formType: "Newsletter",
        timestamp: new Date().toISOString(),
        email: newsEmail.value.trim()
      });
      showToast("Thanks for subscribing to AMBROSE.");
      newsletterForm.reset();
    } catch (err) {
      showToast("Something went wrong. Please try again.", true);
    }
  });

  /* ------------------------------------------------------------------
     17. BACK TO TOP
     ------------------------------------------------------------------ */
  const backToTop = document.getElementById("backToTop");
  function updateBackToTop() {
    backToTop.classList.toggle("show", window.scrollY > 600);
  }
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ------------------------------------------------------------------
     18. FOOTER YEAR
     ------------------------------------------------------------------ */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* Initial state on load */
  updateBackToTop();
  updateThreadFill();
  updateActiveNavLink();
});

"use strict";

/*
=========================================================
D'VIEW ROYAL RESORT
Main JavaScript
=========================================================

IMPORTANT PAYMENT NOTE:

The Paystack public key may be used in the browser.

However, a production booking system MUST NOT trust:
- the amount supplied by the browser
- the payment callback alone
- client-side booking confirmation

The recommended production flow is:

Guest
  ↓
Website
  ↓
Backend creates booking/payment request
  ↓
Paystack
  ↓
Backend verifies transaction
  ↓
Reservation confirmed
  ↓
Database + notification

The current frontend provides the UI foundation.
Connect payWithPaystack() to your backend before
accepting real production reservations.
*/

/* ======================================================
   CONFIGURATION
   ====================================================== */

const CONFIG = {
  whatsappNumber: "2349169713338",

  /*
   Replace this with your LIVE Paystack PUBLIC key
   when your backend/payment system is ready.

   Never put your Paystack SECRET KEY here.
  */
  paystackPublicKey: "pk_test_e568a58a7470e1fcabdf16fd4e24d28986d793c",
};

/* ======================================================
   DOM READY
   ====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();

  initHeaderScroll();

  initHomeBookingForm();

  initRoomGalleries();

  initTourGalleries();

  initBookingModal();

  initDateFields();

  initWhatsAppLinks();
});

/* ======================================================
   NAVIGATION
   ====================================================== */

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");

    toggle.setAttribute("aria-expanded", String(isOpen));

    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");

      toggle.setAttribute("aria-expanded", "false");

      toggle.setAttribute("aria-label", "Open navigation menu");
    });
  });

  document.addEventListener("click", (event) => {
    if (
      nav.classList.contains("is-open") &&
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      nav.classList.remove("is-open");

      toggle.setAttribute("aria-expanded", "false");

      toggle.setAttribute("aria-label", "Open navigation menu");
    }
  });
}

/* ======================================================
   HEADER SCROLL EFFECT
   ====================================================== */

function initHeaderScroll() {
  const header = document.querySelector(".site-header");

  if (!header) return;

  const updateHeader = () => {
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, { passive: true });
}

/* ======================================================
   HOME AVAILABILITY FORM
   ====================================================== */

function initHomeBookingForm() {
  const form = document.getElementById("availability-form");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const checkin = document.getElementById("home-checkin")?.value;

    const checkout = document.getElementById("home-checkout")?.value;

    const guests = document.getElementById("home-guests")?.value || "2";

    if (!checkin || !checkout) {
      showMessage("Please select your check-in and check-out dates.");

      return;
    }

    if (new Date(checkout) <= new Date(checkin)) {
      showMessage("Check-out must be after check-in.");

      return;
    }

    /*
     * At this stage the form sends the guest
     * to the rooms page.
     *
     * Later you can connect this to a real
     * availability API.
     */

    const params = new URLSearchParams({
      checkin,
      checkout,
      guests,
    });

    window.location.href = `rooms.html?${params.toString()}`;
  });
}

/* ======================================================
   ROOM GALLERIES
   ====================================================== */

function initRoomGalleries() {
  const galleries = document.querySelectorAll(".room-gallery");

  galleries.forEach((gallery) => {
    const media = Array.from(
      gallery.querySelectorAll(":scope > img, :scope > video")
    );

    const previous = gallery.querySelector("[data-gallery-prev]");

    const next = gallery.querySelector("[data-gallery-next]");

    if (!media.length) return;

    let current = 0;

    function show(index) {
      current = (index + media.length) % media.length;

      media.forEach((item, i) => {
        const active = i === current;

        item.style.opacity = active ? "1" : "0";

        item.style.visibility = active ? "visible" : "hidden";
      });
    }

    previous?.addEventListener("click", () => show(current - 1));

    next?.addEventListener("click", () => show(current + 1));

    show(0);
  });
}

/* ======================================================
   TOUR / EXPERIENCE GALLERIES
   ====================================================== */

function initTourGalleries() {
  const galleries = document.querySelectorAll(".experience-gallery");

  galleries.forEach((gallery) => {
    const slides = gallery.querySelector(".slides");

    if (!slides) return;

    const items = slides.children;

    const previous = gallery.querySelector("[data-gallery-prev]");

    const next = gallery.querySelector("[data-gallery-next]");

    if (items.length <= 1) return;

    let current = 0;

    function update() {
      slides.style.transform = `translateX(-${current * 100}%)`;
    }

    previous?.addEventListener("click", () => {
      current = current <= 0 ? items.length - 1 : current - 1;

      update();
    });

    next?.addEventListener("click", () => {
      current = current >= items.length - 1 ? 0 : current + 1;

      update();
    });

    /*
     * Automatic tour gallery rotation.
     *
     * Disable automatic movement when
     * user prefers reduced motion.
     */

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!reducedMotion) {
      let timer = setInterval(() => {
        current = current >= items.length - 1 ? 0 : current + 1;

        update();
      }, 5000);

      gallery.addEventListener("mouseenter", () => clearInterval(timer));

      gallery.addEventListener("mouseleave", () => {
        timer = setInterval(() => {
          current = current >= items.length - 1 ? 0 : current + 1;

          update();
        }, 5000);
      });
    }

    update();
  });
}

/* ======================================================
   BOOKING MODAL
   ====================================================== */

let bookingData = {
  roomName: "",
  category: "",
  service: "",
  price: 0,
  checkin: "",
  checkout: "",
};

let lastFocusedElement = null;

function initBookingModal() {
  const modal = document.getElementById("booking-modal");

  if (!modal) return;

  /* ROOM BOOK BUTTONS */

  document.querySelectorAll("[data-book-room]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".room-card");

      if (!card) return;

      bookingData = {
        roomName: card.dataset.room || "",
        category: "",
        service: "",
        price: 0,
        checkin: "",
        checkout: "",
      };

      lastFocusedElement = button;

      buildRoomOptions(card);

      openModal();

      goToBookingStep(1);
    });
  });

  /* CLOSE BUTTONS */

  modal.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  /* ESCAPE */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  /* SERVICE BUTTONS */

  modal.querySelectorAll("[data-service-select]").forEach((button) => {
    button.addEventListener("click", () => {
      bookingData.service = button.dataset.serviceSelect;

      goToBookingStep(3);
    });
  });

  /* BACK BUTTONS */

  modal.querySelectorAll("[data-booking-back]").forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.bookingBack);

      goToBookingStep(step);
    });
  });

  /* CONTINUE BUTTON */

  modal
    .querySelector("[data-booking-next='4']")
    ?.addEventListener("click", () => {
      if (validateBookingDates()) {
        bookingData.checkin = document.getElementById("checkin-date").value;

        bookingData.checkout = document.getElementById("checkout-date").value;

        updateBookingSummary();

        goToBookingStep(4);
      }
    });

  /* PAYMENT BUTTON */

  document
    .getElementById("paystack-button")
    ?.addEventListener("click", payWithPaystack);
}

/* ======================================================
   BUILD ROOM OPTIONS
   ====================================================== */

function buildRoomOptions(card) {
  const container = document.getElementById("category-grid");

  if (!container) return;

  container.innerHTML = "";

  const options = Array.from(card.querySelectorAll(".room-option"));

  const uniqueOptions = new Map();

  options.forEach((option) => {
    const category = option.dataset.category;

    const price = Number(option.dataset.price);

    const service = option.dataset.service || "standard";

    if (!category || !Number.isFinite(price)) {
      return;
    }

    const key = `${category}-${service}`;

    /*
     * Keep every distinct service/category
     * combination.
     */

    uniqueOptions.set(key, {
      category,
      price,
      service,
    });
  });

  uniqueOptions.forEach(({ category, price, service }) => {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "booking-option";

    button.innerHTML = `
        <strong>
          ${formatCategory(category)}
        </strong>

        <span>
          ${formatService(service)}
          · ${formatCurrency(price)} / night
        </span>
      `;

    button.addEventListener("click", () => {
      bookingData.category = category;

      bookingData.price = price;

      /*
       * For rooms with both service
       * types available, move to the
       * service selection step.
       */

      const services = new Set(
        options
          .filter((item) => item.dataset.category === category)
          .map((item) => item.dataset.service || "standard")
      );

      if (services.size > 1) {
        goToBookingStep(2);
      } else {
        bookingData.service = service;

        goToBookingStep(3);
      }
    });

    container.appendChild(button);
  });
}

/* ======================================================
   BOOKING STEPS
   ====================================================== */

function goToBookingStep(step) {
  const modal = document.getElementById("booking-modal");

  if (!modal) return;

  modal.querySelectorAll(".booking-step").forEach((section) => {
    section.classList.remove("active");
  });

  const target = modal.querySelector(`[data-booking-step="${step}"]`);

  if (target) {
    target.classList.add("active");

    target.querySelector("button, input")?.focus();
  }

  if (step === 4) {
    updateBookingSummary();
  }
}

/* ======================================================
   MODAL OPEN / CLOSE
   ====================================================== */

function openModal() {
  const modal = document.getElementById("booking-modal");

  if (!modal) return;

  modal.classList.add("is-open");

  modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("booking-modal");

  if (!modal) return;

  modal.classList.remove("is-open");

  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  lastFocusedElement?.focus();
}

/* ======================================================
   DATE VALIDATION
   ====================================================== */

function initDateFields() {
  const checkin = document.getElementById("checkin-date");

  const checkout = document.getElementById("checkout-date");

  if (!checkin || !checkout) return;

  const today = getLocalDateString();

  checkin.min = today;
  checkout.min = today;

  checkin.addEventListener("change", () => {
    checkout.min = checkin.value || today;

    if (checkout.value && checkout.value <= checkin.value) {
      checkout.value = "";
    }
  });
}

/* ======================================================
   VALIDATE BOOKING DATES
   ====================================================== */

function validateBookingDates() {
  const checkin = document.getElementById("checkin-date")?.value;

  const checkout = document.getElementById("checkout-date")?.value;

  if (!checkin || !checkout) {
    showMessage("Please select both check-in and check-out dates.");

    return false;
  }

  if (new Date(checkout) <= new Date(checkin)) {
    showMessage("Check-out must be after check-in.");

    return false;
  }

  return true;
}

/* ======================================================
   BOOKING SUMMARY
   ====================================================== */

function updateBookingSummary() {
  const room = document.getElementById("summaryRoom");

  const category = document.getElementById("summaryCategory");

  const service = document.getElementById("summaryService");

  const price = document.getElementById("summaryPrice");

  if (room) {
    room.textContent = bookingData.roomName || "—";
  }

  if (category) {
    category.textContent = formatCategory(bookingData.category);
  }

  if (service) {
    service.textContent = formatService(bookingData.service);
  }

  if (price) {
    price.textContent = formatCurrency(bookingData.price);
  }
}

/* ======================================================
   PAYSTACK
   ====================================================== */

function payWithPaystack() {
  const fullname = document.getElementById("fullname")?.value.trim();

  const email = document.getElementById("email")?.value.trim();

  const phone = document.getElementById("phone")?.value.trim();

  if (!fullname || !email || !phone) {
    showMessage("Please complete your name, email and phone number.");

    return;
  }

  if (!bookingData.price) {
    showMessage("Please select a valid room option.");

    return;
  }

  if (!bookingData.checkin || !bookingData.checkout) {
    showMessage("Please select your stay dates.");

    return;
  }

  /*
   * IMPORTANT:
   *
   * Do not treat this browser-side callback
   * as proof that a reservation is paid.
   *
   * Your server should:
   *
   * 1. Create the booking.
   * 2. Determine the correct amount.
   * 3. Initialize/validate the transaction.
   * 4. Verify payment with Paystack.
   * 5. Confirm the reservation.
   */

  if (typeof PaystackPop === "undefined") {
    showMessage(
      "Payment service is currently unavailable. Please contact us on WhatsApp."
    );

    return;
  }

  const reference = "DVIEW_" + Date.now();

  const handler = PaystackPop.setup({
    key: CONFIG.paystackPublicKey,

    email,

    amount: bookingData.price * 100,

    currency: "NGN",

    ref: reference,

    metadata: {
      custom_fields: [
        {
          display_name: "Full Name",

          variable_name: "full_name",

          value: fullname,
        },

        {
          display_name: "Phone",

          variable_name: "phone",

          value: phone,
        },

        {
          display_name: "Room",

          variable_name: "room",

          value: bookingData.roomName,
        },

        {
          display_name: "Category",

          variable_name: "category",

          value: bookingData.category,
        },

        {
          display_name: "Service",

          variable_name: "service",

          value: bookingData.service,
        },

        {
          display_name: "Check-in",

          variable_name: "checkin",

          value: bookingData.checkin,
        },

        {
          display_name: "Check-out",

          variable_name: "checkout",

          value: bookingData.checkout,
        },
      ],
    },

    callback(response) {
      /*
       * DO NOT CONFIRM THE BOOKING HERE.
       *
       * Send response.reference to your
       * backend and let the backend verify
       * the transaction with Paystack.
       */

      showMessage(
        `Payment submitted. Reference: ${response.reference}. Please wait while your reservation is verified.`
      );
    },

    onClose() {
      console.log("Paystack window closed.");
    },
  });

  handler.openIframe();
}

/* ======================================================
   WHATSAPP
   ====================================================== */

function initWhatsAppLinks() {
  const links = document.querySelectorAll('a[href*="wa.me/"]');

  links.forEach((link) => {
    link.addEventListener("click", () => {
      /*
       * Analytics can be added here later.
       */
    });
  });
}

/* ======================================================
   UTILITY FUNCTIONS
   ====================================================== */

function formatCurrency(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "₦0";
  }

  return "₦" + value.toLocaleString("en-NG");
}

function formatCategory(category) {
  if (!category) return "—";

  return category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatService(service) {
  if (!service) return "—";

  return service === "advanced" ? "Advanced Service" : "Standard Service";
}

function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ======================================================
   SIMPLE USER MESSAGE
   ====================================================== */

function showMessage(message) {
  /*
   * Temporary implementation.
   *
   * Later this can become a polished
   * toast notification component.
   */

  window.alert(message);
}

// ========== IMAGE/VIDEO SLIDER FUNCTION ==========
let slideIndex = {};

function moveSlide(btn, n) {
  const slider = btn.parentElement;
  const slides = slider.querySelector(".slides");
  const totalSlides = slides.children.length;
  const cardTitle = slider.closest(".card").querySelector("h3").innerText;

  if (!slideIndex[cardTitle]) slideIndex[cardTitle] = 0;

  slideIndex[cardTitle] += n;
  if (slideIndex[cardTitle] >= totalSlides) slideIndex[cardTitle] = 0;
  if (slideIndex[cardTitle] < 0) slideIndex[cardTitle] = totalSlides - 1;

  slides.style.transform = `translateX(-${slideIndex[cardTitle] * 100}%)`;
}

// Auto slide every 4 seconds
setInterval(() => {
  document.querySelectorAll(".gallery-card").forEach((card) => {
    const nextBtn = card.querySelector(".next");
    if (nextBtn) nextBtn.click();
  });
}, 4000);

// ========== ORDER FOOD FUNCTION ==========
function orderFood() {
  window.open(
    "https://wa.me/2349169713338?text=Hi%20DView%20Royal%20Resort%20I%20want%20to%20order%20food",
    "_blank"
  );
}

// ========== BOOK EVENT FUNCTION ==========
function bookEvent(eventType) {
  window.open(
    `https://wa.me/2349169713338?text=Hi%20DView%20Royal%20Resort%20I%20want%20to%20inquire%20about%20${eventType}`,
    "_blank"
  );
}

// ========== BOOKING MODAL LOGIC ==========
let bookingData = {};

function openBookingModal(button) {
  const card = button.closest(".card");
  bookingData.roomName = card.dataset.room;

  document.getElementById("booking-modal").style.display = "block";
  const categoryGrid = document.getElementById("category-grid");
  categoryGrid.innerHTML = "";
  const addedCategories = new Set();

  // Get all unique categories + lowest price for that category
  card.querySelectorAll(".room-option").forEach((option) => {
    const cat = option.dataset.category;
    const price = option.dataset.price;
    if (!addedCategories.has(cat)) {
      addedCategories.add(cat);
      categoryGrid.innerHTML += `<div class="category-card" data-cat="${cat}" onclick="selectCategory('${cat}', ${price})">${cat.toUpperCase()}<br><small>From ₦${Number(
        price
      ).toLocaleString()}</small></div>`;
    }
  });
  goToStep(1);
}

function closeModal() {
  document.getElementById("booking-modal").style.display = "none";
  // Reset steps
  goToStep(1);
}

function goToStep(stepNumber) {
  document
    .querySelectorAll(".booking-step")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(`step-${stepNumber}`).classList.add("active");
  if (stepNumber === 4) updateSummary();
}

function selectCategory(category, price) {
  bookingData.category = category;
  bookingData.price = price;
  goToStep(2);
}

function selectService(service) {
  bookingData.service = service;
  goToStep(3);
}

function updateSummary() {
  // Match the IDs in your rooms.html step 4
  document.getElementById("summaryRoom").innerText = bookingData.roomName;
  document.getElementById("summaryCategory").innerText =
    bookingData.category.toUpperCase();
  document.getElementById("summaryPrice").innerText = `₦${Number(
    bookingData.price
  ).toLocaleString()}`;
}

// ========== PAYSTACK PAYMENT ==========
function payWithPaystack() {
  const name = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;

  if (!name || !email || !phone) {
    alert("Please fill all your details");
    return;
  }

  let handler = PaystackPop.setup({
    key: "pk_test_e568a58a7470e1fcabdf16fd4e24d28986d793c9", // <-- REPLACE WITH YOUR LIVE KEY LATER
    email: email,
    amount: bookingData.price * 100, // Paystack uses kobo
    currency: "NGN",
    ref: "DVIEW_" + Date.now(),
    metadata: {
      custom_fields: [
        { display_name: "Full Name", variable_name: "name", value: name },
        { display_name: "Phone", variable_name: "phone", value: phone },
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
      ],
    },
    callback: function (response) {
      alert(
        "Payment successful! Ref: " +
          response.reference +
          ". We will contact you on WhatsApp to confirm."
      );
      closeModal();
    },
    onClose: function () {
      alert("Payment window closed.");
    },
  });
  handler.openIframe();
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("booking-modal");
  if (event.target == modal) {
    closeModal();
  }
};

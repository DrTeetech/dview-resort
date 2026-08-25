// Smooth Scroll for nav links
document.querySelectorAll(".nav-links a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

// Order Food Function
function orderFood() {
  window.open(
    "https://wa.me/2349169713338?text=Hi%20DView%20Royal%20Resort%20I%20want%20to%20order%20food",
    "_blank"
  );
}

// Book Event Function
function bookEvent(eventType) {
  window.open(
    `https://wa.me/2349169713338?text=Hi%20DView%20Royal%20Resort%20I%20want%20to%20inquire%20about%20${eventType}`,
    "_blank"
  );
}

// IMAGE/VIDEO SLIDER FUNCTION
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

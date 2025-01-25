const slider = document.querySelector(".slider");
const slides = document.querySelectorAll(".slider .slide");
const prevButton = document.querySelector(".slider-prev");
const nextButton = document.querySelector(".slider-next");

let currentSlide = 0;
let autoSlideInterval; // Timer für automatischen Slide

// Geschwindigkeit in Millisekunden (z.B. 3000 = 3 Sekunden)
const SLIDE_SPEED = 7000;

function updateSlider() {
  slides.forEach((slide, index) => {
    slide.style.display = "none"; // Alle Slides verstecken
    if (index === currentSlide) {
      slide.style.display = "block"; // Nur die aktuelle Slide anzeigen
    }
  });
}

function showNextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlider();
}

function showPrevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlider();
}

// Automatische Bewegung starten
function startAutoSlide() {
  autoSlideInterval = setInterval(showNextSlide, SLIDE_SPEED);
}

// Automatische Bewegung stoppen
function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

// Buttons für manuelles Navigieren
if (nextButton) {
  nextButton.addEventListener("click", () => {
    showNextSlide();
    stopAutoSlide();
    startAutoSlide(); // Timer neu starten
  });
}

if (prevButton) {
  prevButton.addEventListener("click", () => {
    showPrevSlide();
    stopAutoSlide();
    startAutoSlide(); // Timer neu starten
  });
}

// Initial
updateSlider();
startAutoSlide();

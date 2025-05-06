let slideIndex = 0;
const images = ["1.jpeg", "2.jpeg", "3.jpeg","4.jpeg","5.jpeg","6.jpeg","7.jpeg","8.jpeg","9.jpeg"]; // Add your image paths

function showSlide() {
    const slideImage = document.getElementById('slideImage');
    slideImage.src = images[slideIndex];
}

function changeSlide(n) {
    slideIndex += n;

    // Wrap around to the first or last image
    if (slideIndex >= images.length) {
        slideIndex = 0;
    } else if (slideIndex < 0) {
        slideIndex = images.length - 1;
    }
    
    showSlide();
}

// Initial display
showSlide();



// Fade-in animation for feature cards
window.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.feature-card.fade-in');
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('visible'), 200 + i * 150);
  });
  // Animate hero
  document.querySelectorAll('.animate-hero').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 100);
  });
  document.querySelectorAll('.animate-hero-img').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 400);
  });
  // Animate fade-in and slide-in elements on scroll
  const fadeEls = document.querySelectorAll('.fade-in, .slide-in');
  const onScroll = () => {
    fadeEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.classList.add('visible');
      }
    });
  };
  window.addEventListener('scroll', onScroll);
  onScroll();
  // FAQ toggle
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', function() {
      this.classList.toggle('open');
      const answer = this.nextElementSibling;
      answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    });
  });
});

// Enable smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
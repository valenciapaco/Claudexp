// Slide deck functionality
class SlidePresentation {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;

        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        this.progressFill = document.getElementById('progressFill');

        this.init();
    }

    init() {
        // Set total slides
        this.totalSlidesSpan.textContent = this.totalSlides;

        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.nextSlide();
            } else if (e.key === 'Home') {
                this.goToSlide(0);
            } else if (e.key === 'End') {
                this.goToSlide(this.totalSlides - 1);
            }
        });

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        this.handleSwipe = () => {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - next slide
                this.nextSlide();
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - previous slide
                this.previousSlide();
            }
        };

        // Initialize first slide
        this.updateSlide();
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
            this.updateSlide();
        }
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSlide();
        }
    }

    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentSlide = index;
            this.updateSlide();
        }
    }

    updateSlide() {
        // Remove active class from all slides
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            if (index < this.currentSlide) {
                slide.classList.add('prev');
            } else if (index > this.currentSlide) {
                slide.classList.add('next');
            }
        });

        // Add active class to current slide
        this.slides[this.currentSlide].classList.add('active');

        // Update counter
        this.currentSlideSpan.textContent = this.currentSlide + 1;

        // Update progress bar
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;

        // Update button states
        this.prevBtn.disabled = this.currentSlide === 0;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;

        // Update background gradient based on current slide
        this.updateBackgroundGradient();

        // Scroll content to top when changing slides
        const content = this.slides[this.currentSlide].querySelector('.content');
        if (content) {
            content.scrollTop = 0;
        }
    }

    updateBackgroundGradient() {
        // Create dynamic gradient based on slide position
        const slideProgress = this.currentSlide / (this.totalSlides - 1);

        // Define color stops for the gradient journey
        const gradients = [
            'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #d946ef 100%)', // Pink start
            'linear-gradient(135deg, #f472b6 0%, #d946ef 50%, #c026d3 100%)', // Pink to magenta
            'linear-gradient(135deg, #d946ef 0%, #c026d3 50%, #a855f7 100%)', // Magenta
            'linear-gradient(135deg, #c026d3 0%, #a855f7 50%, #9333ea 100%)', // Magenta to purple
            'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7e22ce 100%)', // Purple
            'linear-gradient(135deg, #9333ea 0%, #7e22ce 50%, #6b21a8 100%)'  // Dark purple
        ];

        // Calculate which gradient to use based on progress
        const gradientIndex = Math.min(
            Math.floor(slideProgress * (gradients.length - 1)),
            gradients.length - 1
        );

        document.body.style.background = gradients[gradientIndex];
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const presentation = new SlidePresentation();

    // Add fullscreen toggle (optional)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen();
        }
    });

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // Add slide number navigation (click on counter to jump to slide)
    const slideCounter = document.querySelector('.slide-counter');
    if (slideCounter) {
        slideCounter.style.cursor = 'pointer';
        slideCounter.setAttribute('title', 'Click to jump to slide');

        slideCounter.addEventListener('click', () => {
            const slideNumber = prompt(`Go to slide (1-${presentation.totalSlides}):`);
            if (slideNumber) {
                const index = parseInt(slideNumber) - 1;
                if (index >= 0 && index < presentation.totalSlides) {
                    presentation.goToSlide(index);
                } else {
                    alert(`Please enter a number between 1 and ${presentation.totalSlides}`);
                }
            }
        });
    }

    // Log helpful keyboard shortcuts
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║   Slide Deck Keyboard Shortcuts          ║
    ╠═══════════════════════════════════════════╣
    ║   → or Space    : Next slide              ║
    ║   ←             : Previous slide          ║
    ║   Home          : First slide             ║
    ║   End           : Last slide              ║
    ║   F             : Toggle fullscreen       ║
    ║   Click counter : Jump to specific slide  ║
    ╚═══════════════════════════════════════════╝
    `);
});

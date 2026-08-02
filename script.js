/* ==========================================================================
   INTERACTIVE ENGINE: "NIVI" COQUETTE TECH BADDIE & MUN PORTFOLIO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* 1. CINEMATIC MOUSE CURSOR TRAIL (STAR FOLLOWER)
       ========================================================================== */
    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('custom-cursor-follower');

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let starAngle = 0;

    // Fluid interpolation factor for luxurious trailing
    const lerpFactor = 0.15;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Inner dot tracks coordinate exactly
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Animate custom 4-pointed star cursor follower
    function animateFollower() {
        followerX += (mouseX - followerX) * lerpFactor;
        followerY += (mouseY - followerY) * lerpFactor;

        // Continuous slow luxury spin
        starAngle += 0.65;

        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;

        const svg = follower.querySelector('svg');
        if (svg) {
            svg.style.transform = `rotate(${starAngle}deg)`;
        }

        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Cursor scaling states over active assets
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .capability-card, .project-card, .hamburger');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            follower.classList.add('active');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            follower.classList.remove('active');
        });
    });

    // Hide cursor when leaving viewport boundaries
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
    });


    /* 2. CLICK SPARKLES BURST PARTICLE EMITTER
       ========================================================================== */
    window.addEventListener('click', (e) => {
        // Exclude drawer close buttons or overlay clicks if they trigger full resets
        if (e.target.closest('.btn-drawer-close') || e.target.closest('.about-drawer-overlay')) return;

        const particleCount = 7;
        for (let i = 0; i < particleCount; i++) {
            createSparkle(e.clientX, e.clientY);
        }
    });

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'click-sparkle';
        sparkle.innerHTML = `
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
        `;

        // Calculate random radial velocity angles
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 70 + 35; // speed radius
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        sparkle.style.setProperty('--tx', `${tx}px`);
        sparkle.style.setProperty('--ty', `${ty}px`);
        
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;

        document.body.appendChild(sparkle);

        // Delete DOM element after animation ends
        setTimeout(() => {
            sparkle.remove();
        }, 700);
    }


    /* 3. SPINNING STAR CANVAS SYSTEMS (PARTICLE SYSTEM RESETS)
       ========================================================================== */
    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const particleCount = 35;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    // Helper to draw clean 4-point stars on canvas
    function drawStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius, alpha) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = `rgba(232, 114, 138, ${alpha})`;
        ctx.fill();
    }

    class StarParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1; // scale
            this.speedX = (Math.random() - 0.5) * 0.15;
            this.speedY = (Math.random() - 0.5) * 0.15;
            this.alpha = Math.random() * 0.4 + 0.1;
            this.initialAlpha = this.alpha;
            this.rotation = Math.random() * Math.PI * 2;
            this.spinSpeed = (Math.random() - 0.5) * 0.005;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.spinSpeed;

            // Bounce on boundaries
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            // Gentle repulsion physical effect on close hover
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                const force = (120 - distance) / 120;
                this.x -= (dx / distance) * force * 1.3;
                this.y -= (dy / distance) * force * 1.3;
                this.alpha = Math.min(this.initialAlpha + 0.35, 0.85);
            } else {
                if (this.alpha > this.initialAlpha) {
                    this.alpha -= 0.01;
                }
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            // Spikes=4, outerRadius=size*4.5, innerRadius=size*1.3
            drawStarShape(ctx, 0, 0, 4, this.size * 4.5, this.size * 1.3, this.alpha);
            ctx.restore();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new StarParticle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();


    /* 4. DYNAMIC CARD MOUSE-MOVE 3D TILT EFFECT
       ========================================================================== */
    const cards = document.querySelectorAll('.capability-card, .project-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Mouse coordinate relative to card bounding box
            const cardX = e.clientX - rect.left;
            const cardY = e.clientY - rect.top;
            
            // Normalize coordinate between -1 and 1
            const normX = (cardX / rect.width) * 2 - 1;
            const normY = (cardY / rect.height) * 2 - 1;
            
            // Multiply to compute maximum pitch/yaw rotation angles (max 7deg)
            const rotateY = normX * 7; 
            const rotateX = -normY * 7; 

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            // Restore default values smoothly
            card.style.transform = '';
        });
    });


    /* 5. TYPEWRITER ANIMATION ENGINE FOR HERO SUBTITLE (SAFELY GUARDED)
       ========================================================================== */
    const typewriter = document.getElementById('typewriter-text');
    if (typewriter && typewriter.getAttribute('data-phrases')) {
        try {
            const phrases = JSON.parse(typewriter.getAttribute('data-phrases'));
            let phraseIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            let typingSpeed = 100;

            function typeEffect() {
                if (!typewriter || !phrases.length) return;
                const currentPhrase = phrases[phraseIndex];

                if (isDeleting) {
                    typewriter.textContent = currentPhrase.substring(0, charIndex - 1);
                    charIndex--;
                    typingSpeed = 50; 
                } else {
                    typewriter.textContent = currentPhrase.substring(0, charIndex + 1);
                    charIndex++;
                    typingSpeed = 110; 
                }

                if (!isDeleting && charIndex === currentPhrase.length) {
                    isDeleting = true;
                    typingSpeed = 1800;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    typingSpeed = 400;
                }

                setTimeout(typeEffect, typingSpeed);
            }
            
            setTimeout(typeEffect, 1200);
        } catch (e) {
            console.warn('Typewriter init skipped:', e);
        }
    }


    /* 6. SCROLL REVEALS & ACTIVE NAVBAR HIGHLIGHTING
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const revealOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    const fadeElements = document.querySelectorAll('.fade-in-element');
    fadeElements.forEach(el => el.classList.add('active')); 

    const revealElements = document.querySelectorAll('.reveal-element');
    revealElements.forEach(el => scrollObserver.observe(el));


    // Dynamic Scroll Timeline Fill-line
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineProgress = document.querySelector('.timeline-progress');

    window.addEventListener('scroll', () => {
        if (!timelineContainer) return;
        
        const rect = timelineContainer.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        
        if (rect.top < viewHeight && rect.bottom > 0) {
            const containerHeight = rect.height;
            const progress = (viewHeight - rect.top) / (viewHeight + containerHeight);
            const clampedProgress = Math.max(0, Math.min(100, progress * 100 * 1.25));
            timelineProgress.style.height = `${clampedProgress}%`;
        }
    });


    // Active Navbar Dot highlight depending on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 140;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });


    /* 7. FLOATING ABOUT DRAWER & OVERLAYS
       ========================================================================== */
    const drawerTrigger = document.getElementById('btn-about-trigger');
    const drawerClose = document.getElementById('btn-drawer-close');
    const drawerOverlay = document.getElementById('about-drawer-overlay');
    const drawer = document.getElementById('about-drawer');

    function openDrawer() {
        drawer.classList.add('active');
        drawerOverlay.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; 
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; 
    }

    drawerTrigger.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
            closeDrawer();
        }
    });


    /* 8. TOAST NOTIFICATION FEEDBACK
       ========================================================================== */
    const toastContainer = document.getElementById('toast-container');
    const contactForm = document.getElementById('contact-form');

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="toast-icon"></span>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Repaint repaint to trigger active slide
        setTimeout(() => toast.classList.add('show'), 50);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 4000);
    }

    // Submit handler
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            
            // Custom MUN-Diplomat themed toast message
            showToast(`Thank you, Counselor ${name}! Geopolitical dispatch drafted successfully.`);
            
            contactForm.reset();
        });
    }


    /* 9. MOBILE HAMBURGER NAVIGATION
       ========================================================================== */
    const hamburger = document.getElementById('hamburger');
    const navLinksList = document.getElementById('nav-links');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinksList.classList.toggle('active');
    });

    const mobileLinks = document.querySelectorAll('.nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinksList.classList.remove('active');
        });
    });

});

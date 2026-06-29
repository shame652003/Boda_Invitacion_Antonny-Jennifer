/* ==========================================================
   INVITACIÓN DIGITAL — JENNIFER & ANTHONY
   JavaScript Principal
   15 de septiembre de 2026
   ========================================================== */

const CONFIG = {
    WHATSAPP_NUMBER: 'TU_NUMERO_AQUI',
    TARGET_DATE: new Date('2026-09-15T11:00:00').getTime(),
    STORAGE_KEY: 'jennifer_anthony_guestbook',
    STORAGE_VERSION: '1.0'
};

// =====================
// MÓDULO: INTRO / ENVELOPE MAGIC (GSAP)
// =====================
function initIntro() {
    const overlay = document.getElementById('intro-overlay');
    const seal = document.querySelector('.envelope-seal');
    const closedEnv = document.querySelector('.envelope-closed');
    const mainContent = document.getElementById('main-content');

    if (!overlay || !seal || !closedEnv) {
        if (overlay) overlay.style.display = 'none';
        if (mainContent) mainContent.classList.add('visible');
        initScrollReveals();
        return;
    }

    gsap.set(mainContent, { visibility: 'visible', opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(seal, {
        y: 120,
        opacity: 0,
        rotation: -30,
        duration: 0.6,
        ease: 'back.in(1.7)'
    })
    .to(closedEnv, {
        scale: 1.25,
        rotationY: 15,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.inOut'
    }, '-=0.2')
    .to(overlay, {
        opacity: 0,
        duration: 0.9,
        ease: 'power2.inOut',
        onComplete: () => {
            overlay.style.display = 'none';
            gsap.to(mainContent, {
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out'
            });
            animateNameReveal();
            initScrollReveals();
        }
    });

    [seal, closedEnv, overlay].forEach(el => {
        if (!el) return;
        el.addEventListener('click', () => {
            if (tl.isActive() || tl.progress() > 0) return;
            tl.play();
        });
    });

    setTimeout(() => {
        if (tl.progress() === 0) tl.play();
    }, 8000);
}

function animateNameReveal() {
    const letters = document.querySelectorAll('.name-reveal');
    letters.forEach((letter, i) => {
        const delay = parseInt(letter.dataset.delay) || i;
        setTimeout(() => letter.classList.add('revealed'), delay * 80);
    });
}

// =====================
// MÓDULO: CUENTA REGRESIVA
// =====================
function initCountdown() {
    const units = {
        days: document.querySelector('[data-unit="days"] .number'),
        hours: document.querySelector('[data-unit="hours"] .number'),
        minutes: document.querySelector('[data-unit="minutes"] .number'),
        seconds: document.querySelector('[data-unit="seconds"] .number')
    };

    if (!units.days || !units.hours || !units.minutes || !units.seconds) return;

    let previousValues = { days: '--', hours: '--', minutes: '--', seconds: '--' };

    function update() {
        const now = Date.now();
        const diff = CONFIG.TARGET_DATE - now;

        if (diff <= 0) {
            Object.values(units).forEach(el => { if (el) el.textContent = '00'; });
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const values = {
            days: pad(d), hours: pad(h), minutes: pad(m), seconds: pad(s)
        };

        Object.keys(values).forEach(key => {
            if (previousValues[key] !== values[key]) {
                flipDigit(units[key], values[key]);
            }
        });

        previousValues = values;
    }

    function flipDigit(element, newValue) {
        if (!element) return;
        const card = element.closest('.flip-card');
        if (card) {
            card.classList.remove('flipping');
            void card.offsetWidth;
            card.classList.add('flipping');
        }
        element.textContent = newValue;
    }

    function pad(n) { return n < 10 ? '0' + n : n; }

    update();
    setInterval(update, 1000);
}

// =====================
// MÓDULO: SCROLL REVEALS (Intersection Observer)
// =====================
function initScrollReveals() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// =====================
// MÓDULO: TIMELINE SCROLL ANIMATIONS (GSAP ScrollTrigger)
// =====================
function initTimelineAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.timeline-event').forEach((event) => {
        const side = event.dataset.side || 'left';
        const card = event.querySelector('.timeline-card');
        const dot = event.querySelector('.timeline-dot');

        if (!card) return;

        const xOffset = window.innerWidth >= 768 ? (side === 'left' ? -60 : 60) : -40;

        gsap.from(card, {
            scrollTrigger: { trigger: event, start: 'top 85%', toggleActions: 'play none none none' },
            x: xOffset, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.1,
            onComplete: () => { gsap.set(card, { clearProps: 'transform' }); }
        });

        if (dot) {
            gsap.from(dot, {
                scrollTrigger: { trigger: event, start: 'top 85%', toggleActions: 'play none none none' },
                scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)', delay: 0.2
            });
        }
    });

    const timelineLine = document.querySelector('.timeline-line');
    if (timelineLine) {
        gsap.from(timelineLine, {
            scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 60%', toggleActions: 'play none none none' },
            scaleY: 0, transformOrigin: 'top center', duration: 1.5, ease: 'power2.out'
        });
    }
}

// =====================
// MÓDULO: GALERÍA CARRUSEL (Swiper.js)
// =====================
function initSwiper() {
    if (typeof Swiper === 'undefined') return;

    const isMobile = window.innerWidth < 768;

    const swiper = new Swiper('.wedding-swiper', {
        effect: isMobile ? 'fade' : 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: isMobile ? 1 : 'auto',
        spaceBetween: isMobile ? 0 : 30,
        loop: true,
        speed: 700,
        autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true },
        coverflowEffect: { rotate: 40, stretch: 0, depth: 120, modifier: 1, slideShadows: false },
        fadeEffect: { crossFade: true },
        pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        keyboard: { enabled: true }
    });

    let lastIsMobile = isMobile;
    window.addEventListener('resize', () => {
        const currentIsMobile = window.innerWidth < 768;
        if (currentIsMobile !== lastIsMobile) {
            lastIsMobile = currentIsMobile;
            swiper.destroy(true, true);
            initSwiper();
        }
    });
}

// =====================
// UTILIDAD: Capitalizar texto
// =====================
function formatCapitalization(text) {
    return text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// =====================
// MÓDULO: LIBRO DE VISITAS (Guestbook + LocalStorage)
// =====================
function initGuestbook() {
    const form = document.getElementById('guestbook-form');
    const wall = document.getElementById('guestbook-wall');

    if (!form || !wall) return;

    let messages = loadMessages();
    renderMessages(messages);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawName = (document.getElementById('guest-name')?.value || '').trim();
        const rawText = (document.getElementById('guest-message')?.value || '').trim();
        const name = formatCapitalization(rawName);
        const text = rawText;

        if (!name || !text || name.length < 2 || text.length < 2) {
            showToast('Por favor, completa todos los campos 💛');
            return;
        }

        const entry = {
            id: Date.now(),
            name: name,
            message: text,
            date: new Date().toISOString()
        };

        messages.unshift(entry);
        saveMessages(messages);
        renderMessages(messages);
        initGuestbookSwiper();
        form.reset();
        showToast('¡Mensaje enviado con amor! 💌');
    });
}

function loadMessages() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!data) return getDefaultMessages();
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : getDefaultMessages();
    } catch (e) { return getDefaultMessages(); }
}

function saveMessages(messages) {
    try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(messages)); } catch (e) {}
}

function getDefaultMessages() {
    return [
        {
            id: 1,
            name: 'María & Carlos',
            message: '¡Qué emoción! Estamos súper entusiasmados de acompañarlos en este día tan especial. ¡Les deseamos toda la felicidad del mundo! 💕',
            date: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Familia Rodríguez',
            message: 'Un día inolvidable para una pareja maravillosa. ¡Con mucho cariño y bendiciones para esta nueva etapa juntos!',
            date: new Date(Date.now() - 86400000).toISOString()
        }
    ];
}

function renderMessages(messages) {
    const wall = document.getElementById('guestbook-wall');
    if (!wall) return;

    if (messages.length === 0) {
        wall.innerHTML = '<div class="swiper-slide"><div class="guest-card"><div class="guest-card-header"><strong>💌</strong></div><p class="guest-text">Sé el primero en dejar un mensaje de amor</p></div></div>';
        return;
    }

    wall.innerHTML = messages.map((msg) => `
        <div class="swiper-slide">
            <div class="guest-card">
                <div class="guest-card-header">
                    <strong>${escapeHtml(msg.name)}</strong>
                    <span class="guest-date">${formatDate(msg.date)}</span>
                </div>
                <p class="guest-text">${escapeHtml(msg.message)}</p>
            </div>
        </div>
    `).join('');
}

function initGuestbookSwiper() {
    if (typeof Swiper === 'undefined') return;
    const el = document.querySelector('.comments-swiper');
    if (!el) return;

    if (el.swiper) el.swiper.destroy(true, true);

    new Swiper('.comments-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        centeredSlides: true,
        loop: true,
        speed: 600,
        autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { el: '.comments-pagination', clickable: true },
        keyboard: { enabled: true },
        breakpoints: {
            768: { slidesPerView: 'auto', spaceBetween: 24 }
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoString) {
    try {
        return new Date(isoString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return ''; }
}

// =====================
// MÓDULO: REGALOS — COPY TO CLIPBOARD
// =====================
function initGifts() {
    document.querySelectorAll('.btn-copy[data-copy]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.dataset.copy;
            if (!text) return;

            try {
                await navigator.clipboard.writeText(text);
                showToast('¡Copiado con éxito! Gracias por tu cariño 💛');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="bi bi-check-lg"></i> ¡Copiado!';
                btn.style.background = 'var(--color-green)';
                setTimeout(() => { btn.innerHTML = originalHTML; btn.style.background = ''; }, 2000);
            } catch (err) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showToast('¡Copiado con éxito! Gracias por tu cariño 💛');
                } catch (e2) {
                    showToast('No se pudo copiar automáticamente. Por favor, copia manualmente.');
                }
                document.body.removeChild(textarea);
            }
        });
    });
}

// =====================
// MÓDULO: RSVP + WHATSAPP
// =====================
let rsvpType = null;

function openRsvpModal(type) {
    rsvpType = type;
    const modal = document.getElementById('rsvp-modal');
    const title = document.getElementById('rsvp-modal-title');
    const submitBtn = document.getElementById('rsvp-submit-btn');

    if (!modal) return;

    if (type === 'yes') {
        title.textContent = '¡Confirmar asistencia!';
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-check-lg"></i> Confirmar asistencia';
            submitBtn.style.background = 'var(--color-green)';
        }
    } else {
        title.textContent = 'Lamentamos que no puedas asistir';
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-send-fill"></i> Enviar mensaje';
            submitBtn.style.background = 'var(--color-rose)';
        }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('rsvp-name')?.focus(), 350);
}

function closeRsvpModal() {
    const modal = document.getElementById('rsvp-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function initRsvp() {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawName = (document.getElementById('rsvp-name')?.value || '').trim();
        const rawLastname = (document.getElementById('rsvp-lastname')?.value || '').trim();

        if (!rawName || !rawLastname) {
            showToast('Por favor, completa tu nombre y apellido 💛');
            return;
        }

        const fullName = formatCapitalization(rawName + ' ' + rawLastname);
        let message = '';

        if (rsvpType === 'yes') {
            message = `¡Hola Jennifer y Anthony! Confirmadísimo, allí estaré con ustedes el 15 de septiembre para celebrar su amor. Mi nombre es ${fullName} ✨. ¡Qué emoción!`;
        } else {
            message = `¡Hola Jennifer y Anthony! Lamentablemente no podré asistir a su boda el 15 de septiembre, pero les deseo todo el amor del mundo en esta nueva etapa. ¡Un abrazo fuerte! ❤️ Mi nombre es ${fullName}.`;
        }

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
        closeRsvpModal();
        form.reset();

        showToast(rsvpType === 'yes' ? '¡Gracias por confirmar! Nos vemos pronto 💛' : 'Gracias por avisarnos. Te extrañaremos 💛');
    });

    const modal = document.getElementById('rsvp-modal');
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeRsvpModal(); });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeRsvpModal();
    });
}

// =====================
// MÓDULO: PARALLAX FLOWERS
// =====================
function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.parallax-flower').forEach(flower => {
        const speed = parseFloat(flower.dataset.speed) || 0.2;
        const direction = flower.classList.contains('flower-hero-bottom') ? 1 : -1;
        gsap.to(flower, {
            y: `${direction * 80 * speed}`,
            scrollTrigger: {
                trigger: flower.closest('section'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });
}

// =====================
// TOAST
// =====================
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="bi bi-check-circle-fill"></i><span>${message}</span>`;
    toast.classList.add('show');

    if (toast._hideTimeout) clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// =====================
// MÓDULO: LLUVIA DE PÉTALOS (GSAP)
// =====================
function initPetalRain() {
    if (typeof gsap === 'undefined') return;

    const container = document.createElement('div');
    container.id = 'petal-container';
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;';
    document.body.appendChild(container);

    const petalCount = 12;
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('span');
        petal.classList.add('petal');
        container.appendChild(petal);

        const startX = Math.random() * width;
        const scale = 0.5 + Math.random() * 0.5;
        const duration = 12 + Math.random() * 14;
        const delay = Math.random() * 8;

        gsap.set(petal, {
            x: startX,
            y: -40,
            scale: scale,
            rotation: Math.random() * 360,
            opacity: 0.2 + Math.random() * 0.2
        });

        const tl = gsap.timeline({ repeat: -1, delay: delay });
        tl.to(petal, {
            y: height + 60,
            x: startX + (Math.random() - 0.5) * 200,
            rotation: Math.random() * 720,
            duration: duration,
            ease: 'none',
            onRepeat: () => {
                gsap.set(petal, {
                    x: Math.random() * width,
                    y: -40,
                    rotation: Math.random() * 360
                });
            }
        });
    }
}

// =====================
// INICIALIZACIÓN GLOBAL
// =====================
document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initCountdown();
    initSwiper();
    initGuestbook();
    initGifts();
    initRsvp();
    initPetalRain();

    setTimeout(() => {
        initTimelineAnimations();
        initParallax();
        initGuestbookSwiper();
    }, 100);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Prevenir zoom en doble tap en iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
}, { passive: false });

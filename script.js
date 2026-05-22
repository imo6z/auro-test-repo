// â”€â”€ AURO MAIN PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
'use strict';

// â”€â”€ PRELOADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if (!sessionStorage.getItem('auro_preloaded')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const p = document.getElementById('preloader');
            if (p) p.classList.add('hide');
            sessionStorage.setItem('auro_preloaded', 'true');
        }, 1600);
    });
} else {
    const p = document.getElementById('preloader');
    if (p) p.style.display = 'none';
}

// â”€â”€ MAIN BACKGROUND â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const bgEl = document.getElementById('bg-slideshow');
if (bgEl) bgEl.style.backgroundImage = "url('AUROwebsitebg.png')";

// â”€â”€ NAV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const nav = document.getElementById('mainNav');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    highlightNav();
});

function toggleMenu() { hamburger.classList.toggle('open'); mobileNav.classList.toggle('open'); }
function closeMenu() { hamburger.classList.remove('open'); mobileNav.classList.remove('open'); }

// close mobile menu on outside click
mobileNav.addEventListener('click', e => { if (e.target === mobileNav) closeMenu(); });

function highlightNav() {
    const sections = ['hero', 'packages', 'gallery', 'faq', 'policies', 'contact'];
    let current = '';
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 200) current = id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
}

// smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { closeMenu(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// â”€â”€ REVEAL ANIMATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// â”€â”€ HOW IT WORKS ANIMATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const hiwLine = document.getElementById('hiw-line');
if (hiwLine) {
    const hiwObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) hiwLine.classList.add('animate'); });
    }, { threshold: 0.3 });
    hiwObs.observe(hiwLine);
}

// â”€â”€ PARTICLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function spawnParticles(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.cssText = `left:${x}px;top:${y}px;width:${2 + Math.random() * 4}px;height:${2 + Math.random() * 4}px;`;
            document.body.appendChild(p);
            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 80;
            const anim = p.animate([
                { opacity: 1, transform: 'translate(0,0) scale(1)' },
                { opacity: 0, transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) scale(0)` }
            ], { duration: 800 + Math.random() * 400, easing: 'cubic-bezier(.2,.8,.4,1)' });
            anim.onfinish = () => p.remove();
        }, i * 40);
    }
}
document.addEventListener('click', e => {
    if (e.target.closest('.btn-primary,.btn-outline,.pkg-card,.social-btn')) spawnParticles(e.clientX, e.clientY);
});

// â”€â”€ TOAST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let toastTimer;
function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.className = `toast ${type}`;
    document.getElementById('toast-icon').textContent = type === 'success' ? 'âœ…' : type === 'error' ? 'âš ï¸' : 'â„¹ï¸';
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('visible'), 3500);
}

// â”€â”€ LIGHTBOX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const lbImages = ['bg1.png', 'bg2.png', 'bg3.png', 'bg4.png'];
let lbIdx = 0;

function lbOpen(i) {
    lbIdx = i;
    document.getElementById('lb-img').src = lbImages[i];
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function lbClose(e) {
    if (!e || e.target === document.getElementById('lightbox') || e.target.classList.contains('lb-close')) {
        document.getElementById('lightbox').classList.remove('open');
        document.body.style.overflow = '';
    }
}
function lbNav(dir) {
    lbIdx = (lbIdx + dir + lbImages.length) % lbImages.length;
    const img = document.getElementById('lb-img');
    img.style.opacity = '0';
    setTimeout(() => { img.src = lbImages[lbIdx]; img.style.opacity = '1'; }, 200);
}
document.getElementById('lb-img').style.transition = 'opacity .25s';

document.addEventListener('keydown', e => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbNav(-1);
    if (e.key === 'ArrowRight') lbNav(1);
});

// touch swipe for lightbox
let tsX = 0;
document.getElementById('lightbox').addEventListener('touchstart', e => { tsX = e.touches[0].clientX; }, { passive: true });
document.getElementById('lightbox').addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tsX;
    if (Math.abs(dx) > 50) lbNav(dx > 0 ? -1 : 1);
});

// â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toggleFAQ(trigger) {
    const item = trigger.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const a = i.querySelector('.faq-a');
        if (a) a.style.maxHeight = '0';
    });
    if (!isOpen) {
        item.classList.add('open');
        const a = item.querySelector('.faq-a');
        if (a) a.style.maxHeight = a.scrollHeight + 'px';
    }
}

// â”€â”€ WHATSAPP FLOAT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const waFloat = document.getElementById('wa-float');
if (waFloat) {
    window.addEventListener('scroll', () => {
        waFloat.classList.toggle('visible', window.scrollY > 300);
    });
}

// â”€â”€ CINEMATIC TRANSITIONS & SOUNDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const audioToggle = document.getElementById('audio-toggle');
const audioOnIcon = document.getElementById('audio-on');
const audioOffIcon = document.getElementById('audio-off');
const transitionOverlay = document.getElementById('page-transition');

let isMuted = localStorage.getItem('auro_muted') === 'true';

// ATMOSPHERIC AUDIO SYSTEM (Web Audio API)
let audioCtx = null;
let filterNode = null;
let gainNode = null;

const soundUrls = {
    pouring: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7392657e0f.mp3', // Coffee Pour
    ambient: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73430.mp3'  // Soft Coffee Shop
};

const audioBuffers = {};

async function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Low-pass filter for "muffled/calm" effect
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 1000; // Muffle high frequencies
    filterNode.Q.value = 1;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.15; // Keep it very subtle

    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Pre-load sounds
    for (const [name, url] of Object.entries(soundUrls)) {
        const resp = await fetch(url);
        const arrayBuf = await resp.arrayBuffer();
        audioBuffers[name] = await audioCtx.decodeAudioData(arrayBuf);
    }
}

function playAtmosphericSound(name) {
    if (isMuted || !audioCtx || !audioBuffers[name]) return;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffers[name];
    source.connect(filterNode);
    source.play();
}

// Update Audio UI
function updateAudioUI() {
    audioOnIcon.style.display = isMuted ? 'none' : 'block';
    audioOffIcon.style.display = isMuted ? 'block' : 'none';
    localStorage.setItem('auro_muted', isMuted);
}
updateAudioUI();

audioToggle.addEventListener('click', async () => {
    if (!audioCtx) await initAudio();
    isMuted = !isMuted;
    updateAudioUI();
});

// Page Transition Logic
function startTransition(url) {
    transitionOverlay.classList.add('active');
    playAtmosphericSound('pouring');
    setTimeout(() => {
        window.location.href = url;
    }, 1200);
}

// Intercept Links
document.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', async e => {
        if (!audioCtx) await initAudio();
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !a.target && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('https://wa.me')) {
            e.preventDefault();
            startTransition(href);
        }
    });
});

// Entry Transition
window.addEventListener('load', () => {
    transitionOverlay.classList.add('active');
    setTimeout(() => {
        transitionOverlay.classList.remove('active');
        transitionOverlay.classList.add('exit');
        setTimeout(() => {
            transitionOverlay.classList.remove('exit');
        }, 800);
    }, 500);
});

window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
        transitionOverlay.classList.remove('active');
        transitionOverlay.classList.remove('exit');
    }
});

// General interaction sounds (Hover only)
document.querySelectorAll('.btn-primary, .btn-outline, .pkg-card, .contact-card, .faq-q').forEach(el => {
    el.addEventListener('mouseenter', async () => {
        if (!audioCtx) await initAudio();
        playAtmosphericSound('ambient');
    });
});

console.log('%c AURO âœ¨ AURO COFFEE CORNER ', 'background:#C5A059;color:#000;font-size:14px;font-weight:bold;padding:8px 16px;border-radius:4px;');

// â”€â”€ SCROLL BLUR & FADE EFFECT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.addEventListener('scroll', () => {
    const bgEl = document.getElementById('bg-slideshow');
    if (!bgEl) return;
    const maxScroll = window.innerHeight * 1.2;
    const progress = Math.min(window.scrollY / maxScroll, 1);

    const blurVal = progress * 24;
    const opacityVal = 1 - progress;
    const brightnessVal = 0.8 - (progress * 0.4);

    bgEl.style.filter = `blur(${blurVal}px) brightness(${brightnessVal}) saturate(1.2)`;
    bgEl.style.opacity = opacityVal.toString();
});

// â”€â”€ SCROLL TO TOP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) scrollTopBtn.classList.add('visible');
        else scrollTopBtn.classList.remove('visible');
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// â”€â”€ SCROLL DEPTH TRACKING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function() {
    let maxScrollPct = 0;
    let reported = 0;
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY + window.innerHeight;
        const total = document.documentElement.scrollHeight;
        const pct = Math.round((scrolled / total) * 100);
        if (pct > maxScrollPct) {
            maxScrollPct = pct;
            // Report every 25% milestone to avoid thrashing localStorage
            if (maxScrollPct - reported >= 25) {
                reported = maxScrollPct;
                if (typeof FeedbackService !== 'undefined') {
                    FeedbackService.logVisitor('Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©', maxScrollPct);
                }
            }
        }
    }, { passive: true });
})();

// ── REVIEWS SPOTLIGHT FADE ────────────────────────────────
function loadReviewsTicker() {
    const track = document.getElementById('reviews-track');
    if (!track) return;

    if (typeof FeedbackService === 'undefined') { setTimeout(loadReviewsTicker, 150); return; }
    FeedbackService.init();

    if (window._reviewTimer) { clearInterval(window._reviewTimer); window._reviewTimer = null; }

    function escHtml(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    const approved = FeedbackService.getReviews('approved');
    track.innerHTML = '';

    if (!approved || !approved.length) {
        track.innerHTML = '<div class="reviews-empty">✦ &nbsp; كن أول من يشارك تجربته مع أورو &nbsp; ✦</div>';
        return;
    }

    // Build all cards — CSS grid stacks them; opacity fades between them
    approved.forEach((r, i) => {
        const rating = Math.min(5, Math.max(0, parseInt(r.rating) || 5));
        const stars  = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const card   = document.createElement('div');
        card.className = 'rv-spot-card' + (i === 0 ? ' active' : '');
        card.innerHTML = `
            <span class="rv-big-quote">"</span>
            <p class="rv-spot-text">${escHtml(r.comment || 'تجربة رائعة مع أورو ✦')}</p>
            <div class="rv-spot-author">
                <div class="rv-spot-divider"></div>
                <div class="rv-spot-name">${escHtml(r.name || 'عميل مميز')}</div>
                <div class="rv-spot-stars">${stars}</div>
            </div>`;
        track.appendChild(card);
    });

    const cards  = Array.from(track.querySelectorAll('.rv-spot-card'));
    const n      = cards.length;
    let   idx    = 0;
    let   paused = false;

    function goTo(i) {
        cards[idx].classList.remove('active');
        idx = ((i % n) + n) % n;
        cards[idx].classList.add('active');
        buildDots();
    }

    function buildDots() {
        const dotsEl = document.getElementById('rv-dots');
        if (!dotsEl) return;
        if (n <= 1) { dotsEl.innerHTML = ''; return; }
        dotsEl.innerHTML = '';
        for (let i = 0; i < n; i++) {
            const dot = document.createElement('button');
            dot.className = 'rv-dot' + (i === idx ? ' active' : '');
            dot.setAttribute('aria-label', `التقييم ${i + 1}`);
            dot.onclick = () => goTo(i);
            dotsEl.appendChild(dot);
        }
    }

    const btnPrev = document.getElementById('rv-prev');
    const btnNext = document.getElementById('rv-next');
    if (btnPrev) btnPrev.onclick = () => goTo(idx - 1);
    if (btnNext) btnNext.onclick = () => goTo(idx + 1);

    const spotlight = track.closest('.rv-spotlight');
    if (spotlight) {
        spotlight.addEventListener('mouseenter', () => { paused = true; });
        spotlight.addEventListener('mouseleave', () => { paused = false; });
    }

    let tsX = 0;
    track.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const dx = tsX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 40) goTo(dx > 0 ? idx + 1 : idx - 1);
    });

    if (n > 1) {
        window._reviewTimer = setInterval(() => { if (!paused) goTo(idx + 1); }, 5000);
    }

    buildDots();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReviewsTicker);
} else {
    loadReviewsTicker();
}

// ── 3D COVER FLOW GALLERY ────────────────────────────────
function initCoverFlow() {
    const stack = document.getElementById('cards-stack');
    if (!stack) return;
    const cards = Array.from(stack.querySelectorAll('.stack-card'));
    const total = cards.length;
    if (!total) return;

    let currentIndex = 0;

    function updateGallery() {
        cards.forEach((card, i) => {
            let dist = i - currentIndex;
            if (dist > total / 2) dist -= total;
            if (dist < -total / 2) dist += total;
            
            card.className = 'stack-card'; // reset classes
            if (dist === 0) card.classList.add('is-center');
            else if (dist === 1) card.classList.add('is-right-1');
            else if (dist === -1) card.classList.add('is-left-1');
            else if (dist === 2) card.classList.add('is-right-2');
            else if (dist === -2) card.classList.add('is-left-2');
            else card.classList.add('is-hidden');
        });
    }

    function nextCard() { currentIndex = (currentIndex + 1) % total; updateGallery(); }
    function prevCard() { currentIndex = (currentIndex - 1 + total) % total; updateGallery(); }

    const btnNext = document.getElementById('stack-next');
    const btnPrev = document.getElementById('stack-prev');
    if (btnNext) btnNext.onclick = nextCard;
    if (btnPrev) btnPrev.onclick = prevCard;

    cards.forEach((c, i) => {
        c.addEventListener('click', () => {
            if (!c.classList.contains('is-center')) {
                currentIndex = i;
                updateGallery();
            }
        });
    });

    let tsX = 0;
    stack.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; }, { passive: true });
    stack.addEventListener('touchend', e => {
        const dx = tsX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 40) dx > 0 ? nextCard() : prevCard();
    });

    updateGallery();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoverFlow);
} else {
    initCoverFlow();
}



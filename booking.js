// ── AURO BOOKING ─────────────────────────────────────────────
'use strict';

// ── PRELOADER ─────────────────────────────────────────────────
if (!sessionStorage.getItem('auro_preloaded')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const p = document.getElementById('preloader');
            if (p) p.classList.add('hide');
            sessionStorage.setItem('auro_preloaded', 'true');
        }, 1200);
    });
} else {
    const p = document.getElementById('preloader');
    if (p) p.style.display = 'none';
}

// ── MAIN BACKGROUND ────────────────────────────────────────────
const bgEl = document.getElementById('bg-slideshow');
if (bgEl) bgEl.style.backgroundImage = "url('AUROwebsitebg.png')";

// ── PARTICLES ────────────────────────────────────────────────
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
    if (e.target.closest('.btn-primary,.pkg-card,.drink-card')) spawnParticles(e.clientX, e.clientY);
});

// ── TOAST ────────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.className = `toast ${type}`;
    document.getElementById('toast-icon').textContent = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('visible'), 3500);
}

// ── BOOKING STATE ─────────────────────────────────────────────
let booking = {
    pkg: '',
    cups: 0,
    limit: 0,
    price: 0,
    thermoses: [] // Array of { drink: string, filled: boolean }
};
let currentStep = 1;
let activeThermosIdx = 0;

const DRINK_COLORS = {
    'قهوة اليوم': '#4b2c20',
    'قهوة سعودية': '#c5a059',
    'كرك': '#d2b48c',
    'كركديه': '#9b1b30',
    'هوت تشوكليت': '#3d1f1f'
};




// ── CUSTOM DATE PICKER ─────────────────────────────────────────
class AuroDatePicker {
    constructor(inputId, containerId) {
        this.input = document.getElementById(inputId);
        this.container = document.getElementById(containerId);
        this.currentDate = new Date();
        this.currentDate.setDate(this.currentDate.getDate() + 1); // Default to tomorrow
        this.viewDate = new Date(this.currentDate);
        this.init();
    }

    init() {
        if (!this.input || !this.container) return;
        this.input.addEventListener('click', (e) => {
            e.stopPropagation();
            this.container.classList.toggle('visible');
            if (this.container.classList.contains('visible')) this.render();
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && e.target !== this.input) {
                this.container.classList.remove('visible');
            }
        });
    }

    render() {
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();
        const monthName = new Intl.DateTimeFormat('ar-SA', { month: 'long' }).format(this.viewDate);

        let html = `
            <div class="cal-header">
                <button class="cal-btn prev">‹</button>
                <div class="cal-month-year">${monthName} ${year}</div>
                <button class="cal-btn next">›</button>
            </div>
            <div class="cal-grid">
                <div class="cal-day-name">ح</div><div class="cal-day-name">ن</div><div class="cal-day-name">ث</div>
                <div class="cal-day-name">ر</div><div class="cal-day-name">خ</div><div class="cal-day-name">ج</div><div class="cal-day-name">س</div>
        `;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        for (let i = 0; i < firstDay; i++) html += '<div class="cal-day disabled"></div>';

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const isToday = new Date().toDateString() === date.toDateString();
            const isDisabled = date < tomorrow;
            const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const isActive = this.input.value === localDateStr;

            html += `<div class="cal-day ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}" 
                     data-date="${localDateStr}">${d}</div>`;
        }

        html += '</div>';
        this.container.innerHTML = html;

        this.container.querySelector('.prev').onclick = (e) => {
            e.stopPropagation();
            this.viewDate.setMonth(this.viewDate.getMonth() - 1);
            this.render();
        };
        this.container.querySelector('.next').onclick = (e) => {
            e.stopPropagation();
            this.viewDate.setMonth(this.viewDate.getMonth() + 1);
            this.render();
        };

        this.container.querySelectorAll('.cal-day:not(.disabled)').forEach(day => {
            day.onclick = () => {
                this.input.value = day.dataset.date;
                this.container.classList.remove('visible');
                saveFormData();
                this.input.classList.remove('err');

                const wrap = this.input.closest('.field');
                if (wrap) wrap.classList.remove('has-error');
            };
        });
    }
}


const THERMOS_SVG = (idx) => `
<svg width="200" height="400" viewBox="0 0 200 400" fill="none" class="thermos-svg" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="innerBodyClip-${idx}">
      <path d="M50 110 C 50 100, 150 100, 150 110 L 158 355 C 158 375, 42 375, 42 355 Z" />
    </clipPath>
  </defs>
  <rect id="liquid-layer-${idx}" x="0" y="375" width="200" height="0" fill="transparent" clip-path="url(#innerBodyClip-${idx})" />
  <path class="thermos-outline" d="M50 110 C 50 100, 150 100, 150 110 L 158 355 C 158 375, 42 375, 42 355 Z" stroke="#333" stroke-width="3" fill="transparent" />
  <g id="lid">
    <path d="M50 110 L 38 95 L 45 45 C 45 35, 155 35, 155 45 L 162 95 L 150 110 Z" fill="#222" stroke="#000" />
    <path d="M75 40 Q 100 25, 125 40 L 120 50 Q 100 38, 80 50 Z" fill="#333" />
    <path d="M90 100 L 110 100 L 112 112 L 88 112 Z" fill="#111" />
  </g>
  <path d="M42 355 Q 42 375, 100 375 Q 158 375, 158 355 L 158 365 Q 158 385, 100 385 Q 42 385, 42 365 Z" fill="#111" />
</svg>`;

const TOP_LIMIT = 100;
const BOTTOM_LIMIT = 375;
const TOTAL_HEIGHT = 275;

function calculateFill(percent) {
    const liquidHeight = (percent / 100) * TOTAL_HEIGHT;
    const liquidY = BOTTOM_LIMIT - liquidHeight;
    return { liquidY, liquidHeight };
}

// ── LOCALSTORAGE ──────────────────────────────────────────────
const LS_BOOKING = 'auro_booking';
const LS_FORM = 'auro_form';
function saveBooking() { localStorage.setItem(LS_BOOKING, JSON.stringify({ booking, currentStep, activeThermosIdx })); }
function saveFormData() {
    const data = {};
    ['inp-name', 'inp-phone', 'inp-city', 'inp-event', 'inp-date', 'inp-time', 'inp-notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) data[id] = el.value;
    });
    localStorage.setItem(LS_FORM, JSON.stringify(data));
}
function clearSaved() { localStorage.removeItem(LS_BOOKING); localStorage.removeItem(LS_FORM); }

// ── STEP MANAGEMENT ──────────────────────────────────────────
const steps = ['step-packages', 'step-drinks', 'step-form'];

function showStep(n) {
    currentStep = n;
    steps.forEach((id, i) => {
        const el = document.getElementById(id);
        if (i === n - 1) {
            el.classList.add('active-step');
            el.style.display = 'flex';
        } else {
            el.classList.remove('active-step');
            el.style.display = 'none';
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateStepper(n);
    saveBooking();
}

function updateStepper(step) {
    document.querySelectorAll('.stepper-step').forEach(s => {
        const sStep = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        if (sStep === step) s.classList.add('active');
        else if (sStep < step) s.classList.add('completed');
    });
    document.querySelectorAll('.stepper-line').forEach((line, i) => {
        line.classList.toggle('filled', i < step - 1);
    });
}

function goToStep(step) {
    if (step === 1) {
        showStep(1);
    } else if (step === 2) {
        if (!booking.pkg) { toast('اختر باقة أولاً', 'error'); return; }
        showStep(2);
    } else if (step === 3) {
        if (booking.thermoses.some(t => !t.drink)) {
            toast('يرجى اختيار مشروبات لجميع الترامس المتاحة', 'error');
            return;
        }
        updateSummary();
        showStep(3);
    }
}

// ── PACKAGES ─────────────────────────────────────────────────
function selectPkg(card, name, cups, limit, price) {
    document.querySelectorAll('.pkg-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    booking.pkg = name;
    booking.cups = cups;
    booking.limit = limit;
    booking.price = price;
    booking.thermoses = Array.from({ length: limit }, () => ({ drink: null }));
    activeThermosIdx = 0;

    renderThermoses();

    document.getElementById('drinks-info-text').textContent =
        `باقة ${name} (${price} ريال) – اختر ${limit} ${limit === 1 ? 'مشروب' : 'مشروبات'} بتعبئة الترامس أدناه:`;

    toast(`تم اختيار باقة ${name} ✨`, 'success');

    setTimeout(() => showStep(2), 600);
}

function renderThermoses() {
    const wrap = document.getElementById('thermos-container');
    wrap.innerHTML = '';
    booking.thermoses.forEach((t, i) => {
        const div = document.createElement('div');
        div.id = `thermos-item-${i}`;
        div.className = 'thermos-item' + (i === activeThermosIdx ? ' active' : '') + (t.drink ? ' filled' : '');
        div.innerHTML = `
      ${THERMOS_SVG(i)}
      <span class="thermos-label">${t.drink || `ترمس ${i + 1}`}</span>
    `;
        div.onclick = () => selectThermos(i);

        wrap.appendChild(div);

        if (t.drink) {
            setTimeout(() => animateThermos(i, t.drink), 50);
        }
    });
}


function selectThermos(idx) {
    activeThermosIdx = idx;
    document.querySelectorAll('.thermos-item').forEach((item, i) => {
        item.classList.toggle('active', i === idx);
    });
    saveBooking();
}

function animateThermos(idx, drinkName) {
    const rect = document.getElementById(`liquid-layer-${idx}`);
    if (!rect) return;
    const color = DRINK_COLORS[drinkName] || '#4b2c20';
    const { liquidY, liquidHeight } = calculateFill(90);
    rect.setAttribute('fill', color);
    rect.setAttribute('y', liquidY);
    rect.setAttribute('height', liquidHeight);

    // Add Steam
    const container = document.getElementById(`thermos-item-${idx}`);
    if (container && !container.querySelector('.steam-container')) {
        const steam = document.createElement('div');
        steam.className = 'steam-container';
        for (let i = 0; i < 3; i++) {
            const p = document.createElement('div');
            p.className = 'steam-particle';
            p.style.animationDelay = `${i * 1}s`;
            p.style.left = `${30 + (Math.random() * 40 - 20)}%`;
            steam.appendChild(p);
        }
        container.appendChild(steam);
    }
}


// ── DRINKS ───────────────────────────────────────────────────
function toggleDrink(card, name) {
    if (booking.limit === 0) return;

    // Set drink for active thermos
    booking.thermoses[activeThermosIdx].drink = name;

    // Update visuals
    renderThermoses();
    saveBooking();

    toast(`تمت تعبئة الترمس بـ ${name} ✨`, 'success');


    // Auto-switch to next empty thermos
    const nextEmptyIdx = booking.thermoses.findIndex(t => !t.drink);
    if (nextEmptyIdx !== -1) {
        setTimeout(() => selectThermos(nextEmptyIdx), 800);
    }
}

// ── FORM SUMMARY ─────────────────────────────────────────────
function updateSummary() {
    document.getElementById('sum-pkg').textContent = booking.pkg ? `${booking.pkg} (${booking.price} ريال)` : '—';
    document.getElementById('sum-cups').textContent = booking.cups ? booking.cups + ' كوب' : '—';
    const drinks = booking.thermoses.map(t => t.drink).filter(d => d);
    document.getElementById('sum-drinks').textContent = drinks.length ? drinks.join(' · ') : '—';
}

// ── FORM VALIDATION ──────────────────────────────────────────
function validateField(fieldId, inputId, check) {
    const inp = document.getElementById(inputId);
    const wrap = document.getElementById(fieldId);
    if (!inp || !wrap) return true;
    const ok = check(inp.value.trim());
    inp.classList.toggle('err', !ok);
    wrap.classList.toggle('has-error', !ok);
    return ok;
}

function validateAll() {
    const nameOk = validateField('f-name', 'inp-name', v => v.length >= 3);
    const phoneOk = validateField('f-phone', 'inp-phone', v => /^(05|5)[0-9]{8}$/.test(v));
    const cityOk = validateField('f-city', 'inp-city', v => v !== '');
    const eventOk = validateField('f-event', 'inp-event', v => v.length >= 3);
    const today = new Date(); today.setDate(today.getDate() + 1);
    const dateOk = validateField('f-date', 'inp-date', v => { if (!v) return false; return new Date(v) >= today; });
    const timeOk = validateField('f-time', 'inp-time', v => v !== '');
    return nameOk && phoneOk && cityOk && eventOk && dateOk && timeOk;
}

// live validation + save
document.querySelectorAll('.glass-input').forEach(inp => {
    inp.addEventListener('focus', () => {
        inp.classList.remove('err');
        const wrap = inp.closest('.field');
        if (wrap) wrap.classList.remove('has-error');
    });
    inp.addEventListener('input', () => saveFormData());
    if (inp.id === 'inp-phone') {
        inp.addEventListener('input', () => { inp.value = inp.value.replace(/[^0-9]/g, '').slice(0, 10); });
    }
});

// ── INITIALIZE ENHANCEMENTS ────────────────────────────────────
new AuroDatePicker('inp-date', 'auro-calendar');

restoreBooking();
// ── FORM SUBMIT ──────────────────────────────────────────────
document.getElementById('auroForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateAll()) {
        toast('الرجاء تعبئة جميع الحقول بشكل صحيح ⚠️', 'error');
        document.querySelector('.glass-input.err')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const honeypot = document.getElementById('inp-honeypot');
    if (honeypot && honeypot.value.trim() !== '') {
        toast('تم إرسال طلبك بنجاح! سيتواصل معك فريقنا 🎉', 'success');
        clearSaved();
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    const btn = document.getElementById('submitBtn');
    const text = document.getElementById('submitText');
    btn.disabled = true;
    text.innerHTML = 'جاري الإرسال... <span style="display:inline-block;width:18px;height:18px;border:2.5px solid rgba(0,0,0,.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:8px"></span>';

    const d = {
        name: document.getElementById('inp-name').value.trim(),
        phone: document.getElementById('inp-phone').value.trim(),
        city: document.getElementById('inp-city').value,
        event: document.getElementById('inp-event').value.trim(),
        date: document.getElementById('inp-date').value,
        time: document.getElementById('inp-time').value,
        notes: document.getElementById('inp-notes').value.trim()
    };

    const WEBHOOK = 'https://discord.com/api/webhooks/1466534582286291117/aVV9y5qUHQ3eCAi9hC52bfTNC4csvz-1mPJ7D_IVcJtYZIphv94GJOZBRs2ZvtuOt3BG';

    const drinks = booking.thermoses.map(t => t.drink).filter(d => d);

    try {
        await fetch(WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: '🛎️ طلب حجز AURO جديد',
                    color: 12951641,
                    fields: [
                        { name: '👤 العميل', value: d.name, inline: true },
                        { name: '📱 الجوال', value: d.phone, inline: true },
                        { name: '📦 الباقة', value: `${booking.pkg} – ${booking.cups} كوب (${booking.price} ريال)`, inline: true },
                        { name: '☕ المشروبات', value: drinks.join(' + ') || 'لم تُحدد' },
                        { name: '📍 المدينة', value: d.city, inline: true },
                        { name: '🎉 المناسبة', value: d.event, inline: true },
                        { name: '📅 الموعد', value: `${d.date} | ${d.time}` },
                        { name: '📝 ملاحظات', value: d.notes || 'لا توجد' }
                    ],
                    timestamp: new Date().toISOString()
                }]
            })
        });

        toast('تم إرسال طلبك بنجاح! سيتواصل معك فريقنا 🎉', 'success');

        // ── Save booking to Firebase & localStorage ──
        const bookingData = {
          id:       'bk_' + Date.now(),
          date:     new Date().toISOString(),
          createdAt: Date.now(),
          status:   'pending',
          name:     d.name,
          phone:    d.phone,
          city:     d.city,
          event:    d.event,
          eventDate: d.date,
          time:     d.time,
          notes:    d.notes || '',
          pkg:      booking.pkg,
          cups:     booking.cups,
          price:    booking.price,
          drinks:   drinks.join(' + ') || '—',
        };

        if (typeof FeedbackService !== 'undefined') {
          FeedbackService.init();
        }

        // Wait up to 3 seconds for Firebase to load
        let retries = 15;
        while (!window.AURO_DB && retries > 0) {
          await new Promise(r => setTimeout(r, 200));
          retries--;
        }

        if (window.AURO_DB) {
          try {
            await window.AURO_DB.collection('bookings').doc(bookingData.id).set(bookingData);
          } catch(e) {
            console.error("Firebase booking save error:", e);
          }
        }

        // Always save to localStorage as backup/local sync
        const bookings = JSON.parse(localStorage.getItem('auro_bookings') || '[]');
        bookings.push(bookingData);
        localStorage.setItem('auro_bookings', JSON.stringify(bookings));

        clearSaved();

        const wa = `أهلاً AURO ✨%0A%0Aطلب حجز جديد:%0A👤 ${d.name}%0A📱 ${d.phone}%0A📦 ${booking.pkg} (${booking.cups} كوب - ${booking.price} ريال)%0A☕ ${drinks.join(' + ')}%0A📍 ${d.city}%0A🎉 ${d.event}%0A📅 ${d.date} %7C ${d.time}${d.notes ? '%0A📝 ' + d.notes : ''}`;
        
        // Show success message inside the container
        const container = document.querySelector('.booking-form-wrap');
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 20px; background: rgba(0,0,0,0.2); border-radius: 16px; border: 1px solid var(--glass-border);">
                <div style="font-size: 4rem; margin-bottom: 20px; animation: pop 0.6s cubic-bezier(.4,0,.2,1);">✨</div>
                <h2 style="color: var(--gold); margin-bottom: 15px; font-family: 'Outfit', 'Tajawal', sans-serif;">شكراً لك ${d.name}!</h2>
                <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 30px;">
                    لقد استلمنا طلبك بنجاح. نحن سعداء جداً ومتحمسون لنكون جزءاً من مناسبتك السعيدة.<br><br>
                    سيتم تحويلك الآن إلى واتساب للتواصل المباشر مع فريقنا لتأكيد التفاصيل وإتمام الحجز.
                </p>
                <div style="font-size: 0.9rem; color: var(--gold-light);">جاري التحويل... ⏳</div>
            </div>
        `;

        setTimeout(() => {
            window.open(`https://wa.me/966579383960?text=${wa}`, '_blank');
            setTimeout(() => window.location.href = 'index.html', 500);
        }, 4000);

    } catch (err) {
        console.error(err);
        toast('حدث خطأ في الإرسال، يرجى المحاولة مجدداً', 'error');
        btn.disabled = false;
        text.textContent = 'تأكيد الطلب وإرسال ✨';
    }
});

// ── RESTORE STATE ─────────────────────────────────────────────
function restoreBooking() {
    try {
        const saved = JSON.parse(localStorage.getItem(LS_BOOKING));
        if (saved && saved.booking && saved.booking.pkg) {
            booking = saved.booking;
            currentStep = saved.currentStep || 1;
            activeThermosIdx = saved.activeThermosIdx || 0;

            // mark selected pkg
            document.querySelectorAll('.pkg-card').forEach(card => {
                const onclick = card.getAttribute('onclick');
                if (onclick && onclick.includes(`'${booking.pkg}'`)) card.classList.add('selected');
            });

            if (currentStep >= 2) {
                renderThermoses();
                document.getElementById('drinks-info-text').textContent =
                    `باقة ${booking.pkg} (${booking.price} ريال) – اختر ${booking.limit} ${booking.limit === 1 ? 'مشروب' : 'مشروبات'} بتعبئة الترامس أدناه:`;
            }
            if (currentStep >= 3) updateSummary();

            // restore form data
            const formData = JSON.parse(localStorage.getItem(LS_FORM));
            if (formData) Object.entries(formData).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el && val) el.value = val;
            });

            showStep(currentStep);
            toast('تم استعادة بياناتك السابقة ✨', 'success');
            return;
        }
    } catch (e) { /* ignore */ }

    const params = new URLSearchParams(window.location.search);
    const pkgParam = params.get('pkg');
    if (pkgParam) {
        const pkgMap = {
            gold: { name: 'الذهبية', cups: 20, limit: 1, price: 450 },
            platinum: { name: 'البلاتينية', cups: 40, limit: 2, price: 550 },
            royal: { name: 'الملكية', cups: 60, limit: 3, price: 650 }
        };
        const pkg = pkgMap[pkgParam];
        if (pkg) {
            booking = { pkg: pkg.name, cups: pkg.cups, limit: pkg.limit, price: pkg.price, thermoses: Array.from({ length: pkg.limit }, () => ({ drink: null })) };
            activeThermosIdx = 0;
            document.querySelectorAll('.pkg-card').forEach(card => {
                const onclick = card.getAttribute('onclick');
                if (onclick && onclick.includes(`'${pkg.name}'`)) card.classList.add('selected');
            });
            renderThermoses();
            document.getElementById('drinks-info-text').textContent =
                `باقة ${pkg.name} (${pkg.price} ريال) – اختر ${pkg.limit} ${pkg.limit === 1 ? 'مشروب' : 'مشروبات'} بتعبئة الترامس أدناه:`;
            showStep(2);
            toast(`تم اختيار باقة ${pkg.name} ✨`, 'success');
            return;
        }
    }

    showStep(1);
}

restoreBooking();

// ── SPIN KEYFRAME ─────────────────────────────────────────────
const styleEl = document.createElement('style');
styleEl.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(styleEl);

console.log('%c AURO ✨ Booking ', 'background:#C5A059;color:#000;font-size:14px;font-weight:bold;padding:8px 16px;border-radius:4px;');

// ── CINEMATIC TRANSITIONS & SOUNDS ────────────────────────────
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

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 1000;
    filterNode.Q.value = 1;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.15;

    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    for (const [name, url] of Object.entries(soundUrls)) {
        try {
            const resp = await fetch(url);
            const arrayBuf = await resp.arrayBuffer();
            audioBuffers[name] = await audioCtx.decodeAudioData(arrayBuf);
        } catch (e) { }
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

function startTransition(url) {
    transitionOverlay.classList.remove('exit');
    transitionOverlay.classList.add('active');
    playAtmosphericSound('pouring');
    setTimeout(() => { window.location.href = url; }, 1200);
}

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

// ── SCROLL BLUR & FADE EFFECT ────────────────────────────────
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

// ── SCROLL TO TOP ────────────────────────────────────────────
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) scrollTopBtn.classList.add('visible');
        else scrollTopBtn.classList.remove('visible');
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
} window.addEventListener('load', () => {
    transitionOverlay.classList.add('active');
    setTimeout(() => {
        transitionOverlay.classList.remove('active');
        transitionOverlay.classList.add('exit');
        setTimeout(() => { transitionOverlay.classList.remove('exit'); }, 800);
    }, 500);
});

window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
        transitionOverlay.classList.remove('active');
        transitionOverlay.classList.remove('exit');
    }
});

document.querySelectorAll('.btn-primary, .back-btn, .pkg-card, .drink-card, .stepper-step, .cal-day').forEach(el => {
    el.addEventListener('mouseenter', async () => {
        if (!audioCtx) await initAudio();
        playAtmosphericSound('ambient');
    });
});

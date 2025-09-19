// DOM Elements
const orderButtons = document.querySelectorAll('.order-btn');
const modal = document.getElementById('orderModal');
const closeModalBtn = document.querySelector('.close-modal');
const orderForm = document.getElementById('orderForm');
const countdownEl = {
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
};

// Event Listeners
orderButtons.forEach(button => {
    button.addEventListener('click', openModal);
});

if (orderForm) {
    orderForm.addEventListener('submit', handleFormSubmit);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Phone input: keep simple input (no live mask) and a fast clear button
const phoneInput = document.getElementById('phone');
const clearPhoneBtn = document.querySelector('.clear-input');

if (clearPhoneBtn && phoneInput) {
    clearPhoneBtn.addEventListener('click', () => {
        phoneInput.value = '';
        phoneInput.focus();
    });
}

// Set up countdown timer
setupCountdown();

// Functions
function openModal() {
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function handleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name) {
        alert('Будь ласка, введіть ваше ім\'я');
        return;
    }
    if (!phone) {
        alert('Будь ласка, введіть ваш номер телефону');
        return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!(phoneDigits.length === 12 && phoneDigits.startsWith('380')) && !(phoneDigits.length === 10 && phoneDigits.startsWith('0'))) {
        alert('Будь ласка, введіть коректний український номер телефону');
        return;
    }
    // No extra confirmations — one tap order

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerText;
    submitButton.innerText = 'ВІДПРАВЛЯЄМО...';
    submitButton.disabled = true;

    let formattedPhone = phone;
    if (!phone.includes('+')) {
        const digits = phone.replace(/\D/g, '');
        if (digits.startsWith('380') && digits.length === 12) {
            formattedPhone = `+${digits.substring(0, 2)} (0${digits.substring(2, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
        } else if (digits.startsWith('0') && digits.length === 10) {
            formattedPhone = `+38 (0${digits.substring(1, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
        }
    }

    const message = `💥 Нове замовлення! 💥\n\n👤 Ім'я: ${name}\n📞 Телефон: ${formattedPhone}\n\n🔪 Товар: Професійний розробний ніж TopHouse + точилка у ПОДАРУНОК\n💰 Ціна: 599 грн`;

    // Telegram send using CORS-safelisted POST and GET fallback
    const botToken = '8375195965:AAGLdfnVmLVnyih3b9xswnSfCSH6fVjM52s';
    const chatId = '-4955839873';
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const params = new URLSearchParams({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
    });

    fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
        mode: 'no-cors',
        keepalive: true
    })
    .then(() => {
        // Treat as success (opaque response in no-cors)
        showSuccessNotification('Дякуємо за замовлення! Наш менеджер зв\'яжеться з вами найближчим часом.');
        closeModal();
        if (orderForm) orderForm.reset();
    })
    .catch(err => {
        // Fallback: fire GET via image beacon (still sends request)
        try {
            const beacon = new Image();
            beacon.src = `${telegramUrl}?${params.toString()}`;
        } catch {}
        console.error('Fetch error (using GET fallback):', err);
        showSuccessNotification('Дякуємо за замовлення! Наш менеджер зв\'яжеться з вами найближчим часом.');
        closeModal();
        if (orderForm) orderForm.reset();
    })
    .finally(() => {
        submitButton.innerText = originalText;
        submitButton.disabled = false;
    });
}

// Notification functions
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'custom-notification success';
    notification.innerHTML = `
        <div class="notification-icon"><i class="fas fa-check-circle"></i></div>
        <div class="notification-message">${message}</div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 5000);
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'custom-notification error';
    notification.innerHTML = `
        <div class="notification-icon"><i class="fas fa-exclamation-circle"></i></div>
        <div class="notification-message">${message}</div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 5000);
}

function setupCountdown() {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);
    function updateCountdown() {
        const currentTime = new Date();
        const diff = endTime - currentTime;
        if (diff <= 0) {
            endTime.setHours(endTime.getHours() + 24);
            return updateCountdown();
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        countdownEl.hours.textContent = hours.toString().padStart(2, '0');
        countdownEl.minutes.textContent = minutes.toString().padStart(2, '0');
        countdownEl.seconds.textContent = seconds.toString().padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Smooth scrolling for anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Stock counter
const stockCountElements = document.querySelectorAll('#stockCount, .stockCount');
let initialStock = Math.floor(Math.random() * 8) + 8; // 8-15

function updateStockCount() {
    if (Math.random() < 0.3) {
        initialStock = Math.max(1, initialStock - 1);
        stockCountElements.forEach(el => {
            el.textContent = initialStock;
            el.classList.add('stock-update');
            setTimeout(() => el.classList.remove('stock-update'), 1000);
        });
        const stockBars = document.querySelectorAll('.stock-bar-fill');
        const percentage = (initialStock / 30) * 100;
        stockBars.forEach(bar => bar.style.width = percentage + '%');
    }
}

window.addEventListener('load', () => {
    stockCountElements.forEach(el => { el.textContent = initialStock; });
    const stockBars = document.querySelectorAll('.stock-bar-fill');
    const percentage = (initialStock / 30) * 100;
    stockBars.forEach(bar => bar.style.width = percentage + '%');
});

setInterval(() => { if (!document.hidden) updateStockCount(); }, Math.floor(Math.random() * 30000 + 30000));

// Activity notification system
const activityNotification = document.getElementById('activityNotification');
const notificationText = document.querySelector('.notification-text');
const notificationClose = document.querySelector('.notification-close');

const cities = [ 'Київ', 'Львів', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Вінниця', 'Луцьк', 'Полтава', 'Чернігів', 'Херсон' ];
const names = [ 'Олександр', 'Марія', 'Іван', 'Оксана', 'Андрій', 'Наталія', 'Сергій', 'Олена', 'Василь', 'Тетяна', 'Михайло' ];
const minNotificationTime = 20000;
const maxNotificationTime = 60000;

function showActivityNotification() {
    if (!activityNotification || !notificationText) return;
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    notificationText.textContent = `${randomName} з міста ${randomCity} щойно замовив(ла) професійний розробний ніж TopHouse`;
    activityNotification.classList.add('show');
    setTimeout(() => activityNotification.classList.remove('show'), 5000);
}

if (notificationClose) {
    notificationClose.addEventListener('click', () => {
        if (activityNotification) activityNotification.classList.remove('show');
    });
}

const notificationsDisabled = localStorage.getItem('disableNotifications') === 'true';
let notificationInterval;
if (!notificationsDisabled) {
    setTimeout(() => {
        if (!document.hidden) showActivityNotification();
        notificationInterval = setInterval(() => {
            if (!document.hidden) showActivityNotification();
        }, Math.floor(Math.random() * (maxNotificationTime - minNotificationTime) + minNotificationTime));
    }, 8000);
}

// Video play button handler
const playButton = document.querySelector('.play-button');
const videoPoster = document.getElementById('video-poster');
const videoContainer = document.querySelector('.video-container');
const productVideo = document.getElementById('product-video');

if (playButton && videoPoster && videoContainer && productVideo) {
    playButton.addEventListener('click', function() {
        videoPoster.style.display = 'none';
        playButton.style.display = 'none';
        productVideo.style.display = 'block';
        productVideo.play();
    });
    productVideo.addEventListener('ended', function() {
        videoPoster.style.display = 'block';
        playButton.style.display = 'flex';
        productVideo.style.display = 'none';
    });
}

// Optimize animations using IntersectionObserver
(() => {
    if (!('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll('.feature-item, .reason-item, .testimonial-item');
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                io.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    targets.forEach(t => io.observe(t));
})();
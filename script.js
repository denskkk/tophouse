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

closeModalBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Add phone number formatting with gentle mask and clear button
const phoneInput = document.getElementById('phone');
const clearPhoneBtn = document.querySelector('.clear-input');

if (clearPhoneBtn && phoneInput) {
    clearPhoneBtn.addEventListener('click', () => {
        phoneInput.value = '';
        phoneInput.focus();
    });
}

if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
        const cursorPos = e.target.selectionStart;
        let value = e.target.value.replace(/\D/g, '');

        // Allow user to delete freely
        if (value.length === 0) {
            e.target.value = '';
            return;
        }

        // Keep only up to 10 digits of the local part starting with 0
        if (value.startsWith('38')) value = value.slice(2);
        if (!value.startsWith('0')) value = '0' + value;
        value = value.slice(0, 10);

        // Format +38 (0xx) xxx-xx-xx
        let out = '+38 ';
        if (value.length <= 3) {
            out += '(' + value + ')';
        } else if (value.length <= 6) {
            out += '(' + value.slice(0,3) + ') ' + value.slice(3);
        } else if (value.length <= 8) {
            out += '(' + value.slice(0,3) + ') ' + value.slice(3,6) + '-' + value.slice(6);
        } else {
            out += '(' + value.slice(0,3) + ') ' + value.slice(3,6) + '-' + value.slice(6,8) + '-' + value.slice(8);
        }

        e.target.value = out;

        // Try to keep cursor stable (best-effort)
        try { e.target.setSelectionRange(out.length, out.length); } catch {}
    });
}

orderForm.addEventListener('submit', handleFormSubmit);

// Set up countdown timer
setupCountdown();

// Functions
function openModal() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

function closeModal() {
    // Check if user has entered any data
    const nameField = document.getElementById('name');
    const phoneField = document.getElementById('phone');
    
    if ((nameField && nameField.value.trim()) || (phoneField && phoneField.value.trim())) {
        if (!confirm('Ви впевнені, що хочете закрити форму? Введені дані будуть втрачені.')) {
            return; // User canceled, keep the modal open
        }
    }
    
    // Close the modal
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const privacy = document.getElementById('privacy');
    
    if (!name) {
        alert('Будь ласка, введіть ваше ім\'я');
        return;
    }
    
    if (!phone) {
        alert('Будь ласка, введіть ваш номер телефону');
        return;
    }
    
    // Extract numbers from formatted phone number
    const phoneDigits = phone.replace(/\D/g, '');
    
    // Check if we have the correct number of digits for Ukrainian phone
    if (!(phoneDigits.length === 12 && phoneDigits.startsWith('380')) && 
        !(phoneDigits.length === 10 && phoneDigits.startsWith('0'))) {
        alert('Будь ласка, введіть коректний український номер телефону');
        return;
    }
    
    if (!privacy.checked) {
        alert('Будь ласка, погодьтесь з політикою конфіденційності');
        return;
    }
    
    // Show loading indicator
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerText;
    submitButton.innerText = 'ВІДПРАВЛЯЄМО...';
    submitButton.disabled = true;
    
    // Format the phone number for display in the message
    let formattedPhone = phone;
    
    // If the phone number isn't already formatted, format it
    if (!phone.includes('+')) {
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.startsWith('380') && phoneDigits.length === 12) {
            formattedPhone = `+${phoneDigits.substring(0, 2)} (0${phoneDigits.substring(2, 4)}) ${phoneDigits.substring(4, 7)}-${phoneDigits.substring(7, 9)}-${phoneDigits.substring(9, 11)}`;
        } else if (phoneDigits.startsWith('0') && phoneDigits.length === 10) {
            formattedPhone = `+38 (0${phoneDigits.substring(1, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6, 8)}-${phoneDigits.substring(8, 10)}`;
        }
    }
    
    // Prepare message for Telegram
    const message = `💥 Нове замовлення! 💥\n\n👤 Ім'я: ${name}\n📞 Телефон: ${formattedPhone}\n\n🔪 Товар: Професійний розробний ніж TopHouse + точилка у ПОДАРУНОК\n💰 Ціна: 599 грн`;
    
    // Send to Telegram bot
    const botToken = '8375195965:AAGLdfnVmLVnyih3b9xswnSfCSH6fVjM52s';
    const chatId = '-4955839873';
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    fetch(telegramUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        // Success - show confirmation to user
        console.log('Response data:', data);
        showSuccessNotification('Дякуємо за замовлення! Наш менеджер зв\'яжеться з вами найближчим часом.');
        closeModal();
        orderForm.reset();
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorNotification('Сталася помилка при відправці замовлення. Будь ласка, спробуйте ще раз або зв\'яжіться з нами через email.');
        // Log more details about the error
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
    })
    .finally(() => {
        // Restore button state
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
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
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
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

function setupCountdown() {
    // Set the countdown for 24 hours from now
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);
    
    function updateCountdown() {
        const currentTime = new Date();
        const diff = endTime - currentTime;
        
        if (diff <= 0) {
            // Reset countdown if it reaches zero
            endTime.setHours(endTime.getHours() + 24);
            updateCountdown();
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownEl.hours.textContent = hours.toString().padStart(2, '0');
        countdownEl.minutes.textContent = minutes.toString().padStart(2, '0');
        countdownEl.seconds.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Initial call
    updateCountdown();
    
    // Update the countdown every second
    setInterval(updateCountdown, 1000);
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Removed scroll-based animation handler in favor of IntersectionObserver

// Remove all JavaScript functionality for the sticky CTA button
// This ensures it remains completely static without any animations or movements

// Stock counter logic - create a sense of urgency with decreasing stock
const stockCountElements = document.querySelectorAll('#stockCount, .stockCount');
let initialStock = Math.floor(Math.random() * 8) + 8; // Random number between 8-15

function updateStockCount() {
    if (Math.random() < 0.3) { // 30% chance to decrease stock
        initialStock = Math.max(1, initialStock - 1); // Ensure stock doesn't go below 1
        
        stockCountElements.forEach(el => {
            el.textContent = initialStock;
            
            // Add animation
            el.classList.add('stock-update');
            setTimeout(() => {
                el.classList.remove('stock-update');
            }, 1000);
            
            // Update progress bar width
            const stockBars = document.querySelectorAll('.stock-bar-fill');
            const percentage = (initialStock / 30) * 100; // Assuming max stock was 30
            stockBars.forEach(bar => {
                bar.style.width = percentage + '%';
            });
        });
    }
}

// Initialize stock display
window.addEventListener('load', () => {
    stockCountElements.forEach(el => {
        el.textContent = initialStock;
    });
    
    // Update the stock-bar-fill width
    const stockBars = document.querySelectorAll('.stock-bar-fill');
    const percentage = (initialStock / 30) * 100;
    stockBars.forEach(bar => {
        bar.style.width = percentage + '%';
    });
});

// Periodically update stock (lower frequency, 30-60 seconds) and only when tab is visible
setInterval(() => {
    if (document.hidden) return;
    updateStockCount();
}, Math.floor(Math.random() * 30000 + 30000));

// Activity notification system
const activityNotification = document.getElementById('activityNotification');
const notificationText = document.querySelector('.notification-text');
const notificationClose = document.querySelector('.notification-close');

const cities = [
    'Київ', 'Львів', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 
    'Вінниця', 'Луцьк', 'Полтава', 'Чернігів', 'Херсон'
];

const names = [
    'Олександр', 'Марія', 'Іван', 'Оксана', 'Андрій', 'Наталія', 
    'Сергій', 'Олена', 'Василь', 'Тетяна', 'Михайло'
];

// Random time between 20s and 60s
const minNotificationTime = 20000;
const maxNotificationTime = 60000;

function showActivityNotification() {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    notificationText.textContent = `${randomName} з міста ${randomCity} щойно замовив(ла) професійний розробний ніж TopHouse`;
    
    activityNotification.classList.add('show');
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        activityNotification.classList.remove('show');
    }, 5000);
}

// Close notification when clicking the X
notificationClose.addEventListener('click', (e) => {
    activityNotification.classList.remove('show');
    
    // If holding the click for more than 1 second, disable all future notifications
    if (e.detail === 2) {
        clearInterval(notificationInterval);
        localStorage.setItem('disableNotifications', 'true');
    }
});

// Check if notifications are disabled
const notificationsDisabled = localStorage.getItem('disableNotifications') === 'true';

let notificationInterval;

// Show notifications only if not disabled
if (!notificationsDisabled) {
    // Show first notification after a short delay
    setTimeout(() => {
        if (!document.hidden) showActivityNotification();
        
        // Then show periodically (respect tab visibility)
        notificationInterval = setInterval(() => {
            if (!document.hidden) showActivityNotification();
        }, Math.floor(Math.random() * (maxNotificationTime - minNotificationTime) + minNotificationTime));
    }, 8000);
}

// Quick contact options removed to prevent overflow issues

// Video play button handler
const playButton = document.querySelector('.play-button');
const videoPoster = document.getElementById('video-poster');
const videoContainer = document.querySelector('.video-container');
const productVideo = document.getElementById('product-video');

if (playButton && videoPoster && videoContainer && productVideo) {
    playButton.addEventListener('click', function() {
        // Hide poster image and play button
        videoPoster.style.display = 'none';
        playButton.style.display = 'none';
        
        // Show and play video
        productVideo.style.display = 'block';
        productVideo.play();
    });
    
    // Add event listener for when the video ends
    productVideo.addEventListener('ended', function() {
        // Show poster and play button again
        videoPoster.style.display = 'block';
        playButton.style.display = 'flex';
        
        // Hide video
        productVideo.style.display = 'none';
    });
}

// Optimize scroll-based animations using IntersectionObserver
(() => {
    if (!('IntersectionObserver' in window)) return; // fallback silent
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
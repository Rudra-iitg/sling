// ===== Enhanced Error Handling & Loading States =====

// Loading Overlay Functions
function showLoadingOverlay(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="loading-spinner loading-spinner-primary"></div>
        <div class="loading-overlay-text">${message}</div>
    `;
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Enhanced Toast Notifications
function showToastEnhanced(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const toastIcon = toast.querySelector('.toast-icon');

    // Set icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toastIcon.className = 'toast-icon fas ' + (icons[type] || icons.success);
    toast.className = 'toast toast-' + type;
    toast.querySelector('.toast-message').textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.style.display = 'none';
            toast.classList.remove('hiding');
        }, 400);
    }, 3000);
}

// Enhanced API Error Handler
function handleApiError(error, defaultMessage = 'Something went wrong') {
    console.error('API Error:', error);

    let errorMessage = defaultMessage;

    if (error.message === 'Failed to fetch') {
        errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => logout(), 2000);
    } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
    } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
    } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
    }

    showToastEnhanced(errorMessage, 'error');
    return errorMessage;
}

// Button Loading State
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.classList.add('loading');
        button.dataset.originalText = button.innerHTML;
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    }
}

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\+\-\(\)]+$/;
    return phone.length >= 10 && re.test(phone);
}

function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.add('error');
    input.classList.remove('success');

    // Remove existing error message
    const existingError = input.parentElement.querySelector('.form-error');
    if (existingError) existingError.remove();

    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
    input.parentElement.appendChild(errorDiv);
}

function showFieldSuccess(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.remove('error');
    input.classList.add('success');

    // Remove error message
    const existingError = input.parentElement.querySelector('.form-error');
    if (existingError) existingError.remove();
}

function clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.remove('error', 'success');
    const existingError = input.parentElement.querySelector('.form-error');
    if (existingError) existingError.remove();
}

// Create Skeleton Loader for Trip Cards
function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.innerHTML = `
        <div class="skeleton skeleton-text" style="width: 40%; margin-bottom: 1rem;"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text" style="width: 80%;"></div>
        <div class="skeleton skeleton-text" style="width: 60%;"></div>
        <div style="margin-top: 1rem;">
            <div class="skeleton skeleton-text" style="width: 50%;"></div>
        </div>
    `;
    return card;
}

// Show Skeleton Loaders
function showSkeletonLoaders(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        container.appendChild(createSkeletonCard());
    }
}

// Empty State
function showEmptyState(containerId, message, icon = 'fa-inbox') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="fas ${icon}"></i>
            </div>
            <h3>No Results Found</h3>
            <p>${message}</p>
        </div>
    `;
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Scroll Progress Indicator
function updateScrollProgress() {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.id = 'scrollIndicator';
    document.body.appendChild(scrollIndicator);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollIndicator.style.width = scrolled + '%';
    });
}

// Initialize Enhanced Features
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll progress
    updateScrollProgress();

    // Add ripple effect to buttons
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        if (!button.classList.contains('ripple')) {
            button.classList.add('ripple');
        }
    });

    // Add stagger animation to trip cards
    const tripCards = document.querySelectorAll('.trip-card');
    tripCards.forEach((card, index) => {
        if (index < 6) {
            card.classList.add('stagger-item');
        }
    });

    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        images.forEach(img => img.classList.add('loaded'));
    }
});

// Local Storage Helper
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    },
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }
};

// Network Status Indicator
window.addEventListener('online', () => {
    showToastEnhanced('You are back online!', 'success');
});

window.addEventListener('offline', () => {
    showToastEnhanced('No internet connection', 'warning');
});

// Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToastEnhanced('Copied to clipboard!', 'success');
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        showToastEnhanced('Failed to copy', 'error');
        return false;
    }
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format Time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return hour12 + ':' + minutes + ' ' + ampm;
}

// Format Currency
function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
}

// Calculate Distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
}

console.log('✅ Enhanced features loaded successfully!');

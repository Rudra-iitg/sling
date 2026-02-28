// ===== API Configuration =====
const API_URL = '/api';

// ===== State Management =====
let currentUser = null;
let currentToken = localStorage.getItem('token');
let searchMap = null;
let createTripMap = null;
let originMarker = null;
let destinationMarker = null;
let searchCircle = null;
let userLocation = null;
let viewMode = 'grid';

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check if user is logged in
    if (currentToken) {
        fetchCurrentUser();
    }

    // Initialize date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tripDepartureDate').min = today;
    document.getElementById('searchDate').min = today;

    // Load featured trips
    loadFeaturedTrips();

    // Initialize maps when pages are shown
    initializeMapsOnDemand();

    // Setup autocomplete for location inputs
    setupLocationAutocomplete();
}

// ===== Authentication Functions =====
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateUIForLoggedInUser();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

function updateUIForLoggedInUser() {
    document.getElementById('navAuth').style.display = 'none';
    document.getElementById('navUser').style.display = 'flex';
    document.getElementById('createTripNav').style.display = 'inline-flex';
    document.getElementById('userName').textContent = currentUser.fullName.split(' ')[0];

    if (currentUser.avatar) {
        document.getElementById('userAvatar').innerHTML = `<img src="${currentUser.avatar}" alt="Avatar">`;
    }

    loadNotifications();
}

async function register(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: name,
                email,
                phone,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            currentToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', currentToken);
            closeModal('registerModal');
            updateUIForLoggedInUser();
            showToast('Account created successfully!', 'success');
            showPage('home');
        } else {
            showToast(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Registration failed. Please try again.', 'error');
    }
}

async function login(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', currentToken);
            closeModal('loginModal');
            updateUIForLoggedInUser();
            showToast('Welcome back!', 'success');
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('token');

    document.getElementById('navAuth').style.display = 'flex';
    document.getElementById('navUser').style.display = 'none';
    document.getElementById('createTripNav').style.display = 'none';

    showPage('home');
    showToast('You have been logged out', 'success');
}

// ===== Page Navigation =====
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const pageId = pageName + 'Page';
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Hide hero on non-home pages
    document.getElementById('heroSection').style.display = pageName === 'home' ? 'flex' : 'none';

    // Page-specific actions
    switch (pageName) {
        case 'home':
            loadFeaturedTrips();
            break;
        case 'search':
            setTimeout(() => initializeSearchMap(), 100);
            break;
        case 'create-trip':
            if (!currentUser) {
                showModal('loginModal');
                return;
            }
            setTimeout(() => initializeCreateTripMap(), 100);
            break;
        case 'profile':
            if (!currentUser) {
                showModal('loginModal');
                return;
            }
            loadProfile();
            break;
        case 'my-trips':
            if (!currentUser) {
                showModal('loginModal');
                return;
            }
            loadMyTrips();
            break;
        case 'settings':
            if (!currentUser) {
                showModal('loginModal');
                return;
            }
            break;
    }

    window.scrollTo(0, 0);
}

// ===== Modal Functions =====
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');

    toast.className = 'toast active ' + type;
    icon.className = 'toast-icon fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle');
    messageEl.textContent = message;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ===== Dropdown Toggle =====
function toggleDropdown() {
    document.getElementById('dropdownMenu').classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-dropdown')) {
        document.getElementById('dropdownMenu').classList.remove('active');
    }
});

// ===== Mobile Menu =====
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// ===== Map Functions =====
function initializeMapsOnDemand() {
    // Maps will be initialized when needed
}

function initializeSearchMap() {
    if (searchMap) return;

    searchMap = L.map('searchMap').setView([20.5937, 78.9629], 5); // India center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(searchMap);

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                searchMap.setView([userLocation.lat, userLocation.lng], 12);

                // Add marker for user location
                L.marker([userLocation.lat, userLocation.lng])
                    .addTo(searchMap)
                    .bindPopup('Your Location')
                    .openPopup();
            },
            (error) => {
                console.log('Geolocation error:', error);
            }
        );
    }
}

function initializeCreateTripMap() {
    if (createTripMap) return;

    createTripMap = L.map('createTripMap').setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(createTripMap);

    // Click to set origin/destination
    let clickMode = 'origin';

    createTripMap.on('click', (e) => {
        const { lat, lng } = e.latlng;

        if (clickMode === 'origin') {
            if (originMarker) {
                createTripMap.removeLayer(originMarker);
            }
            originMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-marker origin-marker',
                    html: '<div style="background: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(createTripMap).bindPopup('Origin');

            reverseGeocode(lat, lng, 'tripOrigin');
            clickMode = 'destination';
            showToast('Now click to set destination', 'success');
        } else {
            if (destinationMarker) {
                createTripMap.removeLayer(destinationMarker);
            }
            destinationMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-marker destination-marker',
                    html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(createTripMap).bindPopup('Destination');

            reverseGeocode(lat, lng, 'tripDestination');
            clickMode = 'origin';

            // Draw line between origin and destination
            if (originMarker && destinationMarker) {
                L.polyline([
                    [originMarker.getLatLng().lat, originMarker.getLatLng().lng],
                    [lat, lng]
                ], {
                    color: '#2563eb',
                    weight: 3,
                    dashArray: '10, 10'
                }).addTo(createTripMap);
            }
        }
    });

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                createTripMap.setView([position.coords.latitude, position.coords.longitude], 12);
            }
        );
    }

    showToast('Click on map to set origin, then destination', 'success');
}

async function reverseGeocode(lat, lng, inputId) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();
        if (data.display_name) {
            document.getElementById(inputId).value = data.display_name;
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                reverseGeocode(userLocation.lat, userLocation.lng, 'searchOrigin');

                if (searchMap) {
                    searchMap.setView([userLocation.lat, userLocation.lng], 12);
                }

                showToast('Location found!', 'success');
            },
            (error) => {
                showToast('Unable to get your location', 'error');
            }
        );
    } else {
        showToast('Geolocation not supported', 'error');
    }
}

// ===== Location Autocomplete =====
function setupLocationAutocomplete() {
    const locationInputs = ['heroOrigin', 'heroDestination', 'searchOrigin', 'tripOrigin', 'tripDestination'];

    locationInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', debounce((e) => {
                const value = e.target.value;
                if (value.length >= 3) {
                    searchLocation(value, inputId);
                }
            }, 300));
        }
    });
}

let autocompleteResults = {};

async function searchLocation(query, inputId) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        );
        const results = await response.json();

        autocompleteResults[inputId] = results;
        showAutocompleteDropdown(inputId, results);
    } catch (error) {
        console.error('Location search error:', error);
    }
}

function showAutocompleteDropdown(inputId, results) {
    // Remove existing dropdown
    const existing = document.querySelector('.autocomplete-dropdown');
    if (existing) existing.remove();

    if (!results.length) return;

    const input = document.getElementById(inputId);
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        width: ${input.offsetWidth}px;
    `;

    results.forEach((result, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 0.75rem 1rem;
            cursor: pointer;
            border-bottom: 1px solid #f3f4f6;
        `;
        item.textContent = result.display_name;
        item.addEventListener('click', () => {
            input.value = result.display_name;
            dropdown.remove();

            // Store coordinates
            input.dataset.lat = result.lat;
            input.dataset.lng = result.lon;

            // Update map if applicable
            if (inputId === 'tripOrigin' || inputId === 'tripDestination') {
                updateCreateTripMap(inputId, parseFloat(result.lat), parseFloat(result.lon));
            }
        });
        dropdown.appendChild(item);
    });

    const inputRect = input.getBoundingClientRect();
    dropdown.style.top = `${inputRect.bottom + window.scrollY}px`;
    dropdown.style.left = `${inputRect.left}px`;

    document.body.appendChild(dropdown);

    // Remove on click outside
    setTimeout(() => {
        document.addEventListener('click', function removeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== input) {
                dropdown.remove();
                document.removeEventListener('click', removeDropdown);
            }
        });
    }, 100);
}

function updateCreateTripMap(inputId, lat, lng) {
    if (!createTripMap) return;

    if (inputId === 'tripOrigin') {
        if (originMarker) createTripMap.removeLayer(originMarker);
        originMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(createTripMap).bindPopup('Origin');
    } else if (inputId === 'tripDestination') {
        if (destinationMarker) createTripMap.removeLayer(destinationMarker);
        destinationMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(createTripMap).bindPopup('Destination');
    }

    // Fit map to show both markers
    if (originMarker && destinationMarker) {
        const bounds = L.latLngBounds([originMarker.getLatLng(), destinationMarker.getLatLng()]);
        createTripMap.fitBounds(bounds, { padding: [50, 50] });
    }
}

// ===== Trip Functions =====
async function loadFeaturedTrips() {
    try {
        const response = await fetch(`${API_URL}/trips`);
        const data = await response.json();

        const container = document.getElementById('featuredTripsGrid');
        container.innerHTML = '';

        if (data.trips && data.trips.length > 0) {
            data.trips.slice(0, 6).forEach(trip => {
                container.appendChild(createTripCard(trip));
            });
        } else {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-route"></i>
                    <h3>No trips available</h3>
                    <p>Be the first to create a trip!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading trips:', error);
    }
}

function createTripCard(trip) {
    const template = document.getElementById('tripCardTemplate');
    const card = template.content.cloneNode(true).querySelector('.trip-card');

    card.dataset.tripId = trip.id;

    // Transport icon
    const transportIcons = {
        car: 'fa-car',
        bike: 'fa-motorcycle',
        train: 'fa-train',
        bus: 'fa-bus',
        other: 'fa-car'
    };
    card.querySelector('.trip-transport i').className = 'fas ' + (transportIcons[trip.transportMode] || 'fa-car');

    // Price
    card.querySelector('.trip-price').textContent = trip.pricePerPerson > 0 ? `₹${trip.pricePerPerson}/person` : 'Free';

    // Title
    card.querySelector('.trip-title').textContent = trip.title;

    // Route
    const routePoints = card.querySelectorAll('.route-address');
    routePoints[0].textContent = truncateAddress(trip.origin.address);
    routePoints[1].textContent = truncateAddress(trip.destination.address);

    // Date and time
    card.querySelector('.trip-date').textContent = formatDate(trip.departure.date);
    card.querySelector('.trip-time').textContent = formatTime(trip.departure.time);

    // Companions
    card.querySelector('.trip-companions').textContent = `${trip.currentCompanions}/${trip.maxCompanions} spots`;

    // Creator
    if (trip.creator) {
        card.querySelector('.creator-name').textContent = trip.creator.name;
        card.querySelector('.rating-value').textContent = trip.creator.rating?.toFixed(1) || '5.0';
    }

    return card;
}

function truncateAddress(address) {
    if (!address) return 'Unknown';
    const parts = address.split(',');
    return parts.length > 2 ? parts.slice(0, 2).join(',') + '...' : address;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

async function searchFromHero() {
    const origin = document.getElementById('heroOrigin').value;
    const destination = document.getElementById('heroDestination').value;

    // Store search params
    if (origin) document.getElementById('searchOrigin').value = origin;

    showPage('search');

    if (origin) {
        await searchTrips();
    }
}

async function searchTrips() {
    const originInput = document.getElementById('searchOrigin');
    const radius = document.getElementById('searchRadius').value;
    const transport = document.getElementById('searchTransport').value;
    const date = document.getElementById('searchDate').value;

    let lat = originInput.dataset.lat || userLocation?.lat;
    let lng = originInput.dataset.lng || userLocation?.lng;

    // If no coordinates, try to geocode the address
    if (!lat && !lng && originInput.value) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(originInput.value)}&limit=1`
            );
            const results = await response.json();
            if (results.length > 0) {
                lat = results[0].lat;
                lng = results[0].lon;
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    }

    let url = `${API_URL}/trips?`;
    if (lat && lng) {
        url += `lat=${lat}&lng=${lng}&radius=${radius}`;
    }
    if (transport) {
        url += `&transport=${transport}`;
    }
    if (date) {
        url += `&date=${date}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        const container = document.getElementById('searchResultsGrid');
        container.innerHTML = '';

        if (data.trips && data.trips.length > 0) {
            document.getElementById('resultsTitle').textContent = `${data.trips.length} trips found`;

            data.trips.forEach(trip => {
                container.appendChild(createTripCard(trip));
            });

            // Update map with trip markers
            updateSearchMap(data.trips, lat, lng, radius);
        } else {
            document.getElementById('resultsTitle').textContent = 'No trips found';
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-search"></i>
                    <h3>No trips found</h3>
                    <p>Try adjusting your search criteria or create a new trip</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed. Please try again.', 'error');
    }
}

function updateSearchMap(trips, userLat, userLng, radius) {
    if (!searchMap) return;

    // Clear existing markers
    searchMap.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
            searchMap.removeLayer(layer);
        }
    });

    // Add user location marker and radius circle
    if (userLat && userLng) {
        L.marker([userLat, userLng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }).addTo(searchMap).bindPopup('Your Location');

        L.circle([userLat, userLng], {
            radius: radius * 1000,
            color: '#2563eb',
            fillColor: '#2563eb',
            fillOpacity: 0.1,
            weight: 2
        }).addTo(searchMap);
    }

    // Add trip markers
    const bounds = [];
    trips.forEach(trip => {
        const marker = L.marker([trip.origin.lat, trip.origin.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        }).addTo(searchMap);

        marker.bindPopup(`
            <strong>${trip.title}</strong><br>
            From: ${trip.origin.address}<br>
            To: ${trip.destination.address}<br>
            <button onclick="viewTrip(${trip.id})" style="margin-top: 5px; padding: 5px 10px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">View Details</button>
        `);

        bounds.push([trip.origin.lat, trip.origin.lng]);
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
        if (userLat && userLng) {
            bounds.push([userLat, userLng]);
        }
        searchMap.fitBounds(bounds, { padding: [50, 50] });
    }
}

function setViewMode(mode) {
    viewMode = mode;

    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(mode + 'ViewBtn').classList.add('active');

    const container = document.getElementById('searchResultsGrid');
    if (mode === 'list') {
        container.style.gridTemplateColumns = '1fr';
    } else {
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    }
}

async function viewTrip(tripId) {
    try {
        const response = await fetch(`${API_URL}/trips/${tripId}`);
        const data = await response.json();

        if (response.ok) {
            displayTripDetail(data.trip, data.participants);
            showPage('trip-detail');
        } else {
            showToast('Trip not found', 'error');
        }
    } catch (error) {
        console.error('Error loading trip:', error);
        showToast('Failed to load trip details', 'error');
    }
}

function displayTripDetail(trip, participants) {
    const container = document.getElementById('tripDetailContent');

    const transportLabels = {
        car: 'Car',
        bike: 'Bike',
        train: 'Train',
        bus: 'Bus',
        other: 'Other'
    };

    container.innerHTML = `
        <div class="trip-detail-header">
            <h1>${trip.title}</h1>
            <p>${trip.description || 'No description provided'}</p>
            <div class="trip-meta">
                <div class="trip-meta-item">
                    <i class="fas fa-${trip.transportMode === 'car' ? 'car' : trip.transportMode === 'bike' ? 'motorcycle' : trip.transportMode}"></i>
                    <span>${transportLabels[trip.transportMode] || 'Vehicle'}</span>
                </div>
                <div class="trip-meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(trip.departure.date)}</span>
                </div>
                <div class="trip-meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${formatTime(trip.departure.time)}</span>
                </div>
                <div class="trip-meta-item">
                    <i class="fas fa-users"></i>
                    <span>${trip.currentCompanions}/${trip.maxCompanions} companions</span>
                </div>
                ${trip.pricePerPerson > 0 ? `
                <div class="trip-meta-item">
                    <i class="fas fa-rupee-sign"></i>
                    <span>₹${trip.pricePerPerson}/person</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="trip-detail-content">
            <div class="trip-main">
                <div class="map-container" id="tripDetailMap" style="height: 300px; margin-bottom: 1.5rem;"></div>

                <div class="trip-sidebar-card">
                    <h3>Route Details</h3>
                    <div class="trip-route-detail">
                        <div class="trip-route-point origin">
                            <div class="point-marker"><i class="fas fa-play"></i></div>
                            <div class="point-info">
                                <div class="point-label">Origin</div>
                                <div class="point-address">${trip.origin.address}</div>
                            </div>
                        </div>
                        <div class="trip-route-line"></div>
                        <div class="trip-route-point destination">
                            <div class="point-marker"><i class="fas fa-flag"></i></div>
                            <div class="point-info">
                                <div class="point-label">Destination</div>
                                <div class="point-address">${trip.destination.address}</div>
                            </div>
                        </div>
                    </div>
                </div>

                ${trip.additionalInfo ? `
                <div class="trip-sidebar-card">
                    <h3>Additional Information</h3>
                    <p>${trip.additionalInfo}</p>
                </div>
                ` : ''}

                ${trip.return.date ? `
                <div class="trip-sidebar-card">
                    <h3>Return Journey</h3>
                    <p><i class="fas fa-calendar"></i> ${formatDate(trip.return.date)}</p>
                    ${trip.return.time ? `<p><i class="fas fa-clock"></i> ${formatTime(trip.return.time)}</p>` : ''}
                </div>
                ` : ''}

                ${participants && participants.length > 0 ? `
                <div class="trip-sidebar-card">
                    <h3>Companions (${participants.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${participants.map(p => `
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <div class="creator-avatar"><i class="fas fa-user"></i></div>
                                <div>
                                    <div style="font-weight: 500;">${p.fullName}</div>
                                    <div style="font-size: 0.75rem; color: #6b7280;">
                                        <i class="fas fa-star" style="color: #f59e0b;"></i> ${p.rating?.toFixed(1) || '5.0'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="trip-sidebar">
                <div class="trip-sidebar-card">
                    <h3>Trip Creator</h3>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div class="profile-avatar" style="width: 50px; height: 50px; font-size: 1.25rem;">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600;">${trip.creator?.name || 'Anonymous'}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">
                                <i class="fas fa-star" style="color: #f59e0b;"></i> ${trip.creator?.rating?.toFixed(1) || '5.0'} rating
                            </div>
                        </div>
                    </div>
                    ${trip.status === 'active' ? `
                        ${currentUser && currentUser.id === trip.userId ? `
                            <button class="btn btn-secondary btn-block" onclick="editTrip(${trip.id})">
                                <i class="fas fa-edit"></i> Edit Trip
                            </button>
                        ` : `
                            <button class="btn btn-primary join-btn" onclick="joinTrip(${trip.id})" ${trip.currentCompanions >= trip.maxCompanions ? 'disabled' : ''}>
                                <i class="fas fa-user-plus"></i> ${trip.currentCompanions >= trip.maxCompanions ? 'Trip Full' : 'Join Trip'}
                            </button>
                        `}
                    ` : `
                        <div style="text-align: center; color: #6b7280;">
                            <i class="fas fa-info-circle"></i> This trip is ${trip.status}
                        </div>
                    `}
                </div>

                <div class="trip-sidebar-card">
                    <h3>Search Radius</h3>
                    <p><i class="fas fa-circle-notch"></i> ${trip.searchRadius} km from origin</p>
                </div>
            </div>
        </div>
    `;

    // Initialize map for trip detail
    setTimeout(() => {
        const map = L.map('tripDetailMap').setView([trip.origin.lat, trip.origin.lng], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add origin marker
        L.marker([trip.origin.lat, trip.origin.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }).addTo(map).bindPopup('Origin: ' + trip.origin.address);

        // Add destination marker
        L.marker([trip.destination.lat, trip.destination.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }).addTo(map).bindPopup('Destination: ' + trip.destination.address);

        // Draw route line
        L.polyline([
            [trip.origin.lat, trip.origin.lng],
            [trip.destination.lat, trip.destination.lng]
        ], {
            color: '#2563eb',
            weight: 3
        }).addTo(map);

        // Draw search radius
        L.circle([trip.origin.lat, trip.origin.lng], {
            radius: trip.searchRadius * 1000,
            color: '#2563eb',
            fillColor: '#2563eb',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 5'
        }).addTo(map);

        // Fit bounds
        const bounds = L.latLngBounds([
            [trip.origin.lat, trip.origin.lng],
            [trip.destination.lat, trip.destination.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }, 100);
}

async function createTrip(event) {
    event.preventDefault();

    if (!currentUser) {
        showModal('loginModal');
        return;
    }

    const originInput = document.getElementById('tripOrigin');
    const destinationInput = document.getElementById('tripDestination');

    // Get coordinates from inputs or markers
    let originLat = parseFloat(originInput.dataset.lat) || (originMarker ? originMarker.getLatLng().lat : null);
    let originLng = parseFloat(originInput.dataset.lng) || (originMarker ? originMarker.getLatLng().lng : null);
    let destLat = parseFloat(destinationInput.dataset.lat) || (destinationMarker ? destinationMarker.getLatLng().lat : null);
    let destLng = parseFloat(destinationInput.dataset.lng) || (destinationMarker ? destinationMarker.getLatLng().lng : null);

    if (!originLat || !originLng || !destLat || !destLng) {
        // Try to geocode addresses
        try {
            if (!originLat || !originLng) {
                const originResponse = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(originInput.value)}&limit=1`
                );
                const originResults = await originResponse.json();
                if (originResults.length > 0) {
                    originLat = parseFloat(originResults[0].lat);
                    originLng = parseFloat(originResults[0].lon);
                }
            }

            if (!destLat || !destLng) {
                const destResponse = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationInput.value)}&limit=1`
                );
                const destResults = await destResponse.json();
                if (destResults.length > 0) {
                    destLat = parseFloat(destResults[0].lat);
                    destLng = parseFloat(destResults[0].lon);
                }
            }
        } catch (error) {
            showToast('Please select valid locations on the map', 'error');
            return;
        }
    }

    if (!originLat || !originLng || !destLat || !destLng) {
        showToast('Please select valid locations on the map', 'error');
        return;
    }

    const tripData = {
        title: document.getElementById('tripTitle').value,
        description: document.getElementById('tripDescription').value,
        originAddress: originInput.value,
        originLat,
        originLng,
        destinationAddress: destinationInput.value,
        destinationLat: destLat,
        destinationLng: destLng,
        searchRadius: parseInt(document.getElementById('tripRadius').value),
        departureDate: document.getElementById('tripDepartureDate').value,
        departureTime: document.getElementById('tripDepartureTime').value,
        returnDate: document.getElementById('tripReturnDate').value || null,
        returnTime: document.getElementById('tripReturnTime').value || null,
        maxCompanions: parseInt(document.getElementById('tripMaxCompanions').value),
        pricePerPerson: parseFloat(document.getElementById('tripPrice').value) || 0,
        transportMode: document.getElementById('tripTransport').value,
        additionalInfo: document.getElementById('tripAdditionalInfo').value
    };

    try {
        const response = await fetch(`${API_URL}/trips`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(tripData)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Trip created successfully!', 'success');
            document.getElementById('createTripForm').reset();

            // Clear map markers
            if (originMarker) {
                createTripMap.removeLayer(originMarker);
                originMarker = null;
            }
            if (destinationMarker) {
                createTripMap.removeLayer(destinationMarker);
                destinationMarker = null;
            }

            viewTrip(data.trip.id);
        } else {
            showToast(data.error || 'Failed to create trip', 'error');
        }
    } catch (error) {
        console.error('Create trip error:', error);
        showToast('Failed to create trip. Please try again.', 'error');
    }
}

async function joinTrip(tripId) {
    if (!currentUser) {
        showModal('loginModal');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/trips/${tripId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast('You have joined the trip!', 'success');
            viewTrip(tripId);
        } else {
            showToast(data.error || 'Failed to join trip', 'error');
        }
    } catch (error) {
        console.error('Join trip error:', error);
        showToast('Failed to join trip. Please try again.', 'error');
    }
}

// ===== Profile Functions =====
async function loadProfile() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('profileName').textContent = data.user.fullName;
            document.getElementById('profileBio').textContent = data.user.bio || 'No bio yet';
            document.getElementById('profileRating').textContent = data.user.rating?.toFixed(1) || '5.0';
            document.getElementById('profileTrips').textContent = data.user.totalTrips || 0;
            document.getElementById('profileJoined').textContent = new Date(data.user.createdAt).getFullYear();
            document.getElementById('profileEmail').textContent = data.user.email;
            document.getElementById('profilePhone').textContent = data.user.phone || 'Not provided';

            // Populate edit form
            document.getElementById('editName').value = data.user.fullName;
            document.getElementById('editPhone').value = data.user.phone || '';
            document.getElementById('editBio').value = data.user.bio || '';

            // Load reviews
            if (data.user.reviews && data.user.reviews.length > 0) {
                const reviewsContainer = document.getElementById('profileReviews');
                reviewsContainer.innerHTML = data.user.reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="review-avatar"><i class="fas fa-user"></i></div>
                            <div class="review-info">
                                <div class="review-name">${review.reviewer.name}</div>
                                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                            </div>
                        </div>
                        <p class="review-comment">${review.comment || 'No comment'}</p>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

async function updateProfile(event) {
    event.preventDefault();

    const data = {
        fullName: document.getElementById('editName').value,
        phone: document.getElementById('editPhone').value,
        bio: document.getElementById('editBio').value
    };

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            currentUser = result.user;
            closeModal('editProfileModal');
            loadProfile();
            updateUIForLoggedInUser();
            showToast('Profile updated successfully!', 'success');
        } else {
            showToast(result.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showToast('Failed to update profile', 'error');
    }
}

function showProfileTab(tab) {
    document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
}

// ===== My Trips Functions =====
async function loadMyTrips() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/trips/user/my`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        const createdContainer = document.getElementById('createdTripsGrid');
        const joinedContainer = document.getElementById('joinedTripsGrid');

        createdContainer.innerHTML = '';
        joinedContainer.innerHTML = '';

        if (data.createdTrips && data.createdTrips.length > 0) {
            data.createdTrips.forEach(trip => {
                createdContainer.appendChild(createTripCard(trip));
            });
        } else {
            createdContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-plus-circle"></i>
                    <h3>No trips created</h3>
                    <p>Create your first trip and find companions!</p>
                </div>
            `;
        }

        if (data.joinedTrips && data.joinedTrips.length > 0) {
            data.joinedTrips.forEach(trip => {
                joinedContainer.appendChild(createTripCard(trip));
            });
        } else {
            joinedContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-search"></i>
                    <h3>No trips joined</h3>
                    <p>Search for trips and join one!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load my trips error:', error);
    }
}

function showMyTripsTab(tab) {
    document.querySelectorAll('.trips-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
}

// ===== Settings Functions =====
async function changePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            showToast('Password updated successfully!', 'success');
        } else {
            showToast(data.error || 'Failed to update password', 'error');
        }
    } catch (error) {
        console.error('Change password error:', error);
        showToast('Failed to update password', 'error');
    }
}

function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Implement account deletion
        showToast('Account deletion is not implemented yet', 'error');
    }
}

// ===== Notifications =====
async function loadNotifications() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/users/notifications`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        const container = document.getElementById('notificationsList');

        if (data.notifications && data.notifications.length > 0) {
            const unreadCount = data.notifications.filter(n => !n.read).length;

            if (unreadCount > 0) {
                document.getElementById('notificationBadge').style.display = 'inline';
                document.getElementById('notificationBadge').textContent = unreadCount;
            } else {
                document.getElementById('notificationBadge').style.display = 'none';
            }

            container.innerHTML = data.notifications.map(notification => `
                <div class="notification-item ${!notification.read ? 'unread' : ''}">
                    <div class="notification-icon">
                        <i class="fas fa-${notification.type === 'trip_join' ? 'user-plus' : 'bell'}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <div class="time">${formatTimeAgo(notification.createdAt)}</div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <h3>No notifications</h3>
                    <p>You're all caught up!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load notifications error:', error);
    }
}

function formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return formatDate(dateStr);
}

// ===== Utility Functions =====
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

// Make functions globally available
window.showPage = showPage;
window.showModal = showModal;
window.closeModal = closeModal;
window.login = login;
window.register = register;
window.logout = logout;
window.searchFromHero = searchFromHero;
window.searchTrips = searchTrips;
window.getCurrentLocation = getCurrentLocation;
window.setViewMode = setViewMode;
window.viewTrip = viewTrip;
window.createTrip = createTrip;
window.joinTrip = joinTrip;
window.updateProfile = updateProfile;
window.showProfileTab = showProfileTab;
window.showMyTripsTab = showMyTripsTab;
window.changePassword = changePassword;
window.confirmDeleteAccount = confirmDeleteAccount;
window.toggleDropdown = toggleDropdown;
window.toggleMobileMenu = toggleMobileMenu;
window.editTrip = (tripId) => {
    showToast('Edit functionality coming soon!', 'success');
};
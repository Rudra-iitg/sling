const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'database.json');

// Initialize database structure
function initializeDatabase() {
    if (!fs.existsSync(DB_PATH)) {
        const initialData = {
            users: [],
            trips: [],
            tripParticipants: [],
            reviews: [],
            messages: [],
            notifications: []
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    }
}

// Read database
function readDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        initializeDatabase();
        return readDB();
    }
}

// Write database
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize on load
initializeDatabase();

// Database operations
const db = {
    // Users
    getUserById: (id) => {
        const data = readDB();
        return data.users.find(u => u.id === id);
    },

    getUserByEmail: (email) => {
        const data = readDB();
        return data.users.find(u => u.email === email);
    },

    createUser: async (userData) => {
        const data = readDB();
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = {
            id: generateId(),
            email: userData.email,
            password: hashedPassword,
            fullName: userData.fullName,
            phone: userData.phone || null,
            avatar: 'default-avatar.png',
            bio: null,
            rating: 5.0,
            totalTrips: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.users.push(user);
        writeDB(data);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    updateUser: (id, updates) => {
        const data = readDB();
        const index = data.users.findIndex(u => u.id === id);
        if (index !== -1) {
            data.users[index] = { ...data.users[index], ...updates, updatedAt: new Date().toISOString() };
            writeDB(data);
            const { password, ...userWithoutPassword } = data.users[index];
            return userWithoutPassword;
        }
        return null;
    },

    updateUserPassword: async (id, newPassword) => {
        const data = readDB();
        const index = data.users.findIndex(u => u.id === id);
        if (index !== -1) {
            data.users[index].password = await bcrypt.hash(newPassword, 10);
            data.users[index].updatedAt = new Date().toISOString();
            writeDB(data);
            return true;
        }
        return false;
    },

    verifyPassword: async (user, password) => {
        return bcrypt.compare(password, user.password);
    },

    // Trips
    getAllTrips: () => {
        const data = readDB();
        return data.trips.map(trip => ({
            ...trip,
            creator: data.users.find(u => u.id === trip.userId)
        }));
    },

    getTripById: (id) => {
        const data = readDB();
        const trip = data.trips.find(t => t.id === id);
        if (trip) {
            return {
                ...trip,
                creator: data.users.find(u => u.id === trip.userId)
            };
        }
        return null;
    },

    getTripsByUser: (userId) => {
        const data = readDB();
        return data.trips.filter(t => t.userId === userId);
    },

    getTripsUserJoined: (userId) => {
        const data = readDB();
        const participantTrips = data.tripParticipants.filter(p => p.userId === userId);
        return participantTrips.map(p => {
            const trip = data.trips.find(t => t.id === p.tripId);
            if (trip) {
                return {
                    ...trip,
                    creator: data.users.find(u => u.id === trip.userId)
                };
            }
            return null;
        }).filter(t => t !== null);
    },

    createTrip: (tripData) => {
        const data = readDB();
        const trip = {
            id: generateId(),
            userId: tripData.userId,
            title: tripData.title,
            description: tripData.description || null,
            originAddress: tripData.originAddress,
            originLat: tripData.originLat,
            originLng: tripData.originLng,
            destinationAddress: tripData.destinationAddress,
            destinationLat: tripData.destinationLat,
            destinationLng: tripData.destinationLng,
            searchRadius: tripData.searchRadius || 10,
            departureDate: tripData.departureDate,
            departureTime: tripData.departureTime,
            returnDate: tripData.returnDate || null,
            returnTime: tripData.returnTime || null,
            maxCompanions: tripData.maxCompanions || 4,
            currentCompanions: 0,
            pricePerPerson: tripData.pricePerPerson || 0,
            status: 'active',
            transportMode: tripData.transportMode || 'car',
            additionalInfo: tripData.additionalInfo || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.trips.push(trip);
        writeDB(data);
        return trip;
    },

    updateTrip: (id, updates) => {
        const data = readDB();
        const index = data.trips.findIndex(t => t.id === id);
        if (index !== -1) {
            data.trips[index] = { ...data.trips[index], ...updates, updatedAt: new Date().toISOString() };
            writeDB(data);
            return data.trips[index];
        }
        return null;
    },

    deleteTrip: (id) => {
        const data = readDB();
        data.trips = data.trips.filter(t => t.id !== id);
        data.tripParticipants = data.tripParticipants.filter(p => p.tripId !== id);
        writeDB(data);
        return true;
    },

    // Trip Participants
    getTripParticipants: (tripId) => {
        const data = readDB();
        return data.tripParticipants
            .filter(p => p.tripId === tripId && p.status === 'accepted')
            .map(p => ({
                ...p,
                user: data.users.find(u => u.id === p.userId)
            }));
    },

    joinTrip: (tripId, userId) => {
        const data = readDB();

        // Check if already joined
        const existing = data.tripParticipants.find(p => p.tripId === tripId && p.userId === userId);
        if (existing) {
            return { error: 'Already joined this trip' };
        }

        // Get trip
        const tripIndex = data.trips.findIndex(t => t.id === tripId);
        if (tripIndex === -1) {
            return { error: 'Trip not found' };
        }

        const trip = data.trips[tripIndex];

        // Check if full
        if (trip.currentCompanions >= trip.maxCompanions) {
            return { error: 'Trip is full' };
        }

        // Add participant
        const participant = {
            id: generateId(),
            tripId,
            userId,
            status: 'accepted',
            joinedAt: new Date().toISOString()
        };
        data.tripParticipants.push(participant);

        // Update trip count
        data.trips[tripIndex].currentCompanions += 1;

        // Update user total trips
        const userIndex = data.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            data.users[userIndex].totalTrips += 1;
        }

        writeDB(data);
        return { success: true, participant };
    },

    leaveTrip: (tripId, userId) => {
        const data = readDB();

        const participantIndex = data.tripParticipants.findIndex(
            p => p.tripId === tripId && p.userId === userId
        );

        if (participantIndex === -1) {
            return { error: 'Not a participant' };
        }

        data.tripParticipants.splice(participantIndex, 1);

        // Update trip count
        const tripIndex = data.trips.findIndex(t => t.id === tripId);
        if (tripIndex !== -1) {
            data.trips[tripIndex].currentCompanions -= 1;
        }

        writeDB(data);
        return { success: true };
    },

    // Notifications
    getNotifications: (userId) => {
        const data = readDB();
        return data.notifications.filter(n => n.userId === userId);
    },

    createNotification: (notificationData) => {
        const data = readDB();
        const notification = {
            id: generateId(),
            userId: notificationData.userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data || null,
            read: false,
            createdAt: new Date().toISOString()
        };
        data.notifications.push(notification);
        writeDB(data);
        return notification;
    },

    markNotificationRead: (id, userId) => {
        const data = readDB();
        const index = data.notifications.findIndex(n => n.id === id && n.userId === userId);
        if (index !== -1) {
            data.notifications[index].read = true;
            writeDB(data);
            return true;
        }
        return false;
    },

    // Reviews
    getUserReviews: (userId) => {
        const data = readDB();
        return data.reviews
            .filter(r => r.revieweeId === userId)
            .map(r => ({
                ...r,
                reviewer: data.users.find(u => u.id === r.reviewerId)
            }));
    }
};

module.exports = db;
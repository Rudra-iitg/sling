const express = require('express');
const db = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Helper function to format trip data
function formatTrip(trip) {
    return {
        id: trip.id,
        userId: trip.userId,
        title: trip.title,
        description: trip.description,
        origin: {
            address: trip.originAddress,
            lat: trip.originLat,
            lng: trip.originLng
        },
        destination: {
            address: trip.destinationAddress,
            lat: trip.destinationLat,
            lng: trip.destinationLng
        },
        searchRadius: trip.searchRadius,
        departure: {
            date: trip.departureDate,
            time: trip.departureTime
        },
        return: {
            date: trip.returnDate,
            time: trip.returnTime
        },
        maxCompanions: trip.maxCompanions,
        currentCompanions: trip.currentCompanions,
        pricePerPerson: trip.pricePerPerson,
        status: trip.status,
        transportMode: trip.transportMode,
        additionalInfo: trip.additionalInfo,
        creator: trip.creator ? {
            id: trip.creator.id,
            name: trip.creator.fullName,
            avatar: trip.creator.avatar,
            rating: trip.creator.rating
        } : null,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt
    };
}

// Create a new trip
router.post('/', authenticateToken, (req, res) => {
    try {
        const {
            title, description,
            originAddress, originLat, originLng,
            destinationAddress, destinationLat, destinationLng,
            searchRadius, departureDate, departureTime,
            returnDate, returnTime, maxCompanions,
            pricePerPerson, transportMode, additionalInfo
        } = req.body;

        if (!title || !originAddress || !destinationAddress || !departureDate || !departureTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!originLat || !originLng || !destinationLat || !destinationLng) {
            return res.status(400).json({ error: 'Location coordinates are required' });
        }

        const trip = db.createTrip({
            userId: req.userId,
            title,
            description,
            originAddress,
            originLat: parseFloat(originLat),
            originLng: parseFloat(originLng),
            destinationAddress,
            destinationLat: parseFloat(destinationLat),
            destinationLng: parseFloat(destinationLng),
            searchRadius: searchRadius || 10,
            departureDate,
            departureTime,
            returnDate,
            returnTime,
            maxCompanions: maxCompanions || 4,
            pricePerPerson: pricePerPerson || 0,
            transportMode: transportMode || 'car',
            additionalInfo
        });

        res.status(201).json({
            message: 'Trip created successfully',
            trip: formatTrip(trip)
        });
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ error: 'Failed to create trip' });
    }
});

// Get all trips (with filters)
router.get('/', (req, res) => {
    try {
        const { lat, lng, radius, status, date, transport } = req.query;

        let trips = db.getAllTrips();

        // Filter by active status
        trips = trips.filter(t => t.status === 'active');

        // Filter by location and radius
        if (lat && lng && radius) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const radiusKm = parseFloat(radius);

            trips = trips.filter(trip => {
                const distance = calculateDistance(userLat, userLng, trip.originLat, trip.originLng);
                return distance <= radiusKm;
            });
        }

        // Filter by date
        if (date) {
            trips = trips.filter(t => t.departureDate >= date);
        }

        // Filter by transport mode
        if (transport) {
            trips = trips.filter(t => t.transportMode === transport);
        }

        // Sort by departure date
        trips.sort((a, b) => {
            const dateA = new Date(a.departureDate + 'T' + a.departureTime);
            const dateB = new Date(b.departureDate + 'T' + b.departureTime);
            return dateA - dateB;
        });

        res.json({ trips: trips.map(formatTrip) });
    } catch (error) {
        console.error('Get trips error:', error);
        res.status(500).json({ error: 'Failed to get trips' });
    }
});

// Get single trip
router.get('/:id', (req, res) => {
    try {
        const trip = db.getTripById(req.params.id);

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Get participants
        const participants = db.getTripParticipants(req.params.id);

        res.json({
            trip: formatTrip(trip),
            participants: participants.map(p => ({
                id: p.id,
                userId: p.userId,
                fullName: p.user ? p.user.fullName : 'Unknown',
                avatar: p.user ? p.user.avatar : 'default-avatar.png',
                rating: p.user ? p.user.rating : 5.0,
                status: p.status,
                joinedAt: p.joinedAt
            }))
        });
    } catch (error) {
        console.error('Get trip error:', error);
        res.status(500).json({ error: 'Failed to get trip' });
    }
});

// Update trip
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const trip = db.getTripById(req.params.id);

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trip.userId !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to edit this trip' });
        }

        const {
            title, description, searchRadius,
            departureDate, departureTime, returnDate, returnTime,
            maxCompanions, pricePerPerson, additionalInfo, status
        } = req.body;

        const updates = {};
        if (title) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (searchRadius) updates.searchRadius = searchRadius;
        if (departureDate) updates.departureDate = departureDate;
        if (departureTime) updates.departureTime = departureTime;
        if (returnDate !== undefined) updates.returnDate = returnDate;
        if (returnTime !== undefined) updates.returnTime = returnTime;
        if (maxCompanions) updates.maxCompanions = maxCompanions;
        if (pricePerPerson !== undefined) updates.pricePerPerson = pricePerPerson;
        if (additionalInfo !== undefined) updates.additionalInfo = additionalInfo;
        if (status) updates.status = status;

        const updatedTrip = db.updateTrip(req.params.id, updates);
        res.json({ message: 'Trip updated successfully', trip: formatTrip(updatedTrip) });
    } catch (error) {
        console.error('Update trip error:', error);
        res.status(500).json({ error: 'Failed to update trip' });
    }
});

// Delete trip
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const trip = db.getTripById(req.params.id);

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trip.userId !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this trip' });
        }

        db.deleteTrip(req.params.id);
        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        console.error('Delete trip error:', error);
        res.status(500).json({ error: 'Failed to delete trip' });
    }
});

// Join a trip
router.post('/:id/join', authenticateToken, (req, res) => {
    try {
        const trip = db.getTripById(req.params.id);

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trip.userId === req.userId) {
            return res.status(400).json({ error: 'Cannot join your own trip' });
        }

        if (trip.status !== 'active') {
            return res.status(400).json({ error: 'This trip is no longer active' });
        }

        const result = db.joinTrip(req.params.id, req.userId);

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        // Create notification for trip creator
        const user = db.getUserById(req.userId);
        db.createNotification({
            userId: trip.userId,
            type: 'trip_join',
            title: 'New Companion',
            message: `${user.fullName} joined your trip "${trip.title}"`,
            data: JSON.stringify({ tripId: trip.id, userId: req.userId })
        });

        res.json({ message: 'Successfully joined the trip' });
    } catch (error) {
        console.error('Join trip error:', error);
        res.status(500).json({ error: 'Failed to join trip' });
    }
});

// Leave a trip
router.post('/:id/leave', authenticateToken, (req, res) => {
    try {
        const result = db.leaveTrip(req.params.id, req.userId);

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ message: 'Successfully left the trip' });
    } catch (error) {
        console.error('Leave trip error:', error);
        res.status(500).json({ error: 'Failed to leave trip' });
    }
});

// Get user's trips
router.get('/user/my', authenticateToken, (req, res) => {
    try {
        // Trips created by user
        const createdTrips = db.getTripsByUser(req.userId);

        // Trips user has joined
        const joinedTrips = db.getTripsUserJoined(req.userId);

        res.json({
            createdTrips: createdTrips.map(formatTrip),
            joinedTrips: joinedTrips.map(formatTrip)
        });
    } catch (error) {
        console.error('Get user trips error:', error);
        res.status(500).json({ error: 'Failed to get user trips' });
    }
});

module.exports = router;
const express = require('express');
const db = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    try {
        const user = db.getUserById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get reviews
        const reviews = db.getUserReviews(req.userId);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                avatar: user.avatar,
                bio: user.bio,
                rating: user.rating,
                totalTrips: user.totalTrips,
                createdAt: user.createdAt,
                reviews: reviews.slice(0, 10).map(r => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    reviewer: {
                        name: r.reviewer ? r.reviewer.fullName : 'Anonymous',
                        avatar: r.reviewer ? r.reviewer.avatar : 'default-avatar.png'
                    },
                    createdAt: r.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
    try {
        const { fullName, phone, bio } = req.body;

        const updates = {};
        if (fullName) updates.fullName = fullName;
        if (phone !== undefined) updates.phone = phone;
        if (bio !== undefined) updates.bio = bio;

        const user = db.updateUser(req.userId, updates);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                avatar: user.avatar,
                bio: user.bio,
                rating: user.rating,
                totalTrips: user.totalTrips
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        const user = db.getUserById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValidPassword = await db.verifyPassword(user, currentPassword);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        await db.updateUserPassword(req.userId, newPassword);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Get notifications
router.get('/notifications', authenticateToken, (req, res) => {
    try {
        const notifications = db.getNotifications(req.userId);

        res.json({
            notifications: notifications.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                data: n.data ? JSON.parse(n.data) : null,
                read: n.read,
                createdAt: n.createdAt
            }))
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, (req, res) => {
    try {
        db.markNotificationRead(req.params.id, req.userId);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification error:', error);
        res.status(500).json({ error: 'Failed to mark notification' });
    }
});

// Get user by ID (public profile)
router.get('/:id', (req, res) => {
    try {
        const user = db.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                fullName: user.fullName,
                avatar: user.avatar,
                bio: user.bio,
                rating: user.rating,
                totalTrips: user.totalTrips,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

module.exports = router;
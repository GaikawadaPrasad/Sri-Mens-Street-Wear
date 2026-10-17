const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers, approveUser, rejectUser } = require('../controllers/authController');
const { protect, admin } = require('../utils/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Admin-only User management
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/approve', protect, admin, approveUser);
router.delete('/users/:id/reject', protect, admin, rejectUser);

module.exports = router;

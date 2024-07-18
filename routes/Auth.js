const express = require('express');
const router = express.Router();
const { register, login, logout, checkAuth } = require('../controllers/authControllers');
const authMiddleware = require("../middleware/authMiddleware")

router.post('/signup', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check',authMiddleware, checkAuth);

module.exports = router;

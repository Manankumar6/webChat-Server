const express = require('express');
const router = express.Router();
const { register, login, logout, checkAuth, getAllUser } = require('../controllers/authControllers');
const authMiddleware = require("../middleware/authMiddleware")

router.post('/signup', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check',authMiddleware, checkAuth);
router.get('/getallusers',authMiddleware,getAllUser);

module.exports = router;

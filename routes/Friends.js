const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addFriend } = require('../controllers/FriendController');

router.post('/add-friend/:friendId',authMiddleware, addFriend);


module.exports = router;
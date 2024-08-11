const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addFriend, getAllFriends } = require('../controllers/FriendController');

router.post('/add-friend/:friendId',authMiddleware, addFriend);
router.get('/get-friends',authMiddleware, getAllFriends);


module.exports = router;
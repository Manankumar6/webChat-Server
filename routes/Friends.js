const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addFriend, getAllFriends, removeFriend } = require('../controllers/FriendController');

router.post('/add-friend/:friendId',authMiddleware, addFriend);
router.get('/get-friends',authMiddleware, getAllFriends);
router.delete('/remove-friend/:friendId', authMiddleware, removeFriend);



module.exports = router;
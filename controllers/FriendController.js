const User = require('../models/User');


const addFriend = async (req,res)=>{
    try {
        const { friendId } = req.params; 
        const userId = req.user._id; // Get the friendId from the URL
    //    console.log(req.user) // Get userId from the request body, if sent
    //     console.log('Friend ID:', friendId);
    // console.log('User ID:', userId);  
        // Find the user who is adding the friend
        const user = await User.findById(userId);
      
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the friend exists
        const friend = await User.findById(friendId);
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        // Check if they are already friends
        if (user.friends.includes(friendId)) {
            return res.status(400).json({ message: 'User is already your friend' });
        }

        // Add the friend
        user.friends.push(friendId);
        await user.save();

        res.status(200).json({ message: 'Friend added successfully', friends: user.friends });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const deleteFriend = async (req,res)=>{
    try {
        const { userId } = req.params;
        const { friendId } = req.body; // Assuming friendId is sent in the request body

        // Find the user
        const user = await User.findById(userId);
     
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is actually a friend
        if (!user.friends.includes(friendId)) {
            return res.status(400).json({ message: 'User is not your friend' });
        }

        // Remove the friend
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        await user.save();

        res.status(200).json({ message: 'Friend removed successfully', friends: user.friends });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const getAllFriends = async (req,res)=>{
    try {
        const userId = req.user._id;

        // Find the user and populate the friends list
        const user = await User.findById(userId).populate('friends', 'fullName userName');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ friends: user.friends });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

module.exports = {addFriend,getAllFriends,deleteFriend}
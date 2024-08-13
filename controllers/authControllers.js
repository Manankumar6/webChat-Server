const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  
    try {
        const { fullName, userName, password } = req.body;
        const existUser = await User.findOne({userName});
        if(existUser){
            return res.status(400).json({message:"User Name Already Exist."})
        }
     
        const user = await  User.create({ fullName, userName, password });
        await user.save();
       
        res.status(201).json({ user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { userName, password } = req.body;
        const user = await User.findOne({ userName });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const comparePassword = await user.matchPassword(password);

        if (comparePassword) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.cookie('token', token, { httpOnly: true, sameSite: 'None', secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }); // Set cookie for 24 hours
            res.status(200).json({ user });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({ message: 'Logged out successfully' });
};

const checkAuth = async (req, res) => {
    try {
 
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

const getAllUser  = async (req,res)=>{
    try {
        const loggedInUserId = req.user.id;
        const users = await User.find({})
        const filteredUsers = users.filter(user => user._id.toString() !== loggedInUserId);
      
        res.status(200).json({ success: true, users: filteredUsers });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "An error occurred while fetching users." });
    }
}

module.exports = {
    register,
    login,
    logout,
    checkAuth,
    getAllUser
};

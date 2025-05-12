// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  let status = 0;  // Use let so you can reassign the status

  // List of common domains to block
  const disallowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const emailDomain = email.split('@')[1];
  if (!name || !email || !password) {
      return res.status(400).send('All fields are required');
  }

  if (disallowedDomains.includes(emailDomain)) {
      return res.status(400).send('Registration is restricted to business domains only.');
  }
  
  // Update status if role is superadmin
  if(role === 'superadmin') {
      status = 1;
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).send("Error hashing password");

      User.create(name, email, hashedPassword, role, status, emailDomain, (err) => {
          if (err) {
              console.error('Error registering user:', err);
              return res.status(500).send("Error registering user");
          }
          res.status(201).send("User registered!");
      });
  });
};


// Login User


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Check if the user's status is 1 (active)
      if (user.status !== 1) {
          return res.status(403).json({ message: "Your account is not active. Please contact administrator." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const accessToken = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email , domain: user.domain}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

      res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, domain: user.domain } });
  } catch (err) {
      console.error('Login failed', err); // This will log any internal server error
      res.status(500).json({ message: "Internal server error" });
  }
};




exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  // Ensure the refresh token is provided
  if (!refreshToken) return res.status(400).send("Refresh token required");

  // Verify refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid or expired refresh token");

    // Generate new access token
    const newAccessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    // Respond with the new access token
    res.json({ accessToken: newAccessToken });
  });
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
      const loggedInUserEmail = req.user.email; // Now req.user should be populated correctly
      
      const userDomain = loggedInUserEmail.split('@')[1];

      const allUsers = await User.getAllUsers(); // Get all users from the database

      // Filter out superadmin users and also filter by the domain of the logged-in user
      const filteredUsers = allUsers
        .filter(user => user.email.endsWith(`@${userDomain}`)); // Exclude superadmin

      res.status(200).json(filteredUsers);
  } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).send("Error fetching users");
  }
};


exports.updateUserStatus = async (req, res) => {
  try {
      const { id } = req.params;
      const { status } = req.body; // Accepts either 'verified' or 'declined'

      if (status !== 1 && status !== 2 && status !== 0) {
          return res.status(400).json({ message: 'Invalid status' });
      }

      // Update the user status in the database
      const updatedUser = await User.updateUserStatus(id, status);

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User status updated successfully', user: updatedUser });
  } catch (err) {
      console.error("Error updating user status:", err);
      res.status(500).send("Error updating user status");
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error });
  }
};

// Password reset
exports.resetPassword = async (req, res) => {
  const {newPassword } = req.body;
  
  try {
      const userId = req.params.id;
      // Update the password
      const updatedUser = await User.updatePassword(userId, newPassword);

      if (updatedUser) {
          return res.json({ message: 'Password updated successfully' });
      } else {
          return res.status(404).json({ message: 'User not found or no update was necessary' });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating password', error });
  }
};
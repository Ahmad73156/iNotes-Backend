const express = require('express');
const router = express.Router();
const User=require('../modules/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser'); // Make sure the correct path is used for fetchuser.js

const JWT_SECRET = "yourJWTSecretKey"; // Secret key for signing JWTs

// User Registration Route
router.post(
    "/signup",
    [
        body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, password } = req.body;

            // Check if the "Name" in Db is already existed
            let existingName = await User.findOne({ name });
            if (existingName) {
                return res.status(400).json({ error: 'Name already in Use' });
            }

            // Check if the email already exists
            let existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create a new user
            const user = new User({ name, email, password: hashedPassword });
            await user.save();

            // Generate JWT Token
            const data = { user: { id: user.id } };
            const authToken = jwt.sign(data, JWT_SECRET);

            // Send response with token, username, and hashed password
            res.status(201).json({
                success: true,  // ✅ Add success field
                message: 'User created successfully',
                username: user.name,
                token: authToken, 
            });
            
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// User Login Route
router.post('/login', async (req, res) => {
    let success = false;
    const { email, password } = req.body;

    try {
        // Find the user by email
        let existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare the entered password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            success= false;
            return res.status(400).json({ success,error: 'Invalid credentials' });
        }

        // Generate JWT token for the user
        const data = { user: { id: existingUser.id } };
        const authToken = jwt.sign(data, JWT_SECRET);

        // Send the response with the token and user info (excluding password)
       success = true;
       console.log(authToken,"BToken");
        res.json({
            success:success,
            message: 'User logged in successfully',
            token: authToken,
            user: { name: existingUser.name, email: existingUser.email }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Get User Details (protected route)
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id; // From the fetchuser middleware
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

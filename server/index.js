const port = 8080; // Ensure this matches the port used in your frontend
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Database connection to MongoDB
mongoose.connect("mongodb+srv://sadneyasam:root@cluster0.xjw2f3j.mongodb.net/forms", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Schema for User model
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Users = mongoose.model('Users', userSchema);

// API endpoint to check if the server is running
app.get("/", (req, res) => {
    res.send("Express App is running");
});

// Endpoint for user registration
app.post('/api/Users', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        let user = await Users.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists with this email address" });
        }

        user = new Users({
            firstName,
            lastName,
            email,
            password,
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(payload, 'secret-ecom', { expiresIn: '1h' });
        res.status(201).json({ success: true, token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Endpoint for user login
app.post('/api/Auth', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(payload, 'secret-ecom', { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Middleware to verify the token
const auth = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, 'secret-ecom');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

// Example of a protected route
app.get('/protected', auth, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port);
    } else {
        console.log("Error: " + error);
    }
});

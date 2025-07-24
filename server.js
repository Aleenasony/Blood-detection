const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { spawn } = require('child_process');
// const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    dob: Date,
    personalDetails: {
        age: Number,
        gender: String,
        weight: Number,
        height: Number,
        disease: String
    },
    bloodGroup: String
});
const User = mongoose.model('User', userSchema);

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) return res.status(401).json({ error: 'User not found' });
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { name, dob, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'User already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ name, dob, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Personal Details
app.put('/api/user/details', authMiddleware, async (req, res) => {
    const { name, age, gender, weight, height, disease } = req.body;
    try {
        req.user.name = name || req.user.name;
        req.user.personalDetails = { age, gender, weight, height, disease };
        await req.user.save();
        res.json({ message: 'Details updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Blood Group Detection (Placeholder)
app.post('/api/detect', upload.fields([
    { name: 'anti-a', maxCount: 1 },
    { name: 'anti-b', maxCount: 1 },
    { name: 'anti-d', maxCount: 1 },
    { name: 'control', maxCount: 1 }
]), (req, res) => {
    const files = req.files;
    const antiA = files['anti-a'][0].path;
    const antiB = files['anti-b'][0].path;
    const antiD = files['anti-d'][0].path;
    const control = files['control'][0].path;

    const pythonExec = process.env.PYTHON_EXEC || 'python';
    const scriptPath = path.join(__dirname, 'detect_blood_group.py');
    const pythonProcess = spawn(pythonExec, [scriptPath, antiA, antiB, antiD, control]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.json({ bloodGroup: result.trim() });
        } else {
            res.status(500).json({ error: 'Detection failed' });
        }
    });
});

// Protect Dashboard Route
app.get('/dashboard.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
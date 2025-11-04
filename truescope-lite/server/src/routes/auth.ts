import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { requireAuth } from '../middleware/auth';

const r = express.Router();

// Register
r.post('/register', async function (req, res) {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'name, email and password are required' });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ error: 'email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            passwordHash,
            role,
        });

        return res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        });
    } catch (err) {
        console.error('Register error', err);
        return res.status(500).json({ error: 'internal error' });
    }
});

// Login
r.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'user not found' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'wrong password' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

        return res.json({ token, id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        console.error('Login error', err);
        return res.status(500).json({ error: 'internal error' });
    }
});

// Get current user
r.get('/me', requireAuth, async function (req: any, res) {
    try {
        const user = req.user;
        return res.json({ 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Get me error', err);
        return res.status(500).json({ error: 'internal error' });
    }
});

export default r;
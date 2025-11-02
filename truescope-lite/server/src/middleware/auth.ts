/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */


import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing Authorization header' });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            return res.status(401).json({ error: 'Invalid Authorization header format' });
        }

        const token = parts[1];

        let payload: any;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // attach user to request for downstream handlers
        const user = await User.findById(payload.id).select('-passwordHash');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        (req as any).user = user;
        return next();
    } catch (err) {
        console.error('Auth middleware error', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
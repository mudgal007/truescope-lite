import { Request, Response, NextFunction } from 'express';

type Role = "user" | "reviewer" | "admin";

interface User {
    role: Role;
    // Add other user properties if needed
}

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
    user?: User;
}

export function requireRole(...allowed: Role[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });

        if (!allowed.includes(req.user.role))
            return res.status(403).json({ message: 'Forbidden' });
        next();
    }
}
        
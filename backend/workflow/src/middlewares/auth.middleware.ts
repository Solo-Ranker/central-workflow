import type { Context, Next } from 'hono';
import { jwt } from 'hono/jwt';
import { env } from '../config.js';

export const jwtMiddleware = (c: Context, next: Next) => {
    const middleware = jwt({
        secret: env.JWT_SECRET,
        alg: 'HS256',
    });
    return middleware(c, next);
};

export const isAdmin = async (c: Context, next: Next) => {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'CHECKER') {
        return c.json({ error: 'Unauthorized: Checker role required' }, 403);
    }
    await next();
};

export const isMaker = async (c: Context, next: Next) => {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'MAKER') {
        return c.json({ error: 'Unauthorized: Maker role required' }, 403);
    }
    await next();
};

export const requireRole = (role: 'MAKER' | 'CHECKER') => {
    return async (c: Context, next: Next) => {
        const payload = c.get('jwtPayload');
        if (payload.role !== role) {
            return c.json({ error: `Unauthorized: ${role} role required` }, 403);
        }
        await next();
    };
};

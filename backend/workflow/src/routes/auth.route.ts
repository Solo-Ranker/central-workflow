import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { env } from '../config.js';
import { z } from 'zod';

const auth = new Hono();

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const registerSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(6),
    role: z.enum(['MAKER', 'CHECKER']).optional(),
    fullName: z.string().optional(),
});

auth.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return c.json({ error: 'Invalid input', details: result.error.format() }, 400);
        }

        const { email, username, password, role, fullName } = result.data;

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            return c.json({ error: 'User already exists' }, 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUser] = await db.insert(users).values({
            email,
            username,
            password: hashedPassword,
            role: role || 'MAKER',
            fullName,
        }).returning();

        const token = await sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            env.JWT_SECRET
        );

        return c.json({
            success: true,
            data: {
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    role: newUser.role,
                },
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return c.json({ error: 'Failed to register' }, 500);
    }
});

auth.post('/login', async (c) => {
    try {
        const body = await c.req.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return c.json({ error: 'Invalid credentials format' }, 400);
        }

        const { email, password } = result.data;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        const token = await sign(
            { id: user.id, email: user.email, role: user.role },
            env.JWT_SECRET
        );

        return c.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Failed to login' }, 500);
    }
});

auth.get('/me', async (c) => {
    // This will be protected by jwtMiddleware elsewhere or here
    return c.json({ message: 'Auth endpoint active' });
});

export default auth;

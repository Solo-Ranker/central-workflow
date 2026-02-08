import { eq } from 'drizzle-orm';
import { type Database } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { type CreateUserPayload } from '../types/workflow.type.js';
import { BaseActionHandler } from './base.handler.js';
import { createUserSchema } from '../validators/workflow.validator.js';

export class CreateUserHandler extends BaseActionHandler<CreateUserPayload> {
  async validate(payload: CreateUserPayload): Promise<void> {
    // Validate with Zod schema
    const validationResult = createUserSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }
  }

  async execute(db: Database, payload: CreateUserPayload): Promise<any> {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, payload.email),
    });

    if (existingUser) {
      throw new Error(`User with email ${payload.email} already exists`);
    }

    // Check if username is taken
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, payload.username),
    });

    if (existingUsername) {
      throw new Error(`Username ${payload.username} is already taken`);
    }

    // Insert the new user
    const [newUser] = await db.insert(users).values({
      email: payload.email,
      username: payload.username,
      fullName: payload.fullName,
      password: "$2b$10$4cXn4kdl6v36ARMmUZ0nvOCBGGUKtWk5X.lZRsXWLn/GgQFqaTGRe"
    }).returning();

    return newUser;
  }
}
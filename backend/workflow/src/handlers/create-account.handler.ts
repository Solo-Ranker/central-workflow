import { eq } from 'drizzle-orm';
import { type Database } from '../db/index.js';
import { accounts, users } from '../db/schema/index.js';
import { type CreateAccountPayload } from '../types/workflow.type.js';
import { BaseActionHandler } from './base.handler.js';
import { createAccountSchema } from '../validators/workflow.validator.js';

export class CreateAccountHandler extends BaseActionHandler<CreateAccountPayload> {
  async validate(payload: CreateAccountPayload): Promise<void> {
    // Validate with Zod schema
    const validationResult = createAccountSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }
  }

  async execute(db: Database, payload: CreateAccountPayload): Promise<any> {
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      throw new Error(`User with ID ${payload.userId} does not exist`);
    }

    // Check if account number already exists
    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.accountNumber, payload.accountNumber),
    });

    if (existingAccount) {
      throw new Error(`Account with number ${payload.accountNumber} already exists`);
    }

    // Insert the new account
    const [newAccount] = await db.insert(accounts).values({
      userId: payload.userId,
      accountNumber: payload.accountNumber,
      accountType: payload.accountType,
      balance: payload.balance || '0',
      currency: payload.currency || 'USD',
    }).returning();

    return newAccount;
  }
}
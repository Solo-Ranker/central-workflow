import { eq } from 'drizzle-orm';
import { type Database } from '../db/index.js';
import { promotions } from '../db/schema/index.js';
import { type CreatePromotionPayload } from '../types/workflow.type.js';
import { BaseActionHandler } from './base.handler.js';
import { createPromotionSchema } from '../validators/workflow.validator.js';

export class CreatePromotionHandler extends BaseActionHandler<CreatePromotionPayload> {
  async validate(payload: CreatePromotionPayload): Promise<void> {
    // Validate with Zod schema
    const validationResult = createPromotionSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    // Additional business validation
    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    // Validate discount value based on type
    const discountValue = parseFloat(payload.discountValue);
    if (payload.discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      throw new Error('Percentage discount must be between 0 and 100');
    }

    if (payload.discountType === 'fixed' && discountValue < 0) {
      throw new Error('Fixed discount cannot be negative');
    }
  }

  async execute(db: Database, payload: CreatePromotionPayload): Promise<any> {
    // Check if promotion code already exists
    const existingPromotion = await db.query.promotions.findFirst({
      where: eq(promotions.code, payload.code),
    });

    if (existingPromotion) {
      throw new Error(`Promotion with code ${payload.code} already exists`);
    }

    // Insert the new promotion
    const [newPromotion] = await db.insert(promotions).values({
      code: payload.code,
      name: payload.name,
      description: payload.description,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
    }).returning();

    return newPromotion;
  }
}
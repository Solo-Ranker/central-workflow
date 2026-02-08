import { z } from 'zod';
import { ActionTypes, ActionStatus } from '../types/workflow.type.js';

const dateString = z
  .string()
  .refine(
    (v) => !isNaN(Date.parse(v)),
    "Invalid date format"
  )
  .transform((v) => new Date(v).toISOString());

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().optional(),
});

export const createAccountSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  accountNumber: z.string().min(5, 'Account number must be at least 5 characters'),
  accountType: z.string().min(1, 'Account type is required'),
  balance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid balance format').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
});

export const createPromotionSchema = z.object({
  code: z.string().min(3, 'Promotion code must be at least 3 characters'),
  name: z.string().min(1, 'Promotion name is required'),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed'], {
    errorMap: () => ({ message: 'Discount type must be percentage or fixed' }),
  }),
  discountValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid discount value format'),
  startDate: dateString,
  endDate: dateString,
});

export const createWorkflowActionSchema = z.object({
  actionType: z.enum([ActionTypes.CREATE_USER, ActionTypes.CREATE_ACCOUNT, ActionTypes.CREATE_PROMOTION]),
  payload: z.union([createUserSchema, createAccountSchema, createPromotionSchema]),
  makerId: z.string().min(1, 'Maker ID is required'),
});

export const reviewActionSchema = z.object({
  status: z.enum([ActionStatus.APPROVED, ActionStatus.REJECTED]),
  checkerId: z.string().min(1, 'Checker ID is required'),
  reviewComment: z.string().optional(),
});

export const listActionsQuerySchema = z.object({
  status: z.enum([ActionStatus.PENDING, ActionStatus.APPROVED, ActionStatus.REJECTED]).optional(),
  actionType: z.enum([ActionTypes.CREATE_USER, ActionTypes.CREATE_ACCOUNT, ActionTypes.CREATE_PROMOTION]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
});
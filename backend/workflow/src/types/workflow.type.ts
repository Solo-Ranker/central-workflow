export const ActionTypes = {
  CREATE_USER: 'create_user',
  CREATE_ACCOUNT: 'create_account',
  CREATE_PROMOTION: 'create_promotion',
} as const;

export type ActionType = typeof ActionTypes[keyof typeof ActionTypes];

export const ActionStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ActionStatusType = typeof ActionStatus[keyof typeof ActionStatus];

export interface BaseActionPayload {
  actionType: ActionType;
}

export interface CreateUserPayload extends BaseActionPayload {
  actionType: typeof ActionTypes.CREATE_USER;
  email: string;
  username: string;
  fullName?: string;
}

export interface CreateAccountPayload extends BaseActionPayload {
  actionType: typeof ActionTypes.CREATE_ACCOUNT;
  userId: string;
  accountNumber: string;
  accountType: string;
  balance?: string;
  currency?: string;
}

export interface CreatePromotionPayload extends BaseActionPayload {
  actionType: typeof ActionTypes.CREATE_PROMOTION;
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: string;
  startDate: string;
  endDate: string;
}

export type ActionPayload = CreateUserPayload | CreateAccountPayload | CreatePromotionPayload;
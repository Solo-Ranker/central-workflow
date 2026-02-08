
import { ActionTypes } from '../types/workflow.type.js';
import { type ActionHandler } from './base.handler.js';
import { CreateUserHandler } from './create-user.handler.js';
import { CreateAccountHandler } from './create-account.handler.js';
import { CreatePromotionHandler } from './create-promotion.handler.js';

export class ActionHandlerFactory {
  private static handlers: Record<string, ActionHandler<any>> = {
    [ActionTypes.CREATE_USER]: new CreateUserHandler(),
    [ActionTypes.CREATE_ACCOUNT]: new CreateAccountHandler(),
    [ActionTypes.CREATE_PROMOTION]: new CreatePromotionHandler(),
  };

  static getHandler(actionType: string): ActionHandler<any> {
    const handler = this.handlers[actionType];
    
    if (!handler) {
      throw new Error(`No handler found for action type: ${actionType}`);
    }

    return handler;
  }

  static registerHandler(actionType: string, handler: ActionHandler<any>): void {
    this.handlers[actionType] = handler;
  }

  static getAllActionTypes(): string[] {
    return Object.keys(this.handlers);
  }
}

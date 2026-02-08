import { type Context } from 'hono';
import { ActionHandlerFactory } from '../handlers/action-handler.factory.js';
import { ActionTypes } from '../types/workflow.type.js';

export class ActionTypesController {
    async getActionTypes(c: Context) {
        try {
            const actionTypes = ActionHandlerFactory.getAllActionTypes();

            // Map action types to metadata
            const actionTypesMetadata = actionTypes.map(actionType => {
                let metadata = {
                    actionType,
                    name: '',
                    description: '',
                    category: '',
                };

                // Define metadata for each action type
                switch (actionType) {
                    case ActionTypes.CREATE_USER:
                        metadata = {
                            actionType,
                            name: 'Create User',
                            description: 'Create a new user account in the system',
                            category: 'User Management',
                        };
                        break;
                    case ActionTypes.CREATE_ACCOUNT:
                        metadata = {
                            actionType,
                            name: 'Create Account',
                            description: 'Create a new financial account for a user',
                            category: 'Account Management',
                        };
                        break;
                    case ActionTypes.CREATE_PROMOTION:
                        metadata = {
                            actionType,
                            name: 'Create Promotion',
                            description: 'Create a new promotional campaign',
                            category: 'Marketing',
                        };
                        break;
                    default:
                        metadata = {
                            actionType,
                            name: actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            description: `Action type: ${actionType}`,
                            category: 'General',
                        };
                }

                return metadata;
            });

            return c.json({
                success: true,
                data: actionTypesMetadata,
            });
        } catch (error) {
            console.error('Error getting action types:', error);
            return c.json(
                {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to get action types',
                },
                500
            );
        }
    }
}

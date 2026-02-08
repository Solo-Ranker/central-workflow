import { eq, and, desc } from 'drizzle-orm';
import { type Database, db } from '../db/index.js';
import { workflowActions } from '../db/schema/index.js';
import { ActionStatus, type ActionStatusType } from '../types/workflow.type.js';
import { ActionHandlerFactory } from '../handlers/action-handler.factory.js';

export class WorkflowService {
  private db: Database;

  constructor(database?: Database) {
    this.db = database || db;
  }

  async createAction(actionType: string, payload: any, makerId: string) {
    // Get the appropriate handler
    const handler = ActionHandlerFactory.getHandler(actionType);

    // Validate the payload
    await handler.validate(payload);

    // Create workflow action record
    const [action] = await this.db.insert(workflowActions).values({
      actionType,
      payload,
      makerId,
      status: ActionStatus.PENDING,
    }).returning();

    return action;
  }

  async listActions(filters?: {
    status?: ActionStatusType;
    actionType?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, actionType, page = 1, limit = 10 } = filters || {};
    const offset = (page - 1) * limit;

    let query = this.db.query.workflowActions.findMany({
      orderBy: [desc(workflowActions.createdAt)],
      limit,
      offset,
    });

    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(workflowActions.status, status));
    }
    if (actionType) {
      conditions.push(eq(workflowActions.actionType, actionType));
    }

    if (conditions.length > 0) {
      query = this.db.query.workflowActions.findMany({
        where: and(...conditions),
        orderBy: [desc(workflowActions.createdAt)],
        limit,
        offset,
      });
    }

    const actions = await query;

    // Get total count for pagination
    const totalQuery = conditions.length > 0
      ? this.db.select().from(workflowActions).where(and(...conditions))
      : this.db.select().from(workflowActions);
    
    const totalResult = await totalQuery;
    const total = totalResult.length;

    return {
      data: actions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActionById(actionId: string) {
    const action = await this.db.query.workflowActions.findFirst({
      where: eq(workflowActions.id, actionId),
    });

    if (!action) {
      throw new Error(`Action with ID ${actionId} not found`);
    }

    return action;
  }

  async reviewAction(actionId: string, checkerId: string, status: ActionStatusType, reviewComment?: string) {
    // Get the action
    const action = await this.getActionById(actionId);

    // Check if action is already reviewed
    if (action.status !== ActionStatus.PENDING) {
      throw new Error(`Action is already ${action.status} and cannot be reviewed again`);
    }

    // Maker cannot be the checker
    if (action.makerId === checkerId) {
      throw new Error('Maker cannot review their own action');
    }

    // Update the action status
    const [updatedAction] = await this.db
      .update(workflowActions)
      .set({
        status,
        checkerId,
        reviewComment,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workflowActions.id, actionId))
      .returning();

    // If approved, execute the action
    if (status === ActionStatus.APPROVED) {
      const handler = ActionHandlerFactory.getHandler(action.actionType);
      const result = await handler.execute(this.db, action.payload);
      
      return {
        action: updatedAction,
        executionResult: result,
      };
    }

    return {
      action: updatedAction,
    };
  }
}
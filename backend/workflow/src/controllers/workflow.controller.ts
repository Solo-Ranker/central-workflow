import { type Context } from 'hono';
import { WorkflowService } from '../services/workflow.service.js';
import {
  createWorkflowActionSchema,
  reviewActionSchema,
  listActionsQuerySchema,
} from '../validators/workflow.validator.js';
import { ActionStatus } from '../types/workflow.type.js';

export class WorkflowController {
  private workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
  }

  async createAction(c: Context) {
    try {
      const body = await c.req.json();
      
      // Validate request body
      const validationResult = createWorkflowActionSchema.safeParse(body);
      if (!validationResult.success) {
        return c.json(
          {
            success: false,
            error: 'Validation failed',
            details: validationResult.error.errors,
          },
          400
        );
      }

      const { actionType, payload, makerId } = validationResult.data;

      const action = await this.workflowService.createAction(actionType, payload, makerId);

      return c.json(
        {
          success: true,
          message: 'Workflow action created successfully',
          data: action,
        },
        201
      );
    } catch (error) {
      console.error('Error creating action:', error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create action',
        },
        500
      );
    }
  }

  async listActions(c: Context) {
    try {
      const query = c.req.query();
      
      // Validate query parameters
      const validationResult = listActionsQuerySchema.safeParse(query);
      if (!validationResult.success) {
        return c.json(
          {
            success: false,
            error: 'Invalid query parameters',
            details: validationResult.error.errors,
          },
          400
        );
      }

      const filters = validationResult.data;
      const result = await this.workflowService.listActions(filters);

      return c.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error listing actions:', error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to list actions',
        },
        500
      );
    }
  }

  async getActionDetail(c: Context) {
    try {
      const actionId = c.req.param('id');

      if (!actionId) {
        return c.json(
          {
            success: false,
            error: 'Action ID is required',
          },
          400
        );
      }

      const action = await this.workflowService.getActionById(actionId);

      return c.json({
        success: true,
        data: action,
      });
    } catch (error) {
      console.error('Error getting action detail:', error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get action detail',
        },
        error instanceof Error && error.message.includes('not found') ? 404 : 500
      );
    }
  }

  async reviewAction(c: Context) {
    try {
      const actionId = c.req.param('id');
      const body = await c.req.json();

      if (!actionId) {
        return c.json(
          {
            success: false,
            error: 'Action ID is required',
          },
          400
        );
      }

      // Validate request body
      const validationResult = reviewActionSchema.safeParse(body);
      if (!validationResult.success) {
        return c.json(
          {
            success: false,
            error: 'Validation failed',
            details: validationResult.error.errors,
          },
          400
        );
      }

      const { status, checkerId, reviewComment } = validationResult.data;

      const result = await this.workflowService.reviewAction(
        actionId,
        checkerId,
        status,
        reviewComment
      );

      const message = status === ActionStatus.APPROVED 
        ? 'Action approved and executed successfully'
        : 'Action rejected successfully';

      return c.json({
        success: true,
        message,
        data: result,
      });
    } catch (error) {
      console.error('Error reviewing action:', error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to review action',
        },
        error instanceof Error && error.message.includes('not found') ? 404 : 500
      );
    }
  }
}
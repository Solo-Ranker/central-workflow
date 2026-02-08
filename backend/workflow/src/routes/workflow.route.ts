import { Hono, type Context } from 'hono';
import { WorkflowController } from '../controllers/workflow.controller.js';
import { ActionTypesController } from '../controllers/action-types.controller.js';
import { jwtMiddleware, requireRole } from '../middlewares/auth.middleware.js';

const workflowRoutes = new Hono();

// Apply JWT middleware to all workflow routes
workflowRoutes.use('*', jwtMiddleware);

const workflowController = new WorkflowController();
const actionTypesController = new ActionTypesController();

/**
 * @route GET /api/workflow/action-types
 * @description Get all available action types with metadata
 */
workflowRoutes.get('/action-types', (c: Context) => actionTypesController.getActionTypes(c));

/**
 * @route POST /api/workflow/actions
 * @description Create a new workflow action (maker creates an action)
 * @body {
 *   actionType: string,
 *   payload: object,
 *   makerId: string
 * }
 */
workflowRoutes.post('/actions', requireRole('MAKER'), (c: Context) => workflowController.createAction(c));

/**
 * @route GET /api/workflow/actions
 * @description List all workflow actions with optional filters
 * @query {
 *   status?: 'pending' | 'approved' | 'rejected',
 *   actionType?: 'create_user' | 'create_account' | 'create_promotion',
 *   page?: number,
 *   limit?: number
 * }
 */
workflowRoutes.get('/actions', (c: Context) => workflowController.listActions(c));

/**
 * @route GET /api/workflow/actions/:id
 * @description Get a specific workflow action detail by ID
 * @param id - Action ID
 */
workflowRoutes.get('/actions/:id', (c: Context) => workflowController.getActionDetail(c));

/**
 * @route POST /api/workflow/actions/:id/review
 * @description Review a workflow action (checker approves or rejects)
 * @param id - Action ID
 * @body {
 *   status: 'approved' | 'rejected',
 *   checkerId: string,
 *   reviewComment?: string
 * }
 */
workflowRoutes.post('/actions/:id/review', requireRole('CHECKER'), (c: Context) => workflowController.reviewAction(c));

export default workflowRoutes;
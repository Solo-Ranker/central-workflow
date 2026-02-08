const API_URL = process.env.REACT_APP_API_URL!;

function getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export interface WorkflowAction {
    id: string;
    actionType: string;
    status: 'pending' | 'approved' | 'rejected';
    payload: any;
    makerId: string;
    checkerId?: string;
    reviewComment?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ActionTypeMetadata {
    actionType: string;
    name: string;
    description: string;
    category: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

/**
 * Get all available action types with metadata
 */
export async function getActionTypes(): Promise<ActionTypeMetadata[]> {
    const response = await fetch(`${API_URL}/api/workflow/action-types`, {
        headers: getAuthHeaders(),
    });
    const data: ApiResponse<ActionTypeMetadata[]> = await response.json();

    if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch action types');
    }

    return data.data;
}

/**
 * Create a new workflow action
 */
export async function createAction(
    actionType: string,
    payload: any,
    makerId: string
): Promise<WorkflowAction> {
    const response = await fetch(`${API_URL}/api/workflow/actions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            actionType,
            payload,
            makerId,
        }),
    });

    const data: ApiResponse<WorkflowAction> = await response.json();

    if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to create action');
    }

    return data.data;
}

/**
 * List workflow actions with optional filters
 */
export async function listActions(filters?: {
    status?: 'pending' | 'approved' | 'rejected';
    actionType?: string;
    page?: number;
    limit?: number;
}): Promise<PaginatedResponse<WorkflowAction>> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}/api/workflow/actions?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to fetch actions');
    }

    return data;
}

/**
 * Get a specific workflow action by ID
 */
export async function getActionById(actionId: string): Promise<WorkflowAction> {
    const response = await fetch(`${API_URL}/api/workflow/actions/${actionId}`, {
        headers: getAuthHeaders(),
    });
    const data: ApiResponse<WorkflowAction> = await response.json();

    if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch action');
    }

    return data.data;
}

/**
 * Review a workflow action (approve or reject)
 */
export async function reviewAction(
    actionId: string,
    status: 'approved' | 'rejected',
    checkerId: string,
    reviewComment?: string
): Promise<{ action: WorkflowAction; executionResult?: any }> {
    const response = await fetch(`${API_URL}/api/workflow/actions/${actionId}/review`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            status,
            checkerId,
            reviewComment,
        }),
    });

    const data: ApiResponse<{ action: WorkflowAction; executionResult?: any }> = await response.json();

    if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to review action');
    }

    return data.data;
}

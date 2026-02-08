import { WorkflowComponentRegistration } from 'shared-types';

class ComponentRegistry {
    private registrations = new Map<string, WorkflowComponentRegistration>();

    /**
     * Register a workflow component from a micro frontend
     */
    register(registration: WorkflowComponentRegistration): void {
        if (this.registrations.has(registration.actionType)) {
            console.warn(`Component for action type "${registration.actionType}" is already registered. Overwriting.`);
        }

        this.registrations.set(registration.actionType, registration);
        console.log(`Registered workflow component: ${registration.actionType}`, registration.metadata);
    }

    /**
     * Get a registered component by action type
     */
    getRegistration(actionType: string): WorkflowComponentRegistration | undefined {
        return this.registrations.get(actionType);
    }

    /**
     * Get all registered components
     */
    getAllRegistrations(): WorkflowComponentRegistration[] {
        return Array.from(this.registrations.values());
    }

    /**
     * Check if an action type is registered
     */
    hasRegistration(actionType: string): boolean {
        return this.registrations.has(actionType);
    }

    /**
     * Get all registered action types
     */
    getActionTypes(): string[] {
        return Array.from(this.registrations.keys());
    }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry();

// Export the class for testing purposes
export { ComponentRegistry };

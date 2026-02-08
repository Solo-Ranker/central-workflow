import React, { useState, useEffect } from 'react';
import { componentRegistry } from '../../lib/registry';
import { createAction } from '../../lib/api';
import { CreateFormProps } from 'shared-types';

interface CreateFormFactoryProps {
    actionType: string;
    makerId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateFormFactory: React.FC<CreateFormFactoryProps> = ({
    actionType,
    makerId,
    onSuccess,
    onCancel,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const registration = componentRegistry.getRegistration(actionType);

    if (!registration) {
        return (
            <div style={{ padding: '20px', border: '1px solid #f44336', borderRadius: '4px', backgroundColor: '#ffebee' }}>
                <h3 style={{ color: '#c62828', margin: '0 0 10px 0' }}>Component Not Found</h3>
                <p style={{ margin: 0 }}>
                    No component registered for action type: <strong>{actionType}</strong>
                </p>
            </div>
        );
    }

    const CreateForm = registration.components.CreateForm;

    const handleSubmit = async (payload: any) => {
        setIsLoading(true);
        setError(null);

        try {
            await createAction(actionType, payload, makerId);
            onSuccess();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create action';
            setError(errorMessage);
            console.error('Error creating action:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formProps: CreateFormProps = {
        onSubmit: handleSubmit,
        onCancel,
    };

    return (
        <div>
            {error && (
                <div style={{
                    padding: '12px',
                    marginBottom: '16px',
                    border: '1px solid #f44336',
                    borderRadius: '4px',
                    backgroundColor: '#ffebee',
                    color: '#c62828'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {isLoading && (
                <div style={{
                    padding: '12px',
                    marginBottom: '16px',
                    border: '1px solid #2196f3',
                    borderRadius: '4px',
                    backgroundColor: '#e3f2fd',
                    color: '#1565c0'
                }}>
                    Creating action...
                </div>
            )}

            <CreateForm {...formProps} />
        </div>
    );
};

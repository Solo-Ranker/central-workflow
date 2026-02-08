import React, { useState, useEffect } from 'react';
import { CreateFormFactory } from '../components/WorkflowFactory';
import { getActionTypes, ActionTypeMetadata } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CreateActionPage: React.FC = () => {
    const navigate = useNavigate();

    const [actionTypes, setActionTypes] = useState<ActionTypeMetadata[]>([]);
    const [selectedActionType, setSelectedActionType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const makerId = user?.id || 'INVALID_MAKER_ID';
    

    useEffect(() => {
        loadActionTypes();
    }, []);

    const loadActionTypes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const types = await getActionTypes();
            setActionTypes(types);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load action types';
            setError(errorMessage);
            console.error('Error loading action types:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccess = () => {
        // Navigate to actions list
        navigate('/actions');
    };

    const handleCancel = () => {
        setSelectedActionType(null);
    };

    if (isLoading) {
        return (
            <div style={{ padding: '20px' }}>
                <h1>Create New Action</h1>
                <p>Loading action types...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <h1>Create New Action</h1>
                <div style={{ padding: '12px', border: '1px solid #f44336', borderRadius: '4px', backgroundColor: '#ffebee', color: '#c62828' }}>
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Create New Action</h1>

            {!selectedActionType ? (
                <div>
                    <p>Select the type of action you want to create:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginTop: '20px' }}>
                        {actionTypes.map((actionType) => (
                            <div
                                key={actionType.actionType}
                                onClick={() => setSelectedActionType(actionType.actionType)}
                                style={{
                                    padding: '20px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#fff',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#2196f3';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>{actionType.name}</h3>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>{actionType.description}</p>
                                <span style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>{actionType.category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '8px 16px',
                            marginBottom: '20px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        ← Back to Action Types
                    </button>

                    <CreateFormFactory
                        actionType={selectedActionType}
                        makerId={makerId}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { componentRegistry } from '../../lib/registry';
import { getActionById, reviewAction, WorkflowAction } from '../../lib/api';
import { DetailViewProps } from 'shared-types';
import { useAuth } from '../../context/AuthContext';

interface DetailViewFactoryProps {
    actionId: string;
    checkerId: string;
    onReviewComplete: () => void;
}

export const DetailViewFactory: React.FC<DetailViewFactoryProps> = ({
    actionId,
    checkerId,
    onReviewComplete,
}) => {
    const { isChecker } = useAuth();
    const [action, setAction] = useState<WorkflowAction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReviewing, setIsReviewing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAction();
    }, [actionId]);

    const loadAction = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getActionById(actionId);
            setAction(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load action';
            setError(errorMessage);
            console.error('Error loading action:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (comment?: string) => {
        if (!action) return;

        setIsReviewing(true);
        setError(null);

        try {
            await reviewAction(actionId, 'approved', checkerId, comment);
            loadAction(); // Refresh state
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to approve action';
            setError(errorMessage);
            console.error('Error approving action:', err);
        } finally {
            setIsReviewing(false);
        }
    };

    const handleReject = async (comment: string) => {
        if (!action) return;

        setIsReviewing(true);
        setError(null);

        try {
            await reviewAction(actionId, 'rejected', checkerId, comment);
            loadAction(); // Refresh state
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reject action';
            setError(errorMessage);
            console.error('Error rejecting action:', err);
        } finally {
            setIsReviewing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center text-slate-500">
                <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                Loading action details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 m-4">
                <h3 className="font-bold mb-2">Error Loading Action</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (!action) {
        return (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 m-4">
                <p>Action not found</p>
            </div>
        );
    }

    const registration = componentRegistry.getRegistration(action.actionType);

    if (!registration) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 m-4">
                <h3 className="font-bold mb-2">Component Not Found</h3>
                <p>No component registered for action type: <strong>{action.actionType}</strong></p>
            </div>
        );
    }

    const DetailView = registration.components.DetailView;

    // Determine if current user can review this action
    // Real RBAC: Status must be pending, user cannot be the maker, AND user must have CHECKER role
    const canReview = action.status === 'pending' && action.makerId !== checkerId && isChecker;

    const detailViewProps: DetailViewProps = {
        isChecker: isChecker,
        data: action.payload,
        status: action.status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED',
        onApprove: canReview ? handleApprove : () => console.error("Can't approve this action"),
        onReject: canReview ? handleReject : () => console.error("Can't reject this action"),
    };

    return (
        <div className="p-6">
            {/* Action Metadata Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-medium">Action Type</span>
                        <span className="font-bold text-slate-900">{registration.metadata.name}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${action.status === 'approved' ? 'bg-green-100 text-green-700' :
                            action.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            {action.status}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-medium">Maker ID</span>
                        <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-slate-200 w-fit">{action.makerId}</span>
                    </div>

                    {action.checkerId && (
                        <div className="flex flex-col gap-1">
                            <span className="text-slate-500 font-medium">Checker ID</span>
                            <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-slate-200 w-fit">{action.checkerId}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-medium">Created At</span>
                        <span className="text-slate-700 font-medium">{new Date(action.createdAt).toLocaleString()}</span>
                    </div>

                    {action.reviewedAt && (
                        <div className="flex flex-col gap-1">
                            <span className="text-slate-500 font-medium">Reviewed At</span>
                            <span className="text-slate-700 font-medium">{new Date(action.reviewedAt).toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {action.reviewComment && (
                    <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Review Comment</span>
                        <p className="text-slate-700 italic">"{action.reviewComment}"</p>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm">
                    <div className="flex items-center gap-2 font-bold mb-1">
                        <span>Transaction Failed</span>
                    </div>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Reviewing Indicator */}
            {isReviewing && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-r-lg shadow-sm animate-pulse">
                    <p className="font-bold">Processing review...</p>
                </div>
            )}

            {/* Role-based restriction note */}
            {!canReview && action.status === 'pending' && (
                <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 rounded-r-lg shadow-sm">
                    <div className="font-bold flex items-center gap-2">
                        <span>Review unavailable</span>
                    </div>
                    <p className="text-sm">
                        {action.makerId === checkerId
                            ? "You cannot review actions that you created yourself."
                            : !isChecker
                                ? "Only users with the CHECKER role can approve or reject actions."
                                : "This action is no longer pending."}
                    </p>
                </div>
            )}

            {/* Detail View Component */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <DetailView {...detailViewProps} />
            </div>
        </div>
    );
};

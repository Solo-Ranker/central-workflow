import React from 'react';
import { DetailViewFactory } from '../components/WorkflowFactory';
import { ChevronLeft, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ActionDetailPageProps {
    actionId: string;
}

export const ActionDetailPage: React.FC<ActionDetailPageProps> = ({ actionId }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const checkerId = user?.id || 'INVALID_CHECKER_ID';

    const handleReviewComplete = () => {
        navigate('/actions');
    };

    const handleBackToList = () => {
        navigate('/actions');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={handleBackToList}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Actions List
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Info size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Review Request</h1>
                    <p className="text-slate-500 text-sm">Action ID: <span className="font-mono text-xs">{actionId}</span></p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-1">
                <DetailViewFactory
                    actionId={actionId}
                    checkerId={checkerId}
                    onReviewComplete={handleReviewComplete}
                />
            </div>
        </div>
    );
};

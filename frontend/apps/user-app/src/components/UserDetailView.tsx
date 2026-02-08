import React, { useState } from 'react';
import { DetailViewProps } from 'shared-types';
import {
    User,
    Mail,
    AtSign,
    CheckCircle,
    XCircle,
    MessageSquare,
    AlertTriangle,
    Shield
} from 'lucide-react';

interface UserPayload {
    email: string;
    username: string;
    fullName?: string;
}

export const UserDetailView: React.FC<DetailViewProps> = ({
    isChecker,
    data,
    status,
    onApprove,
    onReject,
}) => {
    const [reviewComment, setReviewComment] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const userPayload = data as UserPayload;

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await onApprove();
        } catch (error) {
            console.error('Error approving:', error);
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!reviewComment.trim()) {
            return;
        }

        setIsProcessing(true);
        try {
            await onReject(reviewComment);
        } catch (error) {
            console.error('Error rejecting:', error);
            setIsProcessing(false);
        }
    };

    const canReview = status === 'PENDING' && isChecker;

    return (
        <div className="bg-white">
            {/* Header section */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <User size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">User Profile Details</h3>
                </div>
                {status !== 'PENDING' && (
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${status === 'APPROVED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {status === 'APPROVED' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        <span className="capitalize">{status.toLowerCase()}</span>
                    </div>
                )}
            </div>

            {/* Details Grid */}
            <div className="p-6 space-y-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <Shield size={40} />
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                            <div className="text-slate-900 font-bold text-lg">
                                {userPayload.fullName || 'Not Provided'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
                            <div className="flex items-center gap-2 text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 w-fit">
                                <AtSign size={14} />
                                {userPayload.username}
                            </div>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Mail size={16} className="text-slate-400" />
                                {userPayload.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Section */}
            {canReview && (
                <div className="mt-2 p-6 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare size={18} className="text-slate-400" />
                        <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Compliance Review</h4>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px] shadow-sm resize-none"
                                placeholder="Add compliance notes or reason for rejection..."
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50 active:scale-95 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Approve Account
                                    </>
                                )}
                            </button>

                            {!showRejectDialog ? (
                                <button
                                    onClick={() => setShowRejectDialog(true)}
                                    disabled={isProcessing}
                                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-red-600 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-all disabled:opacity-50 active:scale-95"
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                            ) : (
                                <div className="flex-1 md:flex-initial flex items-center gap-2">
                                    <button
                                        onClick={handleReject}
                                        disabled={isProcessing || !reviewComment.trim()}
                                        className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-8 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50 active:scale-95 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                                    >
                                        Confirm Rejection
                                    </button>
                                    <button
                                        onClick={() => setShowRejectDialog(false)}
                                        disabled={isProcessing}
                                        className="px-4 py-2.5 text-slate-500 font-medium hover:text-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {!reviewComment.trim() && showRejectDialog && (
                            <div className="flex items-center gap-2 text-red-500 text-xs font-medium animate-pulse">
                                <AlertTriangle size={14} />
                                Please specify the reason for rejection in the comments above.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {status !== 'PENDING' && (
                <div className={`mx-6 my-4 p-4 rounded-xl border flex items-center gap-3 ${status === 'APPROVED'
                        ? 'bg-green-50 border-green-100 text-green-800'
                        : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                    <div className={`p-1.5 rounded-full ${status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {status === 'APPROVED' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </div>
                    <div>
                        <p className="text-sm font-bold shadow-sm">Process Finalized</p>
                        <p className="text-xs opacity-80">This user creation request has been {status.toLowerCase()} and archived.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useState } from 'react';
import { DetailViewProps } from 'shared-types';
import {
    CreditCard,
    DollarSign,
    Hash,
    CheckCircle,
    XCircle,
    Send,
    MessageSquare,
    AlertTriangle
} from 'lucide-react';

interface AccountPayload {
    userId: string;
    accountNumber: string;
    accountType: string;
    balance?: string;
    currency?: string;
}

export const AccountDetailView: React.FC<DetailViewProps> = ({
    isChecker,
    data,
    status,
    onApprove,
    onReject,
}) => {
    const [reviewComment, setReviewComment] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const accountPayload = data as AccountPayload;

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
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <CreditCard size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Account Information</h3>
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
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Holder (User ID)</label>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold">U</div>
                        {accountPayload.userId}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Number</label>
                    <div className="flex items-center gap-2 text-slate-800 font-mono text-sm tracking-tight bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Hash size={14} className="text-slate-400" />
                        {accountPayload.accountNumber}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Type</label>
                    <div className="text-slate-700 font-medium capitalize flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${accountPayload.accountType === 'savings' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                        {accountPayload.accountType} Account
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starting Balance</label>
                    <div className="text-slate-900 font-bold text-xl flex items-center gap-1">
                        <span className="text-slate-400 font-medium text-sm mr-1">{accountPayload.currency || 'USD'}</span>
                        {Number(accountPayload.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Review Section */}
            {canReview && (
                <div className="mt-2 p-6 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare size={18} className="text-slate-400" />
                        <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Review Action</h4>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[100px] shadow-sm resize-none"
                                placeholder="Add professional review notes or reason for rejection..."
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10 disabled:opacity-50 active:scale-95"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Approve Action
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
                                    Reject Request
                                </button>
                            ) : (
                                <div className="flex-1 md:flex-initial flex items-center gap-2">
                                    <button
                                        onClick={handleReject}
                                        disabled={isProcessing || !reviewComment.trim()}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-md shadow-red-600/10 disabled:opacity-50 active:scale-95"
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
                                A comment is required to reject this request.
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
                        <p className="text-sm font-bold">This request was {status.toLowerCase()}</p>
                        <p className="text-xs opacity-80">The processing of this action is complete and cannot be modified.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

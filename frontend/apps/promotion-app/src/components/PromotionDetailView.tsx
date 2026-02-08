import React, { useState } from "react";
import { DetailViewProps } from "shared-types";
import {
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Gift,
  FileText,
} from "lucide-react";

interface PromotionPayload {
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: string;
  startDate: string;
  endDate: string;
}

export const PromotionDetailView: React.FC<DetailViewProps> = ({
  isChecker,
  data,
  status,
  onApprove,
  onReject,
}) => {
  const [reviewComment, setReviewComment] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const promotionPayload = data as PromotionPayload;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove();
    } catch (error) {
      console.error("Error approving:", error);
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
      console.error("Error rejecting:", error);
      setIsProcessing(false);
    }
  };

  const canReview = status === "PENDING" && isChecker;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const durationDays = Math.ceil(
    (new Date(promotionPayload.endDate).getTime() -
      new Date(promotionPayload.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="bg-white">
      {/* Header section */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <Gift size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Promotion Campaign
          </h3>
        </div>
        {status !== "PENDING" && (
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              status === "APPROVED"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {status === "APPROVED" ? (
              <CheckCircle size={14} />
            ) : (
              <XCircle size={14} />
            )}
            <span className="capitalize">{status.toLowerCase()}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Basic Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h4 className="text-2xl font-bold text-slate-900 mb-2">
                {promotionPayload.name}
              </h4>
              <p className="text-slate-500 leading-relaxed italic">
                {promotionPayload.description ||
                  "No description provided for this campaign."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                  Promo Code
                </label>
                <div className="flex items-center gap-2 text-blue-600 font-mono font-bold text-lg">
                  <Tag size={18} />
                  {promotionPayload.code}
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 block">
                  Offer Value
                </label>
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
                  {promotionPayload.discountType === "percentage" ? (
                    <Percent size={18} />
                  ) : (
                    <DollarSign size={18} />
                  )}
                  {promotionPayload.discountValue}
                  <span className="text-xs font-medium text-emerald-600/70 ml-1">
                    {promotionPayload.discountType === "percentage"
                      ? "OFF"
                      : "Discount"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-200 pb-2">
              <Clock size={16} className="text-slate-400" />
              Timeline
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Start Date
                  </label>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatDate(promotionPayload.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-400"></div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    End Date
                  </label>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatDate(promotionPayload.endDate)}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-xs text-slate-400 font-medium">
                    Approx. Duration
                  </span>
                  <p className="text-lg font-bold text-slate-800">
                    {durationDays} Days
                  </p>
                </div>
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
            <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">
              Marketing Approval
            </h4>
          </div>

          <div className="space-y-4">
            {/* Comment Box */}
            <div className="relative">
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500
                    transition-all min-h-[100px] shadow-sm resize-none"
                placeholder="Add comments regarding campaign validity or reject reasons..."
                disabled={isProcessing}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {/* Approve */}
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3
                    bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                    rounded-xl font-bold
                    hover:from-emerald-600 hover:to-emerald-700
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                    transition-all shadow-lg shadow-emerald-600/20
                    active:scale-95 disabled:opacity-50 disabled:shadow-none bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Launch Promotion
                  </>
                )}
              </button>

              {/* Reject */}
              {!showRejectDialog ? (
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isProcessing}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5
                        border border-red-300 text-red-600 rounded-lg font-bold
                        hover:bg-red-50 hover:border-red-400
                        focus:outline-none focus:ring-2 focus:ring-red-500/20
                        transition-all disabled:opacity-50 active:scale-95"
                >
                  <XCircle size={18} />
                  Reject
                </button>
              ) : (
                <div className="flex-1 md:flex-initial flex items-center gap-2">
                  <button
                    onClick={handleReject}
                    disabled={isProcessing || !reviewComment.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-2.5
                            bg-red-600 text-white rounded-lg font-bold
                            hover:bg-red-700
                            focus:outline-none focus:ring-2 focus:ring-red-500/30
                            transition-all shadow-md shadow-red-600/20
                            disabled:opacity-50 active:scale-95"
                  >
                    Confirm Rejection
                  </button>

                  <button
                    onClick={() => setShowRejectDialog(false)}
                    disabled={isProcessing}
                    className="px-4 py-2.5 text-slate-500 font-medium
                            hover:text-slate-800 hover:bg-slate-100 rounded-lg
                            transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Validation */}
            {!reviewComment.trim() && showRejectDialog && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-medium animate-pulse">
                <AlertTriangle size={14} />
                Comment required for rejection.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Banner */}
      {status !== "PENDING" && (
        <div
          className={`mx-6 my-4 p-4 rounded-xl border flex items-center gap-3 ${
            status === "APPROVED"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-red-50 border-red-100 text-red-800"
          }`}
        >
          <div
            className={`p-1.5 rounded-full ${
              status === "APPROVED"
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {status === "APPROVED" ? (
              <CheckCircle size={18} />
            ) : (
              <XCircle size={18} />
            )}
          </div>

          <div>
            <p className="text-sm font-bold capitalize">
              Campaign {status.toLowerCase()}
            </p>
            <p className="text-xs opacity-80">
              This record is now locked for audit purposes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { CreateFormProps } from 'shared-types';
import {
    CreditCard,
    User,
    Hash,
    Briefcase,
    DollarSign,
    Send,
    X,
    AlertCircle,
    PiggyBank
} from 'lucide-react';

export const CreateAccountForm: React.FC<CreateFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        userId: '',
        accountNumber: '',
        accountType: 'savings',
        balance: '',
        currency: 'USD',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.userId) {
            newErrors.userId = 'User ID is required';
        }

        if (!formData.accountNumber) {
            newErrors.accountNumber = 'Account number is required';
        } else if (!/^\d{10,12}$/.test(formData.accountNumber)) {
            newErrors.accountNumber = 'Account number must be 10-12 digits';
        }

        if (!formData.accountType) {
            newErrors.accountType = 'Account type is required';
        }

        if (formData.balance && isNaN(Number(formData.balance))) {
            newErrors.balance = 'Balance must be a valid number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                actionType: 'create_account' as const,
                userId: formData.userId,
                accountNumber: formData.accountNumber,
                accountType: formData.accountType,
                ...(formData.balance && { balance: formData.balance }),
                ...(formData.currency && { currency: formData.currency }),
            };

            await onSubmit(payload);
        } catch (error) {
            console.error('Error submitting form:', error);
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-xl mx-auto">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg">
                        <PiggyBank size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Provision New Account</h2>
                </div>
                <p className="text-sm text-slate-500">
                    Enter the financial parameters for the new account. This request initiates a standard audit workflow.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User ID */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <User size={12} />
                            User ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.userId}
                            onChange={(e) => handleChange('userId', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.userId ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300`}
                            placeholder="e.g. USER-001"
                            disabled={isSubmitting}
                        />
                        {errors.userId && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <AlertCircle size={12} />
                                {errors.userId}
                            </span>
                        )}
                    </div>

                    {/* Account Number */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Hash size={12} />
                            Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => handleChange('accountNumber', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.accountNumber ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300`}
                            placeholder="10-12 digit number"
                            disabled={isSubmitting}
                        />
                        {errors.accountNumber && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <AlertCircle size={12} />
                                {errors.accountNumber}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Briefcase size={12} />
                            Account Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.accountType}
                            onChange={(e) => handleChange('accountType', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                            disabled={isSubmitting}
                        >
                            <option value="savings">Savings Account</option>
                            <option value="checking">Checking Account</option>
                            <option value="investment">Investment Account</option>
                        </select>
                    </div>

                    {/* Currency */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currency</label>
                        <select
                            value={formData.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                            disabled={isSubmitting}
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                        </select>
                    </div>
                </div>

                {/* Balance Field */}
                <div className="space-y-1.5 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <DollarSign size={12} />
                        Initial Funding Balance
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</div>
                        <input
                            type="text"
                            value={formData.balance}
                            onChange={(e) => handleChange('balance', e.target.value)}
                            className={`w-full pl-8 pr-4 py-3 bg-white border ${errors.balance ? 'border-red-300' : 'border-slate-200'} rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm`}
                            placeholder="0.00"
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.balance && (
                        <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium pt-1">
                            <AlertCircle size={12} />
                            {errors.balance}
                        </span>
                    )}
                </div>

                {/* Actions */}
                 <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Send size={18} />
                                Submit for Review
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

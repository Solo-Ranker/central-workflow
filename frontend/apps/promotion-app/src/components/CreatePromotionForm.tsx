import React, { useState } from 'react';
import { CreateFormProps } from 'shared-types';
import {
    Plus,
    Tag,
    FileText,
    Calendar,
    Send,
    X,
    AlertCircle,
    Percent,
    DollarSign
} from 'lucide-react';

export const CreatePromotionForm: React.FC<CreateFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        startDate: '',
        endDate: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code) {
            newErrors.code = 'Promotion code is required';
        } else if (!/^[A-Z0-9_-]{3,20}$/.test(formData.code)) {
            newErrors.code = 'Code must be 3-20 characters (uppercase, numbers, - or _)';
        }

        if (!formData.name) {
            newErrors.name = 'Promotion name is required';
        }

        if (!formData.discountValue) {
            newErrors.discountValue = 'Discount value is required';
        } else if (isNaN(Number(formData.discountValue)) || Number(formData.discountValue) <= 0) {
            newErrors.discountValue = 'Discount value must be a positive number';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'End date is required';
        }

        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
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
                actionType: 'create_promotion' as const,
                code: formData.code,
                name: formData.name,
                ...(formData.description && { description: formData.description }),
                discountType: formData.discountType,
                discountValue: formData.discountValue,
                startDate: formData.startDate,
                endDate: formData.endDate,
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl mx-auto">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-blue-600 text-white rounded-lg">
                        <Plus size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Launch New Campaign</h2>
                </div>
                <p className="text-sm text-slate-500">
                    Define the parameters for your promotional offer. All campaigns require managerial review.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Promo Code */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Tag size={12} />
                            Promotion Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.code ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase placeholder:text-slate-300`}
                            placeholder="WINTER2024"
                            disabled={isSubmitting}
                        />
                        {errors.code && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <AlertCircle size={12} />
                                {errors.code}
                            </span>
                        )}
                    </div>

                    {/* Promo Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={12} />
                            Campaign Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.name ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300`}
                            placeholder="e.g. Early Bird Special"
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <AlertCircle size={12} />
                                {errors.name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[100px] resize-none placeholder:text-slate-300"
                        placeholder="Detailed information about the promotion..."
                        disabled={isSubmitting}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                    {/* Discount Type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Mechanics</label>
                        <select
                            value={formData.discountType}
                            onChange={(e) => handleChange('discountType', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            disabled={isSubmitting}
                        >
                            <option value="percentage">Percentage Off (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                        </select>
                    </div>

                    {/* Discount Value */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            {formData.discountType === 'percentage' ? <Percent size={12} /> : <DollarSign size={12} />}
                            Offer Value <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.discountValue}
                            onChange={(e) => handleChange('discountValue', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-white border ${errors.discountValue ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300`}
                            placeholder={formData.discountType === 'percentage' ? '20' : '49.99'}
                            disabled={isSubmitting}
                        />
                        {errors.discountValue && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <AlertCircle size={12} />
                                {errors.discountValue}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={12} />
                            Lifecycle Start <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.startDate ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all`}
                            disabled={isSubmitting}
                        />
                        {errors.startDate && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <AlertCircle size={12} />
                                {errors.startDate}
                            </span>
                        )}
                    </div>

                    {/* End Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={12} />
                            Lifecycle End <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.endDate ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all`}
                            disabled={isSubmitting}
                        />
                        {errors.endDate && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <AlertCircle size={12} />
                                {errors.endDate}
                            </span>
                        )}
                    </div>
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

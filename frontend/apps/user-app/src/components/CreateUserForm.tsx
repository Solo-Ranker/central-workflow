import React, { useState } from 'react';
import { CreateFormProps } from 'shared-types';
import {
    UserPlus,
    Mail,
    AtSign,
    User,
    Send,
    X,
    AlertCircle
} from 'lucide-react';

export const CreateUserForm: React.FC<CreateFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        fullName: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.username) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
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
                actionType: 'create_user' as const,
                email: formData.email,
                username: formData.username,
                ...(formData.fullName && { fullName: formData.fullName }),
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-lg mx-auto">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-indigo-600 text-white rounded-lg">
                        <UserPlus size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">New User Registration</h2>
                </div>
                <p className="text-sm text-slate-500">
                    Register a new participant for the workflow. This record will be active once approved.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Mail size={12} />
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.email ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300`}
                        placeholder="e.g. alex.smith@company.com"
                        disabled={isSubmitting}
                    />
                    {errors.email && (
                        <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                            <AlertCircle size={12} />
                            {errors.email}
                        </span>
                    )}
                </div>

                {/* Username Field */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <AtSign size={12} />
                        Username <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.username ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300`}
                        placeholder="e.g. asmith_24"
                        disabled={isSubmitting}
                    />
                    {errors.username && (
                        <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                            <AlertCircle size={12} />
                            {errors.username}
                        </span>
                    )}
                </div>

                {/* Full Name Field */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <User size={12} />
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                        placeholder="e.g. Alex Smith"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Action Buttons */}
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

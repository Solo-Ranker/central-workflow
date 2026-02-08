import React, { useState, useEffect } from 'react';
import {
    listActions,
    WorkflowAction,
    getActionTypes,
    ActionTypeMetadata
} from '../lib/api';
import {
    Search,
    Filter,
    Plus,
    Calendar,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ActionsListPage: React.FC = () => {
    const navigate = useNavigate();

    const [actions, setActions] = useState<WorkflowAction[]>([]);
    const [actionTypes, setActionTypes] = useState<ActionTypeMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('');
    const [actionTypeFilter, setActionTypeFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const limit = 10;

    useEffect(() => {
        loadActionTypes();
    }, []);

    useEffect(() => {
        loadActions();
    }, [statusFilter, actionTypeFilter, page]);

    const loadActionTypes = async () => {
        try {
            const types = await getActionTypes();
            setActionTypes(types);
        } catch (err) {
            console.error('Error loading action types:', err);
        }
    };

    const loadActions = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const filters: any = { page, limit };
            if (statusFilter) filters.status = statusFilter;
            if (actionTypeFilter) filters.actionType = actionTypeFilter;

            const response = await listActions(filters);
            setActions(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load actions';
            setError(errorMessage);
            console.error('Error loading actions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = (actionId: string) => {
        navigate(`/actions/${actionId}`);
    };

    const handleCreateNew = () => {
        navigate('/actions/create')
    };

    const getActionTypeName = (actionType: string) => {
        const metadata = actionTypes.find(at => at.actionType === actionType);
        return metadata?.name || actionType;
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'approved': return {
                bg: 'bg-green-50',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: CheckCircle2
            };
            case 'rejected': return {
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: XCircle
            };
            case 'pending': return {
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                border: 'border-amber-200',
                icon: Clock
            };
            default: return {
                bg: 'bg-slate-50',
                text: 'text-slate-700',
                border: 'border-slate-200',
                icon: AlertCircle
            };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Workflow Actions</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and track all system workflow requests</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    New Action
                </button>
            </div>

            {/* Filters Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search Type</label>
                    <div className="relative">
                        <select
                            value={actionTypeFilter}
                            onChange={(e) => { setActionTypeFilter(e.target.value); setPage(1); }}
                            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                        >
                            <option value="">All Action Types</option>
                            {actionTypes.map(at => (
                                <option key={at.actionType} value={at.actionType}>{at.name}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <Clock className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
                    </div>
                </div>

                <button
                    onClick={() => { setStatusFilter(''); setActionTypeFilter(''); setPage(1); }}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    Reset Filters
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle size={20} />
                    <p className="font-medium text-sm">{error}</p>
                </div>
            )}

            {/* Actions Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 text-sm font-medium">Fetching actions...</p>
                    </div>
                ) : actions.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No actions found</h3>
                        <p className="text-slate-500 mt-1">Try adjusting your filters or create a new action.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Maker</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {actions.map((action) => {
                                    const status = getStatusStyles(action.status);
                                    const StatusIcon = status.icon;
                                    return (
                                        <tr key={action.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                                {action.id.substring(0, 8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700">{getActionTypeName(action.actionType)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border}`}>
                                                    <StatusIcon size={14} />
                                                    <span className="capitalize">{action.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                        {action.makerId.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm">{action.makerId}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                    <Calendar size={14} />
                                                    {new Date(action.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewDetail(action.id)}
                                                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group-hover:translate-x-0.5 transform transition-transform"
                                                >
                                                    View
                                                    <ChevronRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing page <span className="text-slate-900 font-bold">{page}</span> of <span className="text-slate-900 font-bold">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

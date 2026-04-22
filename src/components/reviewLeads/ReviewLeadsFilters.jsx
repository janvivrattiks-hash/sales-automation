import React from 'react';
import { Search, Filter } from 'lucide-react';

const ReviewLeadsFilters = ({ 
    searchTerm, 
    setSearchTerm, 
    categoryFilter, 
    setCategoryFilter, 
    statusFilter, 
    setStatusFilter, 
    categories 
}) => {
    return (
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by business name, email..."
                    className="w-full pl-12 pr-4 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-3 items-center">
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select
                        className="pl-9 pr-8 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-xs font-bold text-gray-500 appearance-none focus:bg-white focus:border-primary/20 outline-none cursor-pointer transition-all uppercase tracking-wider"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {categories.filter(c => c !== "All").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select
                        className="pl-9 pr-8 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-xs font-bold text-gray-500 appearance-none focus:bg-white focus:border-primary/20 outline-none cursor-pointer transition-all uppercase tracking-wider"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Enriched">Enriched</option>
                        <option value="Validated">Validated</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ReviewLeadsFilters;

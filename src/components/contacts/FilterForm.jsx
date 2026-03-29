import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';

const FilterForm = ({ filters, setFilters }) => {
    return (
        <div className="space-y-8 py-2 max-w-lg mx-auto text-left">
            {/* Website Available */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Website Available
                </label>
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    {['Any', 'Yes', 'No'].map((option) => (
                        <button
                            key={option}
                            onClick={() => setFilters({ ...filters, website: option })}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${filters.website === option
                                ? 'bg-white text-primary shadow-sm ring-1 ring-black/[0.02]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Min Google Rating */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-900">Min. Google Rating</label>
                    <span className="bg-primary/5 text-primary text-xs font-black px-2.5 py-1 rounded-lg border border-primary/10">
                        {filters.ratings} ★
                    </span>
                </div>
                <div className="relative pt-2">
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={filters.ratings || 0}
                        onChange={(e) => setFilters({ ...filters, ratings: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(filters.ratings / 5) * 100}%, #f3f4f6 ${(filters.ratings / 5) * 100}%, #f3f4f6 100%)`
                        }}
                    />
                    <div className="flex justify-between mt-4">
                        {[0, 1, 2, 3, 4, 5].map((val) => (
                            <span key={val} className="text-[10px] font-bold text-gray-400">{val}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Parameters */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-900">Additional Parameters</label>
                <div className="relative">
                    <select
                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-500 appearance-none focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all"
                        value={filters.parameter}
                        onChange={(e) => setFilters({ ...filters, parameter: e.target.value })}
                    >
                        <option value="" disabled>Select parameter (e.g., Industry, Size)</option>
                        <option value="industry">Industry</option>
                        <option value="size">Company Size</option>
                        <option value="revenue">Annual Revenue</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronRight size={18} className="rotate-90" />
                    </div>
                </div>
            </div>

            {/* Add More */}
            <button className="flex items-center gap-2 text-primary text-sm font-bold hover:opacity-80 transition-opacity pb-2">
                <Plus size={18} /> Add More
            </button>
        </div>
    );
};

export default FilterForm;

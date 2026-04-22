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

            {/* Category */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-900">Category / Niche</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="e.g., Cafes, Restaurants"
                        value={filters.category || ''}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Reviews */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-900">Minimum Reviews</label>
                <div className="relative">
                    <input
                        type="number"
                        placeholder="e.g., 4000"
                        value={filters.reviews || ''}
                        onChange={(e) => setFilters({ ...filters, reviews: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterForm;

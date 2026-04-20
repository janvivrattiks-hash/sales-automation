import React from 'react';
import { Plus, ChevronRight as ChevronRightIcon, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const FilterModal = ({ isOpen, onClose, filters, setFilters, onApply, isFiltering }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Filter Leads"
            footer={
                <div className="flex items-center justify-end w-full gap-4">
                    <button
                        onClick={onClose}
                        className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={onApply}
                        disabled={isFiltering}
                        className="px-8 flex items-center gap-2"
                    >
                        {isFiltering ? <Loader2 className="animate-spin" size={18} /> : 'Apply Filters'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-8">
                {/* Website Available */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-900">Website Available</label>
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        {['Any', 'Yes', 'No'].map((option) => (
                            <button
                                key={option}
                                onClick={() => setFilters(prev => ({ ...prev, website: option }))}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                    filters.website === option
                                        ? 'bg-white text-primary shadow-sm'
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
                            {filters.minRating}
                        </span>
                    </div>
                    <div className="relative pt-2">
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.1"
                            value={filters.minRating || 0}
                            onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(filters.minRating / 5) * 100}%, #f3f4f6 ${(filters.minRating / 5) * 100}%, #f3f4f6 100%)`
                            }}
                        />
                        <div className="flex justify-between mt-4">
                            {[0, 1, 2, 3, 4, 5].map((val) => (
                                <span key={val} className="text-[10px] font-bold text-gray-400">{val}</span>
                            ))}
                        </div>
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
                            onChange={(e) => setFilters(prev => ({ ...prev, reviews: e.target.value }))}
                            className="w-full pl-4 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default FilterModal;

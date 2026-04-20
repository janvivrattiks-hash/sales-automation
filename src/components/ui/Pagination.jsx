import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange = () => { }
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage);
            // Scroll to top of window when page changes
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    if (totalItems === 0) return null;

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisiblePages - 1);

            if (end === totalPages) {
                start = Math.max(1, end - maxVisiblePages + 1);
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="px-8 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white/50 gap-4">
            <p className="text-xs font-bold text-gray-400">
                Showing <span className="text-gray-900">{startIndex}</span> to <span className="text-gray-900">{endIndex}</span> of <span className="text-gray-900">{totalItems}</span> results
            </p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                >
                    <ChevronLeft size={18} />
                </button>

                {getPageNumbers().map(number => (
                    <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-90 ${currentPage === number
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'
                            }`}
                    >
                        {number}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;

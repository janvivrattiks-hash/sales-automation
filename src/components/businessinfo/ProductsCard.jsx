import React from 'react';
import { Package, Plus, Search } from 'lucide-react';
import ProductItem from './ProductItem';
import { Loader2 } from 'lucide-react';

const ProductsCard = ({ products, isLoading, onAdd, onEdit, onDelete }) => {
    // Ensure products is always an array to avoid errors
    const safeProducts = Array.isArray(products) ? products : [];

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden min-h-[200px]">
            <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <Package size={20} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Products & Services</h3>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-all group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-xs font-black uppercase tracking-widest">Add Product</span>
                </button>
            </div>

            <div className="p-10">
                <div className="py-12 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-gray-50 rounded-[2.5rem] bg-gray-50/30 group hover:bg-gray-50/50 hover:border-blue-100 transition-all duration-500">
                    <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl shadow-black/[0.02] flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Package size={32} />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Product Catalog Management</p>
                        <p className="text-[11px] font-bold text-gray-400 max-w-[240px] leading-relaxed">
                            Configure the products and services your business offering to help the AI personalization.
                        </p>
                    </div>
                    <button
                        onClick={onAdd}
                        className="mt-2 px-8 py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                    >
                        + Add New Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductsCard;

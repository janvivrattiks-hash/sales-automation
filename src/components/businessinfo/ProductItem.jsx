import React from 'react';
import { Package, Pencil, Trash2 } from 'lucide-react';

const ProductItem = ({ product, onEdit, onDelete }) => (
    <div className="p-8 bg-gray-50/50 rounded-3xl border border-transparent hover:border-blue-100 transition-all group relative">
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Package size={22} />
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product / Service</p>
                    <div className="space-y-1">
                        <h4 className="text-xl font-black text-gray-900 leading-tight">{product.name}</h4>
                        <p className="text-sm font-medium text-gray-500 max-w-2xl leading-relaxed">
                            {product.description || 'No description provided.'}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(product)}
                    className="p-2 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    title="Edit Product"
                >
                    <Pencil size={16} />
                </button>
                <button
                    onClick={() => onDelete(product.name)}
                    className="p-2 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                    title="Delete Product"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    </div>
);

export default ProductItem;

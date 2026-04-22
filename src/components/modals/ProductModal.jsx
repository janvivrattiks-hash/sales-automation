import React, { useState, useEffect } from 'react';
import { Package, X, Type, FileText, Upload } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

const ProductInput = ({ label, value, onChange, placeholder, icon: Icon, isTextArea }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className={`absolute left-4 ${isTextArea ? 'top-4' : 'top-1/2 -translate-y-1/2'} text-gray-300 group-focus-within:text-primary transition-colors pointer-events-none`}>
                {Icon && <Icon size={18} />}
            </div>
            {isTextArea ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
            )}
        </div>
    </div>
);

const ProductModal = ({ isOpen, onClose, mode = 'add', currentData, onAdd, onUpdate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && currentData) {
                setName(currentData.name || '');
                setDescription(currentData.description || '');
            } else {
                setName('');
                setDescription('');
                setSelectedFile(null);
            }
        }
    }, [isOpen, mode, currentData]);

    const handleSubmit = async () => {
        console.log(">>> [handleSubmit] start");
        if (!name.trim()) {
            toast.error("Product name is required");
            return;
        }

        console.log(">>> [handleSubmit] validation passed", { name, description, selectedFile });
        setIsSubmitting(true);
        try {
            console.log(">>> [handleSubmit] mode:", mode);
            let success = false;
            if (mode === 'add') {
                console.log(">>> [handleSubmit] calling onAdd");
                success = await onAdd({ name, description }, [], selectedFile);
            } else {
                success = await onUpdate(currentData.name, { name, description });
            }

            console.log(">>> [handleSubmit] success:", success);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error(">>> [handleSubmit] error caught:", error);
        } finally {
            setIsSubmitting(false);
            console.log(">>> [handleSubmit] end");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Add New Product' : 'Edit Product'}
            footer={
                <div className="flex items-center justify-end gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="px-6 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-primary text-white shadow-xl shadow-primary/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 outline-none"
                    >
                        {isSubmitting ? (mode === 'add' ? 'Adding...' : 'Updating...') : (mode === 'add' ? 'Add Product' : 'Update Product')}
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-4 items-center mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Product Catalog</p>
                        <p className="text-xs font-bold text-gray-600">
                            {mode === 'add' ? 'Define a new product or service for your business.' : 'Update the details of your product or service.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <ProductInput
                        label="Product Name"
                        value={name}
                        onChange={setName}
                        placeholder="e.g., Premium Consulting"
                        icon={Type}
                    />
                    <ProductInput
                        label="Description"
                        value={description}
                        onChange={setDescription}
                        placeholder="Describe the value proposition..."
                        icon={FileText}
                        isTextArea
                    />
                    
                    {/* Document Upload section */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Document (Optional)</label>
                        <div className="relative group flex flex-col gap-3">
                            <input
                                type="file"
                                id="product-doc-upload"
                                className="hidden"
                                onChange={(e) => {
                                    if(e.target.files && e.target.files.length > 0) {
                                        setSelectedFile(e.target.files[0]);
                                    }
                                }}
                            />
                            <label 
                                htmlFor="product-doc-upload" 
                                className="w-full flex items-center gap-3 pl-4 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-primary hover:border-primary/20 hover:bg-white transition-all cursor-pointer group"
                            >
                                <Upload size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                                <span>Choose a PDF or Word file...</span>
                            </label>

                            {selectedFile && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 bg-primary/[0.02] border border-primary/10 rounded-2xl flex items-center justify-between group/item">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shadow-primary/5 flex-shrink-0">
                                            <FileText size={18} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-gray-900 truncate">{selectedFile.name}</p>
                                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mt-0.5">
                                                {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedFile(null);
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProductModal;

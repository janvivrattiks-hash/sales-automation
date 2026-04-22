import React from 'react';
import { Building2, Camera, Loader2, Upload, Trash2 } from 'lucide-react';

const EditLogoSection = ({ logoUrl, isUploadingLogo, fileInputRef, onLogoChange, onDeleteLogo }) => (
    <div className="bg-white p-12 text-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/5 via-primary to-primary/5" />

        {/* Avatar Section */}
        <div className="relative inline-block mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-900 flex items-center justify-center relative group">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                        alt="Business Logo"
                    />
                ) : (
                    <div className="w-16 h-16 border-2 border-primary/30 rounded-full flex items-center justify-center border-dashed">
                        <Building2 size={32} className="text-primary/40" />
                    </div>
                )}
                
                {isUploadingLogo && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[px]">
                        <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                )}

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="p-2 bg-primary text-white rounded-full absolute bottom-1 right-1 border-4 border-white shadow-lg z-10 cursor-pointer hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                    <Camera size={14} />
                </button>
            </div>
        </div>

        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Edit Basic Information</h2>
        <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed text-sm mb-8">
            Manage your business profile details and public identity within the automation platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-700 uppercase tracking-widest shadow-lg shadow-black/[0.02] hover:border-primary/20 hover:shadow-primary/5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Upload size={14} className="text-primary" />
                {isUploadingLogo ? 'Processing...' : 'Change Business Photo'}
            </button>
            
            {logoUrl && (
                <button 
                    onClick={onDeleteLogo}
                    disabled={isUploadingLogo}
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-red-50 border border-red-100/50 rounded-2xl text-[10px] font-black text-red-600 uppercase tracking-widest hover:bg-red-100 hover:border-red-200 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                >
                    <Trash2 size={13} />
                    Remove Photo
                </button>
            )}
        </div>

        <input
            type="file"
            ref={fileInputRef}
            onChange={onLogoChange}
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
        />
    </div>
);

export default EditLogoSection;

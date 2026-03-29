import React from 'react';
import { Info, Building2, Camera, Loader2, Rocket } from 'lucide-react';
import InfoItem from './InfoItem';

const BasicInfoCard = ({ businessData, isUploadingLogo, fileInputRef, onLogoChange }) => (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden">
        <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Info size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Basic Information</h3>
            </div>
            <div className="px-3 py-1 bg-emerald-50 rounded-lg text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Active
            </div>
        </div>

        <div className="p-12">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Company Logo Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-900 flex items-center justify-center relative">
                            {businessData.logoUrl ? (
                                <img 
                                    src={businessData.logoUrl} 
                                    alt="Company Logo" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 border-2 border-primary/30 rounded-full flex items-center justify-center border-dashed">
                                    <Building2 size={32} className="text-primary/40" />
                                </div>
                            )}
                            
                            {isUploadingLogo && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                    <Loader2 size={24} className="animate-spin text-white" />
                                </div>
                            )}
                            
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary border-4 border-white shadow-lg flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Camera size={14} />
                        </button>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Logo</p>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onLogoChange}
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                />

                {/* Details Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8">
                    <InfoItem label="Business Name" value={businessData.name} />
                    <InfoItem label="Industry" value={businessData.industry} icon={Rocket} />
                    <InfoItem label="Full Name" value={businessData.fullName} />
                    <InfoItem label="Email Address" value={businessData.email} />
                    <InfoItem label="Contact Number" value={businessData.contact} />
                    <InfoItem label="Location" value={businessData.location} />
                </div>
            </div>
        </div>
    </div>
);

export default BasicInfoCard;

import React from 'react';
import { ChevronRight, Key, Edit3 } from 'lucide-react';
import Button from '../ui/Button';

const BusinessHeader = ({ onNavigate, onChangePassword }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <span className="cursor-pointer hover:text-primary transition-colors">Settings</span>
            <ChevronRight size={10} className="text-gray-300" />
            <span className="text-primary">Business Information</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Business Profile</h1>
                <p className="text-gray-500 font-medium text-sm">Configure your company identity and AI interaction model.</p>
            </div>

            <div className="flex items-center gap-4">
                <Button 
                    variant="outline" 
                    className="h-12 px-6 rounded-2xl border-gray-100 shadow-sm hover:bg-gray-50 font-black text-xs uppercase tracking-widest gap-2"
                    onClick={onChangePassword}
                >
                    <Key size={14} className="text-gray-400" />
                    Change Password
                </Button>
                <Button 
                    onClick={() => onNavigate('/edit-business-info')}
                    className="h-12 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest gap-2 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Edit3 size={14} />
                    Edit Profile
                </Button>
            </div>
        </div>
    </div>
);

export default BusinessHeader;

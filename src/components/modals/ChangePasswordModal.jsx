import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { toast } from 'react-toastify';
import Api from '../../../scripts/Api';
import { useApp } from '../../context/AppContext';

const PasswordInput = ({ label, value, onChange, placeholder, show, onToggle, subtext }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none pr-12"
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
        {subtext && <p className="text-[10px] font-medium text-gray-400 ml-1 leading-relaxed">{subtext}</p>}
    </div>
);

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const { user, adminToken } = useApp();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (!adminToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (!user?.admin_id) {
            toast.error("User information not loaded.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_new_password: confirmPassword
            };

            const result = await Api.changePassword(adminToken, user.admin_id, payload);
            
            if (result) {
                toast.success("Password updated successfully!");
                onClose();
                // Reset fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.detail || "Failed to update password. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Change Password"
            footer={
                <div className="flex items-center justify-end gap-3 w-full">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="px-6 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <PasswordInput
                    label="Current Password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrent}
                    onToggle={() => setShowCurrent(!showCurrent)}
                    placeholder="••••••••••••"
                />

                <PasswordInput
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNew}
                    onToggle={() => setShowNew(!showNew)}
                    placeholder="Enter new password"
                    subtext="Must be at least 8 characters including a number and a special symbol."
                />

                <PasswordInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirm}
                    onToggle={() => setShowConfirm(!showConfirm)}
                    placeholder="Re-enter new password"
                />
            </div>
        </Modal>
    );
};

export default ChangePasswordModal;

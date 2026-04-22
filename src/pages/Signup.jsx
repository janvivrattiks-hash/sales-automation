import React, { useState } from 'react';
import { Mail, Lock, UserPlus, Chrome, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Api from '../../scripts/Api';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    const handleChange = (e) => { // handle change
        const { name, value } = e.target;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        } else if (name === 'confirmPassword') {
            setConfirmPassword(value);
        }
    };

    const handleSubmit = async (e) => { // handle submit
        e.preventDefault();
        if (password !== confirmPassword) {
            console.error("Passwords do not match");
            return;
        }
        const res = await Api.Signup(email, password, confirmPassword);
        if (res) {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl shadow-blue-900/5 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-700">

                {/* Left Side - Visual section */}
                <div className="hidden md:flex md:w-1/2 bg-[#F1F5F9] p-12 flex-col items-center justify-center text-center order-2 md:order-1">
                    <div className="relative w-full max-w-[320px] mb-12">
                        {/* Mock Graph Image */}
                        <div className="bg-[#0F172A] rounded-2xl aspect-square w-full p-8 shadow-2xl relative flex flex-col justify-end">
                            <div className="absolute top-8 right-8 bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-bold px-2 py-1 rounded-md border border-[#3B82F6]/20">
                                GROWTH
                            </div>
                            <svg className="w-full h-full text-[#3B82F6]" viewBox="0 0 100 100" fill="none">
                                <path d="M10 80 Q 30 70, 50 40 T 90 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="90" cy="20" r="4" fill="currentColor" />
                            </svg>
                            <div className="mt-4 grid grid-cols-4 gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-[#1E293B] h-12 w-full rounded-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 left-0 bg-[#3B82F6]/20 w-full" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-[#0F172A] mb-4">Start Your Journey</h2>
                    <p className="text-[#64748B] text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                        Join over 10,000 sales teams using our platform to predict trends and close deals faster.
                    </p>
                </div>

                {/* Right Side - Form section */}
                <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center order-1 md:order-2">
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                        </div>
                        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Create Account</h1>
                        <p className="text-[#64748B] font-medium">Join us to manage leads and audiences.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-[#475569] block">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full h-11 pl-4 pr-12 bg-white border-2 border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:ring-0 transition-all outline-none"
                                    value={email}
                                    onChange={handleChange}
                                    required
                                />
                                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-[#475569] block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full h-11 pl-4 pr-12 bg-white border-2 border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:ring-0 transition-all outline-none"
                                    value={password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-[#475569] block">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full h-11 pl-4 pr-12 bg-white border-2 border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:ring-0 transition-all outline-none"
                                    value={confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 text-base font-black rounded-xl shadow-xl shadow-blue-600/20 mt-4">
                            Create Account
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#E2E8F0]"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                                <span className="bg-white px-4 text-[#94A3B8]">OR</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <Button variant="outline" type="button" className="h-11 bg-white border-2 border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[#475569] font-bold text-sm shadow-sm transition-all">
                                <Chrome size={18} className="mr-2" /> Google
                            </Button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm font-bold text-[#64748B]">
                        Already have an account? <button onClick={onNavigateToLogin} className="text-[#3B82F6] hover:underline">Log in</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;

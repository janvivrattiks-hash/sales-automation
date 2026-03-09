import React, { useState, useContext } from 'react';
import { Mail, Lock, LogIn, Chrome, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Api from '../../scripts/Api';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Login = () => {
    const navigate = useNavigate();
    const { setAdminToken } = useContext(AppContext);
    const [form, setForm] = useState({
        email: '',
        password: '',
    })
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };


    const handleLogin = async (e) => { // handle login
        e.preventDefault(); // prevent default
        console.log("logging in user");
        const respose_data = await Api.Login(form.email, form.password); // call login api
        if (respose_data) { // if response is not null
            setUser(respose_data); // set user
            setForm({ email: '', password: '' }); // clear form
            setToken(respose_data); // set token
            localStorage.setItem('admin_token', respose_data.access_token); // set token in local storage
            setAdminToken(respose_data.access_token); // set token in context
            navigate('/dashboard'); // navigate to dashboard
        } else { // if response is null
            setError("invalid login credentials"); // set error message
        }
    };




    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl shadow-blue-900/5 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-700">

                {/* Left Side - Visual section */}
                <div className="hidden md:flex md:w-1/2 bg-[#F1F5F9] p-12 flex-col items-center justify-center text-center">
                    <div className="relative w-full max-w-[320px] mb-12">
                        {/* Mock Graph Image */}
                        <div className="bg-[#0F172A] rounded-2xl aspect-square w-full p-8 shadow-2xl relative flex flex-col justify-end">
                            <div className="absolute top-8 right-8 bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-bold px-2 py-1 rounded-md border border-[#3B82F6]/20">
                                LEADS
                            </div>
                            {/* Simple SVG Graph Representation */}
                            <svg className="w-full h-full text-[#3B82F6]" viewBox="0 0 100 100" fill="none">
                                <path d="M10 90 L30 70 L50 80 L70 40 L90 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 90 H90 V90 H10 Z" fill="currentColor" fillOpacity="0.1" />
                                <circle cx="90" cy="50" r="4" fill="currentColor" />
                            </svg>
                            <div className="mt-4 flex justify-between gap-1 overflow-hidden">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-[#1E293B] h-1 w-full rounded-full overflow-hidden">
                                        <div className="bg-[#3B82F6] h-full" style={{ width: `${Math.random() * 80 + 20}%` }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-[#0F172A] mb-4">Accelerate Your Revenue</h2>
                    <p className="text-[#64748B] text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                        Join over 10,000 sales teams using our platform to predict trends and close deals faster.
                    </p>
                </div>

                {/* Right Side - Form section */}
                <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                        </div>
                        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-[#64748B] font-medium">Log in to manage leads and audiences.</p>
                    </div>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}
                    {
                        !user &&
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#475569] block">Email Address</label>
                                <div className="relative">
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="w-full h-11 pl-4 pr-12 bg-white border-2 border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:ring-0 transition-all outline-none"
                                        value={form.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-[#475569]">Password</label>
                                    <button type="button" className="text-sm font-bold text-[#3B82F6] hover:underline">Forgot password?</button>
                                </div>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full h-11 pl-4 pr-12 bg-white border-2 border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:ring-0 transition-all outline-none"
                                        value={form.password}
                                        onChange={handleInputChange}
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

                            <Button type="submit" onClick={handleLogin} className="w-full h-11 text-base font-black rounded-xl shadow-xl shadow-blue-600/20">
                                Log In
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
                                    <Chrome size={20} className="mr-2" /> Google
                                </Button>
                            </div>
                        </form>
                    }

                    <p className="mt-10 text-center text-sm font-bold text-[#64748B]">
                        Don't have an account? <button onClick={() => navigate('/signup')} className="text-[#3B82F6] hover:underline">Sign up</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

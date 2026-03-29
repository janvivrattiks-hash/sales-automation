import React from 'react';
import { Building2, User, AtSign, ChevronDown, Globe, Briefcase } from 'lucide-react';
import FormField from './FormField';
import Button from '../ui/Button';

const BusinessForm = ({ formData, isSubmitting, onChange, onCancel, onSubmit }) => (
    <div className="p-12 border-t border-gray-50 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Business Name */}
            <FormField label="Business Name" icon={Building2}>
                <input
                    name="businessName"
                    value={formData.businessName}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 group-focus-within:bg-white group-focus-within:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
            </FormField>

            {/* Full Name */}
            <FormField label="Full Name" icon={User}>
                <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 group-focus-within:bg-white group-focus-within:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
            </FormField>

            {/* Email Address */}
            <FormField label="Email Address" icon={AtSign}>
                <input
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 group-focus-within:bg-white group-focus-within:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
            </FormField>

            {/* Contact Number */}
            <FormField label="Contact Number">
                <div className="flex gap-2">
                    <div className="relative shrink-0">
                        <select
                            name="phonePrefix"
                            value={formData.phonePrefix}
                            onChange={onChange}
                            className="appearance-none pl-4 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 focus:bg-white focus:border-primary/20 transition-all outline-none cursor-pointer"
                        >
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                            <option value="+91">+91</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative grow group">
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={onChange}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        />
                    </div>
                </div>
            </FormField>

            {/* Website */}
            <FormField label="Website (Optional)" icon={Globe}>
                <input
                    name="website"
                    value={formData.website}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 group-focus-within:bg-white group-focus-within:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
            </FormField>

            {/* Industry */}
            <FormField label="Industry" icon={Briefcase}>
                <div className="relative group">
                    <select
                        name="industry"
                        value={formData.industry}
                        onChange={onChange}
                        className="appearance-none w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer"
                    >
                        <option>Software & Technology</option>
                        <option>Hardware & Manufacturing</option>
                        <option>Financial Services</option>
                        <option>Digital Marketing</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                </div>
            </FormField>
        </div>

        {/* Business Description */}
        <div className="space-y-2.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Description</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-600 leading-relaxed min-h-[160px] focus:bg-white focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all outline-none resize-none"
            />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6">
            <Button
                variant="outline"
                className="px-8 border-none hover:bg-gray-100 text-gray-500 font-black"
                onClick={onCancel}
            >
                Cancel
            </Button>
            <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
                {isSubmitting ? 'Updating...' : 'Update Information'}
            </Button>
        </div>
    </div>
);

export default BusinessForm;

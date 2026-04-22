import React from 'react';
import { LayoutGrid, MapPin, Map, Users, Zap, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const LeadGenForm = ({ formData, onInputChange, onSubmit, loading, error }) => {
    const fields = [
        { name: 'niche', label: 'Business Category', placeholder: 'Software & IT Servi', icon: LayoutGrid },
        { name: 'city', label: 'City', placeholder: 'e.g. San Francisco', icon: MapPin },
        { name: 'area', label: 'Area/Locality', placeholder: 'e.g. Downtown', icon: Map },
        { name: 'count', label: 'No. of Leads', placeholder: '100', icon: Users },
    ];

    return (
        <Card noPadding className="p-6">
            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {fields.map(({ name, label, placeholder, icon: Icon }) => (
                        <div key={name}>
                            <label className="text-sm font-bold text-gray-700">{label}</label>
                            <div className="relative">
                                <Icon className="absolute left-3 bottom-4 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name={name}
                                    value={formData[name]}
                                    onChange={onInputChange}
                                    placeholder={placeholder}
                                    className="w-full mt-4 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </form>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                    {error}
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <Button
                    className="flex items-center gap-2 shadow-lg shadow-primary/20 min-w-[180px] justify-center"
                    onClick={onSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Zap size={18} fill="currentColor" />
                    )}
                    {loading ? 'Generating...' : 'Generate Leads'}
                </Button>
            </div>
        </Card>
    );
};

export default LeadGenForm;

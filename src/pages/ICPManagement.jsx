import React, { useState, useEffect } from 'react';
import { Target, Plus, Users, Search, MapPin, Briefcase, Globe, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ICPManagement = () => {
    const [icps, setIcps] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchICPs = async () => {
    //         const data = await apiClient.getICPs();
    //         setIcps(data);
    //         setLoading(false);
    //     };
    //     fetchICPs();
    // }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ICP Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Define and refine your Ideal Customer Profiles for targeted automation.</p>
                </div>
                <Button>
                    <Plus size={20} /> Create ICP
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {icps.map((icp) => (
                    <Card
                        key={icp.id}
                        title={icp.name}
                        icon={Target}
                        footer={
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 font-medium italic">Last updated: 2 days ago</span>
                                <div className="flex gap-2">
                                    <Button variant="ghost" className="p-2 h-auto text-gray-400 hover:text-primary">
                                        <Edit3 size={16} />
                                    </Button>
                                    <Button variant="ghost" className="p-2 h-auto text-gray-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                                    <Briefcase size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Target Industry</p>
                                    <p className="font-medium text-gray-900">{icp.industry}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                                    <Users size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Job Titles</p>
                                    <p className="font-medium text-gray-900">{icp.target}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                                    <Globe size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Region</p>
                                    <p className="font-medium text-gray-900">{icp.region}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Match Score</span>
                                    <span className="text-xs font-bold text-primary">High Accuracy</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                <button className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-primary hover:bg-primary/5 transition-all group flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-primary group-hover:text-primary transition-colors">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">Add New Profile</h3>
                        <p className="text-sm text-gray-500">Define criteria for new source lists</p>
                    </div>
                </button>
            </div>

            <Card title="Search & Filter Existing Profiles" icon={Search}>
                <div className="flex gap-4">
                    <Input placeholder="Search profiles by name or keywords..." icon={Search} className="flex-1" />
                    <Button variant="outline" className="px-6">Filter</Button>
                </div>
            </Card>
        </div>
    );
};

export default ICPManagement;

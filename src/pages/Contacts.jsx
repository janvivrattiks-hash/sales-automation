import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Download,
    MoreHorizontal,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            const data = await apiClient.getLeads(); // Reusing the same dummy data for contacts
            setContacts(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentContacts = contacts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage your source leads and potential partners.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Download size={18} /> Export
                    </Button>
                    <Button>
                        <Users size={18} /> Add Contact
                    </Button>
                </div>
            </div>

            <Card className="p-0">
                <div className="p-4 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, email or company..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <Button variant="outline" className="h-[38px] px-3">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900">1-10</span> of 1,248 contacts
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentContacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                {contact.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{contact.name}</p>
                                                <p className="text-sm text-gray-500">{contact.company}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${contact.status === 'New' ? 'bg-blue-100 text-blue-600' :
                                            contact.status === 'Contacted' ? 'bg-orange-100 text-orange-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar size={14} /> Yesterday
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden`}>
                                            <div className={`h-full ${contact.priority === 'High' ? 'bg-red-400' :
                                                contact.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                                                }`} style={{ width: contact.priority === 'High' ? '100%' : contact.priority === 'Medium' ? '60%' : '30%' }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg text-gray-400 transition-colors">
                                                <Mail size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg text-gray-400 transition-colors">
                                                <Phone size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={contacts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </Card>
        </div>
    );
};

export default Contacts;

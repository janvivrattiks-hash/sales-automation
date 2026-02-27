import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Map, Users, Zap, Eye, Trash2, LayoutGrid, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Api from '../../scripts/Api';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const LeadGenerator = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);  //show spinner when API run
    const [error, setError] = useState(null);   // show error message
    const [currentPage, setCurrentPage] = useState(1); // pagination

    const itemsPerPage = 5; // items per page
    const [formData, setFormData] = useState({ // store form data
        query: '',
        city: '',
        area: '',
        count: ''
    });
    const { adminToken } = useContext(AppContext); // get admin token from context

    const handleInputChange = (e) => { // handle form input change
        const { name, value } = e.target; // get name and value from input
        setFormData((prev) => ({ ...prev, [name]: value })); // update form data
    };

    const handleGenerateLeads = async (e) => { // handle generate leads
        e.preventDefault(); // prevent default form submission
        console.log("form data", formData); // log form data

        // call API to add lead
        setLoading(true); // show loading
        const response_data = await Api.addLead(formData, adminToken);
        console.log("response data", response_data);

        if (response_data) {
            toast.success("Lead generated successfully"); // show success message
            const queryInfo = { // store query info
                query: formData.query,
                city: formData.city,
                area: formData.area,
                count: formData.count,
            };
            setFormData({ query: '', city: '', area: '', count: '' }); // reset form data
            navigate('/lead-details', { state: { results: response_data, queryInfo } }); // redirect with data
        } else {
            setError("Failed to generate lead"); // show error message
            setLoading(false); // hide loading
        }
        //Reset form after submission
        setFormData({
            query: '',
            city: '',
            area: '',
            count: ''
        })

    };



    const [activities] = useState([
        { id: 1, query: 'SaaS Companies in New York', category: 'Software & IT • Manhattan', date: 'Oct 24, 2023' },
        { id: 2, query: 'Marketing Agencies in Austin', category: 'Advertising • Downtown', date: 'Oct 22, 2023' },
        { id: 3, query: 'Clinics in London', category: 'Healthcare • West End', date: 'Oct 20, 2023' },
        { id: 4, query: 'Real Estate in Dubai', category: 'Property • Marina', date: 'Oct 19, 2023' },
        { id: 5, query: 'Law Firms in Chicago', category: 'Legal • Loop', date: 'Oct 18, 2023' },
        { id: 6, query: 'Design Agencies in Berlin', category: 'Creative • Mitte', date: 'Oct 17, 2023' },
        { id: 7, query: 'E-commerce Brands in Mumbai', category: 'Retail • BKC', date: 'Oct 16, 2023' },
    ]); // mock data

    const startIndex = (currentPage - 1) * itemsPerPage; // pagination
    const currentActivities = activities.slice(startIndex, startIndex + itemsPerPage); // pagination


    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Generate New Leads</h1>
                <p className="text-gray-500 text-sm mt-1">Find your ideal customers by business category and location.</p>
            </div>

            <Card noPadding className="p-6">
                <form onSubmit={handleGenerateLeads}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="text-sm font-bold text-gray-700">Business Category</label>
                            <div className="relative">
                                <LayoutGrid className="absolute left-3 bottom-4 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="query"
                                    value={formData.query}
                                    onChange={handleInputChange}
                                    placeholder="Software & IT Servi"
                                    className="w-full mt-4 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700">City</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 bottom-4 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="e.g. San Francisco"
                                    className="w-full mt-4 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700">Area/Locality</label>
                            <div className="relative">
                                <Map className="absolute left-3 bottom-4 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Downtown"
                                    className="w-full mt-4 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700">No. of Leads</label>
                            <div className="relative">
                                <Users className="absolute left-3 bottom-4 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="count"
                                    value={formData.count}
                                    onChange={handleInputChange}
                                    placeholder="100"
                                    className="w-full mt-4 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>
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
                        onClick={handleGenerateLeads}
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

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                    <button
                        className="text-sm font-bold text-primary hover:underline"
                        onClick={() => navigate('/search-history')}
                    >
                        View All Activities
                    </button>
                </div>

                <Card noPadding className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] md:min-w-full">
                            <thead>
                                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-8 py-5">Query Name</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentActivities.map((activity) => (
                                    <tr key={activity.id} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{activity.query}</span>
                                                <span className="text-xs text-gray-400 mt-1">{activity.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-medium text-gray-600">{activity.date}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <button
                                                    className="text-gray-400 hover:text-primary transition-colors"
                                                    onClick={() => navigate('/lead-details')}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={20} />
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
                        totalItems={activities.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </Card>
            </div>
        </div>
    );
};

export default LeadGenerator;
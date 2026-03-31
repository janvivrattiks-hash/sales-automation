import React from 'react';
import { Zap, Activity, CheckCircle2, CircleAlert, Lightbulb, Users, User, Mail, Phone, MapPin, Globe, Briefcase } from 'lucide-react';
import { getDeepField, renderData, extractString } from '../../utils/dataHelpers.jsx';
import Card from '../ui/Card';

const SummaryTab = ({ summaryData, isLoadingSummary, poiDetails, isLoadingPoi, icpScore, leadId, contactInfo }) => {
    if (isLoadingSummary || isLoadingPoi) {
        return (
            <div className="flex justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generating AI Insights...</p>
                </div>
            </div>
        );
    }

    if (!summaryData && !isLoadingSummary) {
        return (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center space-y-2 animate-in fade-in">
                <p className="text-sm font-bold text-red-600">Summary Not Found</p>
                <p className="text-xs text-red-400">Target ID: <span className="font-mono">{leadId}</span></p>
                <p className="text-[10px] text-red-300">Please verify enrichment status for this lead.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. AI Summary */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                    <Zap size={24} fill="currentColor" className="opacity-80" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        AI Summary
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-100">Live Insight</span>
                    </h3>
                    <div className="text-base text-gray-700 mt-2 leading-relaxed">
                        {renderData(getDeepField(summaryData, ['summary', 'ai_summary', 'description', 'insights', 'prospect_intelligence', 'full_summary']))}
                    </div>
                </div>
            </div>

            {/* 2. Gaps Identified */}
            <div className="animate-in slide-in-from-right-4 duration-500 delay-100 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                        <Activity size={20} />
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">Gaps Identified</h4>
                </div>
                <div className="space-y-3">
                    {(() => {
                        const gapsRaw = getDeepField(summaryData, ['growth_gaps', 'gaps', 'gaps_identified', 'identified_gaps', 'market_gaps', 'weakness']);
                        if (!gapsRaw) return <p className="text-sm text-gray-400 italic">No gaps identified.</p>;

                        const gapsArr = Array.isArray(gapsRaw) ? gapsRaw : [gapsRaw];
                        return gapsArr.map((gap, i) => {
                            if (gap && typeof gap === 'object') {
                                const gapLabel = gap.gap || gap.title || gap.name || gap.weakness || `Gap ${i + 1}`;
                                const opportunity = gap.opportunity_angle || gap.opportunity || gap.recommendation || null;
                                const impact = gap.growth_impact || gap.impact || gap.severity || null;
                                return (
                                    <div key={i} className="bg-amber-50/40 border border-amber-100 rounded-2xl p-5 space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Gap Identified</p>
                                                <p className="font-bold text-amber-900 text-base">{String(gapLabel)}</p>
                                            </div>
                                            {impact && (
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Growth Impact</p>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${String(impact).toLowerCase() === 'high' ? 'bg-red-100 text-red-700' :
                                                        String(impact).toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>{String(impact)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {opportunity && (
                                            <div className="space-y-1.5 p-3 bg-white/60 rounded-xl border border-amber-100/50">
                                                <div className="flex items-center gap-2">
                                                    <Zap size={12} className="text-amber-500 fill-amber-500" />
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Opportunity Angle</span>
                                                </div>
                                                <p className="text-sm text-amber-900 leading-relaxed font-medium">{String(opportunity)}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return (
                                <div key={i} className="bg-amber-50/40 border border-amber-100 rounded-xl p-4">
                                    <p className="text-amber-900 text-sm leading-relaxed">{String(gap)}</p>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>

            {/* 3. ICP Match Analysis */}
            {(() => {
                const fit = getDeepField(summaryData, ['fit_level', 'fit', 'match_level', 'alignment', 'icp_fit_level']) || getDeepField(contactInfo, ['fit_level', 'fit']) || 'N/A';
                const conf = getDeepField(summaryData, ['confidence_level', 'confidence', 'confidence_score', 'certainty', 'conf_score']) || getDeepField(contactInfo, ['confidence_level', 'confidence']) || 'N/A';
                const summ = getDeepField(summaryData, ['icp_summary', 'icp_analysis', 'match_summary', 'analysis_summary', 'fit_description', 'reasoning']);

                return (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-50 text-green-500 rounded-xl">
                                <CheckCircle2 size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-base">ICP Match Analysis</h4>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-5">
                            {[
                                { label: 'ICP Score', value: String(icpScore).trim() },
                                { label: 'Fit Level', value: typeof fit === 'object' ? JSON.stringify(fit) : String(fit).trim() },
                                { label: 'Confidence', value: typeof conf === 'object' ? JSON.stringify(conf) : String(conf).trim() },
                            ].map(({ label, value }) => {
                                const v = value.toLowerCase();
                                const color = v.includes('high') || v.includes('strong') || v.includes('excellent') ? 'text-green-600'
                                    : v.includes('low') || v.includes('weak') || v.includes('poor') ? 'text-red-500'
                                        : v.includes('medium') || v.includes('mid') || v.includes('moderate') ? 'text-amber-500'
                                            : value === 'N/A' ? 'text-gray-400'
                                                : 'text-gray-900';
                                return (
                                    <div key={label} className="flex flex-col">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                                        <p className={`text-sm font-black capitalize ${color}`}>{value}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {summ && (
                            <div className="bg-green-50/30 p-5 rounded-2xl border border-green-100/50">
                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2 opacity-70">ICP Summary</p>
                                <div className="text-green-900 text-sm leading-relaxed italic">
                                    {typeof summ === 'string' ? `"${summ}"` : renderData(summ)}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* 4. Pain Points */}
            {(() => {
                const points = getDeepField(summaryData, ['pain_points', 'pain_points_detail', 'challenges', 'problems', 'pain_points_list', 'pain_areas', 'weaknesses']);
                if (!points) return null;
                return (
                    <div className="animate-in slide-in-from-left-4 duration-500 delay-300 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                                <CircleAlert size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-base">Pain Points Identified</h4>
                        </div>
                        <div className="bg-red-50/30 p-5 rounded-2xl border border-red-100/50">
                            <div className="text-red-900 text-sm leading-relaxed">
                                {renderData(points, 'pain_points')}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* 5. Strategic Opportunities */}
            {(() => {
                const opps = getDeepField(summaryData, ['strategic_opportunities', 'opportunities', 'growth_opportunities', 'recommendations', 'upsell_potential', 'next_steps']);
                if (!opps) return null;
                return (
                    <div className="animate-in slide-in-from-right-4 duration-500 delay-300 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                                <Lightbulb size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-base">Strategic Opportunities</h4>
                        </div>
                        <div className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50">
                            <div className="text-indigo-900 text-sm leading-relaxed">
                                {renderData(opps)}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* 6. Competitive Landscape */}
            {(() => {
                const landscape = getDeepField(summaryData, ['competitive_landscape', 'competitors', 'market_position', 'market_context', 'rivals']);
                if (!landscape) return null;
                return (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 delay-400 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-50 text-slate-500 rounded-xl">
                                <Users size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-base">Competitive Landscape</h4>
                        </div>
                        <div className="bg-slate-50/30 p-5 rounded-2xl border border-slate-100/50">
                            <div className="text-slate-900 text-sm leading-relaxed">
                                {renderData(landscape)}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* 7. POI Details (Point of Interest) */}
            {(() => {
                const poi = poiDetails || getDeepField(contactInfo, ['poi_details', 'poi', 'points_of_interest']);
                if (!poi) return null;
                return (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 delay-500 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                                <MapPin size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-base">Local Insights (POI)</h4>
                        </div>
                        <div className="bg-orange-50/30 p-5 rounded-2xl border border-orange-100/50">
                            <div className="text-orange-900 text-sm leading-relaxed">
                                {renderData(poi)}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default SummaryTab;

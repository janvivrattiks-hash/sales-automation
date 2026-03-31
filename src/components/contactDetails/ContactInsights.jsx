import React from 'react';
import { CircleAlert, Zap, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import { getDeepField, renderData } from '../../utils/contactDataHelpers';

const ContactInsights = ({ finalLead }) => {
    // Check if insights exist
    const hasInsights = getDeepField(finalLead, ['pain_points', 'weaknesses', 'gaps', 'market_gap']) !== null;
    const poi = getDeepField(finalLead, ['poi_details', 'poi', 'points_of_interest']);

    if (!hasInsights && !poi) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hasInsights && (
                    <>
                        <Card title="Pain Points" icon={CircleAlert}>
                            <div className="mt-2 text-sm">
                                {renderData(getDeepField(finalLead, ['pain_points', 'problems', 'challenges']), 'pain_points')}
                            </div>
                        </Card>
                        <Card title="Market Gaps" icon={Zap}>
                            <div className="mt-2 text-sm">
                                {renderData(getDeepField(finalLead, ['gaps', 'weaknesses', 'market_gap']), 'gaps')}
                            </div>
                        </Card>
                    </>
                )}
            </div>

            {poi && (
                <Card title="Local Insights (POI)" icon={MapPin}>
                    <div className="mt-2 text-sm leading-relaxed">
                        {renderData(poi)}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ContactInsights;

import React from 'react';
import { CircleAlert, Zap } from 'lucide-react';
import Card from '../ui/Card';
import { getDeepField, renderData } from '../../utils/contactDataHelpers';

const ContactInsights = ({ finalLead }) => {
    // Check if insights exist
    const hasInsights = getDeepField(finalLead, ['pain_points', 'weaknesses', 'gaps', 'market_gap']) !== null;

    if (!hasInsights) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Pain Points" icon={CircleAlert}>
                <div className="mt-2">
                    {renderData(getDeepField(finalLead, ['pain_points', 'problems', 'challenges']), 'pain_points')}
                </div>
            </Card>
            <Card title="Market Gaps" icon={Zap}>
                <div className="mt-2">
                    {renderData(getDeepField(finalLead, ['gaps', 'weaknesses', 'market_gap']), 'gaps')}
                </div>
            </Card>
        </div>
    );
};

export default ContactInsights;

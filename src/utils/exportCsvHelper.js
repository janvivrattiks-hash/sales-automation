/**
 * Utility to export enriched leads data as a CSV file.
 */
const getRawSocial = (l, platform) => {
    const p = platform.toLowerCase();
    const capP = p.charAt(0).toUpperCase() + p.slice(1);
    const shortP = p === 'facebook' ? 'fb' : p === 'instagram' ? 'ig' : p === 'linkedin' ? 'li' : p === 'twitter' ? 'tw' : p === 'youtube' ? 'yt' : p;

    const potentialKeys = [
        p, `${p}_url`, `${p}_link`,
        capP, `${capP}_url`, `${capP}_link`,
        `${shortP}_url`, `${shortP}_link`,
        `social_links.${p}`, `social_links.${p}_url`, `social_links.${p}_link`,
        `prospect_intelligence.${p}_url`, `prospect_intelligence.${p}`,
        `prospect_intelligence.social_links.${p}_url`, `prospect_intelligence.social_links.${p}`
    ];

    for (const keyPath of potentialKeys) {
        const val = keyPath.split('.').reduce((obj, key) => obj?.[key], l);
        if (val && typeof val === 'string' && !['n/a', 'null', 'undefined', ''].includes(val.toLowerCase()) && (val.startsWith('http') || val.startsWith('www'))) {
            return val.startsWith('http') ? val : `https://${val}`;
        }
    }

    if (Array.isArray(l.social_media)) {
        const match = l.social_media.find(s => s.type?.toLowerCase() === p || s.platform?.toLowerCase() === p);
        if (match?.url) return match.url.startsWith('http') ? match.url : `https://${match.url}`;
    }

    return '';
};

export const exportLeadsCSV = (leads) => {
    if (!leads || leads.length === 0) return;

    const headers = ["Business Name", "Address", "Mobile", "Email", "Website", "Facebook", "Instagram", "LinkedIn", "Twitter", "YouTube", "Rating"];
    const csvRows = leads.map(l => [
        `"${l.name || l.BusinessName || ''}"`,
        `"${l.address || l.Address || ''}"`,
        `"${l.mobile || l.MobileNumber || l.phone || ''}"`,
        `"${l.email || l.Email || ''}"`,
        `"${l.website || ''}"`,
        `"${getRawSocial(l, 'facebook')}"`,
        `"${getRawSocial(l, 'instagram')}"`,
        `"${getRawSocial(l, 'linkedin')}"`,
        `"${getRawSocial(l, 'twitter')}"`,
        `"${getRawSocial(l, 'youtube')}"`,
        l.rating || l.Rating || 0
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `enriched_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

import React from 'react';

/**
 * Helper to find a field in an object or array of objects using multiple aliases.
 */
export const findField = (data, aliases) => {
    if (!data) return null;
    const target = Array.isArray(data) ? data[0] : data;
    if (!target || typeof target !== 'object') return null;
    const dataKeys = Object.keys(target);

    const findKey = (aliasArr) => {
        // Exact match
        for (const alias of aliasArr) {
            if (target[alias] !== undefined) return target[alias];
        }
        // Case-insensitive match
        for (const alias of aliasArr) {
            const lowAlias = alias.toLowerCase();
            const foundKey = dataKeys.find(k => k.toLowerCase() === lowAlias);
            if (foundKey) return target[foundKey];
        }
        // Partial match
        for (const alias of aliasArr) {
            const lowAlias = alias.toLowerCase();
            const foundKey = dataKeys.find(k => k.toLowerCase().includes(lowAlias));
            if (foundKey) return target[foundKey];
        }
        return null;
    };

    const result = findKey(aliases);
    if (typeof result === 'string' && (result.trim().startsWith('{') || result.trim().startsWith('['))) {
        try { return JSON.parse(result); } catch (e) { return result; }
    }
    return result;
};

/**
 * Recursively find a field deep within an object.
 */
export const getDeepField = (obj, aliases) => {
    if (!obj || typeof obj !== 'object') return null;
    let found = findField(obj, aliases);
    if (found !== null) return found;

    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            let nestedFound = getDeepField(val, aliases);
            if (nestedFound !== null &&
                ((typeof nestedFound === 'string' && nestedFound.trim() !== '') ||
                    (typeof nestedFound === 'number') ||
                    (Array.isArray(nestedFound) && nestedFound.length > 0) ||
                    (typeof nestedFound === 'object' && Object.keys(nestedFound).length > 0))) {
                return nestedFound;
            }
        }
    }
    return null;
};

/**
 * Format a date string into a readable format.
 */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Recent Activity';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Extract a string from potential multiple value types.
 */
export const extractString = (val, defaultStr) => {
    if (!val) return defaultStr;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
        const values = Object.values(val).filter(v => v !== null && v !== undefined && v !== '');
        if (values.length > 0) return values.join(", ");
    }
    return defaultStr;
};

/**
 * Render structured data into components.
 */
export const renderData = (data, type = 'text') => {
    if (!data) return "Data not available...";
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) {
        return (
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="border-b border-gray-100/50 last:border-0 pb-3 last:pb-0">
                        {renderData(item, type)}
                    </div>
                ))}
            </div>
        );
    }
    if (typeof data === 'object') {
        if (type === 'pain_points') {
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-red-900">{data.pain_point || data.point || "Unknown Point"}</span>
                        {data.severity && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${data.severity?.toLowerCase() === 'high' ? 'bg-red-100 text-red-700' : data.severity?.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                {data.severity}
                            </span>
                        )}
                    </div>
                    {data.data_signal && <span className="text-xs text-red-700/70 italic">Signal: {data.data_signal}</span>}
                    {data.description && <p className="text-sm mt-1">{data.description}</p>}
                </div>
            );
        }
        if (type === 'gaps') {
            return (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-900">{data.gap || data.weakness || "Identified Gap"}</span>
                    {data.description && <p className="text-sm text-gray-600 mt-1">{data.description}</p>}
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 gap-2">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return String(data);
};

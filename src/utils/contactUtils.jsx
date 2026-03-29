import { Facebook, Instagram, Linkedin, Twitter, Youtube, Globe } from 'lucide-react';

/**
 * Recursive deep extractor for alias-based key searching in JSON objects.
 */
export const deepGet = (obj, aliases) => {
    if (!obj || typeof obj !== 'object') return null;
    
    // 1. Shallow pass — exact key match
    for (const key of Object.keys(obj)) {
        const lk = key.toLowerCase();
        if (aliases.some(a => lk === a.toLowerCase())) {
            const v = obj[key];
            if (v !== null && v !== undefined && v !== '') return v;
        }
    }
    
    // 2. Recursive into nested objects
    for (const key of Object.keys(obj)) {
        const v = obj[key];
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            const found = deepGet(v, aliases);
            if (found !== null) return found;
        }
    }
    return null;
};

/**
 * Safe string extractor for varied backend data types.
 */
export const extractStr = (val, defaultVal = 'N/A') => {
    if (!val) return defaultVal;
    if (Array.isArray(val)) return val.length > 0 ? extractStr(val[0], defaultVal) : defaultVal;
    if (typeof val === 'object') {
        const first = Object.values(val).find(v => v && typeof v === 'string');
        return first ? first.trim() : defaultVal;
    }
    return String(val).trim() || defaultVal;
};

/**
 * Recursive URL scanner for social media links.
 */
export const socialDomains = [
    'facebook.com', 'fb.com', 'instagram.com', 'linkedin.com', 
    'twitter.com', 'x.com', 'youtube.com', 'tiktok.com', 'github.com'
];

export const scanSocials = (item, extractedSocials = [], seenDomains = new Set()) => {
    if (!item || typeof item === 'function') return extractedSocials;
    
    if (typeof item === 'string') {
        const lower = item.toLowerCase();
        const matchDomain = socialDomains.find(d => lower.includes(d));
        if (matchDomain && !seenDomains.has(matchDomain) && item.length < 200) {
            let cleanLink = item.trim();
            if (!cleanLink.startsWith('http')) cleanLink = 'https://' + cleanLink;
            extractedSocials.push(cleanLink);
            seenDomains.add(matchDomain);
        }
    } else if (typeof item === 'object' && item !== null) {
        Object.values(item).forEach(val => scanSocials(val, extractedSocials, seenDomains));
    }
    return extractedSocials;
};

/**
 * Maps social links to their respective Lucide icons.
 */
export const getSocialIcon = (link) => {
    const lower = String(link).toLowerCase();
    if (lower.includes('facebook') || lower.includes('fb.com')) return <Facebook size={12} className="text-[#1877F2]" />;
    if (lower.includes('instagram')) return <Instagram size={12} className="text-[#E4405F]" />;
    if (lower.includes('linkedin')) return <Linkedin size={12} className="text-[#0A66C2]" />;
    if (lower.includes('twitter') || lower.includes('x.com')) return <Twitter size={12} className="text-[#1DA1F2]" />;
    if (lower.includes('youtube')) return <Youtube size={12} className="text-[#FF0000]" />;
    return <Globe size={12} className="text-gray-400" />;
};

/**
 * Extracts a readable domain hostname from a URL.
 */
export const getHostname = (link) => {
    if (!link) return '';
    try {
        return new URL(String(link).startsWith('http') ? link : `https://${link}`).hostname.replace('www.', '');
    } catch {
        return String(link);
    }
};

/**
 * Searches a contact object for a specific social media platform link using domain-based scanning.
 */
export const findSocialLink = (contact, platform) => {
    const domains = {
        facebook: ['facebook.com', 'fb.com'],
        instagram: ['instagram.com'],
        linkedin: ['linkedin.com'],
        twitter: ['twitter.com', 'x.com'],
        youtube: ['youtube.com', 'youtu.be']
    };

    const collectStrings = (obj, depth = 0) => {
        if (depth > 5 || !obj || typeof obj !== 'object') return [];
        return Object.values(obj).flatMap(v => {
            if (typeof v === 'string') return [v];
            if (typeof v === 'object' && v !== null) return collectStrings(v, depth + 1);
            return [];
        });
    };

    const allValues = collectStrings(contact);
    return allValues.find(v => domains[platform]?.some(d => v.includes(d)));
};


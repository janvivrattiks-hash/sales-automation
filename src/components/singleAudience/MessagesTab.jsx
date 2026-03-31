import React from 'react';
import { Mail } from 'lucide-react';
import Button from '../ui/Button';
import Api from '../../../scripts/Api';

const MessagesTab = ({
    messagesData,
    isLoadingMessages,
    contactName,
    businessName,
    emailsArray,
    phoneStr
}) => {
    if (isLoadingMessages) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold text-sm">Generating AI outreach scripts...</p>
            </div>
        );
    }

    // Extreme Data Discovery (Channel-Aware Recursive Scan)
    const discoverContent = (data) => {
        const result = { emailSubject: '', emailBody: '', whatsappBody: '' };
        if (!data) return result;

        console.log('MESSAGES_DATA_IN_TAB:', data);

        // 1. Handle direct string response (if API returns just the email body)
        if (typeof data === 'string' && data.length > 20) {
            if (data.includes('Hi ') || data.includes('Hello ')) {
                result.emailBody = data;
                return result;
            }
        }

        if (typeof data !== 'object') return result;

        const emailKeys = ['email_message', 'email', 'email_script', 'email_body', 'email_text', 'direct_email', 'outreach_email', 'cold_email', 'marketing_email'];
        const subjectKeys = ['subject', 'email_subject', 'title', 'header', 'topic'];
        const whatsappKeys = ['whatsapp_message', 'whatsapp', 'whatsapp_script', 'whatsapp_body', 'whatsapp_text', 'sms_message', 'direct_message', 'chat_script'];

        const seen = new Set();
        const scan = (obj, depth = 0) => {
            if (depth > 5 || !obj || seen.has(obj)) return;
            seen.add(obj);

            if (Array.isArray(obj)) {
                obj.forEach(item => scan(item, depth + 1));
                return;
            }

            // A. Type/Channel Detection (Primary)
            // If object looks like { type: 'email', content: '...' } or { channel: 'whatsapp', body: '...' }
            const possibleType = String(obj.type || obj.channel || obj.category || obj.target || obj.channel_type || '').toLowerCase();
            const possibleContent = obj.content || obj.body || obj.message || obj.text || obj.script || obj.value;

            if (typeof possibleContent === 'string' && possibleContent.length > 10) {
                if (possibleType.includes('email') || possibleType.includes('mail')) {
                    if (!result.emailBody || possibleContent.length > result.emailBody.length) result.emailBody = possibleContent;
                    if (obj.subject && !result.emailSubject) result.emailSubject = obj.subject;
                } else if (possibleType.includes('whatsapp') || possibleType.includes('whatsapp_script') || possibleType.includes('sms')) {
                    if (!result.whatsappBody || possibleContent.length > result.whatsappBody.length) result.whatsappBody = possibleContent;
                }
            }

            // B. Pattern-Based Detection (Secondary)
            for (const key in obj) {
                const val = obj[key];
                const lowKey = key.toLowerCase();

                if (typeof val === 'string' && val.length > 10) {
                    // Match Subject
                    if (!result.emailSubject && subjectKeys.some(sk => lowKey.includes(sk))) {
                        result.emailSubject = val;
                    }
                    // Match Email Body
                    if (emailKeys.some(ek => lowKey.includes(ek))) {
                        if (!result.emailBody || val.length > result.emailBody.length) result.emailBody = val;
                    }
                    // Match WhatsApp
                    if (whatsappKeys.some(wk => lowKey.includes(wk))) {
                        if (!result.whatsappBody || val.length > result.whatsappBody.length) result.whatsappBody = val;
                    }

                    // Universal Fallback for Email
                    if (!result.emailBody && (val.includes('Hi ') || val.includes('Hello ') || val.includes('Dear '))) {
                        result.emailBody = val;
                    }
                } else if (typeof val === 'object') {
                    scan(val, depth + 1);
                }
            }
        };

        scan(data);
        return result;
    };

    const { emailSubject, emailBody, whatsappBody } = discoverContent(messagesData);
    const firstName = contactName ? contactName.split(' ')[0] : 'there';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Email Outreach */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#EA4335]"></div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EA4335]/10 flex items-center justify-center text-[#EA4335]">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Email Outreach Draft</h3>
                            <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase">
                                {emailSubject ? `Subject: ${emailSubject}` : 'Direct Email Strategy'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-[10px] font-bold hover:bg-[#EA4335]/5 text-[#EA4335]"
                        onClick={async () => {
                            const text = emailBody || `Hi ${firstName},\n\nLoved your recent post about scaling operations...`;
                            const toEmail = emailsArray[0] || '';
                            const subject = emailSubject || `Scaling your operations at ${businessName}`;
                            window.open(`mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`);
                        }}
                    >
                        Send
                    </Button>
                </div>
                <div className="bg-gray-50/50 p-5 rounded-xl text-sm text-gray-700 font-medium leading-relaxed font-mono border border-gray-100 whitespace-pre-line group-hover:border-red-100 transition-colors">
                    {emailSubject && <div className="mb-3 pb-2 border-b border-gray-200/60 font-bold text-gray-900">Subject: {emailSubject}</div>}
                    {emailBody || (
                        <>
                            Hi {firstName},<br /><br />
                            Loved your recent post about scaling operations at {businessName}. I noticed you might be facing challenges with workflow automation.<br /><br />
                            We've helped similar companies streamline these exact processes. Would you be open to a quick 10-min chat next week?
                        </>
                    )}
                </div>
            </div>

            {/* 2. WhatsApp Outreach */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#25D366]"></div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">WhatsApp Script</h3>
                            <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase">Direct Outreach Script</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-[10px] font-bold hover:bg-[#25D366]/5 text-[#25D366]"
                        onClick={async () => {
                            const text = whatsappBody || `Hi ${firstName}, it's Sarah from [Your Company]...`;
                            const cleanPhone = (phoneStr || '').replace(/\D/g, '');
                            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                    >
                        Send
                    </Button>
                </div>
                <div className="bg-gray-50/50 p-5 rounded-xl text-sm text-gray-700 font-medium leading-relaxed border border-gray-100 whitespace-pre-line group-hover:border-green-100 transition-colors">
                    {whatsappBody || (
                        <>
                            Hi {firstName}, it's Sarah from [Your Company]. Wanted to reach out regarding the solutions we discussed. Do you have 5 mins tomorrow to sync?
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesTab;

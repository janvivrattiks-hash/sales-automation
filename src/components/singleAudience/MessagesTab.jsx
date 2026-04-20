import React, { useState } from 'react';
import { Mail, X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import Api from '../../../scripts/Api';
import { toast } from 'react-toastify';
import RichTextEditor from '../ui/RichTextEditor';

const MessagesTab = ({
    messagesData,
    isLoadingMessages,
    contactName,
    businessName,
    emailsArray,
    phoneStr,
    businessId,
    adminEmail
}) => {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [manualEmail, setManualEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [subject, setSubject] = useState('');

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

    const finalRecipientEmail = manualEmail;
    const hasExistingEmail = emailsArray.length > 0 && emailsArray[0] !== 'N/A';

    const handleSendEmail = async () => {
        if (!finalRecipientEmail) {
            setEmailError('Please provide a valid email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(finalRecipientEmail)) {
            setEmailError('Please enter a valid email format.');
            return;
        }

        try {
            setIsSending(true);
            setEmailError('');
            const token = localStorage.getItem('admin_token');
            
            const payload = {
                lead_id: businessId, // Matches backend 'lead_id'
                recipient_email: finalRecipientEmail,
                subject: subject || emailSubject || `Scaling your operations at ${businessName}`,
                content_html: editorContent || emailBody // Backend expects content_html
            };

            const response = await Api.sendGmailOutreach(payload, token);
            if (response) {
                setShowEmailModal(false);
                setManualEmail('');
            }
        } catch (error) {
            console.error('Failed to send email:', error);
            if (error.response?.status === 403) {
                toast.error("Please connect your Google account first!");
                // Optionally trigger connect logic
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleInitialSendAction = async () => {
        try {
            setIsConnecting(true);
            const token = localStorage.getItem('admin_token');
            
            // We'll "test" the connection by trying to fetch history or syncing. 
            // Most reliable way: call the connection URL check or a simple history fetch.
            // If the user is NOT connected, the backend will return 403.
            try {
                await Api.getGmailLeadHistory(businessId, token);
                
                // If we reach here, user is connected. Open the modal.
                const initialEmail = (emailsArray.length > 0 && emailsArray[0] !== 'N/A') ? emailsArray[0] : '';
                setManualEmail(initialEmail);
                setSubject(emailSubject || `Scaling your operations at ${businessName}`);
                setEditorContent(emailBody || `Hi ${firstName},<br/><br/>I loved your work at ${businessName}...`);
                setShowEmailModal(true);
            } catch (err) {
                if (err.response?.status === 403) {
                    // Not connected, redirect to auth in a popup
                    const response = await Api.getGoogleConnectUrl(token);
                    if (response && response.authorization_url) {
                        const width = 600;
                        const height = 700;
                        const left = (window.screen.width / 2) - (width / 2);
                        const top = (window.screen.height / 2) - (height / 2);
                        
                        const popup = window.open(
                            response.authorization_url,
                            'GoogleConnect',
                            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no,toolbar=no,menubar=no`
                        );

                        if (popup) {
                            toast.info("Please complete the sign-in in the popup window.");
                            // Periodic check to see if popup is closed
                            const timer = setInterval(() => {
                                if (popup.closed) {
                                    clearInterval(timer);
                                    toast.success("Connection check: You can now try sending again!");
                                }
                            }, 1000);
                        } else {
                            // Blocked by popup blocker
                            window.location.href = response.authorization_url;
                        }
                    } else {
                        toast.error("Failed to generate connection URL.");
                    }
                } else {
                    // Some other error
                    toast.error("An error occurred while checking connection.");
                }
            }
        } catch (error) {
            console.error("Connection Error:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    // No longer using quillModules/quillFormats here as they are handled inside RichTextEditor

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
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg text-[10px] font-bold hover:bg-[#EA4335]/5 text-[#EA4335]"
                            isLoading={isConnecting}
                            onClick={handleInitialSendAction}
                        >
                            {isConnecting ? 'Checking Connection...' : 'Send'}
                        </Button>
                    </div>
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

            {/* Email Send Modal / Confirmation */}
            {showEmailModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-[#EA4335] p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Send Outreach Email</h3>
                                    <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Admin Email Outreach</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowEmailModal(false);
                                    setEmailError('');
                                }}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">
                            {!hasExistingEmail && (
                                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-2">
                                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm font-bold text-amber-800 leading-tight">
                                        Email of this business is not available, if you have the email of this business put it below manually.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Recipient Email Address</label>
                                    <div className="relative">
                                        <input 
                                            type="email"
                                            value={manualEmail}
                                            onChange={(e) => setManualEmail(e.target.value)}
                                            placeholder="contact@business.com"
                                            className="w-full h-12 pl-4 pr-10 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#EA4335] transition-all outline-none font-bold text-gray-800 placeholder:text-gray-300"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Mail size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Subject</label>
                                    <input 
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#EA4335] transition-all outline-none font-bold text-gray-800"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Message Body</label>
                                    <div className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-100 focus-within:border-[#EA4335] transition-all">
                                        <RichTextEditor 
                                            value={editorContent}
                                            onChange={setEditorContent}
                                            placeholder="Write your email content here..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {emailError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold animate-in slide-in-from-top-2">
                                    <AlertCircle size={14} />
                                    {emailError}
                                </div>
                            )}

                            <div className="pt-2 flex gap-3">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 h-12 rounded-xl text-sm font-black border-2 border-gray-100"
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        setEmailError('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    className="flex-1 h-12 rounded-xl text-sm font-black bg-[#EA4335] hover:bg-[#d63d2f] text-white shadow-xl shadow-red-500/20"
                                    onClick={handleSendEmail}
                                    isLoading={isSending}
                                >
                                    {isSending ? 'Sending...' : 'Send Now'}
                                </Button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <CheckCircle2 size={12} className="text-gray-400" />
                                <span>Sent from {adminEmail || 'Admin System'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesTab;

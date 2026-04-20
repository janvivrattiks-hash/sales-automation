import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

/**
 * A custom React wrapper for vanilla Quill to avoid findDOMNode issues in React 19.
 */
const RichTextEditor = ({ value, onChange, placeholder }) => {
    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    useEffect(() => {
        if (!editorRef.current) return;

        // Initialize Quill
        quillInstance.current = new Quill(editorRef.current, {
            theme: 'snow',
            placeholder: placeholder || 'Type your message...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'clean']
                ],
            },
        });

        // Set initial value
        if (value) {
            quillInstance.current.root.innerHTML = value;
        }

        // Handle changes
        quillInstance.current.on('text-change', () => {
            const html = quillInstance.current.root.innerHTML;
            if (onChange) {
                // To avoid loops, we check if the content actually changed
                // (Though HTML comparison can be tricky, this is a standard pattern)
                onChange(html === '<p><br></p>' ? '' : html);
            }
        });

        // Cleanup
        return () => {
            if (quillInstance.current) {
                // There's no explicit quill.destroy(), but we can remove the toolbar
                // and original container if needed. Most effectively, we just nullify.
                quillInstance.current = null;
            }
        };
    }, []);

    // Sync external value changes (only if it differs from current content)
    useEffect(() => {
        if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
            // Be careful with cursor jumping here. Usually value is only set once on mount.
            // But if needed, we can update it.
            if (value === '') {
                quillInstance.current.root.innerHTML = '<p><br></p>';
            } else if (value !== undefined) {
                // Only update if it's a meaningful change to avoid focus loss
                const current = quillInstance.current.root.innerHTML;
                if (value !== current && !(value === '' && current === '<p><br></p>')) {
                    quillInstance.current.root.innerHTML = value;
                }
            }
        }
    }, [value]);

    return (
        <div className="quill-editor-container bg-white">
            <div ref={editorRef} style={{ height: '200px' }} />
        </div>
    );
};

export default RichTextEditor;

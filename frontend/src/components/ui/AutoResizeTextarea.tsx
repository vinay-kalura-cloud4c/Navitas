import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ minRows = 1, maxRows = 10, className = '', onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // Expose the internal ref to parent components
    useImperativeHandle(ref, () => internalRef.current!, []);

    const adjustHeight = () => {
      const textarea = internalRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate the height based on content
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
      const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom);

      const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;

      // Show scrollbar if content exceeds maxRows
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      if (onChange) {
        onChange(e);
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value]);

    useEffect(() => {
      // Adjust height on mount
      adjustHeight();
    }, []);

    return (
      <textarea
        ref={internalRef}
        className={`resize-none transition-all duration-200 ${className}`}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

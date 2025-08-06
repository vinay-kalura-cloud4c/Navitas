import React from 'react';
import ReactMarkdown from 'react-markdown';

const QuestionModal = ({ questions, onClose }) => {
    // Parse and format the questions properly
    const formatQuestions = (questionsData) => {
        if (!questionsData) return "No questions available.";

        // If it's a string that looks like JSON, parse it
        if (typeof questionsData === 'string') {
            try {
                // Try to parse as JSON first
                const parsed = JSON.parse(questionsData);
                if (parsed.content) {
                    return parsed.content;
                }
                return questionsData;
            } catch (e) {
                // If not JSON, return as is
                return questionsData;
            }
        }

        // If it's already an object with content
        if (typeof questionsData === 'object' && questionsData.content) {
            return questionsData.content;
        }

        // If it's an array, join with line breaks
        if (Array.isArray(questionsData)) {
            return questionsData.join('\n\n');
        }

        // Fallback
        return String(questionsData);
    };

    const formattedQuestions = formatQuestions(questions);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Interview Questions</h2>
                        <p className="text-sm text-gray-600 mt-1">Generated questions for candidate assessment</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose prose-lg max-w-none">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border-l-4 border-blue-400">
                            <p className="text-blue-800 font-medium mb-2">📋 Instructions</p>
                            <p className="text-blue-700 text-sm">
                                These questions are designed to assess the candidate's knowledge and experience.
                                Use them as a guide during the interview process.
                            </p>
                        </div>

                        <div className="formatted-questions space-y-4">
                            <ReactMarkdown
                                components={{
                                    // Custom styling for different markdown elements
                                    h1: ({ children, ...props }) => (
                                        <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200" {...props}>
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children, ...props }) => (
                                        <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6" {...props}>
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children, ...props }) => (
                                        <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4" {...props}>
                                            {children}
                                        </h3>
                                    ),
                                    p: ({ children, ...props }) => (
                                        <p className="text-gray-700 leading-relaxed mb-4" {...props}>
                                            {children}
                                        </p>
                                    ),
                                    strong: ({ children, ...props }) => (
                                        <strong className="font-semibold text-gray-900 bg-yellow-100 px-1 rounded" {...props}>
                                            {children}
                                        </strong>
                                    ),
                                    ul: ({ children, ...props }) => (
                                        <ul className="list-disc list-inside space-y-2 mb-4 ml-4" {...props}>
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children, ...props }) => (
                                        <ol className="list-decimal list-inside space-y-2 mb-4 ml-4" {...props}>
                                            {children}
                                        </ol>
                                    ),
                                    li: ({ children, ...props }) => (
                                        <li className="text-gray-700 leading-relaxed" {...props}>
                                            {children}
                                        </li>
                                    ),
                                    blockquote: ({ children, ...props }) => (
                                        <blockquote className="border-l-4 border-blue-400 bg-blue-50 p-4 my-4 italic" {...props}>
                                            {children}
                                        </blockquote>
                                    ),
                                    code: ({ children, inline, ...props }) => {
                                        if (inline) {
                                            return (
                                                <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <code className="block bg-gray-100 text-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    pre: ({ children, ...props }) => (
                                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" {...props}>
                                            {children}
                                        </pre>
                                    ),
                                }}
                            >
                                {formattedQuestions}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            💡 Tip: Customize these questions based on your specific requirements
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(formattedQuestions);
                                    // You could add a toast notification here
                                }}
                                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                📋 Copy Questions
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionModal;

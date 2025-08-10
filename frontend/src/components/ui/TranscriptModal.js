import React, { useState, useMemo } from 'react';

const TranscriptModal = ({ transcript, aiSummary, onClose }) => {
    console.log(aiSummary);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('transcript');

    // Parse WEBVTT transcript into structured data
    const parsedTranscript = useMemo(() => {
        if (!transcript) return [];

        const entries = transcript.split('\r\n\r\n').filter(entry =>
            entry.trim() &&
            !entry.startsWith('WEBVTT') &&
            entry.includes('-->')
        );

        return entries.map((entry, index) => {
            const lines = entry.split('\r\n').filter(line => line.trim());
            const timeMatch = lines[0]?.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
            const speakerMatch = lines[1]?.match(/<v (.+?)>(.+?)<\/v>/);

            return {
                id: index,
                startTime: timeMatch?.[1] || '',
                endTime: timeMatch?.[2] || '',
                speaker: speakerMatch?.[1] || 'Unknown',
                text: speakerMatch?.[2] || lines[1] || '',
                timestamp: timeMatch?.[1]?.replace(/\.\d{3}$/, '') || ''
            };
        }).filter(entry => entry.text);
    }, [transcript]);

    // Filter transcript based on search term
    const filteredTranscript = useMemo(() => {
        if (!searchTerm) return parsedTranscript;

        return parsedTranscript.filter(entry =>
            entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.speaker.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [parsedTranscript, searchTerm]);

    // Get unique speakers for color coding
    const speakers = useMemo(() => {
        const uniqueSpeakers = [...new Set(parsedTranscript.map(entry => entry.speaker))];
        const colors = [
            'bg-blue-50 border-blue-200 text-blue-900',
            'bg-green-50 border-green-200 text-green-900',
            'bg-purple-50 border-purple-200 text-purple-900',
            'bg-orange-50 border-orange-200 text-orange-900',
            'bg-pink-50 border-pink-200 text-pink-900'
        ];

        return Object.fromEntries(
            uniqueSpeakers.map((speaker, index) => [
                speaker, colors[index % colors.length]
            ])
        );
    }, [parsedTranscript]);

    // ✅ Improved markdown rendering function
    const renderMarkdown = (text) => {
        if (!text || typeof text !== 'string') {
            return <p className="text-gray-500">No AI summary available.</p>;
        }

        // Clean and normalize the text
        const cleanText = text
            .replace(/\r\n/g, '\n')  // Normalize line endings
            .replace(/\r/g, '\n')    // Handle different line ending formats
            .trim();

        if (!cleanText) {
            return <p className="text-gray-500">No AI summary available.</p>;
        }

        const lines = cleanText.split('\n');
        const elements = [];
        let currentListItems = [];
        let listType = null; // 'numbered' or 'bullet'
        
        const flushList = () => {
            if (currentListItems.length > 0) {
                if (listType === 'numbered') {
                    elements.push(
                        <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-2 mb-4 ml-4">
                            {currentListItems.map((item, idx) => (
                                <li key={idx} className="text-gray-700">
                                    {item}
                                </li>
                            ))}
                        </ol>
                    );
                } else if (listType === 'bullet') {
                    elements.push(
                        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
                            {currentListItems.map((item, idx) => (
                                <li key={idx} className="text-gray-600">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    );
                }
                currentListItems = [];
                listType = null;
            }
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Skip empty lines but add spacing
            if (!trimmedLine) {
                flushList();
                elements.push(<div key={`space-${index}`} className="mb-2"></div>);
                return;
            }

            // Handle headers (## or ###)
            if (trimmedLine.match(/^#{1,3}\s/)) {
                flushList();
                const headerLevel = trimmedLine.match(/^(#{1,3})\s/)[1].length;
                const headerText = trimmedLine.replace(/^#{1,3}\s/, '');
                
                const headerClasses = {
                    1: 'text-2xl font-bold text-gray-800 mt-8 mb-4 border-b-2 border-blue-200 pb-2',
                    2: 'text-xl font-bold text-gray-800 mt-6 mb-3 border-b-2 border-blue-200 pb-2',
                    3: 'text-lg font-semibold text-gray-700 mt-4 mb-2'
                };

                const HeaderTag = `h${headerLevel}`;
                elements.push(
                    React.createElement(HeaderTag, {
                        key: `header-${index}`,
                        className: headerClasses[headerLevel]
                    }, parseInlineFormatting(headerText))
                );
                return;
            }

            // Handle numbered lists (1. 2. 3. etc.)
            const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
            if (numberedMatch) {
                if (listType !== 'numbered') {
                    flushList();
                    listType = 'numbered';
                }
                
                const listItemText = numberedMatch[2];
                const formattedText = parseInlineFormatting(listItemText);
                currentListItems.push(formattedText);
                return;
            }

            // Handle bullet points (- or •)
            const bulletMatch = trimmedLine.match(/^[-•]\s+(.+)/);
            if (bulletMatch) {
                if (listType !== 'bullet') {
                    flushList();
                    listType = 'bullet';
                }
                
                const listItemText = bulletMatch[1];
                const formattedText = parseInlineFormatting(listItemText);
                currentListItems.push(formattedText);
                return;
            }

            // If we get here, it's a regular paragraph
            flushList();
            
            // Handle paragraphs with inline formatting
            const formattedText = parseInlineFormatting(trimmedLine);
            elements.push(
                <p key={`para-${index}`} className="mb-3 text-gray-700 leading-relaxed">
                    {formattedText}
                </p>
            );
        });

        // Don't forget to flush any remaining list items
        flushList();

        return <div className="markdown-content">{elements}</div>;
    };

    // ✅ Helper function to parse inline formatting (bold, italic, etc.)
    const parseInlineFormatting = (text) => {
        if (!text || typeof text !== 'string') return text;

        const elements = [];
        let currentIndex = 0;
        
        // Regular expression to match **bold**, *italic*, and `code`
        const inlineRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
        let match;

        while ((match = inlineRegex.exec(text)) !== null) {
            // Add text before the match
            if (match.index > currentIndex) {
                elements.push(text.slice(currentIndex, match.index));
            }

            const fullMatch = match[1];
            const boldText = match[2];
            const italicText = match[3];
            const codeText = match[4];

            if (boldText) {
                elements.push(
                    <strong key={`bold-${match.index}`} className="font-semibold text-gray-800">
                        {boldText}
                    </strong>
                );
            } else if (italicText) {
                elements.push(
                    <em key={`italic-${match.index}`} className="italic text-gray-700">
                        {italicText}
                    </em>
                );
            } else if (codeText) {
                elements.push(
                    <code key={`code-${match.index}`} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                        {codeText}
                    </code>
                );
            }

            currentIndex = match.index + fullMatch.length;
        }

        // Add remaining text
        if (currentIndex < text.length) {
            elements.push(text.slice(currentIndex));
        }

        return elements.length > 0 ? elements : text;
    };

    const exportTranscript = () => {
        const textContent = parsedTranscript
            .map(entry => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
            .join('\n\n');

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meeting-transcript.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportAISummary = () => {
        if (!aiSummary) return;

        const blob = new Blob([aiSummary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interview-analysis.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {activeTab === 'transcript' ? 'Meeting Transcript' : 'AI Interview Analysis'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {activeTab === 'transcript'
                                ? `${parsedTranscript.length} entries • ${Object.keys(speakers).length} speakers`
                                : 'Automated candidate evaluation and recommendations'
                            }
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="border-b bg-gray-50">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('transcript')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'transcript'
                                    ? 'border-blue-500 text-blue-600 bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            📄 Transcript
                        </button>
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analysis'
                                    ? 'border-blue-500 text-blue-600 bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            🤖 AI Analysis
                        </button>
                    </div>
                </div>

                {/* Search and Controls - Only show for transcript tab */}
                {activeTab === 'transcript' && (
                    <div className="p-4 border-b bg-gray-50">
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search transcript..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={exportTranscript}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Export Transcript
                            </button>
                        </div>

                        {/* Speaker Legend */}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(speakers).map(([speaker, colorClass]) => (
                                <span
                                    key={speaker}
                                    className={`px-2 py-1 text-xs rounded-full border ${colorClass}`}
                                >
                                    {speaker}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Analysis Controls - Only show for analysis tab */}
                {activeTab === 'analysis' && (
                    <div className="p-4 border-b bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                {aiSummary ? `Analysis ready • ${aiSummary.length} characters` : 'No analysis available'}
                            </div>
                            <button
                                onClick={exportAISummary}
                                disabled={!aiSummary}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Export Analysis
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'transcript' ? (
                        // Transcript Content
                        filteredTranscript.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                {searchTerm ? 'No results found for your search.' : 'No transcript data available.'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTranscript.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={`p-4 rounded-lg border-l-4 ${speakers[entry.speaker]} hover:shadow-sm transition-shadow`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-sm">
                                                {entry.speaker}
                                            </span>
                                            <span className="text-xs text-gray-500 font-mono">
                                                {entry.timestamp}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed">
                                            {entry.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        // AI Analysis Content
                        <div className="max-w-4xl">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
                                <div className="flex items-center mb-2">
                                    <span className="text-2xl mr-3">🤖</span>
                                    <h3 className="text-lg font-semibold text-gray-800">AI-Powered Interview Analysis</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    This analysis is generated using advanced AI to evaluate the candidate's performance,
                                    technical skills, and overall suitability for the position.
                                </p>
                            </div>

                            {/* ✅ Improved markdown rendering with better error handling */}
                            <div className="prose prose-blue max-w-none bg-white p-6 rounded-lg border">
                                {aiSummary ? (
                                    renderMarkdown(aiSummary)
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        <div className="text-4xl mb-4">📊</div>
                                        <p className="text-lg font-medium">No Analysis Available</p>
                                        <p className="text-sm mt-2">The AI analysis will appear here after processing the interview transcript.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 text-center">
                    <p className="text-xs text-gray-500">
                        {activeTab === 'transcript'
                            ? (searchTerm && `${filteredTranscript.length} of ${parsedTranscript.length} entries shown`)
                            : 'Analysis generated automatically after interview completion'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TranscriptModal;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconUpload, IconCheck, IconX, IconTrash } from '@tabler/icons-react';

const DataBank = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const addFiles = (newFiles) => {
        const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');

        if (pdfFiles.length !== newFiles.length) {
            alert('Some files were skipped. Only PDF files are accepted.');
        }

        setSelectedFiles(prev => [...prev, ...pdfFiles]);
        setUploadResults(null);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadResults(null);

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:8000/databank/get_metadata_then_store_in_databank', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                setUploadResults(result.results);

                // Clear only successful files
                if (result.results.failed.length === 0) {
                    setSelectedFiles([]);
                } else {
                    // Keep only failed files
                    const failedFilenames = result.results.failed.map(f => f.filename);
                    setSelectedFiles(prev => prev.filter(file => failedFilenames.includes(file.name)));
                }
            } else {
                const error = await response.json();
                setUploadResults({
                    total_files: selectedFiles.length,
                    successful: [],
                    failed: selectedFiles.map(f => ({
                        filename: f.name,
                        error: error.detail || 'Upload failed'
                    }))
                });
            }
        } catch (error) {
            setUploadResults({
                total_files: selectedFiles.length,
                successful: [],
                failed: selectedFiles.map(f => ({
                    filename: f.name,
                    error: 'Network error. Please try again.'
                }))
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleClearAll = () => {
        setSelectedFiles([]);
        setUploadResults(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Data Bank
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Upload candidate resumes to add them to your internal data bank (supports multiple files)
                </p>

                {/* Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800'
                        }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <IconUpload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Upload Resumes (PDF only)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Drag and drop your PDF files here, or click to browse
                    </p>
                    <input
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload">
                        <span className="px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition inline-block">
                            Browse Files
                        </span>
                    </label>
                </div>

                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Selected Files ({selectedFiles.length})
                            </h3>
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-700 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded">
                                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                                <path d="M14 2v6h6M9 13h6M9 17h6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                                    >
                                        <IconTrash className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''} to Data Bank`}
                        </button>
                    </motion.div>
                )}

                {/* Upload Results */}
                {uploadResults && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 space-y-4"
                        >
                            {/* Success Messages */}
                            {uploadResults.successful.length > 0 && (
                                <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <IconCheck className="w-6 h-6 text-green-600" />
                                        <h4 className="text-green-800 dark:text-green-200 font-semibold">
                                            Successfully Added ({uploadResults.successful.length})
                                        </h4>
                                    </div>
                                    <ul className="space-y-1 ml-9">
                                        {uploadResults.successful.map((result, index) => (
                                            <li key={index} className="text-sm text-green-700 dark:text-green-300">
                                                ✓ {result.filename}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Error Messages */}
                            {uploadResults.failed.length > 0 && (
                                <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <IconX className="w-6 h-6 text-red-600" />
                                        <h4 className="text-red-800 dark:text-red-200 font-semibold">
                                            Failed ({uploadResults.failed.length})
                                        </h4>
                                    </div>
                                    <ul className="space-y-2 ml-9">
                                        {uploadResults.failed.map((result, index) => (
                                            <li key={index} className="text-sm">
                                                <p className="text-red-700 dark:text-red-300 font-medium">
                                                    ✗ {result.filename}
                                                </p>
                                                <p className="text-red-600 dark:text-red-400 text-xs ml-4">
                                                    {result.error}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default DataBank;

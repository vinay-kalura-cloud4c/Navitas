import React from 'react';
import { IconCheck, IconAlertCircle, IconX } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notification = ({ notification, onClose }) => {
    if (!notification) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed top-4 right-4 z-50 max-w-md"
            >
                <div
                    className={`flex items-start gap-3 p-4 rounded-lg shadow-2xl border-2 ${notification.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        }`}
                >
                    {notification.type === 'success' ? (
                        <IconCheck className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                        <IconAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                        <p className={`font-medium ${notification.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                            {notification.type === 'success' ? 'Success' : 'Error'}
                        </p>
                        <p className={`text-sm mt-1 ${notification.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            {notification.message}
                        </p>
                    </div>
                    <button onClick={onClose} className={notification.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}>
                        <IconX className="h-5 w-5" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Notification;

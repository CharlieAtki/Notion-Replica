import React from 'react';
import { FiInfo, FiX } from 'react-icons/fi'; // Added FiX for the close button
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A reusable modal component to display informational content.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {string} props.title - The title of the info tab.
 * @param {string[]} props.paragraphs - An array of strings, where each string represents a paragraph of information.
 * @param {React.ReactNode} [props.icon] - Optional. A React node to be used as the icon. Defaults to FiInfo.
 */
const InfoTab = ({ isOpen, onClose, title, paragraphs, icon = <FiInfo /> }) => {
    if (!isOpen) return null; // Don't render anything if not open

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" // Overlay
                    onClick={onClose} // Close when clicking outside the modal content
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full relative border border-gray-200 dark:border-gray-700"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                            aria-label="Close"
                        >
                            <FiX size={20} />
                        </button>

                        <div className="flex items-center mb-4">
                            {icon} {/* Render the passed icon or default FiInfo */}
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white ml-2">{title}</h3>
                        </div>

                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {paragraphs.map((paragraph, index) => (
                                <p key={index} className="mb-2 last:mb-0">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InfoTab;
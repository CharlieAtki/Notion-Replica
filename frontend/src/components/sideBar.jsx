import { useState } from "react";
import {FiPlus, FiUserPlus, FiChevronLeft, FiChevronRight, FiPlusCircle} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const SideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <AnimatePresence>
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`
                    relative
                    ${isCollapsed ? "w-16" : "w-42"}
                    bg-white dark:bg-gray-900 shadow-md border-r border-gray-200 dark:border-gray-700
                    flex flex-col justify-between transition-all duration-300 ease-in-out
                `}
            >
                {/* Top section */}
                <div className="flex flex-col p-4 space-y-4">
                    <button className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md
                        text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
                        ${isCollapsed ? "justify-center" : "justify-start"}
                    `}>
                        <FiPlus className="text-lg" />
                        {!isCollapsed && <span className="ml-2">Add Page</span>}
                    </button>
                </div>

                {/* Collapse Button */}
                <div className="absolute top-4 right-[-12px]">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full p-1 shadow hover:scale-105 transition"
                    >
                        {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    </button>
                </div>

                {/* Bottom section */}
                <div className="p-4">
                    <button className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md
                        text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
                        ${isCollapsed ? "justify-center" : "justify-start"}
                    `}>
                        <FiUserPlus className="text-lg" />
                        {!isCollapsed && <span className="ml-2">Invite Members</span>}
                    </button>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
};

export default SideBar;
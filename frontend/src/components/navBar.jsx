import { useNavigate, useLocation } from "react-router-dom";
import {useEffect, useState} from "react";
import { FiMenu, FiX, FiChevronDown, FiHome, FiSettings, FiBarChart2, FiFolder, FiLogOut } from "react-icons/fi";
import { IconContext } from "react-icons";
import { motion, AnimatePresence } from "framer-motion";

const NavBar = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const location = useLocation(); // useState for fetching current URL
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const [currentUserInfo, setCurrentUserInfo] = useState(""); // Holds current user info

    // An array of objects with hardcoded information about the different sections
    const navItems = [
        {
            title: "Dashboard",
            description: "View Your Data",
            link: "/dashboard",
            icon: <FiBarChart2 />,
            requiresAuth: true,
            submenu: [
                {
                    title: "Overview",
                    link: "/dashboard",
                },
                {
                    title: "Stats",
                    link: "/dashboard/stats",
                },
            ]
        },
        {
            title: "Account",
            description: "Manage Your Account",
            link: "/account",
            icon: <FiHome />,
        },
    ];

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/user-auth/fetchCurrentUser`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'content-type': 'application/json',
                        'Accept': 'application/json',
                    }
                });

                const result = await response.json();
                setCurrentUserInfo(result.user);

            } catch (error) {
                console.log(error);
            }
        }

        fetchCurrentUser();
    }, [])

    // Function to delete the user session
    const userLogout = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/user-auth/logout`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            // If the session has been deleted, navigate the user to the loginPage
            const result = await response.json();
            if (result.success) {
                navigate("/login");
            }

        } catch (error) {
            console.log(error);
        }
    }

    // Functions to determine current route
    const isExactMatch = (path) => location.pathname === path;

    // Function to determine whether parent item is active
    const isParentActive = (item) => {
        if (!item.submenu) return isExactMatch(item.link);
        return location.pathname === item.link || item.submenu.some(sub => isExactMatch(sub.link));
    };


    // Function creating the logic for opening the dropdown menu
    const toggleDropdown = (index) => {
        setOpenDropdown(openDropdown === index ? null : index);
    };

    return (
        <IconContext.Provider value={{ className: "inline-block mr-2 text-lg" }}>
            <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-screen-xl  px-2 sm:px-4 lg:px-6">
                    <div className="flex justify-between items-center h-18">
                        {/* Title */}
                        {navItems
                            .filter((item) => {
                                if (item.link === location.pathname) return true;
                                if (item.submenu) {
                                    return item.submenu.some(sub => sub.link === location.pathname);
                                }
                                return false;
                            })
                            .map((item, index) => (
                                <div key={index} className="flex flex-col">
                                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">{item.title || "Undefined"}</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.description || "Undefined"}</p>
                                </div>
                            ))}

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex gap-6 items-center relative">
                            {navItems.map((item, index) => (
                                <div key={index} className="relative">
                                    <button
                                        onClick={() => item.submenu ? toggleDropdown(index) : navigate(item.link)}
                                        // Ternary operator for UI. IsActive is a method checking if the URL specified is currently being used.
                                        className={`flex items-center px-3 py-2 rounded-md font-medium transition-all ${
                                            isParentActive(item)
                                                ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-white"
                                                : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        {item.icon}
                                        {item.title}
                                        {item.submenu && ( // Animation for the submenu dropdown
                                            <motion.span
                                                animate={{ rotate: openDropdown === index ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <FiChevronDown className="ml-1" />
                                            </motion.span>
                                        )}
                                    </button>



                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {item.submenu && openDropdown === index && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-700 shadow-lg rounded-md z-50 min-w-[150px]"
                                            >
                                                {item.submenu.map((sub, subIndex) => (
                                                    <button
                                                        key={subIndex}
                                                        onClick={() => {
                                                            navigate(sub.link);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm ${
                                                            isExactMatch(sub.link)
                                                                ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-white"
                                                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        }`}
                                                    >
                                                        {sub.title}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}

                            {/* Logout button (Separate due to function / API cal)l */}
                            <button
                                className="flex items-center px-3 py-2 rounded-md font-medium transition-all text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => {userLogout()}}>
                                <FiLogOut />
                                LogOut
                            </button>
                        </nav>

                        {/* Current user info display */}
                        <div className="justify-center">
                            <label>
                                {/* Conditionally render only if currentUserInfo.orgs exists and is an array */}
                                {currentUserInfo?.orgs && Array.isArray(currentUserInfo.orgs) && currentUserInfo.orgs.map((item, index) => (
                                    <label key={index} className="text-lg text-white">
                                        {item.name}
                                    </label>
                                ))}
                            </label>
                            <h1 className="text-sm text-gray-500 dark:text-gray-400 ">
                                {currentUserInfo?.email} {/* Use optional chaining for safety */}
                            </h1>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="text-gray-700 dark:text-gray-200"
                            >
                                {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="md:hidden mt-4 space-y-2 overflow-hidden"
                            >
                                {navItems.map((item, index) => (
                                    <div key={index} className="flex flex-col">
                                        <button
                                            onClick={() => {
                                                if (item.submenu) {
                                                    toggleDropdown(index);
                                                } else {
                                                    navigate(item.link);
                                                    setMenuOpen(false);
                                                }
                                            }}
                                            className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                                                isParentActive(item)
                                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-white"
                                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                        >
                                            {item.icon}
                                            {item.title}
                                            {item.submenu && (
                                                <motion.span
                                                    animate={{ rotate: openDropdown === index ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <FiChevronDown className="ml-auto" />
                                                </motion.span>
                                            )}
                                        </button>

                                        {item.submenu && openDropdown === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="ml-6 overflow-hidden"
                                            >
                                                {item.submenu.map((sub, subIndex) => (
                                                    <button
                                                        key={subIndex}
                                                        onClick={() => {
                                                            navigate(sub.link);
                                                            setMenuOpen(false);
                                                        }}
                                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                                            isExactMatch(sub.link)
                                                                ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-white"
                                                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        }`}
                                                    >
                                                        {sub.title}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                                {/* Logout button (Separate due to function / API cal)l */}
                            <button
                                className="w-full text-left px-4 py-2 rounded-md flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {userLogout()}}>
                                <FiLogOut />
                                LogOut
                            </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>
        </IconContext.Provider>
    );
};

export default NavBar;
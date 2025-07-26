import { useNavigate, useLocation } from "react-router-dom";
import {useEffect, useState} from "react";
import { FiMenu, FiX, FiChevronDown, FiHome, FiSettings, FiBarChart2, FiFolder, FiLogOut, FiInfo } from "react-icons/fi";
import { IconContext } from "react-icons";
import { motion, AnimatePresence } from "framer-motion";
import InfoTab from './InfoTab'; // Import the new InfoTab modal component

const NavBar = ({ onOrgChange }) => { // Add prop to notify parent of org changes
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const location = useLocation(); // useState for fetching current URL
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openSwitchOrgMenu, setOpenSwitchOrgMenu] = useState(false);
    const [orgCodeInput, setOrgCodeInput] = useState(""); // State for the organization code input field
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // State to control InfoTab modal visibility

    const [currentUserInfo, setCurrentUserInfo] = useState(""); // Holds current user info
    const [selectedOrg, setSelectedOrg] = useState(null); // Track currently selected org

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
            console.log('User data:', result.user); // Debug log
            setCurrentUserInfo(result.user);

            // Find the current org based on currentOrgId
            if (result.user?.orgs && result.user.currentOrgId) {
                const currentOrg = result.user.orgs.find(org =>
                    org.orgId.toString() === result.user.currentOrgId.toString()
                );
                if (currentOrg) {
                    setSelectedOrg({
                        _id: currentOrg.orgId,
                        name: currentOrg.name
                    });
                }
            } else if (result.user?.orgs && result.user.orgs.length > 0) {
                // Fallback to first org if no currentOrgId
                setSelectedOrg({
                    _id: result.user.orgs[0].orgId,
                    name: result.user.orgs[0].name
                });
            }

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
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

    // Function creating the logic for opening the dropdown (Non dynamic navbar)
    const toggleSwitchOrgDropdown = () => {
        setOpenSwitchOrgMenu(!openSwitchOrgMenu);
        // Reset org code input when closing the dropdown
        if (openSwitchOrgMenu) {
            setOrgCodeInput("");
        }
    };

    // Function to open the InfoTab modal
    const openInfoModal = (e) => {
        e.stopPropagation(); // Prevent dropdown from closing when clicking info icon
        setIsInfoModalOpen(true);
    };

    // Function to close the InfoTab modal
    const closeInfoModal = () => {
        setIsInfoModalOpen(false);
    };

    // Function to handle org selection from existing orgs
    const handleOrgSwitch = async (org) => {
        try {
            // Call API to switch organization
            const response = await fetch(`${backendUrl}/api/user-auth/switchOrg`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ orgId: org.orgId || org._id }),
            });

            const result = await response.json();
            if (result.success) {
                setSelectedOrg({
                    _id: result.org._id,
                    name: result.org.name
                });
                setOpenSwitchOrgMenu(false);

                // Refresh current user info to get updated session data
                await fetchCurrentUser();

                // Notify parent component about org change to refresh workspace data
                if (onOrgChange) {
                    onOrgChange(result.org._id);
                }

                window.location.reload();

                console.log('Successfully switched to org:', result.org);
            } else {
                console.error("Failed to switch organization:", result.message);
            }
        } catch (error) {
            console.log("Error switching organization:", error);
        }
    };

    // Function to handle organisation code submission
    const handleOrgCodeSubmit = async (e) => {
        e.preventDefault();

        if (!orgCodeInput.trim()) {
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/user-auth/addUserToOrgAndSwitch`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ orgCode: orgCodeInput }),
            });

            const result = await response.json();
            if (result.success && result.org) {
                setSelectedOrg({
                    _id: result.org._id,
                    name: result.org.name
                });
                setOrgCodeInput(""); // Clear input on success
                setOpenSwitchOrgMenu(false);

                // Refresh current user info to get updated session data
                await fetchCurrentUser();

                // Notify parent component about org change to refresh workspace data
                if (onOrgChange) {
                    onOrgChange(result.org._id);
                }

                window.location.reload();

                console.log('Successfully joined and switched to org:', result.org);
            } else {
                // Handle the error message
                console.error("Failed to switch organization by code:", result.message);
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.log("Error joining organization:", error);
            alert("An error occurred while joining the organization.");
        }
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

                        {/* Desktop Nav and Right Side Controls */}
                        <div className="hidden md:flex gap-6 items-center">
                            {/* Navigation Items */}
                            <nav className="flex gap-6 items-center relative">
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
                                                    // Added classes for elevation effect
                                                    className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-700 rounded-md z-50 min-w-[150px] shadow-lg border border-gray-200 dark:border-gray-600"
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
                            </nav>

                            {/* Switch Current Org */}
                            <div className="relative org-dropdown">
                                <button
                                    className="flex items-center px-3 py-2 rounded-md font-medium transition-all text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={toggleSwitchOrgDropdown}
                                >
                                    <FiFolder className="mr-2" />
                                    {selectedOrg?.name || 'Select Org'}
                                    <motion.span
                                        animate={{ rotate: openSwitchOrgMenu ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <FiChevronDown className="ml-1" />
                                    </motion.span>
                                </button>

                                {/* Org Dropdown */}
                                <AnimatePresence>
                                    {openSwitchOrgMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            // Added classes for elevation effect
                                            className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-700 rounded-md z-50 min-w-[250px] shadow-lg border border-gray-200 dark:border-gray-600"
                                        >
                                            <div className="py-2">
                                                {/* Info button for the modal */}
                                                <div className="px-4 py-2 flex justify-between items-center">
                                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Switch Organization
                                                    </div>
                                                    <button
                                                        onClick={openInfoModal} // Open the modal on click
                                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        aria-label="Organization Info"
                                                    >
                                                        <FiInfo size={16} />
                                                    </button>
                                                </div>

                                                {currentUserInfo?.orgs && currentUserInfo.orgs.length > 0 && (
                                                    <>
                                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Your Organizations
                                                        </div>
                                                        {currentUserInfo.orgs.map((org, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleOrgSwitch(org)}
                                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                                    selectedOrg?._id?.toString() === org.orgId?.toString()
                                                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-white"
                                                                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                                }`}
                                                            >
                                                                <div className="flex items-center">
                                                                    <FiFolder className="mr-2 text-sm" />
                                                                    <div>
                                                                        <div className="font-medium">{org.name}</div>
                                                                        {org.description && (
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                {org.description}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {selectedOrg?._id?.toString() === org.orgId?.toString() && (
                                                                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                        <hr className="my-2 border-gray-200 dark:border-gray-600" />
                                                    </>
                                                )}

                                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Join with Code
                                                </div>
                                                <form onSubmit={handleOrgCodeSubmit} className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter organization code"
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        value={orgCodeInput}
                                                        onChange={(e) => setOrgCodeInput(e.target.value)}
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    >
                                                        Join
                                                    </button>
                                                </form>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Logout button */}
                            <button
                                className="flex items-center px-3 py-2 rounded-md font-medium transition-all text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => {userLogout()}}>
                                <FiLogOut />
                                LogOut
                            </button>
                        </div>

                        {/* Current user info display */}
                        <div className="justify-center">
                            <h1 className="text-lg text-gray-800 dark:text-white font-medium">
                                {selectedOrg?.name || 'No Organization'}
                            </h1>
                            <h1 className="text-sm text-gray-500 dark:text-gray-400">
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
                                // Mobile menu dropdown also gets elevation
                                className="md:hidden mt-4 space-y-2 overflow-hidden bg-white dark:bg-gray-900 shadow-md rounded-md border border-gray-200 dark:border-gray-700"
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
                                                exit={{ opacity: 0, y: 0 }}
                                                // Added classes for elevation effect
                                                className="ml-6 overflow-hidden bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600"
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

                                {/* Mobile Org Switcher */}
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => toggleSwitchOrgDropdown()}
                                        className="w-full text-left px-4 py-2 rounded-md flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <FiFolder />
                                        Switch Organization
                                        <motion.span
                                            animate={{ rotate: openSwitchOrgMenu ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <FiChevronDown className="ml-auto" />
                                        </motion.span>
                                    </button>

                                    {openSwitchOrgMenu && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            // Added classes for elevation effect
                                            className="ml-6 overflow-hidden bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600"
                                        >
                                            {/* Info button for the modal in mobile */}
                                            <div className="px-4 py-2 flex justify-between items-center">
                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Switch Organization
                                                </div>
                                                <button
                                                    onClick={openInfoModal} // Open the modal on click
                                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    aria-label="Organization Info"
                                                >
                                                    <FiInfo size={16} />
                                                </button>
                                            </div>

                                            {currentUserInfo?.orgs && currentUserInfo.orgs.length > 0 && (
                                                <>
                                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Your Organizations
                                                    </div>
                                                    {currentUserInfo.orgs.map((org, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => {
                                                                handleOrgSwitch(org);
                                                                setMenuOpen(false);
                                                            }}
                                                            className={`block w-full text-left px-4 py-2 text-sm ${
                                                                selectedOrg?._id?.toString() === org.orgId?.toString()
                                                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-white"
                                                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            }`}
                                                        >
                                                            {org.name}
                                                        </button>
                                                    ))}
                                                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                                                </>
                                            )}
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Join with Code
                                            </div>
                                            <form onSubmit={handleOrgCodeSubmit} className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter organization code"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    value={orgCodeInput}
                                                    onChange={(e) => setOrgCodeInput(e.target.value)}
                                                />
                                                <button
                                                    type="submit"
                                                    className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                >
                                                    Join
                                                </button>
                                            </form>
                                        </motion.div>
                                    )}
                                </div>

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

            {/* InfoTab Modal rendered outside the main header structure */}
            <InfoTab
                isOpen={isInfoModalOpen}
                onClose={closeInfoModal}
                title="Understanding Organizations"
                paragraphs={[
                    "Organizations allow you to segment and manage your data separately. Each organization acts as a distinct workspace.",
                    "When you switch organizations, you'll only see the data associated with that specific organization. Your personal account information remains consistent across all organizations you are part of.",
                    "This helps keep your data organized and secure, especially when collaborating or managing multiple projects."
                ]}
            />
        </IconContext.Provider>
    );
};

export default NavBar;
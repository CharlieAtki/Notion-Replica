import NavBar from "../../components/navBar.jsx";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import SideBar from "../../components/sideBar.jsx";
import WorkspaceTable from "../../components/dashboard/workspaceTable.jsx";

const DashboardPage = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/user-auth/authCheck`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'content-type': 'application/json',
                        'Accept': 'application/json',
                    }
                });

                const result = await response.json();

                if (!result || !result.success) {
                    navigate('/login');
                }
            } catch (error) {
                console.error('Auth check error:', error);
                navigate('/login');
            }
        };

        checkLoginStatus();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 min-h-screen flex flex-col">
            {/* Top NavBar stays at the top */}
            <NavBar />

            {/* Below: Sidebar + Page Content in horizontal layout */}
            <div className="flex flex-1">
                <SideBar />
                {/* Page content goes here */}
                <main className="flex-1 bg-white dark:bg-gray-950">
                    {/* Replace with your page routes/components */}
                    <WorkspaceTable />
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
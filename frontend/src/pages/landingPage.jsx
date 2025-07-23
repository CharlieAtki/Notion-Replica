import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 min-h-screen flex flex-col items-center justify-center p-6">
            <h1 className="text-6xl text-gray-400 mb-4">Landing Page</h1>
            <button
                className="rounded-2xl bg-blue-500 text-white px-4 py-2 hover:bg-blue-600"
                onClick={() => navigate("/login")}
            >
                Login Page
            </button>
        </div>
    );
};

export default LandingPage;

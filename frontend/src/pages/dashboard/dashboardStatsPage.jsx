import NavBar from "../../components/navBar.jsx";

const DashboardStatsPage = () => {
    return (
        <div className={"min-h-screen bg-white dark:bg-gray-800 flex flex-col"}>
            <NavBar />
            <h1 className={"p-6"}>Stats Page</h1>
        </div>
    );
};

export default DashboardStatsPage;
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from "./pages/landingPage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import DashboardPage from "./pages/dashboard/dashboardPage.jsx";
import DashboardStatsPage from "./pages/dashboard/dashboardStatsPage.jsx";
import AccountPage from "./pages/account/accountPage.jsx";
import AccountCreationPage from "./pages/accountCreationPage.jsx";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={ <LandingPage /> } />
                <Route path="/login" element={ <LoginPage /> } />
                <Route path="/accountCreation" element={ <AccountCreationPage /> } />
                <Route path="/dashboard" element={ <DashboardPage /> } />
                <Route path="/dashboard/stats" element={ <DashboardStatsPage /> } />
                <Route path="/account" element={ <AccountPage /> } />
            </Routes>
        </Router>
    )
}

export default App;
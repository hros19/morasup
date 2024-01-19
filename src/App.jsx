
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import HomeAdmin from './pages/admin/HomeAdmin';
import HomeStudent from './pages/student/HomeStudent';
import TicketDetails from './pages/student/TicketDetails';
import AdminTicketDetailsOfUser from './pages/admin/AdminTicketUserDetails';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/homeAdmin" element={<HomeAdmin />} />
                <Route path="/homeStudent" element={<HomeStudent />} />
                {/* ticket-details/:id */}
                <Route path="/ticket-details/:ticketId" element={<TicketDetails />} />
                <Route path="/admin/users/:userId" element={<AdminTicketDetailsOfUser />} />
            </Routes>
        </Router>
    );
}

export default App;

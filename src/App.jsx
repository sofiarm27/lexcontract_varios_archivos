import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PublicHeader from './components/PublicHeader';
import Landing from './pages/Landing';
import AboutUs from './pages/AboutUs';
import Support from './pages/Support';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Contracts from './pages/Contracts';
import Users from './pages/Users';
import RegisterClient from './pages/RegisterClient';
import EditClient from './pages/EditClient';
import RegisterContract from './pages/RegisterContract';
import RegisterUser from './pages/RegisterUser';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import LegalLibrary from './pages/LegalLibrary';
import ResetPassword from './pages/ResetPassword';

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <Routes>
          {/* Public Routes with Fixed Header */}
          <Route path="/" element={<><PublicHeader /><div style={{ paddingTop: '80px' }}><Landing /></div></>} />
          <Route path="/about" element={<><PublicHeader /><div style={{ paddingTop: '80px' }}><AboutUs /></div></>} />
          <Route path="/support" element={<><PublicHeader /><div style={{ paddingTop: '80px' }}><Support /></div></>} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* App Routes (Private Layout with Sidebar) */}
          <Route path="/*" element={
            <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: 'var(--bg-main)', marginLeft: '256px' }}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/register" element={<RegisterClient />} />
                  <Route path="/clients/edit/:id" element={<EditClient />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/contracts/register" element={<RegisterContract />} />
                  <Route path="/contracts/templates" element={<LegalLibrary />} />
                  <Route path="/contracts/clauses" element={<LegalLibrary />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/users/register" element={<RegisterUser />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<EditProfile />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

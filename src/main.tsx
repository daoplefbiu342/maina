import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import AdminDashboard from './pages/AdminDashboard';
import SuccessPage from './pages/Success';
import './index.css';
import { AuthProvider } from './lib/auth';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
);

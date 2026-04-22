import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './utils/authService';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Idioms from './pages/Idioms';
import Practice from './pages/Practice';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.error('Auth check failed:', e);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = authService.onAuthStateChange(
      (event, session) => {
        setUser(session?.user);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="app-loading">Загрузка...</div>;
  }

  return (
    <Router basename="/mnogolingo">
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Auth onAuthSuccess={() => setUser(true)} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/idioms"
          element={user ? <Idioms /> : <Navigate to="/" />}
        />
        <Route
          path="/practice"
          element={user ? <Practice /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

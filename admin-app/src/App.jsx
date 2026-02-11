import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ProductManager from './pages/ProductManager';
import BookingManager from './pages/BookingManager';
import ReviewModerator from './pages/ReviewModerator';
import AuditLogViewer from './pages/AuditLogViewer';

import MenuManager from './pages/MenuManager';
import PromotionManager from './pages/PromotionManager';
import HeroManager from './pages/HeroManager';
import CategoryManager from './pages/CategoryManager';
import FooterManager from './pages/FooterManager';
import MediaLibrary from './pages/MediaLibrary';
import TestimonialManager from './pages/TestimonialManager';
import ActivityManager from './pages/ActivityManager';

// New Managers (Need to be created)
import EmailTemplateManager from './pages/EmailTemplateManager'; // Implemented
import TeamManager from './pages/TeamManager'; // Implemented
import SEOManager from './pages/SEOManager'; // Implemented
import FlightManager from './pages/FlightManager'; // Implemented
import NewsletterManager from './pages/NewsletterManager'; // Implemented
import PageContentManager from './pages/PageContentManager'; // Implemented

import AdminLayout from './components/AdminLayout';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './utils/supabase';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      // Update legacy token for backward compat if needed, or clear it
      if (session) {
        localStorage.setItem('adminToken', session.access_token);
      } else {
        localStorage.removeItem('adminToken');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return session ? children : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          toast.success(`New Booking Received! [#${payload.new.id.slice(0, 8)}]`, {
            duration: 5000,
            icon: '🔥', // Fire emoji for hot booking
            style: {
              borderRadius: '16px',
              background: '#111827',
              color: '#fff',
              fontWeight: 'bold'
            }
          });
          queryClient.invalidateQueries(['bookings']);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <PrivateRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<ProductManager />} />
                  <Route path="/bookings" element={<BookingManager />} />
                  <Route path="/categories" element={<CategoryManager />} />
                  <Route path="/menus" element={<MenuManager />} />
                  <Route path="/hero" element={<HeroManager />} />
                  <Route path="/promotions" element={<PromotionManager />} />
                  <Route path="/footer" element={<FooterManager />} />
                  <Route path="/media" element={<MediaLibrary />} />
                  <Route path="/testimonials" element={<TestimonialManager />} />
                  <Route path="/activities" element={<ActivityManager />} />
                  <Route path="/reviews" element={<ReviewModerator />} />
                  <Route path="/logs" element={<AuditLogViewer />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* New Routes */}
                  <Route path="/team" element={<TeamManager />} />
                  <Route path="/seo" element={<SEOManager />} />
                  <Route path="/flights" element={<FlightManager />} />
                  <Route path="/email-templates" element={<EmailTemplateManager />} />
                  <Route path="/newsletter" element={<NewsletterManager />} />
                  <Route path="/pages" element={<PageContentManager />} />
                </Routes>
              </AdminLayout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

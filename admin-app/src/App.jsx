import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Analytics from './pages/Analytics';

import MenuManager from './pages/MenuManager';
import PromotionManager from './pages/PromotionManager';
import HeroManager from './pages/HeroManager';
import CategoryManager from './pages/CategoryManager';
import FooterManager from './pages/FooterManager';
import MediaLibrary from './pages/MediaLibrary';
import TestimonialManager from './pages/TestimonialManager';
import LandActivityManager from './pages/LandActivityManager';
import SeaActivityManager from './pages/SeaActivityManager';
import TeamManager from './pages/TeamManager';
import SEOManager from './pages/SEOManager';
import FlightManager from './pages/FlightManager';
import EmailTemplateManager from './pages/EmailTemplateManager';
import NewsletterManager from './pages/NewsletterManager';
import PageContentManager from './pages/PageContentManager';
import MigrationTool from './pages/MigrationTool'; // Added migration tool import

import AdminLayout from './components/AdminLayout';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

import { useAuthSession } from './hooks/useAuthSession';
import { useAdminNotifications } from './hooks/useAdminNotifications';
import ErrorBoundary from './components/ErrorBoundary';

const PrivateRoute = ({ children }) => {
    const { session, loading } = useAuthSession();

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
    useAdminNotifications(queryClient);

    return (
        <ErrorBoundary>
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
                                        <Route path="/analytics" element={<Analytics />} />
                                        <Route path="/products" element={<ProductManager />} />
                                        <Route path="/bookings" element={<BookingManager />} />
                                        <Route path="/categories" element={<CategoryManager />} />
                                        <Route path="/menus" element={<MenuManager />} />
                                        <Route path="/hero" element={<HeroManager />} />
                                        <Route path="/promotions" element={<PromotionManager />} />
                                        <Route path="/footer" element={<FooterManager />} />
                                        <Route path="/media" element={<MediaLibrary />} />
                                        <Route path="/testimonials" element={<TestimonialManager />} />
                                        <Route path="/activities/land" element={<LandActivityManager />} />
                                        <Route path="/activities/sea" element={<SeaActivityManager />} />
                                        <Route path="/reviews" element={<ReviewModerator />} />
                                        <Route path="/logs" element={<AuditLogViewer />} />
                                        <Route path="/settings" element={<Settings />} />
                                        <Route path="/team" element={<TeamManager />} />
                                        <Route path="/seo" element={<SEOManager />} />
                                        <Route path="/flights" element={<FlightManager />} />
                                        <Route path="/email-templates" element={<EmailTemplateManager />} />
                                        <Route path="/newsletter" element={<NewsletterManager />} />
                                        <Route path="/pages" element={<PageContentManager />} />
                                        <Route path="/migration" element={<MigrationTool />} />
                                    </Routes>
                                </AdminLayout>
                            </PrivateRoute>
                        } />
                    </Routes>
                </Router>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
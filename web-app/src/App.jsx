import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { WishlistProvider } from './context/WishlistContext';
import { ArrowRight, Loader } from 'lucide-react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import './i18n/config';
import './index.css';

// Components
import Layout from './components/Layout';
// Home remains eager for LCP
import Home from './pages/Home';

// Lazy Loaded Pages
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const PackageBuilder = lazy(() => import('./pages/PackageBuilder'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));
const Team = lazy(() => import('./pages/Team'));
const Cruises = lazy(() => import('./pages/Cruises'));
const GroupTours = lazy(() => import('./pages/GroupTours'));
const Destinations = lazy(() => import('./pages/Destinations'));
const HotelDayPackages = lazy(() => import('./pages/HotelDayPackages'));
const Activities = lazy(() => import('./pages/Activities'));
const MauritiusHotels = lazy(() => import('./pages/MauritiusHotels'));
const RodriguesGuestHouses = lazy(() => import('./pages/RodriguesGuestHouses'));
const RodriguesHotels = lazy(() => import('./pages/RodriguesHotels'));
const DayPackageDetails = lazy(() => import('./pages/DayPackageDetails'));
const DestinationDetails = lazy(() => import('./pages/DestinationDetails'));
const VisaServices = lazy(() => import('./pages/VisaServices'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const Flights = lazy(() => import('./pages/Flights'));
const Excursions = lazy(() => import('./pages/Excursions'));
const Transfers = lazy(() => import('./pages/Transfers'));

const queryClient = new QueryClient();

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <Loader className="w-12 h-12 text-primary animate-spin" />
      <p className="text-gray-500 font-medium animate-pulse">Loading Travel Lounge...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WishlistProvider>
        <Toaster position="bottom-right" />
        <Router>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/services/:id" element={<ServiceDetails />} />
                <Route path="/package-builder" element={<PackageBuilder />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/team" element={<Team />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />

                {/* Service Pages */}
                <Route path="/cruises" element={<Cruises />} />
                <Route path="/group-tours" element={<GroupTours />} />
                <Route path="/group-tours/:id" element={<ServiceDetails />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/destinations/:id" element={<DestinationDetails />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/day-packages" element={<HotelDayPackages />} />
                <Route path="/day-packages/:id" element={<ServiceDetails />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/activities/:id" element={<ServiceDetails />} />
                <Route path="/cruises" element={<Cruises />} />
                <Route path="/cruises/:id" element={<ServiceDetails />} />
                <Route path="/hotels" element={<MauritiusHotels />} />
                <Route path="/excursions" element={<Excursions />} />
                <Route path="/transfers" element={<Transfers />} />
                <Route path="/rodrigues-guest-houses" element={<RodriguesGuestHouses />} />
                <Route path="/rodrigues-hotels" element={<RodriguesHotels />} />
                <Route path="/visa-services" element={<VisaServices />} />

                <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </WishlistProvider>
    </QueryClientProvider>
  );
}

export default App;

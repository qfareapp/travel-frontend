import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlanTripForm from './components/PlanTripForm/PlanTripForm';
import Header from './components/Header';
import CreateCircuitPage from './pages/Admin/CreateCircuitPage';
import AddHomestayPage from './pages/Admin/AddHomestayPage';
import ItineraryResultPage from './pages/ItineraryResultPage';
import CreateItineraryForm from './components/Admin/CreateItineraryForm';
import ItineraryConfirmPage from './pages/ItineraryConfirmPage';
import HomestayDetails from './pages/HomestayDetails';
import CircuitDetailsPage from './pages/CircuitDetailsPage';
import DirectPlanForm from './components/PlanTripForm/DirectPlanForm';
import ItineraryDetailsPage from './pages/ItineraryDetailsPage';
import AdminLayout from './components/Admin/AdminLayout';
import BookingsPage from './pages/Admin/BookingsPage';
import LocalGuidePage from "./pages/LocalGuidePage";


function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow px-4 sm:px-6 md:px-10 py-6">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/plan" element={<PlanTripForm />} />
            <Route path="/plan-direct" element={<DirectPlanForm />} />
            <Route path="/itinerary/result" element={<ItineraryResultPage />} />
            <Route path="/itinerary/confirm" element={<ItineraryConfirmPage />} />
            <Route path="/itineraries/:id" element={<ItineraryDetailsPage />} />
            <Route path="/circuit/:id" element={<CircuitDetailsPage />} />
            <Route path="/homestays/:id" element={<HomestayDetails />} />
            <Route path="/guides/:id" element={<LocalGuidePage />} />

            {/* Admin Routes with Sidebar */}
            <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<BookingsPage />} /> 
              <Route path="create-circuit" element={<CreateCircuitPage />} />
              <Route path="add-homestay" element={<AddHomestayPage />} />
              <Route path="create-itinerary" element={<CreateItineraryForm />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

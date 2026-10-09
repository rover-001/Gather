import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import GuestJoinPage from './pages/guest/Join';
import { MeshProvider } from './lib/p2p/MeshContext';
import { MeshModal } from './components/p2p/MeshModal';
import { ThemeProvider } from './context/ThemeContext';

// Lazy load remaining pages
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HostSetup = lazy(() => import('./pages/HostSetup'));
const HostOverviewPage = lazy(() => import('./pages/host/Overview'));
const HostEventPage = lazy(() => import('./pages/host/Event'));
const HostGuestsPage = lazy(() => import('./pages/host/Guests'));
const HostLivePage = lazy(() => import('./pages/host/Live'));
const HostGalleryPage = lazy(() => import('./pages/host/Gallery'));
const GuestLoginPage = lazy(() => import('./pages/guest/Login'));
const GuestWaitingPage = lazy(() => import('./pages/guest/Waiting'));
const GuestCameraPage = lazy(() => import('./pages/guest/Camera'));
const GuestGalleryPage = lazy(() => import('./pages/guest/Gallery'));
const GuestViewerPage = lazy(() => import('./pages/guest/Gallery/components/Viewer'));
const GuestMePage = lazy(() => import('./pages/guest/Me'));

function RouteLoading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090b0e] flex items-center justify-center p-6 text-slate-400 text-xs">
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MeshProvider>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Landing />} />
            <Route path="/dash" element={<Dashboard />} />

            {/* Host Pages */}
            <Route path="/host/setup" element={<HostSetup />} />
            <Route path="/host" element={<HostOverviewPage />} />
            <Route path="/host/event" element={<HostEventPage />} />
            <Route path="/host/guests" element={<HostGuestsPage />} />
            <Route path="/host/live" element={<HostLivePage />} />
            <Route path="/host/gallery" element={<HostGalleryPage />} />

            {/* Guest Pages */}
            <Route path="/e/:slug" element={<GuestJoinPage />} />
            <Route path="/e/:slug/login" element={<GuestLoginPage />} />
            <Route path="/waiting" element={<GuestWaitingPage />} />
            <Route path="/cam" element={<GuestCameraPage />} />
            <Route path="/album" element={<GuestGalleryPage />} />
            <Route path="/album/:id" element={<GuestViewerPage />} />
            <Route path="/me" element={<GuestMePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <MeshModal />
      </MeshProvider>
    </BrowserRouter>
  </ThemeProvider>
  );
}

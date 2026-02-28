// ============================================================
// App Shell — Main Dashboard + Mock Page Routes
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import Dashboard from './Dashboard';
import MockDNS from './pages/MockDNS';
import MockBank from './pages/MockBank';
import MockCDN from './pages/MockCDN';
import MockSocial from './pages/MockSocial';
import MockCloud from './pages/MockCloud';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard */}
        <Route
          path="/"
          element={
            <SimulationProvider>
              <Dashboard />
            </SimulationProvider>
          }
        />

        {/* Mock service pages (visited by OpenClaw agent) */}
        <Route path="/mock/dns" element={<MockDNS />} />
        <Route path="/mock/bank" element={<MockBank />} />
        <Route path="/mock/cdn" element={<MockCDN />} />
        <Route path="/mock/social" element={<MockSocial />} />
        <Route path="/mock/cloud" element={<MockCloud />} />
      </Routes>
    </BrowserRouter>
  );
}

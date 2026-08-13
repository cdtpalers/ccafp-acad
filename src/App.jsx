import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { Loader } from 'lucide-react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Deficiencies = lazy(() => import('./pages/Deficiencies'));
const About = lazy(() => import('./pages/About'));
const ClassSchedule = lazy(() => import('./pages/ClassSchedule'));
const GradeReports = lazy(() => import('./pages/GradeReports'));

function App() {
  return (
    <BrowserRouter>
      <SpeedInsights />
      <Layout>
        <Suspense fallback={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
            <Loader size={36} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ margin: 0, fontWeight: 500 }}>Loading Module...</h3>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/deficiencies" element={<Deficiencies />} />
            <Route path="/schedule" element={<ClassSchedule />} />
            <Route path="/grades" element={<GradeReports />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

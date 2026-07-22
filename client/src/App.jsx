import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Copilot from './pages/Copilot';
import Maintenance from './pages/Maintenance';
import Compliance from './pages/Compliance';
import Lessons from './pages/Lessons';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          <Route path="knowledge" element={<KnowledgeGraph />} />
          <Route path="copilot" element={<Copilot />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="lessons" element={<Lessons />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

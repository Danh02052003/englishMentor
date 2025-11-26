import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './layouts/AppLayout';
import AuthPage from './pages/AuthPage';
import MascotShowcase from './pages/MascotShowcase';
import DashboardPage from './features/dashboard/DashboardPage';
import ReadingModule from './features/reading/ReadingModule';
import ListeningDictation from './features/listening/ListeningDictation';
import SpeakingPractice from './pages/SpeakingPractice';
import WritingCoach from './features/writing/WritingCoach';
import VocabTrainer from './features/vocabulary/VocabTrainer';
import WorkspacePage from './features/notes/WorkspacePage';
import MockTestSimulator from './features/mock/MockTestSimulator';
import PublicDeckPage from './pages/PublicDeckPage';
import useAuthStore from './store/useAuthStore';

function App() {
  const { user } = useAuthStore();
  const isAdmin = user?.email === 'you@gmail.com';

  return (
    <Routes>
      <Route path="auth" element={<AuthPage />} />
      <Route path="test" element={<div className="p-8"><h1>Test Page</h1><a href="/auth">Go to Auth</a></div>} />
      <Route
        path="/"
        element={user ? <AppLayout /> : <Navigate to="/auth" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        {isAdmin && <Route path="mascot-showcase" element={<MascotShowcase />} />}
        <Route path="reading" element={<ReadingModule />} />
        <Route path="listening" element={<ListeningDictation />} />
        <Route path="speaking" element={<SpeakingPractice />} />
        <Route path="writing" element={<WritingCoach />} />
        <Route path="vocabulary" element={<VocabTrainer />} />
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="mock-test" element={<MockTestSimulator />} />
      </Route>
      <Route path="public/deck/:token" element={<PublicDeckPage />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
    </Routes>
  );
}

export default App;


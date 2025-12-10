import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppBar } from './components/layout/AppBar';
import GroupsPage from './pages/groups/GroupsPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';
import GroupAnalyticsPage from './pages/analytics/GroupAnalyticsPage';
import GroupComparisonPage from './pages/analytics/GroupComparisonPage';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <ToastProvider>
        <BrowserRouter>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Navigate to="/groups" replace />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/groups/:groupId" element={<GroupDetailPage />} />
                <Route path="/groups/:groupId/analytics" element={<GroupAnalyticsPage />} />
                <Route path="/groups/compare" element={<GroupComparisonPage />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

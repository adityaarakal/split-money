import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppBar } from './components/layout/AppBar';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ServiceWorkerUpdateDialog } from './components/common/ServiceWorkerUpdateDialog';
import GroupsPage from './pages/groups/GroupsPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';
import GroupAnalyticsPage from './pages/analytics/GroupAnalyticsPage';
import GroupComparisonPage from './pages/analytics/GroupComparisonPage';
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate';
import { useState, useEffect } from 'react';
import { ShareHandler } from './components/common/ShareHandler';
import './index.css';

function App() {
  const { updateAvailable } = useServiceWorkerUpdate();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  // Show update dialog when update is available
  useEffect(() => {
    if (updateAvailable) {
      setUpdateDialogOpen(true);
    }
  }, [updateAvailable]);

  return (
    <ThemeProvider>
      <CssBaseline />
      <ToastProvider>
        <BrowserRouter>
          <ShareHandler />
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
          <OfflineIndicator />
          <ServiceWorkerUpdateDialog
            open={updateDialogOpen}
            onClose={() => setUpdateDialogOpen(false)}
          />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

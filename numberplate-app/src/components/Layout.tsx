import { useState, ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Container, 
  Paper, 
  BottomNavigation, 
  BottomNavigationAction,
  Alert,
  Snackbar
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Collections as GalleryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface LayoutProps {
  isOnline: boolean;
}

const Layout = ({ isOnline }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(location.pathname);

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/capture':
        return 'Capture Numberplate';
      case '/gallery':
        return 'Numberplate Gallery';
      case '/settings':
        return 'Settings';
      default:
        return 'Numberplate Scanner';
    }
  };

  return (
    <Box sx={{ pb: 7, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">{getPageTitle()}</Typography>
        </Toolbar>
      </AppBar>

      {/* Offline warning */}
      <Snackbar open={!isOnline} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="warning" sx={{ width: '100%' }}>
          You are offline. Some features may be limited.
        </Alert>
      </Snackbar>

      {/* Main content */}
      <Container component="main" sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <Outlet />
      </Container>

      {/* Bottom navigation */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_, newValue) => {
            setValue(newValue);
            navigate(newValue);
          }}
        >
          <BottomNavigationAction 
            label="Capture" 
            value="/capture" 
            icon={<CameraIcon />} 
          />
          <BottomNavigationAction 
            label="Gallery" 
            value="/gallery" 
            icon={<GalleryIcon />} 
          />
          <BottomNavigationAction 
            label="Settings" 
            value="/settings" 
            icon={<SettingsIcon />} 
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default Layout; 
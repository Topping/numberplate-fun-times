import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Snackbar, 
  Alert
} from '@mui/material';

const SettingsPage = () => {
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedEndpoint = localStorage.getItem('apiEndpoint');
    if (savedEndpoint) {
      setApiEndpoint(savedEndpoint);
    }
  }, []);

  const handleSaveSettings = () => {
    try {
      // Validate that the endpoint is a valid URL
      new URL(apiEndpoint);
      
      // Save the endpoint to localStorage
      localStorage.setItem('apiEndpoint', apiEndpoint);
      
      // Show success message
      setSnackbarSeverity('success');
      setSnackbarMessage('Settings saved successfully');
      setOpenSnackbar(true);
    } catch (error) {
      // Show error message if URL is invalid
      setSnackbarSeverity('error');
      setSnackbarMessage('Please enter a valid URL');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          API Configuration
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure the endpoint for the numberplate recognition API.
        </Typography>
        
        <TextField
          fullWidth
          label="API Endpoint"
          variant="outlined"
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
          placeholder="https://your-api-endpoint.com"
          helperText="Enter the full URL of your API endpoint"
          sx={{ mb: 3 }}
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Paper>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage; 
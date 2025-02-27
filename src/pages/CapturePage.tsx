import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { PhotoCamera, Refresh, Send } from '@mui/icons-material';

interface PlateResult {
  id: string;
  numberplate: string;
  timestamp: number;
  confidence?: number;
}

const CapturePage = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [plateResult, setPlateResult] = useState<PlateResult | null>(null);

  // Initialize camera
  const initCamera = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(`Error accessing camera: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Capture image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      
      // Stop camera after capture
      stopCamera();
    }
  };

  // Reset capture
  const resetCapture = () => {
    setCapturedImage(null);
    setPlateResult(null);
    initCamera();
  };

  // Process the captured image
  const processImage = async () => {
    if (!capturedImage) return;
    
    const apiEndpoint = localStorage.getItem('apiEndpoint');
    if (!apiEndpoint) {
      setError('API endpoint not configured. Please set it in the Settings page.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'numberplate.jpg');
      
      // Send to API
      const apiResponse = await fetch(`${apiEndpoint}/api/process-plate`, {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status} ${apiResponse.statusText}`);
      }
      
      const data = await apiResponse.json();
      
      // Save result to localStorage for gallery
      if (data.numberplate) {
        const result: PlateResult = {
          id: Date.now().toString(),
          numberplate: data.numberplate,
          timestamp: Date.now(),
          confidence: data.confidence,
        };
        
        setPlateResult(result);
        
        // Save to localStorage
        const savedPlates = localStorage.getItem('plates');
        const plates: PlateResult[] = savedPlates ? JSON.parse(savedPlates) : [];
        plates.push(result);
        localStorage.setItem('plates', JSON.stringify(plates));
        
        setSuccessMessage('Numberplate processed successfully!');
      } else {
        setError('No numberplate detected or recognized');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(`Error processing image: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize camera when component mounts
  useEffect(() => {
    initCamera();
    
    // Cleanup when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Message when no camera is active and no image is captured */}
        {!cameraActive && !capturedImage && !loading && (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="body1" gutterBottom>
              Camera is not active. 
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<PhotoCamera />}
              onClick={initCamera}
            >
              Start Camera
            </Button>
          </Box>
        )}

        {/* Camera view */}
        {cameraActive && !capturedImage && (
          <Box sx={{ position: 'relative' }}>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              style={{ width: '100%', borderRadius: '4px' }}
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                left: 0, 
                right: 0, 
                display: 'flex', 
                justifyContent: 'center' 
              }}
            >
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<PhotoCamera />}
                onClick={captureImage}
              >
                Capture
              </Button>
            </Box>
          </Box>
        )}

        {/* Captured image view */}
        {capturedImage && !loading && (
          <Box>
            <img 
              src={capturedImage} 
              alt="Captured numberplate" 
              style={{ width: '100%', borderRadius: '4px' }} 
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<Refresh />}
                onClick={resetCapture}
              >
                Retake
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Send />}
                onClick={processImage}
                disabled={loading}
              >
                Process
              </Button>
            </Box>
          </Box>
        )}

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="body1">
              Processing numberplate...
            </Typography>
          </Box>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Paper>

      {/* Result display */}
      {plateResult && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h5" component="div">
              {plateResult.numberplate}
            </Typography>
            {plateResult.confidence !== undefined && (
              <Typography variant="body2" color="text.secondary">
                Confidence: {Math.round(plateResult.confidence * 100)}%
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {new Date(plateResult.timestamp).toLocaleString()}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={resetCapture}>Capture Another</Button>
          </CardActions>
        </Card>
      )}

      {/* Error snackbar */}
      <Snackbar 
        open={error !== null} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {/* Success snackbar */}
      <Snackbar 
        open={successMessage !== null} 
        autoHideDuration={3000} 
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CapturePage; 
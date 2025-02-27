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
  const displayVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [plateResult, setPlateResult] = useState<PlateResult | null>(null);

  // Initialize camera with fallback options
  const initCamera = async (retryWithoutFacingMode = false) => {
    console.log('Initializing camera, retryWithoutFacingMode:', retryWithoutFacingMode);
    setCameraLoading(true);
    setError(null);
    
    // Set a timeout to avoid getting stuck in loading state
    const timeoutId = setTimeout(() => {
      console.log('Camera initialization timeout reached');
      if (cameraLoading) {
        setCameraLoading(false);
        setError('Camera initialization timed out. Please try again.');
        stopCamera();
      }
    }, 10000); // 10 seconds timeout
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser');
      }

      // Try with or without facing mode based on parameter
      const constraints = retryWithoutFacingMode 
        ? { video: true, audio: false }
        : { video: { facingMode: 'environment' }, audio: false };

      console.log('Requesting media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', stream.id);

      // Wait a small amount of time to ensure the component is fully mounted
      // This helps avoid the "Video element reference not available" error
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if videoRef is available before proceeding
      if (!videoRef.current) {
        console.warn('Video element not yet available, will try to create it');
        // Don't throw an error, just log a warning and continue
        // The video element might become available later
      } else {
        console.log('Video element reference found, setting srcObject');
        // Set the srcObject directly
        videoRef.current.srcObject = stream;
        console.log('Stream assigned to video element');
        
        // Force a play() immediately instead of waiting for metadata
        try {
          await videoRef.current.play();
          console.log('Video playback started manually');
          clearTimeout(timeoutId);
          setCameraActive(true);
          setCameraLoading(false);
        } catch (playError) {
          console.error('Manual play() error:', playError);
          
          // Fallback to event-based approach
          console.log('Falling back to event-based approach');
          videoRef.current.onloadeddata = async () => {
            console.log('Video data loaded event fired');
            if (videoRef.current) {
              try {
                await videoRef.current.play();
                console.log('Video playback started via onloadeddata');
                clearTimeout(timeoutId);
                setCameraActive(true);
                setCameraLoading(false);
              } catch (e) {
                console.error('Play error in onloadeddata:', e);
                clearTimeout(timeoutId);
                if (!retryWithoutFacingMode) {
                  stopCamera();
                  initCamera(true);
                } else {
                  setError(`Error starting video: ${e instanceof Error ? e.message : String(e)}`);
                  setCameraLoading(false);
                }
              }
            }
          };
        }
        
        // Backup event handler in case onloadeddata doesn't fire
        videoRef.current.oncanplay = () => {
          console.log('Video can play event fired');
          if (cameraLoading && videoRef.current) {
            clearTimeout(timeoutId);
            setCameraActive(true);
            setCameraLoading(false);
          }
        };
      }

      // Set up a periodic check for the video element in case it wasn't available initially
      let checkCount = 0;
      const checkVideoRef = setInterval(() => {
        checkCount++;
        console.log(`Checking for video element (attempt ${checkCount})...`);
        
        if (videoRef.current && videoRef.current.srcObject === null) {
          console.log('Video element now available, setting stream');
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadeddata = async () => {
            console.log('Video data loaded event fired (delayed)');
            try {
              await videoRef.current?.play();
              console.log('Video playback started (delayed)');
              clearTimeout(timeoutId);
              clearInterval(checkVideoRef);
              setCameraActive(true);
              setCameraLoading(false);
            } catch (e) {
              console.error('Delayed play error:', e);
            }
          };
        }
        
        // Give up after 10 attempts (2 seconds)
        if (checkCount >= 10) {
          clearInterval(checkVideoRef);
          if (cameraLoading) {
            console.error('Could not find video element after multiple attempts');
            setError('Camera initialization failed. Please reload the page and try again.');
            setCameraLoading(false);
          }
        }
      }, 200);
      
      // Clear the interval when the component unmounts or when successful
      setTimeout(() => {
        clearInterval(checkVideoRef);
      }, 10000);

    } catch (err) {
      console.error('Error accessing camera:', err);
      clearTimeout(timeoutId);
      
      // If facing mode might be causing issues, retry without it
      if (!retryWithoutFacingMode && err instanceof Error && 
          (err.message.includes('facingMode') || err.message.includes('constraint'))) {
        console.log('Retrying camera initialization without facingMode constraint');
        stopCamera();
        initCamera(true);
      } else {
        setError(`Error accessing camera: ${err instanceof Error ? err.message : String(err)}`);
        setCameraLoading(false);
      }
    }
  };

  // Stop the camera
  const stopCamera = () => {
    console.log('Stopping camera');
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        console.log('Stopping track:', track.kind, track.id);
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
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

  // Mirror the stream to display video when cameraActive changes
  useEffect(() => {
    // If camera is active and we have both video elements
    if (cameraActive && videoRef.current && displayVideoRef.current && videoRef.current.srcObject) {
      console.log('Mirroring video feed to display element');
      displayVideoRef.current.srcObject = videoRef.current.srcObject;
    }
  }, [cameraActive]);

  // Initialize camera when component mounts
  useEffect(() => {
    // Delay camera initialization to ensure DOM is ready
    const initTimer = setTimeout(() => {
      console.log('Delayed camera initialization...');
      initCamera();
    }, 500);
    
    // Cleanup when component unmounts
    return () => {
      clearTimeout(initTimer);
      stopCamera();
    };
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Hidden video element that's always in the DOM */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          controls={false}
          style={{ 
            display: 'none', // Keep it in DOM but hidden
          }}
        />

        {/* Message when no camera is active and no image is captured */}
        {!cameraActive && !capturedImage && !loading && !cameraLoading && (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="body1" gutterBottom>
              Camera is not active. 
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<PhotoCamera />}
              onClick={() => initCamera()}
            >
              Start Camera
            </Button>
          </Box>
        )}
        
        {/* Camera loading indicator */}
        {cameraLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ mb: 2 }}>
              Initializing camera...
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => {
                stopCamera();
                setTimeout(() => initCamera(true), 500);
              }}
            >
              Retry with different settings
            </Button>
          </Box>
        )}

        {/* Camera view */}
        {cameraActive && !capturedImage && (
          <Box sx={{ position: 'relative' }}>
            {/* Display video element */}
            <video 
              ref={displayVideoRef}
              autoPlay 
              playsInline
              muted
              controls={false}
              disablePictureInPicture
              style={{ 
                width: '100%', 
                height: 'auto',
                maxHeight: '70vh',
                borderRadius: '4px',
                backgroundColor: '#000', // Add background to make it visible while loading
                display: 'block', // Ensure it's a block element
                objectFit: 'cover' // Ensures the video fills the container
              }}
            />
            {/* Viewfinder overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'none', // Allows interaction with elements beneath
              }}
            >
              {/* Center rectangle viewfinder for the numberplate */}
              <Box
                sx={{
                  width: '80%',
                  height: '30%',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: '4px',
                  boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                }}
              >
                {/* Corner markers */}
                <Box sx={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, borderTop: '2px solid #fff', borderLeft: '2px solid #fff' }} />
                <Box sx={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, borderTop: '2px solid #fff', borderRight: '2px solid #fff' }} />
                <Box sx={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, borderBottom: '2px solid #fff', borderLeft: '2px solid #fff' }} />
                <Box sx={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, borderBottom: '2px solid #fff', borderRight: '2px solid #fff' }} />
              </Box>
              {/* Text guide */}
              <Typography 
                variant="body2" 
                sx={{ 
                  position: 'absolute', 
                  bottom: '15%', 
                  color: 'white', 
                  textAlign: 'center',
                  textShadow: '1px 1px 2px black',
                  fontWeight: 'medium'
                }}
              >
                Align numberplate within the frame
              </Typography>
            </Box>
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
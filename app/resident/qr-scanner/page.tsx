'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Camera, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ScanResult {
  text: string;
  type: 'payment' | 'access' | 'service' | 'unknown';
  timestamp: Date;
}

export default function QRScannerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!user || user.role !== 'resident') {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(permission.state);
      
      permission.onchange = () => {
        setCameraPermission(permission.state);
      };
    } catch (error) {
      console.log('Camera permission check not supported');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setCameraPermission('granted');
        
        // Start scanning loop
        scanLoop();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission('denied');
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const scanLoop = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas size to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw video frame to canvas
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Get image data for processing
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simulate QR code detection (in real app, use a QR library like jsQR)
    // For demo purposes, we'll simulate finding a QR code after a few seconds
    if (Math.random() < 0.01) { // 1% chance per frame to simulate detection
      simulateQRDetection();
    }

    // Continue scanning
    requestAnimationFrame(scanLoop);
  };

  const simulateQRDetection = () => {
    const qrTypes = ['payment', 'access', 'service'];
    const randomType = qrTypes[Math.floor(Math.random() * qrTypes.length)];
    
    const result: ScanResult = {
      text: `Demo QR Code - ${randomType} - ${Date.now()}`,
      type: randomType as ScanResult['type'],
      timestamp: new Date()
    };

    setCurrentResult(result);
    setScanResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    
    // Stop camera after successful scan
    stopCamera();
    
    toast({
      title: 'QR Code Detected!',
      description: `Found ${randomType} QR code`,
    });
  };

  const handleScanAgain = () => {
    setCurrentResult(null);
    startCamera();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'access':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'service':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'payment':
        return <Badge variant="default" className="bg-green-100 text-green-800">Payment</Badge>;
      case 'access':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Access</Badge>;
      case 'service':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Service</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/resident/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
              <p className="text-gray-600">Scan QR codes with your phone camera</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Camera Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera Scanner
            </CardTitle>
            <CardDescription>
              Point your camera at a QR code to scan it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera View */}
            <div className="relative">
              <div className="relative w-full max-w-md mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full rounded-lg border-2 ${
                    isScanning ? 'border-green-500' : 'border-gray-300'
                  }`}
                />
                
                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-green-500 rounded-lg relative">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-green-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-green-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-green-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-green-500"></div>
                      
                      {/* Scanning line */}
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500 animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center space-x-4">
              {!isScanning ? (
                <Button onClick={startCamera} disabled={cameraPermission === 'denied'}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanner
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Stop Scanner
                </Button>
              )}
              
              {currentResult && (
                <Button onClick={handleScanAgain} variant="outline">
                  Scan Again
                </Button>
              )}
            </div>

            {/* Camera Permission Status */}
            {cameraPermission === 'denied' && (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">
                  Camera access denied. Please enable camera permissions in your browser settings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Scan Result */}
        {currentResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Scan Result
              </CardTitle>
              <CardDescription>
                Latest QR code scan result
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(currentResult.type)}
                  <span className="font-medium">QR Code Detected</span>
                </div>
                {getTypeBadge(currentResult.type)}
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Content:</p>
                <p className="font-mono text-sm break-all">{currentResult.text}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Scanned at: {currentResult.timestamp.toLocaleTimeString()}</span>
                <span>Type: {currentResult.type}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan History
            </CardTitle>
            <CardDescription>
              Your recent QR code scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scanResults.length > 0 ? (
              <div className="space-y-3">
                {scanResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(result.type)}
                      <div>
                        <p className="text-sm font-medium">{result.type.charAt(0).toUpperCase() + result.type.slice(1)} QR Code</p>
                        <p className="text-xs text-gray-500">{result.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                    {getTypeBadge(result.type)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No scans yet. Start scanning to see results here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}







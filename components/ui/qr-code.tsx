'use client';

import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { QrCode, Download, Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeProps {
  data: string;
  title?: string;
  description?: string;
  size?: number;
  downloadable?: boolean;
  copyable?: boolean;
}

export function QRCodeDisplay({ 
  data, 
  title = "QR Code", 
  description, 
  size = 200, 
  downloadable = true, 
  copyable = true 
}: QRCodeProps) {
  const { toast } = useToast();
  const [showData, setShowData] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = async () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${title}-QR.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast({
          title: "QR Code Downloaded",
          description: "QR code has been saved to your device.",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyData = async () => {
    try {
      await navigator.clipboard.writeText(data);
      toast({
        title: "Data Copied",
        description: "QR code data has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={qrRef} className="flex justify-center">
          <div
            style={{
              width: size,
              height: size,
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`}
              alt="QR Code"
              width={size}
              height={size}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="qr-data">QR Data:</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowData(!showData)}
            >
              {showData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {showData && (
            <Input
              id="qr-data"
              value={data}
              readOnly
              className="font-mono text-xs"
            />
          )}
        </div>

        <div className="flex gap-2">
          {downloadable && (
            <Button onClick={downloadQR} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          {copyable && (
            <Button onClick={copyData} variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy Data
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function QRCodeGenerator() {
  const { toast } = useToast();
  const [qrData, setQrData] = useState('');
  const [qrType, setQrType] = useState('payment');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  const generateQR = () => {
    if (!qrData.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter data to generate QR code.",
        variant: "destructive",
      });
      return;
    }

    let formattedData = qrData;
    
    // Format data based on type
    switch (qrType) {
      case 'payment':
        formattedData = `PAYMENT:${qrData}`;
        break;
      case 'building':
        formattedData = `BUILDING:${qrData}`;
        break;
      case 'service':
        formattedData = `SERVICE:${qrData}`;
        break;
      case 'contact':
        formattedData = `CONTACT:${qrData}`;
        break;
    }

    setGeneratedQR(formattedData);
    toast({
      title: "QR Code Generated",
      description: "Your QR code has been created successfully.",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Generate QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-type">QR Code Type:</Label>
          <select
            id="qr-type"
            value={qrType}
            onChange={(e) => setQrType(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="payment">Payment</option>
            <option value="building">Building Access</option>
            <option value="service">Service Request</option>
            <option value="contact">Contact Information</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qr-data">Data:</Label>
          <Input
            id="qr-data"
            placeholder="Enter data for QR code..."
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
          />
        </div>

        <Button onClick={generateQR} className="w-full">
          <QrCode className="h-4 w-4 mr-2" />
          Generate QR Code
        </Button>

        {generatedQR && (
          <div className="mt-4">
            <QRCodeDisplay
              data={generatedQR}
              title={`${qrType.charAt(0).toUpperCase() + qrType.slice(1)} QR Code`}
              description="Generated QR code"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QRCodeScanner() {
  const { toast } = useToast();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsScanning(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Scan QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-gray-100 rounded-md"
            autoPlay
            playsInline
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
              <p className="text-gray-500">Camera not active</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex-1">
              Stop Scanning
            </Button>
          )}
        </div>

        {scannedData && (
          <div className="space-y-2">
            <Label>Scanned Data:</Label>
            <Input value={scannedData} readOnly className="font-mono text-xs" />
            <Button
              onClick={() => setScannedData(null)}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

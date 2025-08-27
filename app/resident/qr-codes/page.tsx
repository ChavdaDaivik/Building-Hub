'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, QrCode, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { mockBuildings, mockResidents } from '@/lib/data';
import { QRCodeScanner } from '@/components/ui/qr-code';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ResidentQRCodes() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scan');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      router.push('/login');
      return;
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleScanResult = (data: string) => {
    setScannedData(data);
    
    // Parse QR code data
    try {
      const parts = data.split(':');
      if (parts.length >= 3) {
        const type = parts[0];
        const buildingId = parts[1];
        const buildingName = parts[2];
        
        if (type === 'ACCESS') {
          const building = mockBuildings.find(b => b.id === buildingId);
          if (building) {
            setScanResult({
              type: 'access',
              building,
              message: 'Access granted to building',
              status: 'success'
            });
            toast({
              title: "Access Granted",
              description: `Welcome to ${buildingName}`,
            });
          } else {
            setScanResult({
              type: 'error',
              message: 'Invalid building QR code',
              status: 'error'
            });
          }
        } else if (type === 'PAYMENT') {
          const building = mockBuildings.find(b => b.id === buildingId);
          if (building) {
            setScanResult({
              type: 'payment',
              building,
              message: 'Payment QR code scanned',
              status: 'info'
            });
          }
        } else {
          setScanResult({
            type: 'unknown',
            message: 'Unknown QR code type',
            status: 'warning'
          });
        }
      }
    } catch (error) {
      setScanResult({
        type: 'error',
        message: 'Invalid QR code format',
        status: 'error'
      });
    }
  };

  if (!user || user.role !== 'resident') {
    return null;
  }

  const userBuilding = mockBuildings.find(b => b.id === user.buildingId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
              <p className="text-gray-600">Scan building QR codes for access and information</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
            <TabsTrigger value="info">Building Info</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Scan Building QR Code</h2>
                <QRCodeScanner />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Scan Results</h2>
                
                {scannedData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Scanned Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Raw Data:</Label>
                          <Input value={scannedData} readOnly className="font-mono text-xs" />
                        </div>
                        
                        {scanResult && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {scanResult.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                              {scanResult.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                              {scanResult.status === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                              {scanResult.status === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                              <span className="font-medium">{scanResult.message}</span>
                            </div>
                            
                            {scanResult.building && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium">{scanResult.building.name}</h4>
                                <p className="text-sm text-gray-600">{scanResult.building.address}</p>
                                <p className="text-sm text-gray-600">{scanResult.building.city}, {scanResult.building.state}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>How to Use</CardTitle>
                    <CardDescription>Instructions for scanning QR codes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Point your camera at a building QR code</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Wait for the scan to complete</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>View building information and access status</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userBuilding && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Your Building
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">{userBuilding.name}</h4>
                      <p className="text-sm text-gray-600">{userBuilding.address}</p>
                      <p className="text-sm text-gray-600">{userBuilding.city}, {userBuilding.state}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Floors:</span>
                        <span>{userBuilding.totalFloors}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Your Unit:</span>
                        <span>{user.unitNumber}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Badge variant="secondary">Active Resident</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>QR Code Types</CardTitle>
                  <CardDescription>Understanding different QR codes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">ACCESS:</Badge>
                    <span>Building entry and access control</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">PAYMENT:</Badge>
                    <span>Maintenance and utility payments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">SERVICE:</Badge>
                    <span>Service requests and maintenance</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

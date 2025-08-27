'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, QrCode, Plus, Edit, Trash2, Download, Copy } from 'lucide-react';
import { mockBuildings, mockPaymentMethods } from '@/lib/data';
import { QRCodeDisplay, QRCodeGenerator, QRCodeScanner } from '@/components/ui/qr-code';
import { useToast } from '@/hooks/use-toast';

export default function QRCodeManagement() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('manage');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      router.push('/login');
      return;
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user || user.role !== 'owner') {
    return null;
  }

  const filteredBuildings = selectedBuilding === 'all' 
    ? mockBuildings 
    : mockBuildings.filter(b => b.id === selectedBuilding);

  const generatePaymentQR = (building: any) => {
    const paymentData = `PAYMENT:${building.id}:${building.name}:MAINTENANCE:500`;
    return paymentData;
  };

  const generateAccessQR = (building: any) => {
    const accessData = `ACCESS:${building.id}:${building.name}:ENTRANCE:MAIN`;
    return accessData;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Data copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
              <p className="text-gray-600">Generate and manage QR codes for your buildings</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manage">Manage QR Codes</TabsTrigger>
            <TabsTrigger value="generate">Generate New</TabsTrigger>
            <TabsTrigger value="scan">Scan QR Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            {/* Building Filter */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Building:</label>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="all">All Buildings</option>
                {mockBuildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>

            {/* QR Codes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuildings.map((building) => (
                <Card key={building.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{building.name}</span>
                      <Badge variant="secondary">Active</Badge>
                    </CardTitle>
                    <CardDescription>{building.address}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Payment QR Code */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Maintenance Payment QR</h4>
                      <QRCodeDisplay
                        data={generatePaymentQR(building)}
                        title={`${building.name} Payment`}
                        description="Scan to pay maintenance fees"
                        size={150}
                      />
                    </div>

                    {/* Access QR Code */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Building Access QR</h4>
                      <QRCodeDisplay
                        data={generateAccessQR(building)}
                        title={`${building.name} Access`}
                        description="Scan for building entry"
                        size={150}
                      />
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QRCodeGenerator />
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick QR Generation</CardTitle>
                  <CardDescription>Generate common QR codes for your buildings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockBuildings.map((building) => (
                    <div key={building.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{building.name}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const data = generatePaymentQR(building);
                            copyToClipboard(data);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Payment Data
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const data = generateAccessQR(building);
                            copyToClipboard(data);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Access Data
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scan" className="space-y-6">
            <div className="max-w-md mx-auto">
              <QRCodeScanner />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>QR Code Types</CardTitle>
                <CardDescription>Understanding different QR code formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">PAYMENT:</Badge>
                    <span>Building ID, Name, Type, Amount</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">ACCESS:</Badge>
                    <span>Building ID, Name, Entry Point</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">SERVICE:</Badge>
                    <span>Service Type, Building ID, Contact</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

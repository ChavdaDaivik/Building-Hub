'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Settings, MessageSquare, QrCode, ArrowLeft, Edit, Plus, DollarSign, MapPin, Calendar } from 'lucide-react';
import { mockBuildings, mockResidents, mockServices, mockMessages } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';

export default function BuildingDetailPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const buildingId = params.id as string;
  const building = mockBuildings.find(b => b.id === buildingId);
  const buildingResidents = mockResidents.filter(r => r.buildingId === buildingId);
  const buildingServices = mockServices.filter(s => s.buildingId === buildingId);
  const buildingMessages = mockMessages.filter(m => m.buildingId === buildingId);

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      router.push('/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!building) {
      router.push('/owner/buildings');
    }
  }, [building, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user || user.role !== 'owner' || !building) {
    return null;
  }

  const totalRevenue = buildingResidents.reduce((sum, r) => sum + r.maintenanceAmount, 0);
  const paidResidents = buildingResidents.filter(r => r.maintenancePaid).length;
  const pendingPayments = buildingResidents.filter(r => !r.maintenancePaid).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/owner/buildings">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Buildings
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
                <p className="text-gray-600">{building.address}, {building.city}, {building.state} {building.zipCode}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Building
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buildingResidents.length}</div>
              <p className="text-xs text-muted-foreground">
                Active residents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buildingServices.length}</div>
              <p className="text-xs text-muted-foreground">
                Service providers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatINR(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From maintenance fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidResidents}</div>
              <p className="text-xs text-muted-foreground">
                {pendingPayments} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Building Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="residents">Residents</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Building Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Building Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium">{building.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Floors:</span>
                      <p className="font-medium">{building.totalFloors}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Address:</span>
                      <p className="font-medium">{building.address}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">City:</span>
                      <p className="font-medium">{building.city}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">State:</span>
                      <p className="font-medium">{building.state}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">ZIP Code:</span>
                      <p className="font-medium">{building.zipCode}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Building Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/owner/building/${building.id}/residents/add`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Resident
                    </Button>
                  </Link>
                  <Link href={`/owner/building/${building.id}/services/add`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Service
                    </Button>
                  </Link>
                  <Link href={`/owner/qr-codes?building=${building.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <QrCode className="h-4 w-4 mr-2" />
                      Manage QR Codes
                    </Button>
                  </Link>
                  <Link href={`/owner/messages?building=${building.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buildingMessages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{message.senderName}</p>
                        <p className="text-sm text-gray-600">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {buildingMessages.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Residents Tab */}
          <TabsContent value="residents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Building Residents</h3>
              <Link href={`/owner/building/${building.id}/residents/add`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resident
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildingResidents.map((resident) => (
                <Card key={resident.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{resident.name}</CardTitle>
                    <CardDescription>Unit {resident.unitNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{resident.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{resident.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Work:</span>
                        <span>{resident.work}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maintenance:</span>
                        <span className="font-medium">{formatINR(resident.maintenanceAmount)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={resident.maintenancePaid ? "default" : "destructive"}>
                        {resident.maintenancePaid ? "Paid" : "Pending"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {buildingResidents.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No residents yet</h3>
                <p className="text-gray-600">Add your first resident to get started</p>
                <Link href={`/owner/building/${building.id}/residents/add`}>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resident
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Building Services</h3>
              <Link href={`/owner/building/${building.id}/services/add`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildingServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span>{service.servicemanName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{service.openingTime} - {service.closingTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={service.isActive ? "default" : "secondary"}>
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {buildingServices.length === 0 && (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                <p className="text-gray-600">Add your first service to get started</p>
                <Link href={`/owner/building/${building.id}/services/add`}>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Building Messages</h3>
              <Link href={`/owner/messages?building=${building.id}`}>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {buildingMessages.map((message) => (
                <Card key={message.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{message.senderName}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-600">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-900">{message.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {buildingMessages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600">Send your first message to residents</p>
                <Link href={`/owner/messages?building=${building.id}`}>
                  <Button className="mt-4">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* QR Codes Tab */}
          <TabsContent value="qr-codes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Building QR Codes</h3>
              <Link href={`/owner/qr-codes?building=${building.id}`}>
                <Button>
                  <QrCode className="h-4 w-4 mr-2" />
                  Manage QR Codes
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Payment QR Code</CardTitle>
                  <CardDescription>For maintenance payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <QrCode className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">Payment QR Code</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">Download</Button>
                    <Button size="sm" variant="outline">Copy</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Access QR Code</CardTitle>
                  <CardDescription>For building entry</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <QrCode className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">Access QR Code</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">Download</Button>
                    <Button size="sm" variant="outline">Copy</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Service QR Code</CardTitle>
                  <CardDescription>For service requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <QrCode className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">Service QR Code</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">Download</Button>
                    <Button size="sm" variant="outline">Copy</Button>
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

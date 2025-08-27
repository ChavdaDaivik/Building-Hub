
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, ArrowLeft, Building, Phone, Clock, MapPin, Users } from 'lucide-react';
import { mockBuildings, mockServices } from '@/lib/data';
import Link from 'next/link';

export default function ResidentServicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [services, setServices] = useState<any[]>([]);
  const [buildingData, setBuildingData] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      router.push('/login');
      return;
    }

    // Get building data
    const building = mockBuildings.find(b => b.id === user.buildingId);
    setBuildingData(building);
    
    // Get services for this building
    const buildingServices = mockServices.filter(s => s.buildingId === user.buildingId);
    setServices(buildingServices);
  }, [user, router]);

  if (!user || user.role !== 'resident' || !buildingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/resident/dashboard" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Available Services</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Building Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Building className="h-12 w-12 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">{buildingData.name}</h2>
                <p className="text-gray-600">{buildingData.address}</p>
                <p className="text-gray-600">{buildingData.city}, {buildingData.state} {buildingData.zipCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm"><strong>Provider:</strong> {service.servicemanName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm"><strong>Phone:</strong> {service.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm"><strong>Hours:</strong> {service.openingTime} - {service.closingTime}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm"><strong>Address:</strong> {service.address}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full" variant="outline">
                    Contact Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {services.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No services available</h3>
                  <p className="text-gray-600">Building management will add services here when they become available.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Service Request Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need a Service Not Listed?</CardTitle>
            <CardDescription>
              Contact building management to request additional services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Contact Management</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Reach out to building management for any service requests or questions.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Management
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Emergency Services</h4>
                <p className="text-sm text-gray-600 mb-3">
                  For urgent maintenance or emergency situations, contact management immediately.
                </p>
                <Button variant="destructive" className="w-full">
                  Emergency Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

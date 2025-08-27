
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Plus, Search, Edit, Trash2, Building, Clock, Phone, MapPin } from 'lucide-react';
import { mockBuildings, mockServices } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ServicesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    // Load services and filter to owner's buildings
    const storedServices = localStorage.getItem('buildingHubServices');
    const allServices = storedServices ? JSON.parse(storedServices) : mockServices;
    const allowedIds = Array.isArray(user?.entityIds) ? user?.entityIds : [];
    setServices(allServices.filter((s: any) => allowedIds.includes(s.buildingId)));
  }, [user]);

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

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.servicemanName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBuilding = selectedBuilding === 'all' || service.buildingId === selectedBuilding;
    
    return matchesSearch && matchesBuilding;
  });

  const getBuildingName = (buildingId: string) => {
    const storedBuildingsRaw = localStorage.getItem('buildingHubBuildings');
    const storedBuildings = storedBuildingsRaw ? JSON.parse(storedBuildingsRaw) : [];
    const merged = [...mockBuildings, ...storedBuildings];
    const building = merged.find(b => b.id === buildingId);
    return building?.name || 'Unknown Building';
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== serviceId));
      toast({
        title: "Service Deleted",
        description: "Service has been removed successfully.",
      });
    }
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices(services.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive }
        : service
    ));
    
    const service = services.find(s => s.id === serviceId);
    toast({
      title: service?.isActive ? "Service Deactivated" : "Service Activated",
      description: `${service?.name} has been ${service?.isActive ? 'deactivated' : 'activated'}.`,
    });
  };

  if (!user || user.role !== 'owner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
              <p className="text-gray-600">Manage all services across your buildings</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/owner/add-service">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <Label htmlFor="search">Search Services</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, description, or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end space-x-4">
              <div>
                <Label htmlFor="building-filter">Filter by Building</Label>
                <select
                  id="building-filter"
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="p-2 border rounded-md ml-2"
                >
                  <option value="all">All Buildings</option>
                  {mockBuildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all buildings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {services.filter(s => s.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(services.map(s => s.servicemanName)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique providers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(services.map(s => s.buildingId)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Buildings covered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{service.name}</span>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{service.servicemanName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{service.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{service.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{service.openingTime} - {service.closingTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{getBuildingName(service.buildingId)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant={service.isActive ? "outline" : "default"}
                    onClick={() => toggleServiceStatus(service.id)}
                  >
                    {service.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedBuilding !== 'all' 
                ? 'Try adjusting your search terms or building filter.' 
                : 'Get started by adding your first service.'}
            </p>
            {!searchTerm && selectedBuilding === 'all' && (
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

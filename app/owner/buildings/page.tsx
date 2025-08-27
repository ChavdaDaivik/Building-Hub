
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Plus, Search, Edit, Trash2, Users, QrCode, DollarSign } from 'lucide-react';
import { mockBuildings, mockResidents, mockServices } from '@/lib/data';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function BuildingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [buildings, setBuildings] = useState(mockBuildings);

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      router.push('/login');
      return;
    }
    // Merge stored buildings from localStorage with mocks, then restrict to owner's entityIds
    const storedRaw = localStorage.getItem('buildingHubBuildings');
    const stored = storedRaw ? JSON.parse(storedRaw) : [];
    const merged = [...mockBuildings, ...stored];
    const allowedIds = Array.isArray(user.entityIds) ? user.entityIds : [];
    setBuildings(merged.filter(b => allowedIds.includes(b.id)));
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBuildingStats = (buildingId: string) => {
    const residents = mockResidents.filter(r => r.buildingId === buildingId);
    const services = mockServices.filter(s => s.buildingId === buildingId);
    const totalRevenue = residents.reduce((sum, r) => sum + r.maintenanceAmount, 0);
    
    return {
      residents: residents.length,
      services: services.length,
      totalRevenue
    };
  };

  const handleDeleteBuilding = (buildingId: string) => {
    if (confirm('Are you sure you want to delete this building?')) {
      setBuildings(buildings.filter(b => b.id !== buildingId));
      toast({
        title: "Building Deleted",
        description: "Building has been removed successfully.",
      });
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Buildings Management</h1>
              <p className="text-gray-600">Manage all your properties and buildings</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/owner/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Building
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
              <Label htmlFor="search">Search Buildings</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, address, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Generate All QR Codes
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buildings.length}</div>
              <p className="text-xs text-muted-foreground">
                Active properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockResidents.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all buildings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockServices.length}</div>
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
              <div className="text-2xl font-bold">
                {formatINR(mockResidents.reduce((sum, r) => sum + r.maintenanceAmount, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                From maintenance fees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Buildings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuildings.map((building) => {
            const stats = getBuildingStats(building.id);
            return (
              <Card key={building.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{building.name}</span>
                    <Badge variant="secondary">Active</Badge>
                  </CardTitle>
                  <CardDescription>{building.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span>{building.city}, {building.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Floors:</span>
                      <span>{building.totalFloors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Residents:</span>
                      <span>{stats.residents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Services:</span>
                      <span>{stats.services}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Revenue:</span>
                      <span className="font-medium">{formatINR(stats.totalRevenue)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/owner/building/${building.id}`}>
                      <Button size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/owner/qr-codes?building=${building.id}`}>
                      <Button size="sm" variant="outline">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteBuilding(building.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBuildings.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No buildings found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first building.'}
            </p>
            {!searchTerm && (
              <Link href="/owner/add">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Building
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

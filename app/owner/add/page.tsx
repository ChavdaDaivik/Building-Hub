
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, ArrowLeft, Save, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AddBuildingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    totalFloors: '',
    description: '',
    amenities: '',
    parkingSpaces: '',
    yearBuilt: ''
  });

  if (!user || user.role !== 'owner') {
    router.push('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.totalFloors) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new building object
      const newBuilding = {
        id: Date.now().toString(),
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        totalFloors: parseInt(formData.totalFloors),
        description: formData.description,
        amenities: formData.amenities,
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : new Date().getFullYear(),
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      toast({
        title: "Building Added Successfully!",
        description: `${formData.name} has been added to your portfolio.`,
      });

      // Redirect to buildings page
      router.push('/owner/buildings');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add building. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Add New Building</h1>
                <p className="text-gray-600">Create a new property in your portfolio</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Building Information
            </CardTitle>
            <CardDescription>
              Fill in the details below to add a new building to your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Building Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Sunrise Apartments"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFloors">Total Floors *</Label>
                  <Input
                    id="totalFloors"
                    name="totalFloors"
                    type="number"
                    placeholder="e.g., 15"
                    value={formData.totalFloors}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="e.g., 123 Main Street"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="e.g., New York"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="e.g., NY"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      placeholder="e.g., 10001"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    placeholder="e.g., 2020"
                    value={formData.yearBuilt}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                  <Input
                    id="parkingSpaces"
                    name="parkingSpaces"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.parkingSpaces}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              {/* Description and Amenities */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Building Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the building, its features, and target market..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <Textarea
                    id="amenities"
                    name="amenities"
                    placeholder="List available amenities (e.g., Gym, Pool, Security, etc.)"
                    value={formData.amenities}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link href="/owner/buildings">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Building...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Building
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Fields</h4>
                <ul className="space-y-1">
                  <li>• Building Name</li>
                  <li>• Street Address</li>
                  <li>• City, State, ZIP</li>
                  <li>• Total Floors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Optional Fields</h4>
                <ul className="space-y-1">
                  <li>• Year Built</li>
                  <li>• Parking Spaces</li>
                  <li>• Description</li>
                  <li>• Amenities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


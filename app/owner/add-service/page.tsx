'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building, Settings, ArrowLeft, Upload, Camera, Plus } from 'lucide-react';
import { mockBuildings } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AddServicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    buildingId: '',
    servicemanName: '',
    servicemanPhone: '',
    servicemanEmail: '',
    openingTime: '',
    closingTime: '',
    address: '',
    isActive: true,
    serviceImage: null as File | null,
    qrCodeImage: null as File | null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [qrCodePreview, setQrCodePreview] = useState<string>('');

  if (!user || user.role !== 'owner') {
    router.push('/login');
    return null;
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'service' | 'qr') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'service') {
        setFormData(prev => ({ ...prev, serviceImage: file }));
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({ ...prev, qrCodeImage: file }));
        const reader = new FileReader();
        reader.onload = (e) => setQrCodePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create new service object
      const newService = {
        id: Date.now().toString(), // Generate unique ID
        name: formData.name,
        description: formData.description,
        type: formData.type,
        buildingId: formData.buildingId,
        servicemanName: formData.servicemanName,
        servicemanPhone: formData.servicemanPhone,
        servicemanEmail: formData.servicemanEmail,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        address: formData.address,
        isActive: formData.isActive,
        serviceImage: formData.serviceImage ? URL.createObjectURL(formData.serviceImage) : '',
        qrCodeImage: formData.qrCodeImage ? URL.createObjectURL(formData.qrCodeImage) : ''
      };

      // Add to localStorage for persistence
      const existingServices = JSON.parse(localStorage.getItem('buildingHubServices') || '[]');
      existingServices.push(newService);
      localStorage.setItem('buildingHubServices', JSON.stringify(existingServices));
      
      toast({
        title: 'Success!',
        description: 'Service added successfully',
      });
      
      router.push('/owner/services');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add service. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/owner/services">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
              <p className="text-gray-600">Add a new service to your building</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Service Information
              </CardTitle>
              <CardDescription>
                Enter the service details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Cleaning Service"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Service Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="landscaping">Landscaping</SelectItem>
                      <SelectItem value="pool">Pool Service</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the service..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Building Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Building Assignment
              </CardTitle>
              <CardDescription>
                Assign the service to a building
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="building">Building *</Label>
                <Select value={formData.buildingId} onValueChange={(value) => handleInputChange('buildingId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBuildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name} - {building.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Service Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Service Provider Details
              </CardTitle>
              <CardDescription>
                Contact information for the service provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="servicemanName">Provider Name *</Label>
                  <Input
                    id="servicemanName"
                    value={formData.servicemanName}
                    onChange={(e) => handleInputChange('servicemanName', e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servicemanPhone">Phone Number *</Label>
                  <Input
                    id="servicemanPhone"
                    value={formData.servicemanPhone}
                    onChange={(e) => handleInputChange('servicemanPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servicemanEmail">Email</Label>
                  <Input
                    id="servicemanEmail"
                    type="email"
                    value={formData.servicemanEmail}
                    onChange={(e) => handleInputChange('servicemanEmail', e.target.value)}
                    placeholder="john@service.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Service Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Service St, City, State"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Operating Hours
              </CardTitle>
              <CardDescription>
                Set the service operating schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="openingTime">Opening Time</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => handleInputChange('openingTime', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="closingTime">Closing Time</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => handleInputChange('closingTime', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Service Status
              </CardTitle>
              <CardDescription>
                Control the service availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Service is active</Label>
              </div>
            </CardContent>
          </Card>

          {/* Service Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Service Image
              </CardTitle>
              <CardDescription>
                Upload an image representing the service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="file"
                      id="serviceImage"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'service')}
                      className="hidden"
                    />
                    <Label htmlFor="serviceImage" className="cursor-pointer">
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Upload Image</p>
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('serviceImage')?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <p className="text-xs text-gray-500">
                      Click to upload or take a photo
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                QR Code Image (Optional)
              </CardTitle>
              <CardDescription>
                Upload a custom QR code image for the service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="file"
                      id="qrCodeImage"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'qr')}
                      className="hidden"
                    />
                    <Label htmlFor="qrCodeImage" className="cursor-pointer">
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                        {qrCodePreview ? (
                          <img src={qrCodePreview} alt="QR Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">QR Code</p>
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('qrCodeImage')?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Upload QR
                    </Button>
                    <p className="text-xs text-gray-500">
                      Upload a custom QR code image
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/owner/services">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

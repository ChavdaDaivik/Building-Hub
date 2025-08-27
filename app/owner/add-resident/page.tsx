'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Building, Users, ArrowLeft, Upload, Camera, UserPlus } from 'lucide-react';
import { mockBuildings } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AddResidentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    work: '',
    unitNumber: '',
    buildingId: '',
    maintenanceAmount: '',
    profileImage: null as File | null,
    qrCodeImage: null as File | null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [qrCodePreview, setQrCodePreview] = useState<string>('');

  // Preselect the owner's building and prevent choosing others
  useEffect(() => {
    if (!user || user.role !== 'owner') return;
    const allowedIds = Array.isArray(user.entityIds) ? user.entityIds : (user.buildingId ? [user.buildingId] : []);
    const firstBuildingId = allowedIds[0] || '';
    setFormData(prev => ({ ...prev, buildingId: firstBuildingId }));
  }, [user]);

  if (!user || user.role !== 'owner') {
    router.push('/login');
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'qr') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'profile') {
        setFormData(prev => ({ ...prev, profileImage: file }));
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

  // Generate a UUID for resident ID with secure fallback
  const generateResidentId = (): string => {
    try {
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        // @ts-expect-error: runtime check above ensures availability
        return crypto.randomUUID();
      }
    } catch (_) {
      // ignore and use fallback
    }
    return `res_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  };

  // Cryptographically-strong password generator with required complexity
  const generateStrongPassword = (length: number = 14): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()-_=+[]{};:,.<>/?';
    const allChars = `${lowercase}${uppercase}${digits}${symbols}`;

    const getSecureInt = (max: number): number => {
      try {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
          const buf = new Uint32Array(1);
          crypto.getRandomValues(buf);
          return buf[0] % max;
        }
      } catch (_) {
        // fallback to Math.random if crypto is not available
      }
      return Math.floor(Math.random() * max);
    };

    const pick = (set: string) => set[getSecureInt(set.length)];

    // Ensure at least one from each category
    const required = [pick(lowercase), pick(uppercase), pick(digits), pick(symbols)];
    const remainingLength = Math.max(length, 12) - required.length;
    const rest: string[] = [];
    for (let i = 0; i < remainingLength; i++) {
      rest.push(pick(allChars));
    }
    const pwdArray = [...required, ...rest];
    // Shuffle (Fisher–Yates)
    for (let i = pwdArray.length - 1; i > 0; i--) {
      const j = getSecureInt(i + 1);
      [pwdArray[i], pwdArray[j]] = [pwdArray[j], pwdArray[i]];
    }
    return pwdArray.join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ensure buildingId is set to the current owner's building
      const allowedIds = Array.isArray(user.entityIds) ? user.entityIds : (user.buildingId ? [user.buildingId] : []);
      const effectiveBuildingId = formData.buildingId || allowedIds[0] || '';
      if (!effectiveBuildingId) {
        toast({
          title: 'Validation Error',
          description: 'No building selected for this owner.',
          variant: 'destructive'
        });
        return;
      }

      // Create new resident object
      const newResidentId = generateResidentId();
      const baseUsername = formData.name.split(' ')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'resident';
      const username = `${baseUsername}${Math.floor(Math.random() * 900) + 100}`;
      const password = generateStrongPassword(14);

      const newResident = {
        id: newResidentId, // Generate unique ID
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        work: formData.work,
        unitNumber: formData.unitNumber,
        buildingId: effectiveBuildingId,
        maintenanceAmount: parseFloat(formData.maintenanceAmount) || 0,
        maintenancePaid: false,
        password,
        profileImage: formData.profileImage ? URL.createObjectURL(formData.profileImage) : '',
        qrCodeImage: formData.qrCodeImage ? URL.createObjectURL(formData.qrCodeImage) : ''
      };

      // Add to localStorage for persistence
      const existingResidents = JSON.parse(localStorage.getItem('buildingHubResidents') || '[]');
      existingResidents.push(newResident);
      localStorage.setItem('buildingHubResidents', JSON.stringify(existingResidents));

      // Also create a login for this resident
      const existingUsers = JSON.parse(localStorage.getItem('buildingHubUsers') || '[]');
      const newUser = { id: newResidentId, username, password, role: 'resident', entityIds: [newResidentId] };
      localStorage.setItem('buildingHubUsers', JSON.stringify([...existingUsers, newUser]));
      
      toast({
        title: 'Success!',
        description: `Resident added. Username: ${username}  Password: ${password}`,
      });
      
      router.push('/owner/residents');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add resident. Please try again.',
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
            <Link href="/owner/residents">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Residents
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Resident</h1>
              <p className="text-gray-600">Add a new resident to your building</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the resident's personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="work">Work/Company</Label>
                  <Input
                    id="work"
                    value={formData.work}
                    onChange={(e) => handleInputChange('work', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
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
                Assign the resident to a building and unit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="building">Building *</Label>
                  <Select value={formData.buildingId} onValueChange={(value) => handleInputChange('buildingId', value)} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const allowedIds = Array.isArray(user.entityIds) ? user.entityIds : (user.buildingId ? [user.buildingId] : []);
                        return mockBuildings
                          .filter(b => allowedIds.includes(b.id))
                          .map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name} - {building.city}
                            </SelectItem>
                          ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">Unit Number *</Label>
                  <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                    placeholder="A101"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Financial Information
              </CardTitle>
              <CardDescription>
                Set maintenance fees and payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maintenanceAmount">Monthly Maintenance Fee *</Label>
                <Input
                  id="maintenanceAmount"
                  type="number"
                  value={formData.maintenanceAmount}
                  onChange={(e) => handleInputChange('maintenanceAmount', e.target.value)}
                  placeholder="500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Profile Image
              </CardTitle>
              <CardDescription>
                Upload a profile photo for the resident
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profile')}
                      className="hidden"
                    />
                    <Label htmlFor="profileImage" className="cursor-pointer">
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Upload Photo</p>
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('profileImage')?.click()}
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
                Upload a custom QR code image for the resident
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
            <Link href="/owner/residents">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Resident'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

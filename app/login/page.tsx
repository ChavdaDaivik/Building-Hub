
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockBuildings, mockResidents } from '@/lib/data';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('owner');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [ownerForm, setOwnerForm] = useState({
    email: '',
    password: '',
    buildingId: '',
    buildingName: ''
  });
  
  const [residentForm, setResidentForm] = useState({
    email: '',
    password: '',
    buildingName: ''
  });

  const [ownerSignupForm, setOwnerSignupForm] = useState({
    buildingName: '',
    buildingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    email: '',
    password: ''
  });

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simple validation
      if (!ownerForm.email || !ownerForm.password || !ownerForm.buildingName) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields (including building name).",
          variant: "destructive",
        });
        return;
      }

      // Enforce single owner per building using localStorage mapping
      const mappingKey = 'buildingHubOwnerByBuilding';
      const rawMap = localStorage.getItem(mappingKey);
      const ownerMap: Record<string, string> = rawMap ? JSON.parse(rawMap) : {};

      // Find building by name (case-insensitive) from merged (mock + stored)
      const buildingsKey = 'buildingHubBuildings';
      const storedBuildingsRaw = localStorage.getItem(buildingsKey);
      const storedBuildings = storedBuildingsRaw ? JSON.parse(storedBuildingsRaw) : [];
      const allBuildings = [...mockBuildings, ...storedBuildings];
      const norm = (s: string) => s.trim().toLowerCase();
      const matched = allBuildings.find(b => norm(b.name) === norm(ownerForm.buildingName));

      if (!matched) {
        toast({
          title: "Building Not Found",
          description: "No building with that name. Use Owner Signup to create/claim.",
          variant: "destructive",
        });
        return;
      }

      const existingOwnerEmail = ownerMap[matched.id];
      if (existingOwnerEmail && existingOwnerEmail.toLowerCase() !== ownerForm.email.toLowerCase()) {
        toast({
          title: "Login Blocked",
          description: "This building already has an owner account.",
          variant: "destructive",
        });
        return;
      }

      // In this demo, accept any non-empty password. You may replace with real auth.
      // Persist the owner email for this building on first successful login
      if (!existingOwnerEmail) {
        ownerMap[matched.id] = ownerForm.email;
        localStorage.setItem(mappingKey, JSON.stringify(ownerMap));
      }

      const selectedBuilding = matched;
      const ownerUser = {
        id: `owner-${ownerForm.email}`,
        name: selectedBuilding ? `${selectedBuilding.name} Owner` : 'Building Owner',
        email: ownerForm.email,
        role: 'owner' as const,
        entityIds: [selectedBuilding.id],
      };

      await login(ownerUser);
      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });
      router.push('/owner/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResidentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simple validation
      if (!residentForm.email || !residentForm.password || !residentForm.buildingName) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields (including building name).",
          variant: "destructive",
        });
        return;
      }

      // Resolve building by name (merged stored + mock)
      const buildingsKey = 'buildingHubBuildings';
      const storedBuildingsRaw = localStorage.getItem(buildingsKey);
      const storedBuildings = storedBuildingsRaw ? JSON.parse(storedBuildingsRaw) : [];
      const allBuildings = [...mockBuildings, ...storedBuildings];
      const norm = (s: string) => s.trim().toLowerCase();
      const matchedBuilding = allBuildings.find(b => norm(b.name) === norm(residentForm.buildingName));
      if (!matchedBuilding) {
        toast({
          title: "Building Not Found",
          description: "No building with that name.",
          variant: "destructive",
        });
        return;
      }

      // Load residents from localStorage with mock fallback
      const storedResidentsRaw = localStorage.getItem('buildingHubResidents');
      const residentSource = storedResidentsRaw ? JSON.parse(storedResidentsRaw) : mockResidents;

      // Find resident by email + building
      const resident = residentSource.find((r: any) => 
        r.email === residentForm.email &&
        r.buildingId === matchedBuilding.id
      );

      if (resident) {
        const firstName = String(resident.name || '')
          .split(' ')[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') || 'resident';
        const defaultPassword = `${firstName}@123`;

        const inputPassword = residentForm.password;
        const storedPassword = resident.password || '';
        const passwordOk = inputPassword === storedPassword || inputPassword === defaultPassword;

        if (!passwordOk) {
          toast({
            title: "Login Failed",
            description: "Invalid credentials.",
            variant: "destructive",
          });
          return;
        }
        const residentUser = {
          id: resident.id,
          name: resident.name,
          email: resident.email,
          role: 'resident' as const,
          buildingId: resident.buildingId,
          unitNumber: resident.unitNumber
        };

        await login(residentUser);
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${resident.name}!`,
        });
        router.push('/resident/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials or building selection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (formType: 'owner' | 'resident', field: string, value: string) => {
    if (formType === 'owner') {
      setOwnerForm(prev => ({ ...prev, [field]: value }));
    } else {
      setResidentForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleOwnerSignupChange = (field: string, value: string) => {
    setOwnerSignupForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOwnerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { buildingName, buildingAddress, city, state, zipCode, email, password } = ownerSignupForm;
      if (!buildingName || !buildingAddress || !city || !state || !zipCode || !email || !password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
        return;
      }

      const buildingsKey = 'buildingHubBuildings';
      const ownerMapKey = 'buildingHubOwnerByBuilding';
      const storedBuildingsRaw = localStorage.getItem(buildingsKey);
      const storedBuildings = storedBuildingsRaw ? JSON.parse(storedBuildingsRaw) : [];
      const allBuildings = [...mockBuildings, ...storedBuildings];

      const norm = (s: string) => s.trim().toLowerCase();
      const exists = allBuildings.find(b => norm(b.name) === norm(buildingName) && norm(b.address) === norm(buildingAddress));
      if (exists) {
        const ownerMapRaw = localStorage.getItem(ownerMapKey);
        const ownerMap: Record<string, string> = ownerMapRaw ? JSON.parse(ownerMapRaw) : {};
        const existingOwnerEmail = ownerMap[exists.id];
        if (existingOwnerEmail && existingOwnerEmail.toLowerCase() !== email.toLowerCase()) {
          toast({
            title: "Signup Blocked",
            description: "This building is already owned by another account.",
            variant: "destructive",
          });
          return;
        }

        if (!existingOwnerEmail) {
          ownerMap[exists.id] = email;
          localStorage.setItem(ownerMapKey, JSON.stringify(ownerMap));
        }

        const ownerUser = {
          id: `owner-${email}`,
          name: `${exists.name} Owner`,
          email,
          role: 'owner' as const,
          entityIds: [exists.id],
        };
        await login(ownerUser);
        toast({ title: 'Signup Successful', description: 'You now own this building.' });
        router.push('/owner/dashboard');
        return;
      }

      const newId = Date.now().toString();
      const newBuilding = {
        id: newId,
        name: buildingName,
        address: buildingAddress,
        city,
        state,
        zipCode,
        totalFloors: 1,
        ownerId: `owner-${email}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedStored = [...storedBuildings, newBuilding];
      localStorage.setItem(buildingsKey, JSON.stringify(updatedStored));

      const ownerMapRaw = localStorage.getItem(ownerMapKey);
      const ownerMap: Record<string, string> = ownerMapRaw ? JSON.parse(ownerMapRaw) : {};
      ownerMap[newId] = email;
      localStorage.setItem(ownerMapKey, JSON.stringify(ownerMap));

      const ownerUser = {
        id: `owner-${email}`,
        name: `${buildingName} Owner`,
        email,
        role: 'owner' as const,
        entityIds: [newId],
      };

      await login(ownerUser);
      toast({ title: 'Signup Successful', description: 'Building created and assigned to you.' });
      router.push('/owner/dashboard');
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred during signup.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Building Hub</h1>
          <p className="text-gray-600">Your complete building management solution</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="owner" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Building Owner
                </TabsTrigger>
                <TabsTrigger value="resident" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Resident
                </TabsTrigger>
                <TabsTrigger value="owner-signup" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Owner Signup
                </TabsTrigger>
              </TabsList>

              {/* Owner Login */}
              <TabsContent value="owner" className="space-y-4">
                <form onSubmit={handleOwnerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner-building-name">Building Name</Label>
                    <Input
                      id="owner-building-name"
                      placeholder="Enter your building name"
                      value={ownerForm.buildingName}
                      onChange={(e) => handleInputChange('owner', 'buildingName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner-email">Email</Label>
                    <div className="relative">
                      <Input
                        id="owner-email"
                        type="email"
                        placeholder="owner@buildinghub.com"
                        value={ownerForm.email}
                        onChange={(e) => handleInputChange('owner', 'email', e.target.value)}
                        required
                        className="pl-10"
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="owner-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={ownerForm.password}
                        onChange={(e) => handleInputChange('owner', 'password', e.target.value)}
                        required
                        className="pl-10 pr-10"
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing In...
                      </>
                    ) : (
                      'Sign In as Owner'
                    )}
                  </Button>
                </form>

                {/* Owner Login Note */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Note:</p>
                      <p>Each building can have only one owner account. The first owner who logs in for a building will be set as its owner. Others will be blocked from claiming the same building.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Owner Signup */}
              <TabsContent value="owner-signup" className="space-y-4">
                <form onSubmit={handleOwnerSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-building-name">Building Name</Label>
                    <Input
                      id="signup-building-name"
                      placeholder="e.g., Green Meadows"
                      value={ownerSignupForm.buildingName}
                      onChange={(e) => handleOwnerSignupChange('buildingName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-building-address">Address</Label>
                    <Input
                      id="signup-building-address"
                      placeholder="123 Main St"
                      value={ownerSignupForm.buildingAddress}
                      onChange={(e) => handleOwnerSignupChange('buildingAddress', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-city">City</Label>
                      <Input
                        id="signup-city"
                        value={ownerSignupForm.city}
                        onChange={(e) => handleOwnerSignupChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-state">State</Label>
                      <Input
                        id="signup-state"
                        value={ownerSignupForm.state}
                        onChange={(e) => handleOwnerSignupChange('state', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-zip">Zip Code</Label>
                      <Input
                        id="signup-zip"
                        value={ownerSignupForm.zipCode}
                        onChange={(e) => handleOwnerSignupChange('zipCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Owner Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="owner@example.com"
                      value={ownerSignupForm.email}
                      onChange={(e) => handleOwnerSignupChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={ownerSignupForm.password}
                      onChange={(e) => handleOwnerSignupChange('password', e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Owner Account...
                      </>
                    ) : (
                      'Sign Up as Owner'
                    )}
                  </Button>
                </form>
                <div className="mt-2 text-xs text-gray-600">
                  If a building with the same name and address already exists and has an owner, signup will be blocked. If it exists without an owner, you will claim it.
                </div>
              </TabsContent>

              {/* Resident Login */}
              <TabsContent value="resident" className="space-y-4">
                <form onSubmit={handleResidentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resident-building-name">Building Name</Label>
                    <Input
                      id="resident-building-name"
                      placeholder="Enter your building name"
                      value={residentForm.buildingName}
                      onChange={(e) => handleInputChange('resident', 'buildingName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resident-email">Email</Label>
                    <div className="relative">
                      <Input
                        id="resident-email"
                        type="email"
                        placeholder="resident@example.com"
                        value={residentForm.email}
                        onChange={(e) => handleInputChange('resident', 'email', e.target.value)}
                        required
                        className="pl-10"
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resident-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="resident-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={residentForm.password}
                        onChange={(e) => handleInputChange('resident', 'password', e.target.value)}
                        required
                        className="pl-10 pr-10"
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing In...
                      </>
                    ) : (
                      'Sign In as Resident'
                    )}
                  </Button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Demo Resident Accounts:</p>
                      <p>John Doe: john@example.com / resident123</p>
                      <p>Jane Smith: jane@example.com / resident123</p>
                      <p>Mike Johnson: mike@example.com / resident123</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help? Contact support at{' '}
            <a href="mailto:support@buildinghub.com" className="text-blue-600 hover:underline">
              support@buildinghub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

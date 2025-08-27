'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  ArrowLeft, 
  Upload, 
  Camera,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function OwnerSettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Building Manager',
    email: user?.email || 'owner@buildinghub.com',
    phone: '+1 (555) 123-4567',
    company: 'Building Management Co.',
    bio: 'Professional building manager with 10+ years of experience.',
    profileImage: null as File | null
  });
  
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    sessionTimeout: '30'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceAlerts: true,
    paymentReminders: true,
    residentMessages: true,
    weeklyReports: false
  });
  
  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  if (!user || user.role !== 'owner') {
    router.push('/login');
    return null;
  }

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    switch (section) {
      case 'profile':
        setProfileData(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecurityData(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotificationSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'app':
        setAppSettings(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Success!',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Success!',
        description: 'Security settings updated',
      });
      setSecurityData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update security settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/owner/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="profileImage" className="cursor-pointer">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">Upload</p>
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
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500">
                    Upload a new profile picture
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => handleInputChange('profile', 'company', e.target.value)}
                    placeholder="Company name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords ? 'text' : 'password'}
                      value={securityData.currentPassword}
                      onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPasswords ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={securityData.confirmPassword}
                  onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactor"
                  checked={securityData.twoFactorEnabled}
                  onCheckedChange={(checked) => handleInputChange('security', 'twoFactorEnabled', checked)}
                />
                <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select value={securityData.sessionTimeout} onValueChange={(value) => handleInputChange('security', 'sessionTimeout', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveSecurity} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotif">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotif"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'emailNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotif">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via text message</p>
                  </div>
                  <Switch
                    id="smsNotif"
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'smsNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotif">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications in the app</p>
                  </div>
                  <Switch
                    id="pushNotif"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'pushNotifications', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Specific Notifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceAlerts"
                      checked={notificationSettings.maintenanceAlerts}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'maintenanceAlerts', checked)}
                    />
                    <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="paymentReminders"
                      checked={notificationSettings.paymentReminders}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'paymentReminders', checked)}
                    />
                    <Label htmlFor="paymentReminders">Payment Reminders</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="residentMessages"
                      checked={notificationSettings.residentMessages}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'residentMessages', checked)}
                    />
                    <Label htmlFor="residentMessages">Resident Messages</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weeklyReports"
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'weeklyReports', checked)}
                    />
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                App Preferences
              </CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={appSettings.theme} onValueChange={(value) => handleInputChange('app', 'theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={appSettings.language} onValueChange={(value) => handleInputChange('app', 'language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={appSettings.timezone} onValueChange={(value) => handleInputChange('app', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={appSettings.currency} onValueChange={(value) => handleInputChange('app', 'currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Settings className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Logout</h4>
                <p className="text-sm text-red-600 mb-4">
                  Sign out of your account. You'll need to log in again to access your dashboard.
                </p>
                <Button onClick={handleLogout} variant="destructive">
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}







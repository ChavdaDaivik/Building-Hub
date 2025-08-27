
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  Settings, 
  MessageSquare, 
  QrCode, 
  DollarSign, 
  Bell,
  Camera,
  CreditCard,
  FileText,
  Calendar,
  MapPin,
  CheckCircle,
  Wrench
} from 'lucide-react';
import { mockBuildings, mockResidents, mockMessages, mockPayments } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';

export default function ResidentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [building, setBuilding] = useState<any>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      router.push('/login');
      return;
    }

    // Prefer buildingId from logged-in user; resolve from merged stored + mock
    const storedBuildingsRaw = localStorage.getItem('buildingHubBuildings');
    const storedBuildings = storedBuildingsRaw ? JSON.parse(storedBuildingsRaw) : [];
    const allBuildings = [...mockBuildings, ...storedBuildings];
    const residentBuilding = allBuildings.find((b: any) => b.id === (user as any).buildingId);
    if (residentBuilding) {
      setBuilding(residentBuilding);

      // Get messages for the user's building
      const buildingMessages = mockMessages
        .filter(m => m.buildingId === (user as any).buildingId)
        .slice(0, 3);
      setRecentMessages(buildingMessages);

      // Monthly payment status: use monthly store
      const storedResidentsRaw = localStorage.getItem('buildingHubResidents');
      const residents = storedResidentsRaw ? JSON.parse(storedResidentsRaw) : mockResidents;
      const me = Array.isArray(residents) ? residents.find((r: any) => r.id === user.id) : null;
      const ym = new Date();
      const monthKey = `${ym.getFullYear()}-${String(ym.getMonth() + 1).padStart(2, '0')}`;
      const storeKey = 'buildingHubMonthlyPayments';
      const monthlyRaw = localStorage.getItem(storeKey);
      const monthly: any[] = monthlyRaw ? JSON.parse(monthlyRaw) : [];
      const current = monthly.find(p => p.residentId === user.id && p.month === monthKey);
      const amount = me?.maintenanceAmount || 0;
      if (!current || current.status !== 'completed') {
        setPendingPayments([{ id: `maint_${user.id}_${monthKey}`, residentId: user.id, type: 'Monthly Maintenance', amount, status: 'pending', dueDate: new Date().toISOString() }]);
      } else {
        setPendingPayments([]);
      }
    }
  }, [user, router]);

  // Notify resident about new owner messages since last seen
  useEffect(() => {
    if (!user || user.role !== 'resident') return;
    try {
      const stored = localStorage.getItem('buildingHubMessages');
      const all = stored ? JSON.parse(stored) : [];
      const lastSeenKey = `buildingHubLastSeenMessages_${user.id}`;
      const lastSeenRaw = localStorage.getItem(lastSeenKey);
      const lastSeen = lastSeenRaw ? new Date(lastSeenRaw).getTime() : 0;
      const newCount = all.filter((m: any) => m.senderRole === 'owner' && m.buildingId === (user as any).buildingId && new Date(m.createdAt).getTime() > lastSeen).length;
      if (newCount > 0) {
        toast({
          title: 'New announcements',
          description: `${newCount} new message${newCount > 1 ? 's' : ''} from management.`,
        });
      }
    } catch (_) {
      // ignore
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user || user.role !== 'resident' || !building) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}! 👋</h1>
              <p className="text-gray-600 mt-2">
                You're living at <span className="font-medium">{building.name}</span> in {building.city}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/resident/qr-scanner">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Scan QR Codes</h3>
                <p className="text-sm text-gray-600">Access building, payments, services</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/resident/payment">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <CreditCard className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Pay Maintenance</h3>
                <p className="text-sm text-gray-600">View and pay your bills</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/resident/messages">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Messages</h3>
                <p className="text-sm text-gray-600">Communicate with management</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/resident/services">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Services</h3>
                <p className="text-sm text-gray-600">Request maintenance & services</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Building Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Building Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Building Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Building Name</p>
                    <p className="font-medium">{building.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Floors</p>
                    <p className="font-medium">{building.totalFloors}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{building.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-medium">{building.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">State</p>
                    <p className="font-medium">{building.state}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Link href="/resident/building-info">
                    <Button variant="outline" className="w-full">
                      <MapPin className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Messages
                </CardTitle>
                <CardDescription>
                  Latest communications from building management
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentMessages.length > 0 ? (
                  <div className="space-y-4">
                    {recentMessages.map((message) => (
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
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent messages</p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <Link href="/resident/messages">
                    <Button variant="outline" className="w-full">
                      View All Messages
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingPayments.length > 0 ? (
                  <div className="space-y-3">
                    {pendingPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{payment.type}</p>
                          <p className="text-xs text-gray-600">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatINR(payment.amount)}</p>
                          <Badge variant="destructive">Pending</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-green-600">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">All payments up to date!</p>
                  </div>
                )}
                
                <Link href="/resident/payment">
                  <Button className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Payments
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/resident/qr-scanner">
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    QR Code Scanner
                  </Button>
                </Link>
                
                <Link href="/resident/services">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Request Service
                  </Button>
                </Link>
                
                <Link href="/resident/maintenance">
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="h-4 w-4 mr-2" />
                    Maintenance Request
                  </Button>
                </Link>
                
                <Link href="/resident/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Building Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Building Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Residents</span>
                  <span className="font-medium">{
                    (() => {
                      const storedResidentsRaw = typeof window !== 'undefined' ? localStorage.getItem('buildingHubResidents') : null;
                      const residents = storedResidentsRaw ? JSON.parse(storedResidentsRaw) : mockResidents;
                      return (residents || []).filter((r: any) => r.buildingId === building.id).length;
                    })()
                  }</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Building Age</span>
                  <span className="font-medium">{new Date().getFullYear() - (building.yearBuilt || 2020)} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Maintenance Status</span>
                  <Badge variant="default">Good</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

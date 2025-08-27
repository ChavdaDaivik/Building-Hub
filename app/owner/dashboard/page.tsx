
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, MessageSquare, Settings, Plus, QrCode, DollarSign } from 'lucide-react';
import { mockBuildings, mockResidents, mockServices, mockMessages } from '@/lib/data';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import QRCode from 'react-qr-code';
import { useToast } from '@/hooks/use-toast';

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalResidents: 0,
    totalServices: 0,
    unreadMessages: 0,
  });

  const [paymentsByBuilding, setPaymentsByBuilding] = useState<Record<string, { upiId?: string; qrUrl?: string }>>({});
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editBuildingId, setEditBuildingId] = useState<string>('');
  const [editUpiId, setEditUpiId] = useState('');
  const [editQrUrl, setEditQrUrl] = useState('');
  const [previewQrForBuildingId, setPreviewQrForBuildingId] = useState<string>('');

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      router.push('/login');
      return;
    }

    const refresh = () => {
      // Load residents from storage (fallback to mock) and filter to owner's buildings
      const storedResidentsRaw = localStorage.getItem('buildingHubResidents');
      const allResidents = storedResidentsRaw ? JSON.parse(storedResidentsRaw) : mockResidents;
      const allowedIds = Array.isArray(user.entityIds) ? user.entityIds : [];
      const residents = allResidents.filter((r: any) => allowedIds.includes(r.buildingId));

      // Load payments mapping
      const storedPaymentsRaw = localStorage.getItem('buildingHubPayments');
      const payments = storedPaymentsRaw ? JSON.parse(storedPaymentsRaw) : {};
      setPaymentsByBuilding(payments);

      // Load services from storage (fallback to mock) and filter to owner's buildings
      const storedServicesRaw = localStorage.getItem('buildingHubServices');
      const allServices = storedServicesRaw ? JSON.parse(storedServicesRaw) : mockServices;
      const services = allServices.filter((s: any) => allowedIds.includes(s.buildingId));

      // Load buildings from storage (merge with mock) and filter to owner's buildings
      const storedBuildingsRaw = localStorage.getItem('buildingHubBuildings');
      const storedBuildings = storedBuildingsRaw ? JSON.parse(storedBuildingsRaw) : [];
      const mergedBuildings = [...mockBuildings, ...storedBuildings].filter(b => allowedIds.includes(b.id));

      // Calculate stats for only the owner's scope
      setStats({
        totalBuildings: mergedBuildings.length,
        totalResidents: residents.length,
        totalServices: services.length,
        unreadMessages: mockMessages.filter(m => allowedIds.includes(m.buildingId)).length,
      });
    };

    // Initial load
    refresh();

    // Auto-refresh on storage changes (from other tabs or programmatic updates)
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'buildingHubResidents' || e.key === 'buildingHubServices' || e.key === 'buildingHubBuildings' || e.key === 'buildingHubPayments') {
        refresh();
      }
    };
    window.addEventListener('storage', onStorage);

    // Refresh when window regains focus
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);

    // Light polling to catch same-tab localStorage updates
    const interval = window.setInterval(refresh, 2000);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      window.clearInterval(interval);
    };
  }, [user, router]);

  // Notify owner about new resident messages since last seen
  useEffect(() => {
    if (!user || user.role !== 'owner') return;
    try {
      const stored = localStorage.getItem('buildingHubMessages');
      const all = stored ? JSON.parse(stored) : [];
      const lastSeenKey = `buildingHubLastSeenMessages_${user.id}`;
      const lastSeenRaw = localStorage.getItem(lastSeenKey);
      const lastSeen = lastSeenRaw ? new Date(lastSeenRaw).getTime() : 0;
      const buildingIds: string[] = Array.isArray((user as any).entityIds) ? (user as any).entityIds : [];
      const newCount = all.filter((m: any) => m.senderRole === 'resident' && buildingIds.includes(m.buildingId) && new Date(m.createdAt).getTime() > lastSeen).length;
      if (newCount > 0) {
        toast({
          title: 'New resident messages',
          description: `${newCount} new message${newCount > 1 ? 's' : ''} from residents. Check Messages.`,
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

  if (!user || user.role !== 'owner') {
    return null;
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBuildings}</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResidents}</div>
              <p className="text-xs text-muted-foreground">
                +5 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/owner/add">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium">Add Building</h3>
                  <p className="text-sm text-gray-600">Create new building</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/owner/residents">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium">Manage Residents</h3>
                  <p className="text-sm text-gray-600">Add/edit residents</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/owner/services">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium">Manage Services</h3>
                  <p className="text-sm text-gray-600">Configure services</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/owner/messages">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-medium">Messages</h3>
                  <p className="text-sm text-gray-600">View communications</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/owner/qr-codes">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <QrCode className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <h3 className="font-medium">QR Codes</h3>
                  <p className="text-sm text-gray-600">Manage QR codes</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Messages
              </CardTitle>
              <CardDescription>
                Latest communications from residents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMessages.slice(0, 3).map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{message.senderName}</p>
                      <p className="text-sm text-gray-600">{message.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/owner/messages">
                  <Button variant="outline" className="w-full">
                    View All Messages
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                QR codes and payment options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBuildings.map((building) => {
                  const pm = paymentsByBuilding[building.id] || {};
                  const hasQr = !!pm.qrUrl || !!pm.upiId;
                  return (
                    <div key={building.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{building.name}</h4>
                        <p className="text-sm text-gray-600">Maintenance Payment</p>
                        {pm.upiId && (
                          <p className="text-xs text-gray-500">UPI: {pm.upiId}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {hasQr && (
                          <Button size="sm" variant="outline" onClick={() => setPreviewQrForBuildingId(building.id)}>
                            <QrCode className="h-4 w-4 mr-1" />
                            QR Code
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditBuildingId(building.id);
                            setEditUpiId(pm.upiId || '');
                            setEditQrUrl(pm.qrUrl || '');
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Building List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Buildings</h2>
            <Link href="/owner/buildings">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBuildings.map((building) => (
              <Card key={building.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {building.name}
                    <Badge variant="secondary">Active</Badge>
                  </CardTitle>
                  <CardDescription>{building.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Floors:</span>
                      <span>{building.totalFloors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span>{building.city}, {building.state}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Link href={`/owner/building/${building.id}`}>
                      <Button size="sm" className="flex-1">
                        Manage
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Edit Payment Method Dialog */}
    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Payment Method</DialogTitle>
          <DialogDescription>Set UPI ID and/or QR image URL for this building.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">UPI ID</label>
            <Input value={editUpiId} onChange={(e) => setEditUpiId(e.target.value)} placeholder="name@bank" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">QR Image URL</label>
            <Input value={editQrUrl} onChange={(e) => setEditQrUrl(e.target.value)} placeholder="https://.../qr.png" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const updated = { ...paymentsByBuilding, [editBuildingId]: { upiId: editUpiId || undefined, qrUrl: editQrUrl || undefined } };
              setPaymentsByBuilding(updated);
              localStorage.setItem('buildingHubPayments', JSON.stringify(updated));
              setIsPaymentDialogOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* QR Preview Dialog */}
    <Dialog open={!!previewQrForBuildingId} onOpenChange={(open) => !open && setPreviewQrForBuildingId('')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment QR Code</DialogTitle>
          <DialogDescription>Scan to pay maintenance.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {(() => {
            const pm = paymentsByBuilding[previewQrForBuildingId] || {};
            const upiLink = pm.upiId ? `upi://pay?pa=${encodeURIComponent(pm.upiId)}&pn=Building%20Maintenance` : '';
            if (pm.qrUrl) {
              return <img src={pm.qrUrl} alt="Payment QR" className="w-48 h-48 object-contain" />;
            }
            if (upiLink) {
              return <QRCode value={upiLink} size={192} />;
            }
            return <p className="text-sm text-gray-600">No QR configured.</p>;
          })()}
        </div>
        <DialogFooter>
          <Button onClick={() => setPreviewQrForBuildingId('')}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

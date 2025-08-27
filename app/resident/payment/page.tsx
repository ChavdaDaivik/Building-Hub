'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, QrCode, CreditCard, DollarSign, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { mockBuildings, mockResidents, mockPayments } from '@/lib/data';
import { QRCodeDisplay } from '@/components/ui/qr-code';
import { useToast } from '@/hooks/use-toast';
import { formatINR } from '@/lib/utils';

export default function ResidentPayment() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      router.push('/login');
      return;
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user || user.role !== 'resident') {
    return null;
  }

  // Resolve resident and building from merged data
  const storedResidentsRaw = typeof window !== 'undefined' ? localStorage.getItem('buildingHubResidents') : null;
  const residents = storedResidentsRaw ? JSON.parse(storedResidentsRaw) : mockResidents;
  const resident = (residents || []).find((r: any) => r.id === user.id);

  const storedBuildingsRaw = typeof window !== 'undefined' ? localStorage.getItem('buildingHubBuildings') : null;
  const storedBuildings = storedBuildingsRaw ? JSON.parse(storedBuildingsRaw) : [];
  const building = [...mockBuildings, ...storedBuildings].find(b => b.id === user.buildingId);

  // Monthly payment store
  const ym = new Date();
  const monthKey = `${ym.getFullYear()}-${String(ym.getMonth() + 1).padStart(2, '0')}`;
  const storeKey = 'buildingHubMonthlyPayments';
  const storedMonthlyRaw = typeof window !== 'undefined' ? localStorage.getItem(storeKey) : null;
  const monthly: any[] = storedMonthlyRaw ? JSON.parse(storedMonthlyRaw) : [];
  const myHistory = monthly.filter(p => p.residentId === user.id).sort((a, b) => (a.month < b.month ? 1 : -1));
  const current = monthly.find(p => p.residentId === user.id && p.month === monthKey);
  const isPaidThisMonth = !!current && current.status === 'completed';
  const amountDue = resident?.maintenanceAmount || 0;

  const pendingPayments = isPaidThisMonth ? [] : [{
    id: `maint_${user.id}_${monthKey}`,
    residentId: user.id,
    description: `Monthly Maintenance - ${monthKey}`,
    type: 'maintenance',
    amount: amountDue,
    status: 'pending',
    dueDate: new Date().toISOString(),
  }];
  const completedPayments = isPaidThisMonth ? [{
    id: `maint_${user.id}_${monthKey}`,
    residentId: user.id,
    description: `Monthly Maintenance - ${monthKey}`,
    type: 'maintenance',
    amount: amountDue,
    status: 'completed',
    paymentDate: current?.paidAt || new Date().toISOString(),
  }] : [];

  const handlePayment = (payment: any) => {
    setSelectedPayment(payment);
    setActiveTab('pay');
  };

  const markPaid = (method: 'cash' | 'online') => {
    try {
      const raw = localStorage.getItem(storeKey);
      const items: any[] = raw ? JSON.parse(raw) : [];
      const idx = items.findIndex(p => p.residentId === user.id && p.month === monthKey);
      const record = {
        residentId: user.id,
        buildingId: user.buildingId,
        month: monthKey,
        amount: amountDue,
        method,
        status: 'completed',
        paidAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        items[idx] = record;
      } else {
        items.push(record);
      }
      localStorage.setItem(storeKey, JSON.stringify(items));
      toast({ title: 'Payment Recorded', description: `${method === 'cash' ? 'Cash' : 'Online'} payment for ${monthKey}.` });
      setSelectedPayment(null);
      setActiveTab('overview');
    } catch (_) {
      toast({ title: 'Error', description: 'Failed to record payment.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Center</h1>
              <p className="text-gray-600">Manage your maintenance and utility payments</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Payment Overview</TabsTrigger>
            <TabsTrigger value="pay">Make Payment</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Due</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatINR(pendingPayments.reduce((sum, p) => sum + p.amount, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pendingPayments.length} pending payments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatINR(resident?.maintenanceAmount || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maintenance fee
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatINR(completedPayments.reduce((sum, p) => sum + p.amount, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {completedPayments.length} completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pending Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Payments that need your attention</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingPayments.length > 0 ? (
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{payment.description}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                            <span>Type: {payment.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-xl font-bold text-red-600">
                              {formatINR(payment.amount)}
                            </div>
                            <Badge variant="destructive">Due</Badge>
                          </div>
                          <Button onClick={() => handlePayment(payment)}>
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No pending payments at this time.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Building Payment QR */}
            {building && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Building Payment QR Code
                  </CardTitle>
                  <CardDescription>
                    Scan this QR code to pay maintenance fees for {building.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-4">
                        This QR code contains your building and unit information for quick payment processing.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Building:</span>
                          <span className="font-medium">{building.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Unit:</span>
                          <span className="font-medium">{resident?.unitNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Fee:</span>
                          <span className="font-medium">{formatINR(resident?.maintenanceAmount || 0)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6">
                      <QRCodeDisplay
                        data={`PAYMENT:${building.id}:${building.name}:MAINTENANCE:${resident?.maintenanceAmount}:${resident?.name}:${resident?.unitNumber}`}
                        title="Payment QR"
                        description="Scan to pay"
                        size={150}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pay" className="space-y-6">
            {selectedPayment ? (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Payment</CardTitle>
                  <CardDescription>Review and confirm your payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Description:</span>
                        <span>{selectedPayment.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-bold text-lg">{formatINR(selectedPayment.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{selectedPayment.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Due Date:</span>
                        <span>{new Date(selectedPayment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Mark Payment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button className="h-20 flex-col" onClick={() => markPaid('online')}>
                        <CreditCard className="h-6 w-6 mb-2" />
                        Pay Online
                      </Button>
                      <Button variant="outline" className="h-20 flex-col" onClick={() => markPaid('cash')}>
                        <DollarSign className="h-6 w-6 mb-2" />
                        Mark as Cash
                      </Button>
                    </div>
                  </div>
                  <div className="flex">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedPayment(null)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Payment</h3>
                <p className="text-gray-600">Choose a payment from the overview tab to proceed.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your completed and failed payments</CardDescription>
              </CardHeader>
              <CardContent>
                {myHistory.length > 0 ? (
                  <div className="space-y-4">
                    {myHistory.map((payment) => (
                      <div key={`${payment.residentId}_${payment.month}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">Monthly Maintenance - {payment.month}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>Paid: {new Date(payment.paidAt).toLocaleDateString()}</span>
                            <span>Method: {payment.method}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{formatINR(payment.amount)}</div>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                    <p className="text-gray-600">Your payment history will appear here once you make payments.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

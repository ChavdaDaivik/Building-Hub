
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Users, Plus, Search, Edit, Trash2, Mail, Phone, DollarSign } from 'lucide-react';
import { mockBuildings, mockResidents } from '@/lib/data';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Resident = typeof mockResidents[number];

export default function ResidentsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [residents, setResidents] = useState<any[]>([]);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    work: '',
    unitNumber: '',
    buildingId: '',
    maintenanceAmount: ''
  });

  // Monthly payment store helpers
  const ym = new Date();
  const monthKey = `${ym.getFullYear()}-${String(ym.getMonth() + 1).padStart(2, '0')}`;
  const paymentStoreKey = 'buildingHubMonthlyPayments';
  const readMonthly = (): any[] => {
    try { return JSON.parse(localStorage.getItem(paymentStoreKey) || '[]'); } catch { return []; }
  };
  const isPaidThisMonth = (residentId: string) => {
    const items = readMonthly();
    const rec = items.find(p => p.residentId === residentId && p.month === monthKey);
    return !!rec && rec.status === 'completed';
  };
  const setPaidThisMonth = (residentId: string, buildingId: string, amount: number, method: 'cash' | 'online') => {
    const items = readMonthly();
    const idx = items.findIndex(p => p.residentId === residentId && p.month === monthKey);
    const record = { residentId, buildingId, month: monthKey, amount, method, status: 'completed', paidAt: new Date().toISOString() };
    if (idx >= 0) items[idx] = record; else items.push(record);
    localStorage.setItem(paymentStoreKey, JSON.stringify(items));
    toast({ title: 'Marked Paid', description: `${method === 'cash' ? 'Cash' : 'Online'} for ${monthKey}.` });
    // trigger re-render
    setResidents(prev => [...prev]);
  };
  const unsetPaidThisMonth = (residentId: string) => {
    const items = readMonthly().filter(p => !(p.residentId === residentId && p.month === monthKey));
    localStorage.setItem(paymentStoreKey, JSON.stringify(items));
    toast({ title: 'Marked Unpaid', description: `Removed payment for ${monthKey}.` });
    setResidents(prev => [...prev]);
  };

  useEffect(() => {
    // Load residents and filter to owner's buildings
    const storedResidents = localStorage.getItem('buildingHubResidents');
    const allResidents = storedResidents ? JSON.parse(storedResidents) : mockResidents;
    const allowedIds = Array.isArray(user?.entityIds) ? user?.entityIds : [];
    setResidents(allResidents.filter((r: any) => allowedIds.includes(r.buildingId)));
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

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBuilding = selectedBuilding === 'all' || resident.buildingId === selectedBuilding;
    
    return matchesSearch && matchesBuilding;
  });

  const getBuildingName = (buildingId: string) => {
    const storedBuildingsRaw = localStorage.getItem('buildingHubBuildings');
    const storedBuildings = storedBuildingsRaw ? JSON.parse(storedBuildingsRaw) : [];
    const merged = [...mockBuildings, ...storedBuildings];
    const building = merged.find(b => b.id === buildingId);
    return building?.name || 'Unknown Building';
  };

  const handleDeleteResident = (residentId: string) => {
    if (confirm('Are you sure you want to delete this resident?')) {
      setResidents(residents.filter(r => r.id !== residentId));
      // persist
      const stored = JSON.parse(localStorage.getItem('buildingHubResidents') || '[]');
      const updated = stored.filter((r: any) => r.id !== residentId);
      localStorage.setItem('buildingHubResidents', JSON.stringify(updated));
      toast({
        title: "Resident Deleted",
        description: "Resident has been removed successfully.",
      });
    }
  };

  const openEdit = (resident: Resident) => {
    setEditingResident(resident);
    setEditForm({
      name: resident.name,
      email: resident.email,
      phone: resident.phone,
      work: resident.work || '',
      unitNumber: resident.unitNumber,
      buildingId: resident.buildingId,
      maintenanceAmount: String(resident.maintenanceAmount || '')
    });
  };

  const saveEdit = () => {
    if (!editingResident) return;
    const updated = residents.map(r =>
      r.id === editingResident.id
        ? {
            ...r,
            ...editForm,
            maintenanceAmount: parseFloat(editForm.maintenanceAmount) || 0
          }
        : r
    );
    setResidents(updated);
    localStorage.setItem('buildingHubResidents', JSON.stringify(updated));
    setEditingResident(null);
    toast({ title: 'Resident Updated', description: 'Changes saved.' });
  };

  const handleExportExcel = () => {
    try {
      const rows = residents.map((r) => ({
        ID: r.id,
        Name: r.name,
        Email: r.email,
        Phone: r.phone,
        Work: r.work,
        Unit: r.unitNumber,
        Building: getBuildingName(r.buildingId),
        MaintenanceAmount: r.maintenanceAmount,
        MaintenancePaid: !!r.maintenancePaid,
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Residents');
      XLSX.writeFile(workbook, 'residents.xlsx');
      toast({ title: 'Exported', description: 'Residents exported to residents.xlsx' });
    } catch (err) {
      toast({ title: 'Export failed', description: 'Could not export Excel file', variant: 'destructive' });
    }
  };

  const getMaintenanceStatus = (resident: any) => {
    return isPaidThisMonth(resident.id)
      ? { status: 'Paid', variant: 'default' as const }
      : { status: 'Pending', variant: 'destructive' as const };
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
              <h1 className="text-2xl font-bold text-gray-900">Residents Management</h1>
              <p className="text-gray-600">Manage all residents across your buildings</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/owner/add-resident">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resident
                </Button>
              </Link>
              <Button variant="outline" onClick={handleExportExcel}>
                Export to Excel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const storedResidents = localStorage.getItem('buildingHubResidents');
                  if (storedResidents) {
                    setResidents(JSON.parse(storedResidents));
                  }
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
              <Label htmlFor="search">Search Residents</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or unit..."
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
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{residents.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all buildings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Buildings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.from(new Set(residents.map(r => r.buildingId))).length}</div>
              <p className="text-xs text-muted-foreground">
                With residents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Maintenance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {residents.filter(r => isPaidThisMonth(r.id)).length}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {residents.filter(r => !isPaidThisMonth(r.id)).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Residents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResidents.map((resident) => {
            const maintenanceStatus = getMaintenanceStatus(resident);
            return (
              <Card key={resident.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg">
                        {resident.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{resident.name}</CardTitle>
                      <CardDescription>Unit {resident.unitNumber}</CardDescription>
                    </div>
                    <Badge variant={maintenanceStatus.variant}>
                      {maintenanceStatus.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{resident.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{resident.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{getBuildingName(resident.buildingId)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>{formatINR(resident.maintenanceAmount)}/month</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Work:</span>
                      <span className="font-medium">{resident.work}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1" onClick={() => openEdit(resident)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {isPaidThisMonth(resident.id) ? (
                      <Button size="sm" variant="outline" onClick={() => unsetPaidThisMonth(resident.id)}>
                        Mark Unpaid
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setPaidThisMonth(resident.id, resident.buildingId, resident.maintenanceAmount, 'online')}>
                          Mark Paid (Online)
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setPaidThisMonth(resident.id, resident.buildingId, resident.maintenanceAmount, 'cash')}>
                          Mark Paid (Cash)
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteResident(resident.id)}
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

        {filteredResidents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No residents found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedBuilding !== 'all' 
                ? 'Try adjusting your search terms or building filter.' 
                : 'Get started by adding your first resident.'}
            </p>
            {!searchTerm && selectedBuilding === 'all' && (
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Resident
              </Button>
            )}
          </div>
        )}
        
        {/* Edit Resident Dialog */}
        <Dialog open={!!editingResident} onOpenChange={(open) => !open && setEditingResident(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Resident</DialogTitle>
              <DialogDescription>Update resident information and save changes.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Full Name</Label>
                <Input id="edit_name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input id="edit_email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone</Label>
                <Input id="edit_phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_work">Work/Company</Label>
                <Input id="edit_work" value={editForm.work} onChange={(e) => setEditForm({ ...editForm, work: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_unit">Unit Number</Label>
                <Input id="edit_unit" value={editForm.unitNumber} onChange={(e) => setEditForm({ ...editForm, unitNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_building">Building</Label>
                <select
                  id="edit_building"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.buildingId}
                  onChange={(e) => setEditForm({ ...editForm, buildingId: e.target.value })}
                >
                  {mockBuildings.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_amount">Monthly Maintenance</Label>
                <Input id="edit_amount" type="number" value={editForm.maintenanceAmount} onChange={(e) => setEditForm({ ...editForm, maintenanceAmount: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setEditingResident(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
 
{/* Edit Resident Dialog */}
{/* Placed at end of component render */}

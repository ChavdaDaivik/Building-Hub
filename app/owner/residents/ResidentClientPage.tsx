
'use client';
import { useState, useEffect } from 'react';
import type { Resident, User, Building } from '@/lib/data';
import { users as userStore, buildings as buildingStore, updateUserStore, updateBuildingsStore } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Download, CheckCircle2, XCircle, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ResidentClientPage({ initialResidents }: { initialResidents: Resident[] }) {
  const { user } = useAuth();
  const [residents, setResidents] = useState<Resident[]>(initialResidents);
  const [users, setUsers] = useState<User[]>(userStore);
  const [buildings, setBuildings] = useState<Building[]>(buildingStore);

  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{username: string, password: string} | null>(null);
  const { toast } = useToast();
  
  // Resync state if initialResidents prop changes (e.g., building switch)
  useEffect(() => {
      setResidents(initialResidents);
  }, [initialResidents]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Name,Apartment,Phone,Email,MaintenancePaid\n"
      + residents.map(r => `${r.id},${r.name},${r.apartment},${r.phone},${r.email},${r.maintenancePaid}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "residents.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Resident data has been exported as a CSV file.",
    });
  };

  const handleSaveResident = (residentData: Omit<Resident, 'id' | 'buildingId'> & { id?: string }) => {
    if (!user?.buildingId) return;

    let updatedBuildings;
    if (selectedResident) {
      // Edit existing resident
      updatedBuildings = buildings.map(b => {
          if (b.id === user.buildingId) {
              const updatedResidents = b.residents.map(r => {
                  if (r.id === residentData.id) {
                    const updated: Resident = { ...r, ...residentData } as Resident;
                    return updated;
                  }
                  return r;
              });
              return { ...b, residents: updatedResidents };
          }
          return b;
      });
      toast({ title: "Success", description: "Resident information updated." });
    } else {
      // Add new resident
      const newId = `res-${Math.random().toString(36).substr(2, 9)}`;
      const newResident: Resident = { ...residentData, id: newId, buildingId: user.buildingId } as Resident;
      
      const baseUsername = newResident.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const username = `${baseUsername}${Math.floor(Math.random() * 900) + 100}`;
      const password = `${baseUsername}@123`;
      
      const newUser: User = { id: newId, username, password, role: 'resident', entityIds: [newId] };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      updateUserStore(updatedUsers);

      updatedBuildings = buildings.map(b => {
          if (b.id === user.buildingId) {
              return { ...b, residents: [newResident, ...b.residents] };
          }
          return b;
      });

      setNewCredentials({ username, password });
      toast({ title: "Success", description: "New resident has been added." });
    }
    
    setBuildings(updatedBuildings);
    updateBuildingsStore(updatedBuildings);
    setResidents(updatedBuildings.find(b => b.id === user.buildingId)?.residents || []);
    setIsDialogOpen(false);
    setSelectedResident(null);
  };
  
  const handleDeleteResident = (residentId: string) => {
      if (!user?.buildingId) return;

      const updatedBuildings = buildings.map(b => {
          if (b.id === user.buildingId) {
              return { ...b, residents: b.residents.filter(r => r.id !== residentId) };
          }
          return b;
      });
      
      const updatedUsers = users.filter(u => u.id !== residentId);
      setUsers(updatedUsers);
      updateUserStore(updatedUsers);

      setBuildings(updatedBuildings);
      updateBuildingsStore(updatedBuildings);
      setResidents(updatedBuildings.find(b => b.id === user.buildingId)?.residents || []);
      toast({ title: "Success", variant: "destructive", description: "Resident has been deleted." });
  };

  return (
    <>
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>All Residents</CardTitle>
                <CardDescription>A list of all residents in the building.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setSelectedResident(null); setIsDialogOpen(open);}}>
                    <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setSelectedResident(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Resident
                    </Button>
                    </DialogTrigger>
                    <ResidentFormDialog 
                    resident={selectedResident} 
                    onSave={handleSaveResident} 
                    onClose={() => setIsDialogOpen(false)}
                    />
                </Dialog>
                <Button size="sm" variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Apartment</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Maintenance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {residents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell className="font-medium">{resident.name}</TableCell>
                <TableCell>{resident.apartment}</TableCell>
                <TableCell>{resident.phone}</TableCell>
                <TableCell>
                  {resident.maintenancePaid ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                      <XCircle className="mr-1 h-3 w-3" /> Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedResident(resident); setIsDialogOpen(true); }}>Edit</Button>
                        <AlertDialog>
                             <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                     <Trash className="h-4 w-4" />
                                     <span className="sr-only">Delete</span>
                                 </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the resident's data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteResident(resident.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    {newCredentials && (
         <AlertDialog open={!!newCredentials} onOpenChange={() => setNewCredentials(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Resident Added Successfully!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please save the following credentials for the new resident. They will need them to log in.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4 text-sm bg-muted p-4 rounded-md">
                    <p><strong>Username:</strong> {newCredentials.username}</p>
                    <p><strong>Password:</strong> {newCredentials.password}</p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setNewCredentials(null)}>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </>
  );
}

function ResidentFormDialog({ resident, onSave, onClose }: { resident: Resident | null, onSave: (data: Omit<Resident, 'id' | 'buildingId'> & { id?: string }) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: resident?.name || '',
    apartment: resident?.apartment || '',
    phone: resident?.phone || '',
    email: resident?.email || '',
    maintenancePaid: resident?.maintenancePaid || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: resident?.id });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({...prev, [id]: value }));
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{resident ? 'Edit Resident' : 'Add New Resident'}</DialogTitle>
        <DialogDescription>
          {resident ? "Update the resident's information." : "Fill in the details for the new resident."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} id="resident-form" className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apartment">Apartment</Label>
          <Input id="apartment" value={formData.apartment} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={formData.phone} onChange={handleChange} required/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={handleChange} required/>
        </div>
        <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="maintenancePaid" checked={formData.maintenancePaid} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, maintenancePaid: !!checked }))} />
            <Label htmlFor="maintenancePaid">Maintenance Paid</Label>
        </div>
      </form>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" form="resident-form">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  )
}

    
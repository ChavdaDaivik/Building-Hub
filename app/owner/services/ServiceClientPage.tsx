
'use client';
import { useState, useEffect } from 'react';
import type { Service, Building } from '@/lib/data';
import { buildings as buildingsStore, updateBuildingsStore } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ServiceClientPage({ initialServices, isOwner }: { initialServices: Service[], isOwner: boolean }) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [buildings, setBuildings] = useState<Building[]>(buildingsStore);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const handleSaveService = (serviceData: Omit<Service, 'id'> & { id?: string }) => {
    if (!user?.buildingId) return;

    let updatedBuildings;
    if (selectedService) {
      // Edit
      updatedBuildings = buildings.map(b => {
          if (b.id === user.buildingId) {
              const updatedServices = b.services.map(s => s.id === serviceData.id ? { ...s, ...serviceData } : s);
              return { ...b, services: updatedServices };
          }
          return b;
      });
      toast({ title: "Success", description: "Service information updated." });
    } else {
      // Add
      const newService = { ...serviceData, id: `srv-${Math.random().toString(36).substr(2, 5)}`};
      updatedBuildings = buildings.map(b => {
          if (b.id === user.buildingId) {
              return { ...b, services: [newService, ...b.services] };
          }
          return b;
      });
      toast({ title: "Success", description: "New service has been added." });
    }
    setBuildings(updatedBuildings);
    updateBuildingsStore(updatedBuildings);
    setServices(updatedBuildings.find(b => b.id === user.buildingId)?.services || []);
    setIsDialogOpen(false);
    setSelectedService(null);
  };
  
  const handleDeleteService = (serviceId: string) => {
    if (!user?.buildingId) return;

    const updatedBuildings = buildings.map(b => {
        if (b.id === user.buildingId) {
            return { ...b, services: b.services.filter(s => s.id !== serviceId) };
        }
        return b;
    });

    setBuildings(updatedBuildings);
    updateBuildingsStore(updatedBuildings);
    setServices(updatedBuildings.find(b => b.id === user.buildingId)?.services || []);
    toast({ title: "Success", variant: "destructive", description: "Service has been deleted." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Providers</CardTitle>
        <CardDescription>A list of approved service providers for the building.</CardDescription>
        {isOwner && (
          <div className="flex items-center gap-2 pt-2">
            <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setSelectedService(null); setIsDialogOpen(open);}}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setSelectedService(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <ServiceFormDialog 
                service={selectedService} 
                onSave={handleSaveService} 
                onClose={() => setIsDialogOpen(false)}
              />
            </Dialog>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              {isOwner && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.type}</TableCell>
                <TableCell>{service.contact}</TableCell>
                {isOwner && (
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedService(service); setIsDialogOpen(true); }}>
                            Edit
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete this service provider.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteService(service.id)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                     </AlertDialog>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ServiceFormDialog({ service, onSave, onClose }: { service: Service | null, onSave: (data: Omit<Service, 'id'> & { id?: string }) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    contact: service?.contact || '',
    type: service?.type || 'Other',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: service?.id });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({...prev, [id]: value }));
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <DialogDescription>{service ? "Update service details." : "Fill in the details for the new service."}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} id="service-form" className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contact</Label>
          <Input id="contact" value={formData.contact} onChange={handleChange} required/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Service['type'] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Plumbing">Plumbing</SelectItem>
              <SelectItem value="Electrician">Electrician</SelectItem>
              <SelectItem value="Cleaning">Cleaning</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button></DialogClose>
        <Button type="submit" form="service-form">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  )
}


'use client';

import { useState, useEffect } from 'react';
import type { Building } from '@/lib/data';
import { buildings as buildingsStore, updateBuildingsStore } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function BuildingClientPage({ initialInfo, isOwner }: { initialInfo: Building, isOwner: boolean }) {
  const [info, setInfo] = useState<Building>(initialInfo);
  const [buildings, setBuildings] = useState(buildingsStore);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setInfo(initialInfo);
  }, [initialInfo]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.buildingId) return;

    const updatedBuildings = buildings.map(b => b.id === user.buildingId ? info : b);
    setBuildings(updatedBuildings);
    updateBuildingsStore(updatedBuildings);
    
    toast({
      title: "Success!",
      description: "Building information has been updated.",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setInfo(prev => ({
      ...prev,
      [id]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <form onSubmit={handleSave}>
      <Card>
        <CardHeader>
          <CardTitle>Building Details</CardTitle>
          <CardDescription>
            {isOwner ? "Edit the general information about the building." : "General information about the building."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Building Name</Label>
            <Input id="name" value={info.name} onChange={handleChange} readOnly={!isOwner} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={info.address} onChange={handleChange} readOnly={!isOwner} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floors">Number of Floors</Label>
              <Input id="floors" type="number" value={info.floors} onChange={handleChange} readOnly={!isOwner} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input id="yearBuilt" type="number" value={info.yearBuilt} onChange={handleChange} readOnly={!isOwner} />
            </div>
          </div>
        </CardContent>
        {isOwner && (
          <CardFooter>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        )}
      </Card>
    </form>
  );
}

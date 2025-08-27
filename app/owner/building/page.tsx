
'use client';
import BuildingClientPage from './BuildingClientPage';
import { useAuth } from '@/hooks/useAuth';
import { buildings } from '@/lib/data';

export default function BuildingPage() {
  const { user } = useAuth();
  
  if (!user || !user.buildingId) {
    return null;
  }
  
  const building = buildings.find(b => b.id === user.buildingId);

  if (!building) {
      return <div>Building not found.</div>
  }

  return (
     <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Building Information</h1>
      <BuildingClientPage initialInfo={building} isOwner={true} />
    </div>
  );
}

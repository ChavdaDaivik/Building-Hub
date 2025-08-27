'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Building } from 'lucide-react';
import OwnerNavigation from '@/components/dashboard/OwnerNavigation';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'owner')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Building Hub</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return null;
  }

  return (
    <>
      <OwnerNavigation />
      {children}
    </>
  );
}

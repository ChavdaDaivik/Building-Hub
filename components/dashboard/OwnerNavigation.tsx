'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Building, 
  Plus, 
  Users, 
  Settings, 
  MessageSquare, 
  QrCode,
  UserPlus,
  Wrench
} from 'lucide-react';

export default function OwnerNavigation() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/owner/dashboard', icon: Home },
    { name: 'Buildings', href: '/owner/buildings', icon: Building },
    { name: 'Add Building', href: '/owner/add', icon: Plus },
    { name: 'Residents', href: '/owner/residents', icon: Users },
    { name: 'Add Resident', href: '/owner/add-resident', icon: UserPlus },
    { name: 'Services', href: '/owner/services', icon: Settings },
    { name: 'Add Service', href: '/owner/add-service', icon: Wrench },
    { name: 'Messages', href: '/owner/messages', icon: MessageSquare },
    { name: 'QR Codes', href: '/owner/qr-codes', icon: QrCode },
    { name: 'Settings', href: '/owner/settings', icon: Settings },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/owner/dashboard" className="flex items-center">
          <Building className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-lg font-semibold text-gray-900">Building Hub</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className={cn(
                  'mr-2 h-4 w-4',
                  isActive ? 'text-blue-700' : 'text-gray-400'
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="md:hidden text-sm text-gray-500">Menu</div>
      </div>
    </header>
  );
}

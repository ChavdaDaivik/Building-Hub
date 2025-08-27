
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Loader2, Menu, Building, ChevronDown } from 'lucide-react';
import { AppLogo } from '../AppLogo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Users, Wrench, MessageSquare, LogOut, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildings as allBuildings } from '@/lib/data';


interface ProtectedLayoutProps {
  children: React.ReactNode;
  role: 'owner' | 'resident';
}

const navItems = {
  owner: [
    { href: '/owner/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/owner/residents', icon: Users, label: 'Residents' },
    { href: '/owner/services', icon: Wrench, label: 'Services' },
    { href: '/owner/building', icon: Building, label: 'Building Info' },
    { href: '/owner/messages', icon: MessageSquare, label: 'Messages' },
  ],
  resident: [
    { href: '/resident/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/resident/building', icon: Building,label: 'Building Info' },
    { href: '/resident/services', icon: Wrench, label: 'Nearby Services' },
    { href: '/resident/messages', icon: MessageSquare, label: 'Messages' },
  ],
};

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);

    return (
        <button
            onClick={() => router.push(href)}
            className={cn(
                "relative h-10 px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive && "text-foreground"
            )}
        >
            <span>{children}</span>
            <span
              className={cn(
                "absolute left-2 right-2 -bottom-2 h-[2px] rounded bg-primary/70 opacity-0 transition-all",
                isActive && "opacity-100"
              )}
            />
        </button>
    )
}

const MobileNavLink = ({ href, children, onNavigate }: { href: string, children: React.ReactNode, onNavigate: () => void }) => {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);

    return (
         <Button 
            variant="ghost" 
            onClick={() => { router.push(href); onNavigate(); }}
            className={cn(
                "w-full justify-start",
                isActive && "bg-accent"
            )}
        >
            {children}
        </Button>
    )
}

export default function ProtectedLayout({ children, role }: ProtectedLayoutProps) {
  const { user, loading, logout, switchBuilding, getBuildingName } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // These special pages have their own layout and auth handling
  const specialPages = ['/owner/buildings', '/owner/add'];

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== role) {
        router.replace('/login');
      } else if (role === 'owner' && !user.buildingId && !specialPages.includes(pathname)) {
        router.replace('/owner/buildings');
      }
    }
  }, [user, loading, role, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Do not render the main layout for special pages, as they have their own.
  // The useEffect above still protects them.
  if (specialPages.includes(pathname)) {
      return <>{children}</>;
  }

  // If we are on a standard page but don't have the necessary info, show loading.
  // The useEffect will trigger a redirect.
  if (user.role !== role || (role === 'owner' && !user.buildingId)) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userOwnedBuildings = user.role === 'owner' ? allBuildings.filter(b => (user.entityIds || []).includes(b.id)) : [];
  const currentNavItems = navItems[role] || [];
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex h-16 items-center justify-between">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                    <div className="flex items-center gap-2 h-14 px-2 border-b">
                     <AppLogo />
                    </div>
                    {currentNavItems.map((item) => (
                        <MobileNavLink key={item.label} href={item.href} onNavigate={() => setIsMobileMenuOpen(false)}>
                            <item.icon className="h-5 w-5 mr-4" />
                            {item.label}
                        </MobileNavLink>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>
          <div className="hidden sm:flex items-center gap-2">
            <AppLogo />
          </div>

          <div className="flex items-center gap-2 ml-4">
             {user.role === 'owner' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-full h-9">
                      <Building className="mr-2 h-4 w-4" />
                      {getBuildingName(user.buildingId)}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Switch Building</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userOwnedBuildings.map(b => (
                        <DropdownMenuItem key={b.id} onClick={() => switchBuilding(b.id)}>
                            {b.name}
                        </DropdownMenuItem>
                    ))}
                     <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/owner/add')}>
                         <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Building
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {user.role === 'resident' && (
                 <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {getBuildingName(user.buildingId)}
                </div>
              )}
          </div>
          
          <nav className="hidden sm:flex items-center gap-2 ml-auto">
              {currentNavItems.map((item) => (
                    <NavLink key={item.label} href={item.href}>
                        {item.label}
                    </NavLink>
                ))}
          </nav>
          <div className="flex items-center gap-4 ml-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://placehold.co/40x40.png`} />
                      <AvatarFallback>{user.id.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                     <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
           </div>
         </div>
       </header>
       <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 fade-in-up">
        {children}
      </main>
    </div>
  );
}

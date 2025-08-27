'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, QrCode, MessageSquare, DollarSign, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we have a user and we're not loading
    if (!isLoading && user) {
      if (user.role === 'owner') {
        router.push('/owner/dashboard');
      } else if (user.role === 'resident') {
        router.push('/resident/dashboard');
      }
    }
  }, [user, isLoading, router]);

  // Show loading only briefly while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Building Hub</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Building Hub</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Building className="h-20 w-20 text-blue-600 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Modern Building
              <span className="text-blue-600"> Management</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Streamline your building operations with our comprehensive management platform. 
              From QR code payments to resident communications, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Managing
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Building
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools building owners and managers need to run their properties efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Building Management */}
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Building Management</CardTitle>
                <CardDescription>
                  Manage multiple buildings, floors, and units from a single dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Add and manage buildings
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Track building details
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Monitor occupancy rates
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Resident Management */}
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Resident Management</CardTitle>
                <CardDescription>
                  Keep track of all residents, their details, and payment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Resident profiles
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Payment tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Maintenance history
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* QR Code System */}
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">QR Code System</CardTitle>
                <CardDescription>
                  Generate and manage QR codes for payments, access, and services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Payment QR codes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Building access codes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Service requests
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Communication */}
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Communication</CardTitle>
                <CardDescription>
                  Send messages and announcements to residents and staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Bulk messaging
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Announcements
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Resident notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Payment Management */}
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Payment Management</CardTitle>
                <CardDescription>
                  Track maintenance fees, utility payments, and other charges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Payment tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Due date reminders
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Payment history
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Service Management */}
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Service Management</CardTitle>
                <CardDescription>
                  Manage cleaning, security, and maintenance services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Service providers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Service scheduling
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Quality monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Building Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of building owners who are already using Building Hub to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Get Started Today
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Building className="h-8 w-8 text-blue-400 mr-3" />
                <span className="text-xl font-bold">Building Hub</span>
              </div>
              <p className="text-gray-400">
                Modern building management solution for property owners and managers.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Building Management</li>
                <li>Resident Portal</li>
                <li>QR Code System</li>
                <li>Payment Tracking</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Documentation</li>
                <li>Training</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Building Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

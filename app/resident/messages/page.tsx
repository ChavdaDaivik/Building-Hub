
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ArrowLeft, Building } from 'lucide-react';
import { mockBuildings, mockMessages } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ResidentMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [buildingData, setBuildingData] = useState<any>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      router.push('/login');
      return;
    }

    // Get building data
    const building = mockBuildings.find(b => b.id === user.buildingId);
    setBuildingData(building);
    
    // Load messages from localStorage then fallback to mock
    const storedRaw = localStorage.getItem('buildingHubMessages');
    const all = storedRaw ? JSON.parse(storedRaw) : mockMessages;
    const buildingMessages = all.filter((m: any) => m.buildingId === user.buildingId);
    setMessages(buildingMessages);
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== 'resident') return;
    const lastSeenKey = `buildingHubLastSeenMessages_${user.id}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());
  }, [user]);

  if (!user || user.role !== 'resident' || !buildingData) {
    return null;
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const storedRaw = localStorage.getItem('buildingHubMessages');
    const all = storedRaw ? JSON.parse(storedRaw) : mockMessages;
    const msg = {
      id: `msg_${Date.now()}`,
      content,
      senderId: user.id,
      senderName: user.name,
      senderRole: 'resident',
      buildingId: user.buildingId,
      recipientType: 'owners',
      createdAt: new Date()
    };
    const updatedAll = [msg, ...all];
    localStorage.setItem('buildingHubMessages', JSON.stringify(updatedAll));
    setMessages([msg, ...messages]);
    setContent('');
    setIsComposing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/resident/dashboard" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Building Messages</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsComposing(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>

        {isComposing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Compose Message to Management</CardTitle>
              <CardDescription>Send a message to your building's management</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Type your message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsComposing(false)}>Cancel</Button>
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        {/* Building Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Building className="h-12 w-12 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">{buildingData.name}</h2>
                <p className="text-gray-600">{buildingData.address}</p>
                <p className="text-gray-600">{buildingData.city}, {buildingData.state} {buildingData.zipCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Messages & Announcements
            </CardTitle>
            <CardDescription>
              Important updates and announcements from building management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{message.senderName}</h4>
                        <Badge variant={message.senderRole === 'owner' ? 'default' : 'secondary'}>
                          {message.senderRole === 'owner' ? 'Management' : 'Resident'}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{message.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(message.createdAt)}</span>
                        <span>{formatTime(message.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">Building management will post important updates here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

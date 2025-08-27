
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, Search, Send, Trash2, Building, Calendar } from 'lucide-react';
import { mockBuildings, mockMessages } from '@/lib/data';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function MessagesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [messages, setMessages] = useState<any[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({
    content: '',
    buildingId: '',
    recipientType: 'all' as 'all' | 'residents' | 'owners'
  });

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      router.push('/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    // Load messages from localStorage on mount
    const stored = localStorage.getItem('buildingHubMessages');
    setMessages(stored ? JSON.parse(stored) : mockMessages);
    // Mark messages as seen now
    const lastSeenKey = `buildingHubLastSeenMessages_${user?.id}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuilding === 'all' || message.buildingId === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

  const getBuildingName = (buildingId: string) => {
    const building = mockBuildings.find(b => b.id === buildingId);
    return building?.name || 'All Buildings';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a message content.",
        variant: "destructive",
      });
      return;
    }

    if (!newMessage.buildingId) {
      toast({
        title: "Validation Error",
        description: "Please select a building.",
        variant: "destructive",
      });
      return;
    }

    try {
      const message = {
        id: `msg_${Date.now()}`,
        content: newMessage.content,
        senderId: user.id,
        senderName: user.name,
        senderRole: 'owner',
        buildingId: newMessage.buildingId,
        recipientType: newMessage.recipientType,
        createdAt: new Date(),
      };

      const stored = localStorage.getItem('buildingHubMessages');
      const all = stored ? JSON.parse(stored) : mockMessages;
      const updated = [message, ...all];
      localStorage.setItem('buildingHubMessages', JSON.stringify(updated));
      setMessages(updated);
      setIsComposing(false);
      setNewMessage({
        content: '',
        buildingId: '',
        recipientType: 'all'
      });

      toast({
        title: "Message Sent!",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      const stored = localStorage.getItem('buildingHubMessages');
      const all = stored ? JSON.parse(stored) : mockMessages;
      const updated = all.filter((m: any) => m.id !== messageId);
      localStorage.setItem('buildingHubMessages', JSON.stringify(updated));
      setMessages(updated);
      toast({
        title: "Message Deleted",
        description: "Message has been removed successfully.",
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
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
              <h1 className="text-2xl font-bold text-gray-900">Messages & Communications</h1>
              <p className="text-gray-600">Send messages to residents and manage communications</p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setIsComposing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Message
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
              <Label htmlFor="search">Search Messages</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search message content..."
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
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">
                All communications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {messages.filter(m => {
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return new Date(m.createdAt) > monthAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Recent messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buildings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(messages.map(m => m.buildingId)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                With messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {messages.filter(m => m.senderId === user.id).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Sent by you
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Compose Message */}
        {isComposing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Compose New Message</CardTitle>
              <CardDescription>
                Send a message to residents or other building owners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building">Building *</Label>
                    <select
                      id="building"
                      value={newMessage.buildingId}
                      onChange={(e) => setNewMessage({...newMessage, buildingId: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select a building</option>
                      {mockBuildings.map((building) => (
                        <option key={building.id} value={building.id}>
                          {building.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientType">Recipients</Label>
                    <select
                      id="recipientType"
                      value={newMessage.recipientType}
                      onChange={(e) => setNewMessage({...newMessage, recipientType: e.target.value as any})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="all">All (Residents & Owners)</option>
                      <option value="residents">Residents Only</option>
                      <option value="owners">Owners Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Message Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Type your message here..."
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsComposing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{message.senderName}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{getBuildingName(message.buildingId)}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{formatDate(message.createdAt)}</span>
                    </div>
                    
                    <p className="text-gray-900 mb-3">{message.content}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>From: {message.senderRole}</span>
                      <span>Building: {getBuildingName(message.buildingId)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedBuilding !== 'all' 
                ? 'Try adjusting your search terms or building filter.' 
                : 'Get started by sending your first message.'}
            </p>
            {!searchTerm && selectedBuilding === 'all' && (
              <Button onClick={() => setIsComposing(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

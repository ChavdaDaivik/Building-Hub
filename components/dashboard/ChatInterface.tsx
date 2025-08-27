
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { Message, Resident, Building } from '@/lib/data';
import { buildings as buildingsStore, updateBuildingsStore } from '@/lib/data';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface ChatProps {
  initialMessages: Message[];
  allResidents: Resident[];
}

export default function ChatInterface({ initialMessages, allResidents }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [residents, setResidents] = useState<Resident[]>(allResidents);
  const [buildings, setBuildings] = useState<Building[]>(buildingsStore);
  const [newMessage, setNewMessage] = useState('');
  
  const [activeConversation, setActiveConversation] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
      setMessages(initialMessages);
      setResidents(allResidents);
  }, [initialMessages, allResidents]);

  useEffect(() => {
    if (user?.role === 'owner' && residents.length > 0 && !activeConversation) {
      setActiveConversation(residents[0].id);
    } else if (user?.role === 'resident') {
      setActiveConversation(buildings.find(b => b.id === user.buildingId)?.ownerId || '');
    }
  }, [user?.role, residents, activeConversation, user?.buildingId, buildings]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth'});
    }
  }, [messages]);


  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !user.buildingId) return;

    const receiverId = activeConversation;

    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: receiverId,
      text: newMessage,
      timestamp: new Date(),
      read: false,
    };
    
    const updatedBuildings = buildings.map(b => {
      if (b.id === user.buildingId) {
        return { ...b, messages: [...b.messages, msg] };
      }
      return b;
    });

    setBuildings(updatedBuildings);
    updateBuildingsStore(updatedBuildings);
    setMessages(updatedBuildings.find(b => b.id === user.buildingId)?.messages || []);
    setNewMessage('');
  };

  const conversationPartners = useMemo(() => {
    if (user?.role !== 'owner') return [];
    return residents;
  }, [residents, user?.role]);


  const filteredMessages = messages.filter(msg => {
    if(user?.role === 'owner') {
        if (!activeConversation) return false;
        return (msg.senderId === activeConversation && msg.receiverId === user?.id) ||
               (msg.senderId === user?.id && msg.receiverId === activeConversation);
    }
    // Resident view
    const ownerId = buildings.find(b => b.id === user?.buildingId)?.ownerId;
    return (msg.senderId === user?.id && msg.receiverId === ownerId) ||
           (msg.senderId === ownerId && msg.receiverId === user?.id);
  });
  
  const getPartnerName = (id: string) => {
    if (id === buildings.find(b => b.id === user?.buildingId)?.ownerId) {
        return 'Owner';
    }
    return residents.find(r => r.id === id)?.name || 'Unknown';
  }


  return (
    <Card className="h-[75vh] flex flex-col md:flex-row">
      {user?.role === 'owner' && (
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[60vh] md:h-full">
            <CardContent className="p-2">
              {conversationPartners.length > 0 ? conversationPartners.map(partner => (
                <Button 
                  key={partner.id} 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start p-2 h-auto mb-1",
                    activeConversation === partner.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => setActiveConversation(partner.id)}
                >
                  <Avatar className="mr-3">
                    <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{partner.name}</p>
                    <p className="text-xs text-muted-foreground">Apt {partner.apartment}</p>
                  </div>
                </Button>
              )) : <p className="p-4 text-sm text-muted-foreground">No residents found.</p>}
            </CardContent>
          </ScrollArea>
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>
            {activeConversation ? `Chat with ${getPartnerName(activeConversation)}` : 'Select a conversation'}
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 p-4 bg-gray-50" ref={scrollAreaRef as any}>
          <div className="space-y-4">
            {filteredMessages.map(msg => (
              <div key={msg.id} className={cn(
                "flex items-end gap-2",
                msg.senderId === user?.id ? "justify-end" : "justify-start"
              )}>
                 {msg.senderId !== user?.id && (
                     <Avatar className="h-8 w-8">
                        <AvatarFallback>{getPartnerName(msg.senderId).charAt(0)}</AvatarFallback>
                     </Avatar>
                 )}
                <div className={cn(
                  "rounded-lg px-4 py-2 max-w-sm",
                  msg.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-card border"
                )}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <CardFooter className="p-4 border-t">
          <div className="flex w-full items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Type your message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!activeConversation}
            />
            <Button onClick={handleSendMessage} disabled={!activeConversation}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}

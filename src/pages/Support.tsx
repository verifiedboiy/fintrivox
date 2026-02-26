import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, CheckCircle, Send, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { supportApi } from '@/services/api';

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('MEDIUM');
  const [creating, setCreating] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      supportApi.list().then(({ data }) => {
        setTickets(data.tickets);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await supportApi.create({ subject, message, category, priority });
      const { data } = await supportApi.list();
      setTickets(data.tickets);
      setShowForm(false);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setReplying(true);
    try {
      await supportApi.reply(selectedTicket.id, replyMessage);
      const { data } = await supportApi.list();
      setTickets(data.tickets);
      setSelectedTicket(data.tickets.find((t: any) => t.id === selectedTicket.id));
      setReplyMessage('');
    } catch (err) { console.error(err); }
    finally { setReplying(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge className="bg-blue-100 text-blue-700">Open</Badge>;
      case 'IN_PROGRESS': return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>;
      case 'RESOLVED': return <Badge className="bg-green-100 text-green-700">Resolved</Badge>;
      case 'CLOSED': return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const faqs = [
    { question: 'How do I create an account?', answer: 'Click the "Get Started" button and follow the registration process.' },
    { question: 'What is the minimum investment amount?', answer: 'The minimum investment varies by plan. Our Starter plan begins at $100.' },
    { question: 'How do I withdraw my funds?', answer: 'Go to Withdraw, select method, enter amount, and provide your withdrawal key.' },
    { question: 'Is my money safe?', answer: 'Yes, we use bank-grade security including 256-bit encryption and 2FA.' },
    { question: 'How long do withdrawals take?', answer: 'Crypto: within 1 hour. Bank transfers: 1-3 business days.' },
  ];

  // If user is logged in, show ticket system
  if (user) {
    if (selectedTicket) {
      return (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedTicket(null)} className="text-blue-600 hover:text-blue-700">← Back</button>
            <h1 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h1>
            {getStatusBadge(selectedTicket.status)}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="font-medium">You</p>
                  <span className="text-xs text-gray-400">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-600 mt-1">{selectedTicket.message}</p>
              </div>

              <div className="space-y-3 mt-4">
                {selectedTicket.replies?.map((reply: any) => (
                  <div key={reply.id} className={`p-3 rounded-lg ${reply.isAdmin ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{reply.isAdmin ? '⚡ Admin' : `${reply.user?.firstName} ${reply.user?.lastName}`}</p>
                      <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{reply.message}</p>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
                <div className="mt-4 flex gap-2">
                  <Textarea value={replyMessage} onChange={e => setReplyMessage(e.target.value)} placeholder="Type your reply..." rows={2} className="flex-1" />
                  <Button onClick={handleReply} disabled={replying || !replyMessage.trim()} className="bg-blue-600 hover:bg-blue-700">
                    {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-500">Get help from our team</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            {showForm ? 'Cancel' : '+ New Ticket'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle>Create New Ticket</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <Input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Brief description of your issue" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
                      <option value="general">General</option>
                      <option value="deposit">Deposit</option>
                      <option value="withdrawal">Withdrawal</option>
                      <option value="investment">Investment</option>
                      <option value="account">Account</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} placeholder="Describe your issue in detail" />
                </div>
                <Button type="submit" disabled={creating} className="w-full bg-blue-600 hover:bg-blue-700">
                  {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Submit Ticket'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No tickets yet</p>
              <p className="text-gray-500">Create a ticket to get help from our support team</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-gray-500">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ticket.replies?.length > 0 && (
                        <span className="text-xs text-gray-500">{ticket.replies.length} replies</span>
                      )}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Public support page for non-logged-in users
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">How Can We Help?</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">Our support team is available 24/7.</p>
        </div>
      </section>

      <section className="py-16 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6"><MessageSquare className="w-8 h-8 text-blue-600" /></div>
                <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our team in real-time</p>
                <Button variant="outline" className="w-full">Start Chat</Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6"><Mail className="w-8 h-8 text-green-600" /></div>
                <h3 className="text-xl font-semibold mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Get a response within 24 hours</p>
                <Button variant="outline" className="w-full">Send Email</Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-6"><Phone className="w-8 h-8 text-amber-600" /></div>
                <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-4">Call us for urgent matters</p>
                <Button variant="outline" className="w-full">+1 (555) 123-4567</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}

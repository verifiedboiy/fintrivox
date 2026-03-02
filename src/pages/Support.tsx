import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, CheckCircle, Send, Loader2, Clock, AlertCircle } from 'lucide-react';
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
    { question: 'How do I fund my account?', answer: 'Go to the Deposit page, select your preferred payment method (Crypto, Bank Transfer, etc.), and follow the on-screen instructions. Your balance will update automatically after confirmation.' },
    { question: 'How long do withdrawals take?', answer: 'Withdrawals are processed promptly. Cryptocurrency withdrawals typically arrive within 1 hour, while Bank Transfers can take 1-3 business days depending on your region.' },
    { question: 'Is there a minimum investment?', answer: 'Yes, our Starter plan begins at $100. Higher tiers offer more advanced features and higher potential yields.' },
    { question: 'How can I contact support directly?', answer: 'You can reach us directly via Telegram @IFPBrokeragent or by sending an email to support@fintrivox.com. We are available 24/7.' },
    { question: 'Is my money safe?', answer: 'Absolutely. We use bank-grade security including 256-bit encryption, mandatory Two-Factor Authentication (2FA), and cold storage for the majority of user assets.' },
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Support & Help Center</h1>
          <p className="text-gray-500">Need assistance? Open a ticket or browse our FAQs</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Tickets</h2>
              <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
                {showForm ? 'Cancel' : '+ New Ticket'}
              </Button>
            </div>

            {showForm && (
              <Card className="border-blue-100 bg-blue-50/30">
                <CardHeader><CardTitle className="text-lg">Create New Ticket</CardTitle></CardHeader>
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
              <Card className="border-dashed border-2">
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900">No active tickets</p>
                  <p className="text-gray-500">Create a ticket to get help from our support team</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {tickets.map(ticket => (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500" onClick={() => setSelectedTicket(ticket)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{ticket.subject}</p>
                          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {ticket.replies?.length > 0 && (
                            <span className="text-xs text-blue-600 font-medium">{ticket.replies.length} replies</span>
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

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Need Immediate Help?</h2>
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold">Telegram Support</h3>
                </div>
                <p className="text-sm text-blue-50/80 mb-6 leading-relaxed">
                  Join our official support channel for real-time updates and direct assistance from our moderators.
                </p>
                <a
                  href="https://t.me/IFPBrokeragent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Message on Telegram
                </a>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Email Support</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <div className="p-3 bg-white rounded-lg border border-gray-100 text-sm font-medium text-blue-600 break-all">
                  support@fintrivox.com
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Security Note</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    We will never ask for your password or withdrawal key. Be careful of impersonators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="pt-8 border-t border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-1">If your question isn't answered here, please open a ticket or contact our email.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b-gray-100">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-blue-600">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
              <p className="text-gray-600 mb-3 font-medium">Didn't find what you are looking for?</p>
              <a
                href="mailto:support@fintrivox.com"
                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
              >
                Send an email to support@fintrivox.com
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Public support page for non-logged-in users
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">How Can We Help?</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">Our support team is available 24/7. Choose a contact method below or browse our FAQs.</p>
        </div>
      </section>

      <section className="py-16 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-xl transition-all border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Send className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Telegram Support</h3>
                <p className="text-gray-600 mb-6">Join our community and get help in real-time from our official moderators.</p>
                <a href="https://t.me/IFPBrokeragent" target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Open Telegram
                </a>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-all border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-6">For detailed inquiries or account issues, send us an email and we'll respond within 24h.</p>
                <a href="mailto:support@fintrivox.com" className="block w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                  support@fintrivox.com
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Fast answers to the most common questions from our investors.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-gray-200">
                <AccordionTrigger className="text-left font-semibold text-gray-900">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600 text-lg leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-16 p-8 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
            <p className="text-xl font-bold text-gray-900 mb-4">Still need help?</p>
            <p className="text-gray-500 mb-6">Our dedicated support team is ready to assist you with any questions or issues.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button className="px-8 h-12 bg-blue-600 hover:bg-blue-700 text-lg rounded-xl">Sign in to Open Ticket</Button>
              </Link>
              <a href="mailto:support@fintrivox.com">
                <Button variant="outline" className="px-8 h-12 text-lg rounded-xl border-gray-200">Email Us Directly</Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

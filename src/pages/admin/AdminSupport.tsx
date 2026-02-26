import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/services/api';

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    try {
      const params: any = { limit: 50 };
      if (filter) params.status = filter;
      const { data } = await adminApi.getSupportTickets(params);
      setTickets(data.tickets);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setReplying(true);
    try {
      await adminApi.replySupportTicket(selected.id, reply);
      setReply('');
      fetchTickets();
      const updatedTickets = await adminApi.getSupportTickets({ limit: 50 });
      setTickets(updatedTickets.data.tickets);
      setSelected(updatedTickets.data.tickets.find((t: any) => t.id === selected.id));
    } catch (err) { console.error(err); }
    finally { setReplying(false); }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      await adminApi.updateSupportTicket(ticketId, { status });
      fetchTickets();
      if (selected?.id === ticketId) setSelected({ ...selected, status });
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT': return <Badge className="bg-red-100 text-red-700">Urgent</Badge>;
      case 'HIGH': return <Badge className="bg-orange-100 text-orange-700">High</Badge>;
      case 'MEDIUM': return <Badge className="bg-blue-100 text-blue-700">Medium</Badge>;
      case 'LOW': return <Badge className="bg-gray-100 text-gray-700">Low</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="text-blue-600 hover:text-blue-700">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{selected.subject}</h1>
          {getStatusBadge(selected.status)}
          {getPriorityBadge(selected.priority)}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>From: {selected.user?.firstName} {selected.user?.lastName} ({selected.user?.email})</span>
          <span>•</span>
          <span>Category: {selected.category}</span>
          <span>•</span>
          <span>{new Date(selected.createdAt).toLocaleString()}</span>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <p className="font-medium">{selected.user?.firstName} {selected.user?.lastName}</p>
                <span className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-600 mt-2">{selected.message}</p>
            </div>

            {selected.replies?.map((r: any) => (
              <div key={r.id} className={`p-4 rounded-lg ${r.isAdmin ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-start">
                  <p className="font-medium">{r.isAdmin ? '⚡ Admin' : `${r.user?.firstName} ${r.user?.lastName}`}</p>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-600 mt-2">{r.message}</p>
              </div>
            ))}

            {selected.status !== 'CLOSED' && (
              <div className="flex gap-2">
                <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type admin reply..." rows={2} className="flex-1" />
                <Button onClick={handleReply} disabled={replying || !reply.trim()} className="bg-blue-600 hover:bg-blue-700">
                  {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          {selected.status === 'OPEN' && <Button onClick={() => handleStatusChange(selected.id, 'IN_PROGRESS')} variant="outline"><Clock className="w-4 h-4 mr-2" /> Mark In Progress</Button>}
          {(selected.status === 'OPEN' || selected.status === 'IN_PROGRESS') && <Button onClick={() => handleStatusChange(selected.id, 'RESOLVED')} className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" /> Resolve</Button>}
          {selected.status !== 'CLOSED' && <Button onClick={() => handleStatusChange(selected.id, 'CLOSED')} variant="outline" className="text-red-600"><XCircle className="w-4 h-4 mr-2" /> Close</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1><p className="text-gray-500">Manage customer support requests</p></div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Open</p><p className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'OPEN').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Resolved</p><p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'RESOLVED').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Closed</p><p className="text-2xl font-bold text-gray-600">{tickets.filter(t => t.status === 'CLOSED').length}</p></CardContent></Card>
      </div>

      <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded-lg px-3 py-2">
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>

      <div className="space-y-3">
        {tickets.map(ticket => (
          <Card key={ticket.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelected(ticket)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{ticket.subject}</p>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {ticket.user?.firstName} {ticket.user?.lastName} • {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">{ticket.message}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {ticket.replies?.length > 0 && <span className="text-sm text-gray-500"><MessageSquare className="w-4 h-4 inline mr-1" />{ticket.replies.length}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-500"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No tickets found</p></div>
        )}
      </div>
    </div>
  );
}

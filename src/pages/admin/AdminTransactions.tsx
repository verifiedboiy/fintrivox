import { useState, useEffect } from 'react';
import { Search, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApi } from '@/services/api';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [showDeny, setShowDeny] = useState(false);
  const [denyId, setDenyId] = useState('');
  const [denyReason, setDenyReason] = useState('');

  const fetchTx = async () => {
    try {
      const params: any = { limit: 50 };
      if (filter.type) params.type = filter.type;
      if (filter.status) params.status = filter.status;
      const { data } = await adminApi.getTransactions(params);
      setTransactions(data.transactions);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTx(); }, [filter]);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this transaction?')) return;
    try {
      await adminApi.approveTransaction(id);
      fetchTx();
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleDenyStart = (id: string) => { setDenyId(id); setDenyReason(''); setShowDeny(true); };

  const handleDenyConfirm = async () => {
    try {
      await adminApi.denyTransaction(denyId, denyReason);
      setShowDeny(false);
      fetchTx();
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'CANCELLED': return <Badge className="bg-red-100 text-red-700">Denied</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1><p className="text-gray-500">Review and manage all transactions</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{transactions.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-600">{transactions.filter(t => t.status === 'PENDING').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{transactions.filter(t => t.status === 'COMPLETED').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Denied</p><p className="text-2xl font-bold text-red-600">{transactions.filter(t => t.status === 'CANCELLED').length}</p></CardContent></Card>
      </div>

      <div className="flex gap-4">
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className="border rounded-lg px-3 py-2">
          <option value="">All Types</option>
          <option value="DEPOSIT">Deposits</option>
          <option value="WITHDRAWAL">Withdrawals</option>
          <option value="INVESTMENT">Investments</option>
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="border rounded-lg px-3 py-2">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Denied</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div><p className="font-medium">{tx.user?.firstName} {tx.user?.lastName}</p><p className="text-sm text-gray-500">{tx.user?.email}</p></div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {tx.type === 'DEPOSIT' ? <ArrowDownRight className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-red-600" />}
                      </div>
                      <span className="capitalize">{tx.type.toLowerCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${tx.amount?.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{tx.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    {tx.status === 'PENDING' && (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(tx.id)}><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleDenyStart(tx.id)}><XCircle className="w-4 h-4 mr-1" /> Deny</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No transactions found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDeny} onOpenChange={setShowDeny}>
        <DialogContent>
          <DialogHeader><DialogTitle>Deny Transaction</DialogTitle></DialogHeader>
          <div><Input value={denyReason} onChange={e => setDenyReason(e.target.value)} placeholder="Reason for denial (optional)" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeny(false)}>Cancel</Button>
            <Button onClick={handleDenyConfirm} className="bg-red-600 hover:bg-red-700">Deny Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

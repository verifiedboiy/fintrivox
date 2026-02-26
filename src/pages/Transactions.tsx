import { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Search,
  Download,
  Calendar,
  Loader2,
  Receipt,
  Printer,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { transactionApi } from '@/services/api';

export default function Transactions() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params: any = { limit: 100 };
        if (filter !== 'all') params.type = filter.toUpperCase();
        const { data } = await transactionApi.list(params);
        setTransactions(data.transactions.map((tx: any) => ({
          ...tx,
          type: tx.type.toLowerCase(),
          status: tx.status.toLowerCase(),
          createdAt: new Date(tx.createdAt),
        })));
      } catch (err) {
        console.error('Fetch transactions error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [filter]);

  if (!user) return null;

  const filteredTransactions = transactions.filter(tx => {
    const desc = (tx.description || tx.type || '').toLowerCase();
    return desc.includes(searchQuery.toLowerCase()) || tx.type.includes(searchQuery.toLowerCase());
  });

  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const totalProfit = transactions.filter(t => t.type === 'profit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="w-5 h-5 text-green-600" />;
      case 'withdrawal': return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'profit': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'investment': return <ArrowUpRight className="w-5 h-5 text-purple-600" />;
      default: return <ArrowLeftRight className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'processing': return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
      case 'failed': case 'cancelled': return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleTxClick = (tx: any) => {
    setSelectedTx(tx);
    setShowReceipt(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500">View all your transactions and activities</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Total Deposits</p>
          <p className="text-2xl font-bold text-green-600">${totalDeposits.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Total Withdrawals</p>
          <p className="text-2xl font-bold text-red-600">${totalWithdrawals.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Total Profit</p>
          <p className="text-2xl font-bold text-blue-600">${totalProfit.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input placeholder="Search transactions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="all">All Types</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
          <option value="profit">Profits</option>
          <option value="investment">Investments</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(tx => (
                <TableRow
                  key={tx.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleTxClick(tx)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-100' :
                          tx.type === 'withdrawal' ? 'bg-red-100' :
                            tx.type === 'profit' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                        {getTransactionIcon(tx.type)}
                      </div>
                      <span className="capitalize font-medium">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{tx.description || tx.type}</p>
                    {tx.reference && <p className="text-sm text-gray-500">Ref: {tx.reference}</p>}
                  </TableCell>
                  <TableCell>
                    <p>{tx.createdAt.toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{tx.createdAt.toLocaleTimeString()}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="text-right">
                    <p className={`font-bold ${tx.type === 'deposit' || tx.type === 'profit' ? 'text-green-600' :
                        tx.type === 'withdrawal' ? 'text-red-600' : 'text-gray-900'
                      }`}>
                      {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </p>
                    {tx.fee > 0 && <p className="text-sm text-gray-500">Fee: ${tx.fee}</p>}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Transaction Receipt
            </DialogTitle>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  selectedTx.type === 'deposit' ? 'bg-green-100' :
                  selectedTx.type === 'withdrawal' ? 'bg-red-100' :
                  selectedTx.type === 'profit' ? 'bg-blue-100' :
                  selectedTx.type === 'investment' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {getTransactionIcon(selectedTx.type)}
                </div>
              </div>
              <p className="text-center text-2xl font-bold mb-4">
                <span className={
                  selectedTx.type === 'deposit' || selectedTx.type === 'profit' ? 'text-green-600' :
                  selectedTx.type === 'withdrawal' ? 'text-red-600' : 'text-gray-900'
                }>
                  {selectedTx.type === 'deposit' || selectedTx.type === 'profit' ? '+' : '-'}${selectedTx.amount.toLocaleString()}
                </span>
              </p>

              <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Description</span>
                  <span className="font-medium text-right max-w-[200px]">{selectedTx.description || selectedTx.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  {getStatusBadge(selectedTx.status)}
                </div>
                {selectedTx.reference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono text-xs">{selectedTx.reference}</span>
                  </div>
                )}
                {selectedTx.method && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium">{selectedTx.method}</span>
                  </div>
                )}
                {selectedTx.fee > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fee</span>
                      <span className="font-medium">${selectedTx.fee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Net Amount</span>
                      <span className="font-medium">${(selectedTx.netAmount || selectedTx.amount - selectedTx.fee).toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="font-medium text-right">
                    {selectedTx.createdAt.toLocaleDateString()}<br/>
                    <span className="text-xs text-gray-400">{selectedTx.createdAt.toLocaleTimeString()}</span>
                  </span>
                </div>
                {selectedTx.processedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Processed</span>
                    <span className="font-medium">{new Date(selectedTx.processedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowReceipt(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

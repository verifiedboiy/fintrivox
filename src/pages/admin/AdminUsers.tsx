import { useState, useEffect } from 'react';
import {
  Search, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Wallet, TrendingUp, TrendingDown, UserCheck, UserX, Edit, Eye,
  Mail, Phone, Calendar, DollarSign, Loader2, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi } from '@/services/api';

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showAdjustProfit, setShowAdjustProfit] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState<'add' | 'deduct'>('add');
  const [fundReason, setFundReason] = useState('');
  const [profitAmount, setProfitAmount] = useState('');
  const [profitType, setProfitType] = useState<'increase' | 'decrease'>('increase');
  const [profitReason, setProfitReason] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [editForm, setEditForm] = useState<any>({});

  const fetchUsers = async (search?: string) => {
    try {
      const { data } = await adminApi.getUsers({ search, limit: 50 });
      setUsers(data.users);
      if (!stats) {
        const s = await adminApi.getStats();
        setStats(s.data.stats);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (searchQuery) fetchUsers(searchQuery); else fetchUsers(); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleViewUser = async (user: any) => {
    setSelectedUser(user);
    try {
      const { data } = await adminApi.getUser(user.id);
      setUserDetails(data.user);
    } catch (err) { console.error(err); }
    setShowUserDetails(true);
  };

  const handleAddFunds = (user: any) => { setSelectedUser(user); setShowAddFunds(true); };
  const handleAdjustProfit = (user: any) => { setSelectedUser(user); setShowAdjustProfit(true); };
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      status: user.status,
      role: user.role,
      suspensionReason: user.suspensionReason || ''
    });
    setShowEditUser(true);
  };

  const submitAddFunds = async () => {
    if (!selectedUser || !fundAmount) return;
    const amount = parseFloat(fundAmount);
    const newBalance = fundType === 'add' ? selectedUser.balance + amount : selectedUser.balance - amount;
    try {
      await adminApi.updateUser(selectedUser.id, { balance: newBalance });
      alert(`Successfully ${fundType === 'add' ? 'added' : 'deducted'} $${fundAmount} ${fundType === 'add' ? 'to' : 'from'} ${selectedUser.firstName}'s account`);
      setShowAddFunds(false);
      setFundAmount(''); setFundReason('');
      fetchUsers(searchQuery);
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const submitAdjustProfit = async () => {
    if (!selectedUser || !profitAmount) return;
    const amount = parseFloat(profitAmount);
    const newProfit = profitType === 'increase'
      ? (selectedUser.totalProfit || 0) + amount
      : Math.max(0, (selectedUser.totalProfit || 0) - amount);
    try {
      await adminApi.updateUser(selectedUser.id, { totalProfit: newProfit });
      alert(`Successfully ${profitType === 'increase' ? 'increased' : 'decreased'} profit by $${profitAmount}`);
      setShowAdjustProfit(false);
      setProfitAmount(''); setProfitReason('');
      fetchUsers(searchQuery);
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const submitEditUser = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.updateUser(selectedUser.id, editForm);
      alert('User updated successfully');
      setShowEditUser(false);
      fetchUsers(searchQuery);
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleSuspendUser = (user: any) => {
    setSelectedUser(user);
    setSuspensionReason(user.suspensionReason || '');
    setShowSuspendDialog(true);
  };

  const submitSuspendUser = async () => {
    if (!selectedUser) return;
    const isCurrentlySuspended = selectedUser.status === 'SUSPENDED';
    const newStatus = isCurrentlySuspended ? 'ACTIVE' : 'SUSPENDED';
    try {
      await adminApi.updateUser(selectedUser.id, {
        status: newStatus,
        suspensionReason: newStatus === 'SUSPENDED' ? suspensionReason : null
      });
      alert(`User ${newStatus === 'SUSPENDED' ? 'suspended' : 'activated'} successfully`);
      setShowSuspendDialog(false);
      fetchUsers(searchQuery);
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const submitDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.deleteUser(selectedUser.id);
      alert('User deleted successfully');
      setShowDeleteDialog(false);
      fetchUsers(searchQuery);
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'SUSPENDED': return <Badge className="bg-red-100 text-red-700">Suspended</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <Badge className="bg-green-100 text-green-700"><UserCheck className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'REJECTED': return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default: return <Badge variant="secondary">Not Submitted</Badge>;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">User Management</h1><p className="text-gray-500">Manage users, funds, and profits</p></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold">{stats?.totalUsers || users.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Active Users</p><p className="text-2xl font-bold text-green-600">{stats?.activeUsers || users.filter(u => u.status === 'ACTIVE').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Pending KYC</p><p className="text-2xl font-bold text-yellow-600">{users.filter(u => u.kycStatus === 'PENDING').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Suspended</p><p className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'SUSPENDED').length}</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input placeholder="Search users by name, email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Invested</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10"><AvatarFallback className="bg-blue-100 text-blue-700">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback></Avatar>
                      <div><p className="font-medium">{user.firstName} {user.lastName}</p><p className="text-sm text-gray-500">{user.email}</p></div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{getKycBadge(user.kycStatus)}</TableCell>
                  <TableCell className="font-medium">${user.balance?.toLocaleString()}</TableCell>
                  <TableCell>${user.investedAmount?.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">+${user.totalProfit?.toLocaleString()}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewUser(user)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}><Edit className="w-4 h-4 mr-2" /> Edit User</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddFunds(user)}><Wallet className="w-4 h-4 mr-2" /> Add/Deduct Funds</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAdjustProfit(user)}><TrendingUp className="w-4 h-4 mr-2" /> Adjust Profit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspendUser(user)} className={user.status === 'SUSPENDED' ? 'text-green-600' : 'text-amber-600'}>
                          <UserX className="w-4 h-4 mr-2" /> {user.status === 'SUSPENDED' ? 'Activate User' : 'Suspend User'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete User completely
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {(userDetails || selectedUser) && (() => {
            const u = userDetails || selectedUser;
            return (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="investments">Investments</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-16 h-16"><AvatarFallback className="bg-blue-100 text-blue-700 text-xl">{u.firstName?.[0]}{u.lastName?.[0]}</AvatarFallback></Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{u.firstName} {u.lastName}</h3>
                      <p className="text-gray-500">{u.email}</p>
                      <div className="flex gap-2 mt-2">{getStatusBadge(u.status)}{getKycBadge(u.kycStatus)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Total Balance</p><p className="text-2xl font-bold">${u.balance?.toLocaleString()}</p></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Available Balance</p><p className="text-2xl font-bold">${u.availableBalance?.toLocaleString()}</p></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Invested Amount</p><p className="text-2xl font-bold">${u.investedAmount?.toLocaleString()}</p></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Total Profit</p><p className="text-2xl font-bold text-green-600">${u.totalProfit?.toLocaleString()}</p></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-gray-400" /><span>{u.email}</span></div>
                    <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-gray-400" /><span>{u.phone || 'Not provided'}</span></div>
                    <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-400" /><span>Joined {new Date(u.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </TabsContent>

                <TabsContent value="transactions">
                  <div className="space-y-3">
                    {(u.transactions || []).slice(0, 10).map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div><p className="font-medium capitalize">{tx.type.toLowerCase()}</p><p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p></div>
                        <p className={`font-medium ${tx.type === 'DEPOSIT' || tx.type === 'PROFIT' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'DEPOSIT' || tx.type === 'PROFIT' ? '+' : '-'}${tx.amount?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {(!u.transactions || u.transactions.length === 0) && <p className="text-center py-8 text-gray-500">No transactions</p>}
                  </div>
                </TabsContent>

                <TabsContent value="investments">
                  <div className="space-y-3">
                    {(u.investments || []).map((inv: any) => (
                      <div key={inv.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div><p className="font-medium">{inv.plan?.name || 'Investment'}</p><p className="text-sm text-gray-500">${inv.amount?.toLocaleString()}</p></div>
                          <Badge variant={inv.status === 'ACTIVE' ? 'default' : 'secondary'}>{inv.status}</Badge>
                        </div>
                        <p className="text-sm text-green-600 mt-2">+${(inv.earnedProfit || 0).toLocaleString()} earned</p>
                      </div>
                    ))}
                    {(!u.investments || u.investments.length === 0) && <p className="text-center py-8 text-gray-500">No investments</p>}
                  </div>
                </TabsContent>

                <TabsContent value="activity">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="font-medium">Last Login</p><p className="text-sm text-gray-500">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="font-medium">Referral Code</p><p className="text-sm text-gray-500">{u.referralCode || 'N/A'}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="font-medium">2FA Status</p><p className="text-sm text-gray-500">{u.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p></div>
                  </div>
                </TabsContent>
              </Tabs>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle><DialogDescription>Update {selectedUser?.firstName}'s profile</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value={editForm.firstName || ''} onChange={e => setEditForm((f: any) => ({ ...f, firstName: e.target.value }))} /></div>
              <div><Label>Last Name</Label><Input value={editForm.lastName || ''} onChange={e => setEditForm((f: any) => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div><Label>Status</Label>
              <select value={editForm.status || ''} onChange={e => setEditForm((f: any) => ({ ...f, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 mt-1">
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div><Label>KYC Status</Label>
              <select value={editForm.kycStatus || ''} onChange={e => setEditForm((f: any) => ({ ...f, kycStatus: e.target.value }))} className="w-full border rounded-lg px-3 py-2 mt-1">
                <option value="NOT_SUBMITTED">Not Submitted</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            {editForm.status === 'SUSPENDED' && (
              <div>
                <Label>Suspension Reason</Label>
                <Input
                  value={editForm.suspensionReason || ''}
                  onChange={e => setEditForm((f: any) => ({ ...f, suspensionReason: e.target.value }))}
                  placeholder="Reason for suspension..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUser(false)}>Cancel</Button>
            <Button onClick={submitEditUser} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Funds Dialog */}
      <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Funds</DialogTitle><DialogDescription>Add or deduct funds from {selectedUser?.firstName}'s account</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button type="button" variant={fundType === 'add' ? 'default' : 'outline'} onClick={() => setFundType('add')} className="flex-1"><ArrowDownRight className="w-4 h-4 mr-2" /> Add Funds</Button>
              <Button type="button" variant={fundType === 'deduct' ? 'default' : 'outline'} onClick={() => setFundType('deduct')} className="flex-1"><ArrowUpRight className="w-4 h-4 mr-2" /> Deduct Funds</Button>
            </div>
            <div><Label>Amount</Label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><Input type="number" placeholder="0.00" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className="pl-10" /></div></div>
            <div><Label>Reason</Label><Input placeholder="Enter reason for this transaction..." value={fundReason} onChange={e => setFundReason(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFunds(false)}>Cancel</Button>
            <Button onClick={submitAddFunds} className={fundType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>{fundType === 'add' ? 'Add Funds' : 'Deduct Funds'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Profit Dialog */}
      <Dialog open={showAdjustProfit} onOpenChange={setShowAdjustProfit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adjust Profit</DialogTitle><DialogDescription>Increase or decrease profit for {selectedUser?.firstName}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button type="button" variant={profitType === 'increase' ? 'default' : 'outline'} onClick={() => setProfitType('increase')} className="flex-1"><TrendingUp className="w-4 h-4 mr-2" /> Increase</Button>
              <Button type="button" variant={profitType === 'decrease' ? 'default' : 'outline'} onClick={() => setProfitType('decrease')} className="flex-1"><TrendingDown className="w-4 h-4 mr-2" /> Decrease</Button>
            </div>
            <div><Label>Amount</Label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><Input type="number" placeholder="0.00" value={profitAmount} onChange={e => setProfitAmount(e.target.value)} className="pl-10" /></div></div>
            <div><Label>Reason</Label><Input placeholder="Enter reason for profit adjustment..." value={profitReason} onChange={e => setProfitReason(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustProfit(false)}>Cancel</Button>
            <Button onClick={submitAdjustProfit} className={profitType === 'increase' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}>{profitType === 'increase' ? 'Increase Profit' : 'Decrease Profit'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser?.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account'}</DialogTitle>
            <DialogDescription>
              {selectedUser?.status === 'SUSPENDED'
                ? `Are you sure you want to reactivate ${selectedUser?.firstName}'s account?`
                : `Specify a reason for suspending ${selectedUser?.firstName}'s account.`}
            </DialogDescription>
          </DialogHeader>
          {selectedUser?.status !== 'SUSPENDED' && (
            <div className="space-y-2 py-4">
              <Label>Suspension Reason</Label>
              <Input
                placeholder="e.g. Unusual activity detected, KYC documents invalid..."
                value={suspensionReason}
                onChange={e => setSuspensionReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This message will be shown to the user on their frozen screen.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>Cancel</Button>
            <Button
              onClick={submitSuspendUser}
              className={selectedUser?.status === 'SUSPENDED' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive'}
            >
              {selectedUser?.status === 'SUSPENDED' ? 'Reactivate Account' : 'Confirm Suspension'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete User Account</DialogTitle>
            <DialogDescription>
              This action is <span className="font-bold text-destructive">PERMANENT</span>. All data associated with {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email}) including investments, transitions, and KYC documents will be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium text-destructive bg-destructive/10 p-4 rounded-lg">
              WARNING: This cannot be undone. Are you absolutely certain?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onClick={submitDeleteUser} variant="destructive">
              Yes, Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

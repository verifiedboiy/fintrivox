import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Loader2, FileText, RefreshCw, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApi } from '@/services/api';

export default function AdminKYC() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showDoc, setShowDoc] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectUserId, setRejectUserId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const fetchKyc = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (filter) params.status = filter;
      const { data } = await adminApi.getKycList(params);
      setUsers(data.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchKyc(); }, [filter]);

  const handleApprove = async (userId: string) => {
    if (!confirm('Approve this KYC?')) return;
    try {
      await adminApi.approveKyc(userId);
      fetchKyc();
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleRejectStart = (userId: string) => { setRejectUserId(userId); setRejectReason(''); setShowReject(true); };
  const handleRejectConfirm = async () => {
    try {
      await adminApi.rejectKyc(rejectUserId, rejectReason || 'Documents not acceptable');
      setShowReject(false);
      fetchKyc();
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const viewDocuments = (user: any) => {
    setSelectedUser(user);
    setShowDoc(true);
  };

  const handleDeleteDoc = async (field: string) => {
    if (!selectedUser || !confirm(`Are you sure you want to delete this ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}?`)) return;
    try {
      await adminApi.deleteKycDoc(selectedUser.id, field);
      // Update local state to reflect deletion
      const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          const updatedDocs = u.kycDocuments.map((d: any) => ({ ...d, [field]: null }));
          return { ...u, kycDocuments: updatedDocs };
        }
        return u;
      });
      setUsers(updatedUsers);
      setSelectedUser((prev: any) => ({
        ...prev,
        kycDocuments: prev.kycDocuments.map((d: any) => ({ ...d, [field]: null }))
      }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to delete'); }
  };

  const handleWipeDocs = async () => {
    if (!selectedUser || !confirm('Are you sure you want to WIPE ALL documents for this user to save space? This cannot be undone.')) return;
    try {
      await adminApi.wipeKycDocs(selectedUser.id);
      // Update local state to reflect deletion
      const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          const updatedDocs = u.kycDocuments.map((d: any) => ({
            ...d,
            frontImage: null,
            backImage: null,
            selfieImage: null,
            selfieVideo: null
          }));
          return { ...u, kycDocuments: updatedDocs };
        }
        return u;
      });
      setUsers(updatedUsers);
      setSelectedUser((prev: any) => ({
        ...prev,
        kycDocuments: prev.kycDocuments.map((d: any) => ({
          ...d,
          frontImage: null,
          backImage: null,
          selfieImage: null,
          selfieVideo: null
        }))
      }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to wipe documents'); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <Badge className="bg-green-100 text-green-700 border-green-200">Verified</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'REJECTED': return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const doc = selectedUser?.kycDocuments?.[0];

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-500">Review and manage KYC submissions</p>
        </div>
        <Button variant="outline" onClick={fetchKyc} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-600">{users.filter(u => u.kycStatus === 'PENDING').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Verified</p><p className="text-2xl font-bold text-green-600">{users.filter(u => u.kycStatus === 'VERIFIED').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Rejected</p><p className="text-2xl font-bold text-red-600">{users.filter(u => u.kycStatus === 'REJECTED').length}</p></CardContent></Card>
      </div>

      <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded-lg px-3 py-2 bg-white">
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="VERIFIED">Verified</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.kycStatus)}</TableCell>
                  <TableCell className="capitalize">{user.kycDocuments?.[0]?.type?.replace(/_/g, ' ') || <span className="text-gray-400 text-sm">No documents</span>}</TableCell>
                  <TableCell>{user.kycSubmittedAt ? new Date(user.kycSubmittedAt).toLocaleDateString() : <span className="text-gray-400 text-sm">—</span>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => viewDocuments(user)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      {user.kycStatus === 'PENDING' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(user.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRejectStart(user.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p>No KYC submissions found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Document Dialog */}
      <Dialog open={showDoc} onOpenChange={setShowDoc}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> KYC Review — {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5">
              {/* User Details */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Email</span><p className="font-medium">{selectedUser.email}</p></div>
                <div><span className="text-gray-500">Status</span><p className="mt-0.5">{getStatusBadge(selectedUser.kycStatus)}</p></div>
                <div><span className="text-gray-500">Submitted</span><p className="font-medium">{selectedUser.kycSubmittedAt ? new Date(selectedUser.kycSubmittedAt).toLocaleString() : '—'}</p></div>
                <div><span className="text-gray-500">Document Type</span><p className="font-medium capitalize">{doc?.type?.replace(/_/g, ' ') || '—'}</p></div>
                {doc?.documentNumber && <div><span className="text-gray-500">Document Number</span><p className="font-medium">{doc.documentNumber}</p></div>}
              </div>

              {!doc ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700">Front of Document</p>
                      {doc.frontImage && <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2" onClick={() => handleDeleteDoc('frontImage')}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>}
                    </div>
                    {doc.frontImage
                      ? <img src={doc.frontImage} alt="Front" className="max-w-full rounded-xl border shadow-sm" />
                      : <p className="text-gray-400 text-sm italic">No image uploaded</p>}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700">Back of Document</p>
                      {doc.backImage && <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2" onClick={() => handleDeleteDoc('backImage')}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>}
                    </div>
                    {doc.backImage
                      ? <img src={doc.backImage} alt="Back" className="max-w-full rounded-xl border shadow-sm" />
                      : <p className="text-gray-400 text-sm italic">No image uploaded</p>}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700">Selfie Photo</p>
                      {doc.selfieImage && <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2" onClick={() => handleDeleteDoc('selfieImage')}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>}
                    </div>
                    {doc.selfieImage
                      ? <img src={doc.selfieImage} alt="Selfie" className="max-w-full rounded-xl border shadow-sm" />
                      : <p className="text-gray-400 text-sm italic">No image uploaded</p>}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700">Live Selfie Video (15s)</p>
                      {doc.selfieVideo && <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2" onClick={() => handleDeleteDoc('selfieVideo')}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>}
                    </div>
                    {doc.selfieVideo
                      ? <video src={doc.selfieVideo} controls playsInline className="max-w-full w-full max-h-[360px] rounded-xl border shadow-md bg-black" />
                      : <p className="text-gray-400 text-sm italic">No video uploaded</p>}
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 h-11"
                      onClick={handleWipeDocs}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Wipe All Documents (Save Space)
                    </Button>
                    <p className="text-center text-[11px] text-gray-400 mt-2">
                      Does not affect user KYC status. Clears images/video from storage.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedUser?.kycStatus === 'PENDING' && (
            <DialogFooter className="flex gap-3 pt-2 border-t">
              <Button
                className="bg-green-600 hover:bg-green-700 flex-1"
                onClick={() => { handleApprove(selectedUser.id); setShowDoc(false); }}
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approve KYC
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                onClick={() => { handleRejectStart(selectedUser.id); setShowDoc(false); }}
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject KYC
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject KYC Verification</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500 mb-3">Please provide a reason for rejection. This will be shown to the user.</p>
          <Input
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Documents are blurry or expired"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button onClick={handleRejectConfirm} className="bg-red-600 hover:bg-red-700">Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}

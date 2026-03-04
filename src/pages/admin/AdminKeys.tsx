import { useState, useEffect } from 'react';
import {
    Search, Key, Loader2, Copy, CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApi } from '@/services/api';
import { toast } from 'sonner';

export default function AdminKeys() {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingFor, setGeneratingFor] = useState<string | null>(null);
    const [generatedKey, setGeneratedKey] = useState<{ key: string; expiresAt: string } | null>(null);
    const [showKeyDialog, setShowKeyDialog] = useState(false);

    const fetchUsers = async (search?: string) => {
        try {
            const { data } = await adminApi.getUsers({ search, limit: 50 });
            setUsers(data.users);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleGenerateKey = async (user: any) => {
        setGeneratingFor(user.id);
        try {
            const { data } = await adminApi.generateWithdrawalKey(user.id);
            setGeneratedKey({ key: data.withdrawalKey, expiresAt: data.expiresAt });
            setShowKeyDialog(true);
            toast.success(`Key generated for ${user.firstName}`);
            fetchUsers(searchQuery);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to generate key');
        } finally {
            setGeneratingFor(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Key copied to clipboard');
    };

    const isExpired = (expiry: string | null) => {
        if (!expiry) return true;
        return new Date() > new Date(expiry);
    };

    const formatExpiry = (expiry: string | null) => {
        if (!expiry) return 'No key';
        const date = new Date(expiry);
        if (date < new Date()) return 'Expired';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading && users.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Withdrawal Keys</h1>
                    <p className="text-gray-500">Generate time-limited (30m) one-time use keys for user withdrawals</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">User</TableHead>
                                <TableHead>Current Key Status</TableHead>
                                <TableHead>Expires At</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => {
                                const expired = isExpired(user.withdrawalKeyExpiresAt);
                                const hasKey = !!user.withdrawalKey;

                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-9 h-9">
                                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {!hasKey ? (
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-normal">None</Badge>
                                            ) : expired ? (
                                                <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50 font-normal">Expired</Badge>
                                            ) : (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 font-normal">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                {hasKey && !expired && <Clock className="w-3.5 h-3.5 text-blue-500" />}
                                                {formatExpiry(user.withdrawalKeyExpiresAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                size="sm"
                                                variant={hasKey && !expired ? "outline" : "default"}
                                                className={hasKey && !expired ? "" : "bg-blue-600 hover:bg-blue-700"}
                                                onClick={() => handleGenerateKey(user)}
                                                disabled={generatingFor === user.id}
                                            >
                                                {generatingFor === user.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Key className="w-4 h-4 mr-2" />
                                                        {hasKey && !expired ? "Regenerate" : "Generate Key"}
                                                    </>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {users.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                        No users found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Key Display Dialog */}
            <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                            Key Generated Successfully
                        </DialogTitle>
                        <DialogDescription>
                            Copy and send this unique key to the user. It will expire in 30 minutes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 p-4 bg-gray-50 border rounded-xl mt-2">
                        <code className="flex-1 font-mono text-xl font-bold tracking-wider text-blue-700">
                            {generatedKey?.key}
                        </code>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(generatedKey?.key || '')}
                            className="hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Copy className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
                        <AlertTriangle className="w-4 h-4" />
                        Expires at: {generatedKey && new Date(generatedKey.expiresAt).toLocaleTimeString()} (30 minutes)
                    </div>
                    <DialogFooter className="sm:justify-start mt-4">
                        <Button
                            type="button"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => setShowKeyDialog(false)}
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

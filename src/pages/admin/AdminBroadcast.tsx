import { useState, useEffect } from 'react';
import { Megaphone, Users, Mail, Bell, Send, Search, CheckCircle2, AlertCircle, Loader2, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/services/api';
import { toast } from 'sonner';

export default function AdminBroadcast() {
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [broadcastType, setBroadcastType] = useState<'email' | 'notification' | 'both'>('notification');
    const [targetType, setTargetType] = useState<'all' | 'selected'>('all');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [notificationType, setNotificationType] = useState('INFO');
    const [link, setLink] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await adminApi.getUsers({ limit: 1000 });
            setUsers(data.users || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            toast.error('Failed to load user list');
        } finally {
            setUsersLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSendBroadcast = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Subject and message are required');
            return;
        }

        if (targetType === 'selected' && selectedUserIds.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        const confirmMsg = targetType === 'all'
            ? `Are you sure you want to send this broadcast to ALL ${users.length} users?`
            : `Are you sure you want to send this broadcast to ${selectedUserIds.length} selected users?`;

        if (!confirm(confirmMsg)) return;

        setLoading(true);
        try {
            await adminApi.sendBroadcast({
                type: broadcastType,
                target: targetType,
                userIds: targetType === 'selected' ? selectedUserIds : undefined,
                subject,
                message,
                notificationType,
                link
            });

            toast.success('Broadcast sent successfully!');
            // Reset form
            setSubject('');
            setMessage('');
            setLink('');
            setSelectedUserIds([]);
        } catch (err: any) {
            console.error('Broadcast failed:', err);
            toast.error(err.response?.data?.error || 'Failed to send broadcast');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-blue-600" />
                        System Broadcast
                    </h1>
                    <p className="text-gray-500">Send updates directly to user accounts and emails</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Configuration Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Broadcast Details</CardTitle>
                            <CardDescription>Compose your message and select delivery channels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Delivery Channel</label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={broadcastType === 'notification' ? 'default' : 'outline'}
                                            className="flex-1"
                                            onClick={() => setBroadcastType('notification')}
                                        >
                                            <Bell className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </Button>
                                        <Button
                                            variant={broadcastType === 'email' ? 'default' : 'outline'}
                                            className="flex-1"
                                            onClick={() => setBroadcastType('email')}
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Email
                                        </Button>
                                        <Button
                                            variant={broadcastType === 'both' ? 'default' : 'outline'}
                                            className="flex-1"
                                            onClick={() => setBroadcastType('both')}
                                        >
                                            Both
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Notification Type</label>
                                    <select
                                        className="w-full rounded-md border border-gray-200 p-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        value={notificationType}
                                        onChange={(e) => setNotificationType(e.target.value)}
                                    >
                                        <option value="INFO">Information (Blue)</option>
                                        <option value="SUCCESS">Success (Green)</option>
                                        <option value="WARNING">Warning (Yellow)</option>
                                        <option value="ERROR">Alert (Red)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject / Title</label>
                                <Input
                                    placeholder="e.g., Important Platform Update"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message Content</label>
                                <textarea
                                    className="w-full min-h-[200px] rounded-md border border-gray-200 p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Redirect Link (Optional)</label>
                                <Input
                                    placeholder="/dashboard/invest"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-400 font-medium">Clicking the notification will take the user to this URL</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-100 bg-blue-50/30">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Megaphone className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Ready to launch?</h4>
                                    <p className="text-sm text-gray-600">
                                        Targeting {targetType === 'all' ? `all ${users.length} active users` : `${selectedUserIds.length} selected users`} via {broadcastType}
                                    </p>
                                </div>
                            </div>
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg shadow-lg shadow-blue-200"
                                onClick={handleSendBroadcast}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                                Execute Broadcast
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Target Selection Column */}
                <div className="space-y-6">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-500" />
                                Audience Selection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${targetType === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                    onClick={() => setTargetType('all')}
                                >
                                    All Users
                                </button>
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${targetType === 'selected' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                    onClick={() => setTargetType('selected')}
                                >
                                    Selected
                                </button>
                            </div>

                            {targetType === 'selected' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Find users..."
                                            className="pl-9 h-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                        {usersLoading ? (
                                            <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></div>
                                        ) : filteredUsers.length === 0 ? (
                                            <div className="py-8 text-center text-sm text-gray-400">No users found</div>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <div
                                                    key={user.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${selectedUserIds.includes(user.id)
                                                            ? 'border-blue-200 bg-blue-50'
                                                            : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                    onClick={() => toggleUserSelection(user.id)}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                                    {selectedUserIds.includes(user.id) ? (
                                                        <CheckCircle2 className="w-4 h-4 text-blue-500 ml-2 flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border border-gray-300 ml-2 flex-shrink-0" />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {selectedUserIds.length > 0 && (
                                        <div className="pt-2 border-top">
                                            <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
                                                <span>Selected ({selectedUserIds.length})</span>
                                                <button
                                                    className="text-red-500 hover:underline"
                                                    onClick={() => setSelectedUserIds([])}
                                                >
                                                    Clear all
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedUserIds.slice(0, 10).map(id => {
                                                    const user = users.find(u => u.id === id);
                                                    return (
                                                        <Badge key={id} variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] py-0">
                                                            {user?.firstName || 'User'}
                                                        </Badge>
                                                    );
                                                })}
                                                {selectedUserIds.length > 10 && <span className="text-[10px] text-gray-400">+{selectedUserIds.length - 10} more</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {targetType === 'all' && (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                        <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-900">Entire Community</h5>
                                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                                            Your message will be sent to all {users.length} active platform users.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/services/api';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try { const { data } = await adminApi.getAuditLogs({ page, limit: 50 }); setLogs(data.logs); } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchLogs();
  }, [page]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">System Logs</h1><p className="text-gray-500">Audit trail and system activity</p></div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{log.action?.replace(/_/g, ' ').toLowerCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div><p className="font-medium">{log.user?.firstName} {log.user?.lastName}</p><p className="text-sm text-gray-500">{log.user?.email}</p></div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm text-gray-600">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No audit logs found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

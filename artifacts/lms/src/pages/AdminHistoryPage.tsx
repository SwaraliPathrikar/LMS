import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fmtDate } from '@/lib/formatDate';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminHistoryPage() {
  const { user, selectedLibrary, setSelectedLibrary } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    navigate('/login');
    return null;
  }

  const isAdmin = user.role === 'admin';
  const isLibrarian = user.role === 'librarian';

  if (!isAdmin && !isLibrarian) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Circulation History</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can view circulation history.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    api.libraries.list().then(setLibraries).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = { status: 'returned' };
        if (selectedLibrary) params.libraryId = selectedLibrary;
        const data = await api.borrow.list(params);
        setHistory(data.requests ?? data);
      } catch (e) {
        console.error('Failed to load history', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedLibrary]);

  const stats = useMemo(() => ({
    returned: history.filter(t => t.status === 'returned').length,
    lost: history.filter(t => t.status === 'lost').length,
    totalFines: 0,
  }), [history]);

  const getBookTitle = (req: any) => req.book?.title || 'Unknown';
  const getMemberName = (req: any) => req.user?.name || 'Unknown';
  const getLibraryName = (req: any) => req.library?.name || 'Unknown';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'returned': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">Circulation History</h1>
          <p className="text-muted-foreground mt-1">View historical circulation records and completed transactions</p>
        </div>

        {isAdmin && (
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">Select Library</label>
            <Select value={selectedLibrary || ''} onValueChange={setSelectedLibrary}>
              <SelectTrigger>
                <SelectValue placeholder="Select a library..." />
              </SelectTrigger>
              <SelectContent>
                {libraries.map(lib => (
                  <SelectItem key={lib.id} value={lib.id}>
                    {lib.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Returned Books</p>
                <p className="text-3xl font-bold text-success mt-1">{stats.returned}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Lost Books</p>
                <p className="text-3xl font-bold text-destructive mt-1">{stats.lost}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Fines Collected</p>
                <p className="text-3xl font-bold text-warning mt-1">₹{stats.totalFines}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History ({history.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No history records</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Member</th>
                      <th className="text-left py-3 px-4 font-semibold">Book</th>
                      <th className="text-left py-3 px-4 font-semibold">Library</th>
                      <th className="text-left py-3 px-4 font-semibold">Request Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Return Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(trans => (
                      <tr key={trans.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4 font-medium">{getMemberName(trans)}</td>
                        <td className="py-3 px-4">{getBookTitle(trans)}</td>
                        <td className="py-3 px-4 text-xs">{getLibraryName(trans)}</td>
                        <td className="py-3 px-4 text-xs">{fmtDate(trans.requestDate)}</td>
                        <td className="py-3 px-4 text-xs">{trans.returnDate ? fmtDate(trans.returnDate) : '—'}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(trans.status)}>
                            {trans.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BookOpen, Clock } from 'lucide-react';
import { fmtDate } from '@/lib/formatDate';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function BorrowedResourcesPage() {
  const { user, selectedLibrary } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const isCitizen = user.role === 'citizen';
  const isAdmin = user.role === 'admin';
  const isLibrarian = user.role === 'librarian';

  if (isCitizen) return <CitizenBorrowedPage />;

  if (!isAdmin && !isLibrarian) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Borrowed Resources</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can view borrowed resources.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return <AdminLibrarianBorrowedPage />;
}

function CitizenBorrowedPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = { userId: user!.id };
        const data = await api.borrow.list(params);
        const all = data.requests ?? data;
        setTransactions(all.filter((t: any) => t.status === 'approved'));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const stats = useMemo(() => ({
    issued: transactions.filter(t => t.status === 'approved').length,
    overdue: 0,
    totalFines: 0,
  }), [transactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">My Borrowed Resources</h1>
          <p className="text-muted-foreground mt-1">Track your currently borrowed books</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Currently Borrowed</p>
                  <p className="text-3xl font-bold text-info mt-1">{stats.issued}</p>
                </div>
                <BookOpen className="w-10 h-10 text-info/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{stats.overdue}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-destructive/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Fines</p>
                  <p className="text-3xl font-bold text-warning mt-1">₹{stats.totalFines}</p>
                </div>
                <Clock className="w-10 h-10 text-warning/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Borrowed Books ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">You haven't borrowed any books yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Book</th>
                      <th className="text-left py-3 px-4 font-semibold">Library</th>
                      <th className="text-left py-3 px-4 font-semibold">Request Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(trans => (
                      <tr key={trans.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4 font-medium">{trans.book?.title || 'Unknown'}</td>
                        <td className="py-3 px-4 text-xs">{trans.library?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-xs">{fmtDate(trans.requestDate)}</td>
                        <td className="py-3 px-4 text-xs">{trans.dueDate ? fmtDate(trans.dueDate) : '—'}</td>
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

function AdminLibrarianBorrowedPage() {
  const { user, selectedLibrary } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = { status: 'approved' };
        if (selectedLibrary) params.libraryId = selectedLibrary;
        const data = await api.borrow.list(params);
        setTransactions(data.requests ?? data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedLibrary]);

  const stats = useMemo(() => ({
    issued: transactions.length,
    overdue: 0,
    totalFines: 0,
  }), [transactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">Borrowed Resources</h1>
          <p className="text-muted-foreground mt-1">Track all currently borrowed books across libraries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Currently Issued</p>
                  <p className="text-3xl font-bold text-info mt-1">{stats.issued}</p>
                </div>
                <BookOpen className="w-10 h-10 text-info/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{stats.overdue}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-destructive/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Fines</p>
                  <p className="text-3xl font-bold text-warning mt-1">₹{stats.totalFines}</p>
                </div>
                <Clock className="w-10 h-10 text-warning/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Borrowed Books ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No borrowed resources</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Member</th>
                      <th className="text-left py-3 px-4 font-semibold">Book</th>
                      <th className="text-left py-3 px-4 font-semibold">Library</th>
                      <th className="text-left py-3 px-4 font-semibold">Request Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(trans => (
                      <tr key={trans.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4 font-medium">{trans.user?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">{trans.book?.title || 'Unknown'}</td>
                        <td className="py-3 px-4 text-xs">{trans.library?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-xs">{fmtDate(trans.requestDate)}</td>
                        <td className="py-3 px-4 text-xs">{trans.dueDate ? fmtDate(trans.dueDate) : '—'}</td>
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

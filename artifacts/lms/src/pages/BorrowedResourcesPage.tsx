import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { circulationTransactions, books, members, libraryBranches } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function BorrowedResourcesPage() {
  const { user, selectedLibrary } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const isAdmin = user.role === 'admin';
  const isLibrarian = user.role === 'librarian';
  const isCitizen = user.role === 'citizen';

  // For citizens, show their own borrowed books
  if (isCitizen) {
    const citizenTransactions = useMemo(() => {
      // Find the member record for this citizen user - try both ID and email matching
      const member = members.find(m => m.id === user.id || m.email === user.email);
      if (!member) return [];
      
      return circulationTransactions.filter(t => 
        t.memberId === member.id && (t.status === 'issued' || t.status === 'overdue')
      );
    }, [user.id, user.email]);

    const stats = useMemo(() => {
      return {
        issued: citizenTransactions.filter(t => t.status === 'issued').length,
        overdue: citizenTransactions.filter(t => t.status === 'overdue').length,
        totalFines: citizenTransactions.reduce((sum, t) => sum + t.fineAmount, 0),
      };
    }, [citizenTransactions]);

    const getBookTitle = (bookId: string) => books.find(b => b.id === bookId)?.title || 'Unknown';
    const getLibraryName = (libraryId: string) => libraryBranches.find(l => l.id === libraryId)?.name || 'Unknown';

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'issued': return 'bg-blue-100 text-blue-800';
        case 'overdue': return 'bg-red-100 text-red-800';
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
              <CardTitle>My Borrowed Books ({citizenTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {citizenTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">You haven't borrowed any books yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Book</th>
                        <th className="text-left py-3 px-4 font-semibold">Library</th>
                        <th className="text-left py-3 px-4 font-semibold">Issue Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Fine</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citizenTransactions.map(trans => (
                        <tr key={trans.id} className="border-b hover:bg-secondary/50">
                          <td className="py-3 px-4 font-medium">{getBookTitle(trans.bookId)}</td>
                          <td className="py-3 px-4 text-xs">{getLibraryName(trans.libraryId)}</td>
                          <td className="py-3 px-4 text-xs">{trans.issueDate}</td>
                          <td className="py-3 px-4 text-xs">{trans.dueDate}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(trans.status)}>
                              {trans.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold">₹{trans.fineAmount}</td>
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

  const transactions = useMemo(() => {
    let result = circulationTransactions.filter(t => t.status === 'issued' || t.status === 'overdue');
    if (isLibrarian && selectedLibrary) {
      result = result.filter(t => t.libraryId === selectedLibrary);
    }
    return result;
  }, [isLibrarian, selectedLibrary]);

  const stats = useMemo(() => {
    return {
      issued: transactions.filter(t => t.status === 'issued').length,
      overdue: transactions.filter(t => t.status === 'overdue').length,
      totalFines: transactions.reduce((sum, t) => sum + t.fineAmount, 0),
    };
  }, [transactions]);

  const getBookTitle = (bookId: string) => books.find(b => b.id === bookId)?.title || 'Unknown';
  const getMemberName = (memberId: string) => members.find(m => m.id === memberId)?.name || 'Unknown';
  const getLibraryName = (libraryId: string) => libraryBranches.find(l => l.id === libraryId)?.name || 'Unknown';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No borrowed resources</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Member</th>
                      <th className="text-left py-3 px-4 font-semibold">Book</th>
                      <th className="text-left py-3 px-4 font-semibold">Library</th>
                      <th className="text-left py-3 px-4 font-semibold">Issue Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(trans => (
                      <tr key={trans.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4 font-medium">{getMemberName(trans.memberId)}</td>
                        <td className="py-3 px-4">{getBookTitle(trans.bookId)}</td>
                        <td className="py-3 px-4 text-xs">{getLibraryName(trans.libraryId)}</td>
                        <td className="py-3 px-4 text-xs">{trans.issueDate}</td>
                        <td className="py-3 px-4 text-xs">{trans.dueDate}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(trans.status)}>
                            {trans.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">₹{trans.fineAmount}</td>
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

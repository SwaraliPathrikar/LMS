import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { circulationTransactions, books, members, libraryBranches } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CheckCircle, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const statusColors: Record<string, string> = {
  issued: 'bg-blue-100 text-blue-800',
  returned: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  lost: 'bg-gray-100 text-gray-800',
};

const statusIcons: Record<string, React.ElementType> = {
  issued: Clock,
  returned: CheckCircle,
  overdue: AlertCircle,
  lost: AlertCircle,
};

export default function CirculationManagement() {
  const { user, selectedLibrary, setSelectedLibrary } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const filtered = useMemo(() => {
    let result = circulationTransactions;
    
    // Filter by library if admin
    if (user?.role === 'admin' && selectedLibrary) {
      result = result.filter(t => t.libraryId === selectedLibrary);
    } else if (user?.role === 'librarian' && selectedLibrary) {
      result = result.filter(t => t.libraryId === selectedLibrary);
    }
    
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(t => {
        const m = members.find(m => m.id === t.memberId);
        const b = books.find(b => b.id === t.bookId);
        return m?.name.toLowerCase().includes(q) || b?.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      });
    }
    if (selectedStatus) {
      result = result.filter(t => t.status === selectedStatus);
    }
    return result;
  }, [query, selectedStatus, selectedLibrary, user?.role]);

  const stats = useMemo(() => {
    return {
      issued: circulationTransactions.filter(t => t.status === 'issued').length,
      returned: circulationTransactions.filter(t => t.status === 'returned').length,
      overdue: circulationTransactions.filter(t => t.status === 'overdue').length,
      lost: circulationTransactions.filter(t => t.status === 'lost').length,
    };
  }, []);

  const getBookTitle = (bookId: string) => books.find(b => b.id === bookId)?.title || 'Unknown';
  const getMemberName = (memberId: string) => members.find(m => m.id === memberId)?.name || 'Unknown';
  const getLibraryName = (libraryId: string) => libraryBranches.find(l => l.id === libraryId)?.name || 'Unknown';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Circulation Management</h1>
          <p className="text-muted-foreground mt-1">Track book issues, returns, and renewals</p>
        </div>

        {/* Library Selection for Admin */}
        {user?.role === 'admin' && (
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">Select Library</label>
            <Select value={selectedLibrary || ''} onValueChange={setSelectedLibrary}>
              <SelectTrigger>
                <SelectValue placeholder="Select a library..." />
              </SelectTrigger>
              <SelectContent>
                {libraryBranches.map(lib => (
                  <SelectItem key={lib.id} value={lib.id}>
                    {lib.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Currently Issued</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.issued}</p>
                </div>
                <Clock className="w-10 h-10 text-blue-600/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Returned</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.returned}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats.overdue}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-600/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lost</p>
                  <p className="text-3xl font-bold text-gray-600 mt-1">{stats.lost}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-gray-600/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input placeholder="Search by member name, book title, or transaction ID..." className="pl-10 h-12" value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={selectedStatus === null ? 'default' : 'outline'} onClick={() => setSelectedStatus(null)} className={selectedStatus === null ? 'bg-accent text-accent-foreground' : ''}>
            All Transactions
          </Button>
          {['issued', 'returned', 'overdue', 'lost'].map(status => (
            <Button key={status} size="sm" variant={selectedStatus === status ? 'default' : 'outline'} onClick={() => setSelectedStatus(status)} className={selectedStatus === status ? 'bg-accent text-accent-foreground' : ''}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Circulation Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Transaction ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Member</th>
                    <th className="text-left py-3 px-4 font-semibold">Book</th>
                    <th className="text-left py-3 px-4 font-semibold">Issue Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(transaction => {
                    const Icon = statusIcons[transaction.status];
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs">{transaction.id}</td>
                        <td className="py-3 px-4">{getMemberName(transaction.memberId)}</td>
                        <td className="py-3 px-4 max-w-xs truncate">{getBookTitle(transaction.bookId)}</td>
                        <td className="py-3 px-4">{transaction.issueDate}</td>
                        <td className="py-3 px-4">{transaction.dueDate}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[transaction.status]}>
                            <Icon size={12} className="mr-1" />
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedTransaction(transaction); setShowDetailDialog(true); }}>
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog - Properly Structured */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="w-[95vw] max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-3">
                <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs"><strong>ID:</strong> {selectedTransaction.id}</p>
                  <p className="text-xs"><strong>Member:</strong> {getMemberName(selectedTransaction.memberId)}</p>
                  <p className="text-xs"><strong>Book:</strong> {getBookTitle(selectedTransaction.bookId)}</p>
                  <p className="text-xs"><strong>Library:</strong> {getLibraryName(selectedTransaction.libraryId)}</p>
                  <p className="text-xs"><strong>Issue:</strong> {selectedTransaction.issueDate}</p>
                  <p className="text-xs"><strong>Due:</strong> {selectedTransaction.dueDate}</p>
                  {selectedTransaction.returnDate && <p className="text-xs"><strong>Return:</strong> {selectedTransaction.returnDate}</p>}
                  <p className="text-xs"><strong>Renewals:</strong> {selectedTransaction.renewalCount}</p>
                  <p className="text-xs"><strong>Fine:</strong> ₹{selectedTransaction.fineAmount}</p>
                  <p className="text-xs">
                    <strong>Status:</strong>{' '}
                    <Badge className={statusColors[selectedTransaction.status]}>{selectedTransaction.status}</Badge>
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="flex gap-2 flex-wrap mt-4 pt-4 border-t">
              <Button size="sm" variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
              {selectedTransaction?.status === 'issued' && (
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <CheckCircle size={14} className="mr-1" /> Return
                </Button>
              )}
              {selectedTransaction?.status === 'issued' && (
                <Button size="sm" variant="outline">
                  <RotateCcw size={14} className="mr-1" /> Renew
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

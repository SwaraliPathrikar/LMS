import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { circulationTransactions, books, members, libraryBranches } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function RenewalRequestsPage() {
  const { user, selectedLibrary, setSelectedLibrary } = useAuth();
  const navigate = useNavigate();
  const [selectedRenewal, setSelectedRenewal] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

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
          <h1 className="page-header">Renewal Requests</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can manage renewal requests.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Mock renewal requests based on circulation transactions
  const renewalRequests = useMemo(() => {
    let requests = circulationTransactions
      .filter(t => t.renewalCount < 2 && (t.status === 'issued' || t.status === 'overdue'))
      .map((t, idx) => ({
        id: `renewal-${idx}`,
        transactionId: t.id,
        memberId: t.memberId,
        bookId: t.bookId,
        currentDueDate: t.dueDate,
        newDueDate: new Date(new Date(t.dueDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        renewalCount: t.renewalCount,
        status: 'pending' as const,
        requestDate: new Date().toISOString().split('T')[0],
      }));

    if (isLibrarian && selectedLibrary) {
      requests = requests.filter(r => {
        const trans = circulationTransactions.find(t => t.id === r.transactionId);
        return trans?.libraryId === selectedLibrary;
      });
    }

    return requests;
  }, [isLibrarian, selectedLibrary]);

  const pending = renewalRequests.filter(r => r.status === 'pending');
  const approved = renewalRequests.filter(r => r.status === 'approved');
  const rejected = renewalRequests.filter(r => r.status === 'rejected');

  const getBookTitle = (bookId: string) => books.find(b => b.id === bookId)?.title || 'Unknown';
  const getMemberName = (memberId: string) => members.find(m => m.id === memberId)?.name || 'Unknown';

  const handleApprove = () => {
    toast.success(`Renewal approved for ${getBookTitle(selectedRenewal.bookId)}`);
    setShowDialog(false);
    setSelectedRenewal(null);
    setAction(null);
  };

  const handleReject = () => {
    toast.success(`Renewal request rejected`);
    setShowDialog(false);
    setSelectedRenewal(null);
    setAction(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">Renewal Requests</h1>
          <p className="text-muted-foreground mt-1">Manage book renewal requests from members</p>
        </div>

        {/* Library Selection for Admin */}
        {isAdmin && (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{pending.length}</p>
                </div>
                <Clock className="w-10 h-10 text-warning/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-success mt-1">{approved.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-success/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{rejected.length}</p>
                </div>
                <XCircle className="w-10 h-10 text-destructive/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Renewal Requests ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending renewal requests</p>
            ) : (
              <div className="space-y-3">
                {pending.map(req => (
                  <div key={req.id} className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{getMemberName(req.memberId)}</p>
                            <p className="text-xs text-muted-foreground">{getBookTitle(req.bookId)}</p>
                          </div>
                          <Badge variant="outline">{req.renewalCount}/2</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Current Due</p>
                            <p className="font-medium">{req.currentDueDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">New Due</p>
                            <p className="font-medium">{req.newDueDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Extension</p>
                            <p className="font-medium">14 days</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRenewal(req);
                          setShowDialog(true);
                        }}
                        className="w-full md:w-auto"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Renewal Request</DialogTitle>
            </DialogHeader>
            {selectedRenewal && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Member</p>
                    <p className="font-semibold">{getMemberName(selectedRenewal.memberId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Book</p>
                    <p className="font-semibold">{getBookTitle(selectedRenewal.bookId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Due Date</p>
                    <p className="font-semibold">{selectedRenewal.currentDueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Due Date</p>
                    <p className="font-semibold">{selectedRenewal.newDueDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Renewals Used</p>
                    <p className="font-semibold">{selectedRenewal.renewalCount} / 2</p>
                  </div>
                </div>

                <DialogFooter>
                  {action === null ? (
                    <>
                      <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={() => setAction('reject')}>Reject</Button>
                      <Button onClick={() => setAction('approve')}>Approve</Button>
                    </>
                  ) : action === 'approve' ? (
                    <>
                      <Button variant="outline" onClick={() => setAction(null)}>Back</Button>
                      <Button onClick={handleApprove}>Confirm Approval</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setAction(null)}>Back</Button>
                      <Button variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
                    </>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

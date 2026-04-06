import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { books, borrowRequests, libraryBranches } from '@/data/mockData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { FileText, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { fmtDate } from '@/lib/formatDate';

export default function MyRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }
  if (user.role !== 'citizen') { navigate('/admin/requests-approve'); return null; }

  return <CitizenRequestHistory />;
}

function CitizenRequestHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const myRequests = useMemo(() =>
    borrowRequests
      .filter(r => r.userId === user?.id)
      .sort((a, b) => b.requestDate.localeCompare(a.requestDate)),
    [user?.id]
  );

  const pendingCount  = myRequests.filter(r => r.status === 'pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = myRequests.filter(r => r.status === 'rejected').length;

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-success/15 text-success border-0">Approved</Badge>;
    if (status === 'rejected') return <Badge className="bg-destructive/15 text-destructive border-0">Rejected</Badge>;
    return <Badge className="bg-warning/15 text-warning border-0">Pending</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-header">My Requests</h1>
            <p className="text-muted-foreground mt-1">History of all your borrow requests</p>
          </div>
          <Button onClick={() => navigate('/borrow-requests')}>
            <Send size={14} className="mr-2" /> New Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl md:text-3xl font-bold text-warning mt-1">{pendingCount}</p>
                </div>
                <Clock className="w-7 h-7 md:w-10 md:h-10 text-warning/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl md:text-3xl font-bold text-success mt-1">{approvedCount}</p>
                </div>
                <CheckCircle className="w-7 h-7 md:w-10 md:h-10 text-success/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{rejectedCount}</p>
                </div>
                <XCircle className="w-7 h-7 md:w-10 md:h-10 text-destructive/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={18} /> Request History
            </CardTitle>
          </CardHeader>
          {myRequests.length === 0 ? (
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No requests yet.</p>
              <Button variant="outline" className="mt-3" onClick={() => navigate('/borrow-requests')}>
                <Send size={14} className="mr-1" /> Make your first request
              </Button>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Library</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myRequests.map(req => {
                    const book    = books.find(b => b.id === req.bookId);
                    const library = libraryBranches.find(l => l.id === req.libraryId);
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium text-sm">{book?.title ?? 'Unknown'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{library?.name ?? req.libraryId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{req.issueType}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{fmtDate(req.requestDate)}</TableCell>
                        <TableCell>{statusBadge(req.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {req.status === 'rejected' && req.rejectionReason
                            ? <span className="text-destructive text-xs">{req.rejectionReason}</span>
                            : req.responseDate ?? '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
}

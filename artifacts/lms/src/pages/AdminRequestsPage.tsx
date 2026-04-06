import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, AlertCircle, Mail } from 'lucide-react';
import { fmtDate, fmtDateTime } from '@/lib/formatDate';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminRequestsPage() {
  const { user, selectedLibrary } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role !== 'admin' && user.role !== 'librarian') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Borrow Requests</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can approve requests.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedLibrary) params.libraryId = selectedLibrary;
      const data = await api.borrow.list(params);
      setRequests(data.requests ?? data);
    } catch (e) {
      console.error('Failed to load borrow requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [selectedLibrary]);

  const pending = requests.filter(r => r.status === 'pending');
  const approved = requests.filter(r => r.status === 'approved');
  const rejected = requests.filter(r => r.status === 'rejected');

  const getBookTitle = (req: any) => req.book?.title || 'Unknown';
  const getMemberName = (req: any) => req.user?.name || 'Unknown';

  const handleApprove = async () => {
    try {
      await api.borrow.approve(selectedRequest.id);
      toast.success(
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-success mt-0.5" />
          <div>
            <p className="font-semibold">Request Approved!</p>
            <p className="text-sm text-muted-foreground">Notification sent via email and in-app</p>
          </div>
        </div>
      );
      await fetchRequests();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to approve request');
    }
    setShowDialog(false);
    setSelectedRequest(null);
    setRejectionReason('');
    setAction(null);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await api.borrow.reject(selectedRequest.id, rejectionReason);
      toast.info(
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <p className="font-semibold">Request Rejected</p>
            <p className="text-sm text-muted-foreground">Notification sent via email and in-app</p>
          </div>
        </div>
      );
      await fetchRequests();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to reject request');
    }
    setShowDialog(false);
    setSelectedRequest(null);
    setRejectionReason('');
    setAction(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">Borrow Requests</h1>
          <p className="text-muted-foreground mt-1">Review and manage all borrow requests from members</p>
        </div>

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
            <CardTitle>Pending Requests ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : pending.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {pending.map(req => (
                  <div key={req.id} className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{getMemberName(req)}</p>
                            <p className="text-xs text-muted-foreground">{getBookTitle(req)}</p>
                          </div>
                          <Badge variant="outline">{req.issueType}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Reason</p>
                            <p className="font-medium">{req.reason}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">{fmtDate(req.requestDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-medium text-warning">Pending</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowDialog(true);
                          setAction(null);
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

        {/* Approved Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-success">Approved Requests ({approved.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {approved.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No approved requests</p>
            ) : (
              <div className="space-y-3">
                {approved.map(req => (
                  <div key={req.id} className="p-4 rounded-lg border border-success/30 bg-success/5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{getMemberName(req)}</p>
                            <Badge className="bg-success/20 text-success border-0">Approved</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{getBookTitle(req)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{req.user?.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Request Date</p>
                          <p className="font-medium">{fmtDate(req.requestDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p className="font-medium">{req.dueDate ? fmtDate(req.dueDate) : '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Issue Type</p>
                          <p className="font-medium capitalize">{req.issueType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-success">
                        <Mail size={12} />
                        <span>Notification sent via email & in-app</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejected Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Rejected Requests ({rejected.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {rejected.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No rejected requests</p>
            ) : (
              <div className="space-y-3">
                {rejected.map(req => (
                  <div key={req.id} className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{getMemberName(req)}</p>
                            <Badge className="bg-destructive/20 text-destructive border-0">Rejected</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{getBookTitle(req)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{req.user?.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Request Date</p>
                          <p className="font-medium">{fmtDate(req.requestDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rejected Date</p>
                          <p className="font-medium">{req.responseDate ? fmtDate(req.responseDate) : '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Issue Type</p>
                          <p className="font-medium capitalize">{req.issueType}</p>
                        </div>
                      </div>
                      {req.rejectionReason && (
                        <div className="text-xs">
                          <p className="text-muted-foreground">Rejection Reason:</p>
                          <p className="font-medium text-destructive">{req.rejectionReason}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <Mail size={12} />
                        <span>Notification sent via email & in-app</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Borrow Request</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Member</p>
                    <p className="font-semibold">{getMemberName(selectedRequest)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{selectedRequest.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Book</p>
                    <p className="font-semibold">{getBookTitle(selectedRequest)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issue Type</p>
                    <p className="font-semibold">{selectedRequest.issueType}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="font-semibold">{selectedRequest.reason}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Purpose</p>
                    <p className="font-semibold">{selectedRequest.purpose}</p>
                  </div>
                </div>

                {action === 'reject' && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Rejection Reason</p>
                    <Textarea
                      placeholder="Provide reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-24"
                    />
                  </div>
                )}

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

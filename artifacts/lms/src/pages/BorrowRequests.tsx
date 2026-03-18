import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { borrowRequests, books, members, libraryBranches, notifications } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, CheckCircle, XCircle, Clock, AlertCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function BorrowRequests() {
  const { user, selectedLibrary } = useAuth();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  if (!user) return null;

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-warning/15 text-warning', label: 'Pending' },
    approved: { icon: CheckCircle, color: 'bg-success/15 text-success', label: 'Approved' },
    rejected: { icon: XCircle, color: 'bg-destructive/15 text-destructive', label: 'Rejected' },
  };

  // Filter requests based on role
  const filteredRequests = useMemo(() => {
    if (user.role === 'admin') {
      // Admin sees all requests
      return borrowRequests;
    } else if (user.role === 'librarian') {
      // Librarian sees requests for books in their library
      return borrowRequests.filter(req => req.libraryId === selectedLibrary);
    } else {
      // Citizen sees only their own requests
      return borrowRequests.filter(req => req.userId === user.id);
    }
  }, [user, selectedLibrary]);

  const handleApprove = (requestId: string) => {
    const request = borrowRequests.find(r => r.id === requestId);
    if (request) {
      const book = books.find(b => b.id === request.bookId);
      const library = libraryBranches.find(l => l.id === request.libraryId);
      
      request.status = 'approved';
      request.responseDate = new Date().toISOString().split('T')[0];
      request.notificationSent = true;
      
      // Create in-app notification
      const newNotification = {
        id: `n${Date.now()}`,
        userId: request.userId,
        type: 'approval' as const,
        title: 'Borrow Request Approved',
        message: `Your request for "${book?.title}" at ${library?.name} has been approved. You can now collect/access the book.`,
        read: false,
        createdAt: new Date().toISOString().split('T')[0],
        channel: 'in_system' as const,
        actionUrl: '/borrow-requests'
      };
      notifications.push(newNotification);
      
      // Simulate email notification
      console.log(`📧 Email sent to ${request.email}: Your borrow request for "${book?.title}" has been approved!`);
      
      toast.success(
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-success mt-0.5" />
          <div>
            <p className="font-semibold">Request Approved!</p>
            <p className="text-sm text-muted-foreground">Notification sent via email and in-app</p>
          </div>
        </div>
      );
    }
  };

  const handleReject = (requestId: string) => {
    const request = borrowRequests.find(r => r.id === requestId);
    if (request) {
      const book = books.find(b => b.id === request.bookId);
      const library = libraryBranches.find(l => l.id === request.libraryId);
      
      request.status = 'rejected';
      request.responseDate = new Date().toISOString().split('T')[0];
      request.rejectionReason = rejectReason;
      request.notificationSent = true;
      
      // Create in-app notification
      const newNotification = {
        id: `n${Date.now()}`,
        userId: request.userId,
        type: 'approval' as const,
        title: 'Borrow Request Rejected',
        message: `Your request for "${book?.title}" at ${library?.name} has been rejected. Reason: ${rejectReason}`,
        read: false,
        createdAt: new Date().toISOString().split('T')[0],
        channel: 'in_system' as const,
        actionUrl: '/borrow-requests'
      };
      notifications.push(newNotification);
      
      // Simulate email notification
      console.log(`📧 Email sent to ${request.email}: Your borrow request for "${book?.title}" has been rejected. Reason: ${rejectReason}`);
      
      toast.info(
        <div className="flex items-start gap-2">
          <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-semibold">Request Rejected</p>
            <p className="text-sm text-muted-foreground">Notification sent via email and in-app</p>
          </div>
        </div>
      );
      
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedRequest(null);
    }
  };

  // Show access denied for citizens if no requests
  if (user.role === 'citizen' && filteredRequests.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">My Borrow Requests</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">You haven't made any borrow requests yet.</p>
              <Button className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setShowNewRequest(true)}>
                <Send size={16} className="mr-2" /> Create New Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">
              {user.role === 'citizen' ? 'My Borrow Requests' : 'Borrow Requests'}
            </h1>
            {user.role === 'librarian' && (
              <p className="text-muted-foreground mt-1">Requests for books in your library</p>
            )}
            {user.role === 'admin' && (
              <p className="text-muted-foreground mt-1">All borrow requests across all libraries</p>
            )}
          </div>
          {user.role === 'citizen' && (
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setShowNewRequest(true)}>
              <Send size={16} className="mr-2" /> New Request
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map(req => {
              const book = books.find(b => b.id === req.bookId);
              const member = members.find(m => m.id === req.userId);
              const library = libraryBranches.find(l => l.id === req.libraryId);
              const status = statusConfig[req.status];
              const StatusIcon = status.icon;

              return (
                <Card key={req.id} className="stat-card">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{book?.title}</h3>
                          <Badge className={`${status.color} border-0`}>
                            <StatusIcon size={12} className="mr-1" /> {status.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground">
                          {user.role !== 'citizen' && (
                            <p>Requested by: <strong className="text-foreground">{member?.name || req.email}</strong></p>
                          )}
                          <p>Library: <strong className="text-foreground">{library?.name}</strong></p>
                          <p>Issue Type: <strong className="text-foreground capitalize">{req.issueType}</strong></p>
                          <p>Date: <strong className="text-foreground">{req.requestDate}</strong></p>
                          <p>Purpose: <strong className="text-foreground">{req.purpose}</strong></p>
                          <p>Contact: <strong className="text-foreground">{req.mobile}</strong></p>
                        </div>
                        <p className="text-sm text-muted-foreground">Reason: {req.reason}</p>
                        {req.status === 'rejected' && req.rejectionReason && (
                          <p className="text-sm text-destructive">Rejection Reason: {req.rejectionReason}</p>
                        )}
                        {req.status !== 'pending' && req.notificationSent && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Mail size={12} />
                            <span>Notification sent via email & in-app</span>
                          </div>
                        )}
                      </div>
                      {(user.role === 'admin' || user.role === 'librarian') && req.status === 'pending' && (
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleApprove(req.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive" onClick={() => { setSelectedRequest(req.id); setShowRejectDialog(true); }}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {user.role === 'librarian' ? 'No borrow requests for your library' : 'No borrow requests found'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* New Request Dialog */}
        <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Borrow Request</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); toast.success('Request submitted!'); setShowNewRequest(false); }}>
              <div className="space-y-2">
                <Label>Book Title / Keyword</Label>
                <Input placeholder="Search for a book..." />
              </div>
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <div className="flex gap-2">
                  {['Physical', 'Digital'].map(t => (
                    <Button key={t} type="button" variant="outline" size="sm">{t}</Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2"><Label>Reason</Label><Textarea placeholder="Why do you need this book?" /></div>
              <div className="space-y-2"><Label>Purpose</Label><Input placeholder="Academic / Research / Personal" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="your@email.com" /></div>
                <div className="space-y-2"><Label>Mobile</Label><Input placeholder="+91 XXXXX XXXXX" /></div>
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Submit Request</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-destructive">Reject Request</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reason for Rejection</Label>
                <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why this request is being rejected..." />
              </div>
              <Button className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={() => { handleReject(selectedRequest || ''); }}>
                Confirm Rejection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

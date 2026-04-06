import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, BookOpen, PlusCircle, AlertCircle } from 'lucide-react';
import { fmtDate } from '@/lib/formatDate';

const statusConfig = {
  pending:  { label: 'Pending',  icon: Clock,         className: 'bg-warning/20 text-warning border-warning/30' },
  approved: { label: 'Approved', icon: CheckCircle,   className: 'bg-success/20 text-success border-success/30' },
  rejected: { label: 'Rejected', icon: XCircle,       className: 'bg-destructive/20 text-destructive border-destructive/30' },
};

export default function CitizenMyRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    api.borrow.list({ limit: '100' }).then(d => setMyRequests(d.requests ?? d)).catch(console.error);
  }, []);

  if (!user) { navigate('/login'); return null; }
  if (user.role !== 'citizen') { navigate('/dashboard'); return null; }

  const getBook = (req: any) => req.book;
  const getLibrary = (req: any) => req.library;

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-header">My Requests</h1>
            <p className="text-muted-foreground mt-1">Track the status of your borrow requests</p>
          </div>
          <Button size="sm" onClick={() => navigate('/borrow-requests')}>
            <PlusCircle size={14} className="mr-2" /> New Request
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {(['pending', 'approved', 'rejected'] as const).map(status => {
            const count = myRequests.filter(r => r.status === status).length;
            const cfg = statusConfig[status];
            const Icon = cfg.icon;
            return (
              <Card key={status} className="stat-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground capitalize">{cfg.label}</p>
                    <p className="text-2xl font-bold mt-0.5">{count}</p>
                  </div>
                  <Icon size={24} className="opacity-30" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {myRequests.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-muted-foreground">No requests yet</p>
              <p className="text-sm text-muted-foreground mt-1">Submit a borrow request to get started</p>
              <Button className="mt-4" size="sm" onClick={() => navigate('/borrow-requests')}>
                <PlusCircle size={14} className="mr-2" /> Make a Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myRequests.map(req => {
              const book = getBook(req);
              const library = getLibrary(req);
              const cfg = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending;
              const Icon = cfg.icon;
              return (
                <Card key={req.id} className={`border ${cfg.className.includes('success') ? 'border-success/20' : cfg.className.includes('destructive') ? 'border-destructive/20' : 'border-warning/20'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm truncate">{book?.title ?? req.bookId}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 capitalize">{req.issueType}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{book?.author} · {book?.genre}</p>
                        <p className="text-xs text-muted-foreground">Library: {library?.name ?? req.libraryId}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Reason: </span>
                            <span>{req.reason}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Requested: </span>
                            <span>{fmtDate(req.requestDate)}</span>
                          </div>
                          {req.responseDate && (
                            <div>
                              <span className="text-muted-foreground">Response: </span>
                              <span>{fmtDate(req.responseDate)}</span>
                            </div>
                          )}
                          {req.rejectionReason && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Rejection reason: </span>
                              <span className="text-destructive">{req.rejectionReason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Icon size={14} />
                        <span className={`text-xs font-semibold`}>{cfg.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

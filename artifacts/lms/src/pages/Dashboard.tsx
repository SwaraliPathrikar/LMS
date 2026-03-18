import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { libraryBranches, members, circulationTransactions, getLibraryMetrics, getAllLibrariesMetrics, getAggregatedMetrics, getOverborrowedBooks, getOverborrowedBooksCount, getOverbookedCount, getOverbookedMembers, getOverdueAnalytics, getFinesAnalytics, getActiveUsersAnalytics, getNewMembersAnalytics, getOnTimeReturnRate, getAvgBorrowDuration, getBookUtilizationRate, getTop5BorrowedBooks, getLowStockAlerts, getPeakUsageTime, getDashboardAlerts } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BookOpen, Users, AlertCircle, ArrowRight, Bell, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { notifications } from '@/data/mockData';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role === 'citizen') {
    return <CitizenDashboard />;
  }

  return <AdminLibrarianDashboard />;
}


function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const citizenStats = {
    borrowedBooks: 3,
    overdueBooks: 1,
    finesDue: 50,
    membershipStatus: 'active',
    membershipExpiry: '2025-06-15',
    upcomingDueDate: '2026-03-25',
  };

  // Get unread notifications for the citizen
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => n.userId === user?.id && !n.read);
  }, [user?.id]);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">My Library Account</h1>
          <p className="text-muted-foreground mt-1">Welcome, {user?.name}! Manage your library activities</p>
        </div>

        {/* Notification Alert */}
        {unreadNotifications.length > 0 && (
          <Card className="border-accent/50 bg-accent/5 cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => navigate('/notifications')}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">You have {unreadNotifications.length} new notification{unreadNotifications.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to view your notifications</p>
                </div>
                <ArrowRight className="w-4 h-4 text-accent" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Books Borrowed</p>
                  <p className="text-2xl md:text-3xl font-bold text-accent mt-1">{citizenStats.borrowedBooks}</p>
                </div>
                <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-accent/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Overdue Books</p>
                  <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{citizenStats.overdueBooks}</p>
                </div>
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-destructive/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Fines Due</p>
                  <p className="text-2xl md:text-3xl font-bold text-warning mt-1">₹{citizenStats.finesDue}</p>
                </div>
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-warning/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Membership</p>
                  <p className="text-2xl md:text-3xl font-bold text-info mt-1 capitalize">{citizenStats.membershipStatus}</p>
                </div>
                <Users className="w-8 h-8 md:w-10 md:h-10 text-info/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {citizenStats.overdueBooks > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">You have {citizenStats.overdueBooks} overdue book(s)</p>
                  <p className="text-xs text-muted-foreground mt-1">Please return them to avoid additional fines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {citizenStats.finesDue > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">You have ₹{citizenStats.finesDue} in fines due</p>
                  <p className="text-xs text-muted-foreground mt-1">Pay now to avoid suspension of borrowing privileges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={() => navigate('/books/search')} className="bg-accent hover:bg-accent/90 text-accent-foreground justify-between">
                <span>Search Books</span>
                <ArrowRight size={16} />
              </Button>
              <Button onClick={() => navigate('/notifications')} variant="outline" className="justify-between relative">
                <span>View Notifications</span>
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
                <ArrowRight size={16} />
              </Button>
              <Button onClick={() => navigate('/events')} variant="outline" className="justify-between">
                <span>Browse Events</span>
                <ArrowRight size={16} />
              </Button>
              <Button onClick={() => navigate('/user/borrowed')} variant="outline" className="justify-between">
                <span>My Borrowed Books</span>
                <ArrowRight size={16} />
              </Button>
              <Button onClick={() => navigate('/borrow-requests')} variant="outline" className="justify-between">
                <span>My Requests</span>
                <ArrowRight size={16} />
              </Button>
              <Button onClick={() => navigate('/fees')} variant="outline" className="justify-between">
                <span>Pay Fines</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Membership Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
              <span className="text-sm">Membership Status</span>
              <span className="font-semibold capitalize text-accent">{citizenStats.membershipStatus}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
              <span className="text-sm">Expires On</span>
              <span className="font-semibold">{citizenStats.membershipExpiry}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
              <span className="text-sm">Next Book Due</span>
              <span className="font-semibold">{citizenStats.upcomingDueDate}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-sm">
                <span>Borrowed "Wings of Fire"</span>
                <span className="text-muted-foreground">2 days ago</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-sm">
                <span>Returned "The Discovery of India"</span>
                <span className="text-muted-foreground">5 days ago</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-sm">
                <span>Registered for "Summer Reading Program"</span>
                <span className="text-muted-foreground">1 week ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// ADMIN/LIBRARIAN DASHBOARD ROUTER
// ============================================================================

function AdminLibrarianDashboard() {
  const { user } = useAuth();

  if (user?.role === 'librarian') {
    return <LibrarianDashboard />;
  }

  return <AdminDashboard />;
}

// ============================================================================
// LIBRARIAN DASHBOARD
// ============================================================================

function LibrarianDashboard() {
  const { selectedLibrary } = useAuth();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState<string | null>(null);
  const [showOverborrowedDialog, setShowOverborrowedDialog] = useState(false);

  const metrics = useMemo(() => {
    if (!selectedLibrary) return null;
    return getLibraryMetrics(selectedLibrary);
  }, [selectedLibrary]);

  const overborrowedBooks = useMemo(() => getOverborrowedBooks(selectedLibrary ?? undefined), [selectedLibrary]);
  const library = libraryBranches.find(b => b.id === selectedLibrary);

  const handleCardClick = (metricType: string) => {
    setSelectedMetricType(metricType);
    setShowDetails(true);
  };

  if (!metrics || !library) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Library Dashboard</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Please select a library from the sidebar</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">{library.name} Dashboard</h1>
          <p className="text-muted-foreground mt-1">Library-specific metrics and analytics</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleCardClick('books')}>
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Total Books</p>
                <p className="text-2xl md:text-3xl font-bold text-accent mt-1">{metrics.totalBooks}</p>
                <p className="text-xs text-muted-foreground mt-1">Physical + Digital</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleCardClick('members')}>
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Members</p>
                <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{metrics.totalMembers}</p>
                <p className="text-xs text-muted-foreground mt-1">Active Members</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleCardClick('borrowed')}>
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Borrowed</p>
                <p className="text-2xl md:text-3xl font-bold text-info mt-1">{metrics.currentBorrowedBooks}</p>
                <p className="text-xs text-muted-foreground mt-1">Physical Books</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleCardClick('downloads')}>
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Downloads</p>
                <p className="text-2xl md:text-3xl font-bold text-success mt-1">{metrics.currentDownloads}</p>
                <p className="text-xs text-muted-foreground mt-1">Digital Books</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl md:text-3xl font-bold text-warning mt-1">{metrics.utilizationPercentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">Library Usage</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleCardClick('overborrowed')}>
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Overborrowed</p>
                <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{getOverborrowedBooksCount(selectedLibrary ?? undefined)}</p>
                <p className="text-xs text-muted-foreground mt-1">Book titles over capacity</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={() => navigate('/members')} variant="outline" className="justify-between">
                <span>Manage Members</span>
                <ArrowRight size={16} />
              </Button>
              <Button onClick={() => navigate('/fees')} variant="outline" className="justify-between">
                <span>Manage Fines</span>
                <ArrowRight size={16} />
              </Button>
              <Button onClick={() => navigate('/events')} variant="outline" className="justify-between">
                <span>Manage Events</span>
                <ArrowRight size={16} />
              </Button>
              <Button onClick={() => navigate('/circulation')} variant="outline" className="justify-between">
                <span>Circulation</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl max-h-[calc(100vh-100px)] overflow-y-auto sm:top-[15%] sm:translate-y-0">
            <DialogHeader>
              <DialogTitle>
                {selectedMetricType === 'books' && 'Total Books Breakdown'}
                {selectedMetricType === 'members' && 'Members Breakdown'}
                {selectedMetricType === 'borrowed' && 'Borrowed Books Breakdown'}
                {selectedMetricType === 'downloads' && 'Downloads Breakdown'}
                {selectedMetricType === 'overborrowed' && 'Overborrowed Books'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedMetricType === 'books' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-accent/10">
                    <p className="text-sm text-muted-foreground">Physical Books</p>
                    <p className="text-3xl font-bold text-accent mt-1">{metrics.totalBooks - metrics.currentDownloads}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10">
                    <p className="text-sm text-muted-foreground">Digital Books</p>
                    <p className="text-3xl font-bold text-success mt-1">{metrics.currentDownloads}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold text-primary mt-1">{metrics.totalBooks}</p>
                  </div>
                </div>
              )}
              {selectedMetricType === 'members' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-3xl font-bold text-primary mt-1">{metrics.totalMembers}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-info/10">
                    <p className="text-sm text-muted-foreground">Library</p>
                    <p className="text-lg font-semibold text-info mt-1">{library.name}</p>
                  </div>
                </div>
              )}
              {selectedMetricType === 'borrowed' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-info/10">
                    <p className="text-sm text-muted-foreground">Currently Borrowed</p>
                    <p className="text-3xl font-bold text-info mt-1">{metrics.currentBorrowedBooks}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/10">
                    <p className="text-sm text-muted-foreground">Library</p>
                    <p className="text-lg font-semibold text-warning mt-1">{library.name}</p>
                  </div>
                </div>
              )}
              {selectedMetricType === 'downloads' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-success/10">
                    <p className="text-sm text-muted-foreground">Total Downloads</p>
                    <p className="text-3xl font-bold text-success mt-1">{metrics.currentDownloads}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/10">
                    <p className="text-sm text-muted-foreground">Library</p>
                    <p className="text-lg font-semibold text-accent mt-1">{library.name}</p>
                  </div>
                </div>
              )}
              {selectedMetricType === 'overborrowed' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-destructive/10">
                    <p className="text-sm text-muted-foreground">Overborrowed Book Titles</p>
                    <p className="text-3xl font-bold text-destructive mt-1">{getOverborrowedBooksCount(selectedLibrary ?? undefined)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active borrowings + approved requests exceed total copies</p>
                  </div>
                  {getOverborrowedBooks(selectedLibrary ?? undefined).length === 0 ? (
                    <div className="p-4 rounded-lg bg-success/10 text-center">
                      <p className="text-sm text-success font-medium">No overborrowed books right now</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Book Title</th>
                            <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Author</th>
                            <th className="text-center py-2 pr-3 text-muted-foreground font-medium">Total Copies</th>
                            <th className="text-center py-2 pr-3 text-muted-foreground font-medium">Active</th>
                            <th className="text-center py-2 pr-3 text-muted-foreground font-medium">Pending</th>
                            <th className="text-center py-2 text-muted-foreground font-medium">Over By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getOverborrowedBooks(selectedLibrary ?? undefined).map(book => (
                            <tr key={book.bookId} className="border-b border-destructive/20 bg-destructive/5">
                              <td className="py-2 pr-3 font-medium">{book.title}</td>
                              <td className="py-2 pr-3 text-muted-foreground">{book.author}</td>
                              <td className="py-2 pr-3 text-center">{book.totalCount}</td>
                              <td className="py-2 pr-3 text-center text-info font-semibold">{book.activeBorrowings}</td>
                              <td className="py-2 pr-3 text-center text-warning font-semibold">{book.pendingRequests}</td>
                              <td className="py-2 text-center">
                                <span className="inline-block bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                                  +{book.overborrowedCount}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function AdminDashboard() {
  const [showLibraryDetails, setShowLibraryDetails] = useState(false);
  const [selectedLibraryForDetails, setSelectedLibraryForDetails] = useState<string | null>(null);
  const [selectedMetricType, setSelectedMetricType] = useState<string | null>(null);

  const aggregated = useMemo(() => getAggregatedMetrics(), []);
  const allMetrics = useMemo(() => getAllLibrariesMetrics(), []);
  const overdueData = useMemo(() => getOverdueAnalytics(), []);
  const finesData = useMemo(() => getFinesAnalytics(), []);
  const activeUsers = useMemo(() => getActiveUsersAnalytics(), []);
  const newMembers = useMemo(() => getNewMembersAnalytics(), []);
  const onTimeData = useMemo(() => getOnTimeReturnRate(), []);
  const avgDuration = useMemo(() => getAvgBorrowDuration(), []);
  const utilizationData = useMemo(() => getBookUtilizationRate(), []);

  const selectedMetrics = selectedLibraryForDetails
    ? allMetrics.find(m => m.libraryId === selectedLibraryForDetails)
    : null;

  const handleMetricCardClick = (metricType: string) => {
    setSelectedMetricType(metricType);
    setSelectedLibraryForDetails(null);
    setShowLibraryDetails(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">Municipal Library Dashboard</h1>
          <p className="text-muted-foreground mt-1">City-wide metrics and analytics</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* ── Row 1-2: Core Metrics ── */}
          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleMetricCardClick('books')}>
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Total Books</p>
              <p className="text-2xl md:text-3xl font-bold text-accent mt-1">{aggregated.totalBooks}</p>
              <p className="text-xs text-muted-foreground mt-1">All Libraries</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleMetricCardClick('members')}>
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{aggregated.totalMembers}</p>
              <p className="text-xs text-muted-foreground mt-1">All Libraries</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleMetricCardClick('borrowed')}>
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Borrowed</p>
              <p className="text-2xl md:text-3xl font-bold text-info mt-1">{aggregated.totalBorrowedBooks}</p>
              <p className="text-xs text-muted-foreground mt-1">Physical Books</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleMetricCardClick('downloads')}>
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Downloads</p>
              <p className="text-2xl md:text-3xl font-bold text-success mt-1">{aggregated.totalDownloads}</p>
              <p className="text-xs text-muted-foreground mt-1">Digital Books</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Avg Utilization</p>
              <p className="text-2xl md:text-3xl font-bold text-warning mt-1">{aggregated.averageUtilization}%</p>
              <p className="text-xs text-muted-foreground mt-1">All Libraries</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover:shadow-lg transition-all" onClick={() => handleMetricCardClick('overborrowed')}>
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Overborrowed</p>
              <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{getOverborrowedBooksCount()}</p>
              <p className="text-xs text-muted-foreground mt-1">Book titles over capacity</p>
            </div></CardContent>
          </Card>

          {/* ── Row 3-4: Advanced Analytics ── */}
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Overdue Books</p>
              <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{overdueData.overdue}</p>
              <p className="text-xs text-destructive/70 mt-1">{overdueData.pct}% of borrowed</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Total Fines</p>
              <p className="text-2xl md:text-3xl font-bold text-warning mt-1">₹{finesData.collected + finesData.pending}</p>
              <p className="text-xs text-success mt-1">Collected ₹{finesData.collected}</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl md:text-3xl font-bold text-info mt-1">{activeUsers.active}</p>
              <p className="text-xs text-muted-foreground mt-1">Inactive: {activeUsers.inactive}</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">New Members</p>
              <p className="text-2xl md:text-3xl font-bold text-success mt-1">{newMembers.thisMonth}</p>
              <p className={`text-xs mt-1 font-medium ${newMembers.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                {newMembers.growth >= 0 ? '↑' : '↓'} {Math.abs(newMembers.growth)}% this month
              </p>
            </div></CardContent>
          </Card>

          {/* ── Row 5: Performance Metrics ── */}
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">On-Time Returns</p>
              <p className="text-2xl md:text-3xl font-bold text-success mt-1">{onTimeData.rate}%</p>
              <p className="text-xs text-muted-foreground mt-1">{onTimeData.onTime}/{onTimeData.total} returns</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Avg Borrow Duration</p>
              <p className="text-2xl md:text-3xl font-bold text-accent mt-1">{avgDuration}</p>
              <p className="text-xs text-muted-foreground mt-1">days per book</p>
            </div></CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6"><div className="flex flex-col items-center text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Book Utilization</p>
              <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{utilizationData.rate}%</p>
              <p className="text-xs text-muted-foreground mt-1">{utilizationData.borrowed}/{utilizationData.totalCopies} copies</p>
            </div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Library-Wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allMetrics.map(metric => (
                <div key={metric.libraryId} className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm md:text-base">{metric.libraryName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2 text-xs md:text-sm">
                        <div>
                          <p className="text-muted-foreground">Books</p>
                          <p className="font-bold text-accent">{metric.totalBooks}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Members</p>
                          <p className="font-bold text-primary">{metric.totalMembers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Borrowed</p>
                          <p className="font-bold text-info">{metric.currentBorrowedBooks}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Downloads</p>
                          <p className="font-bold text-success">{metric.currentDownloads}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <p className="font-bold text-warning">{metric.utilizationPercentage}%</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedLibraryForDetails(metric.libraryId);
                        setSelectedMetricType(null);
                        setShowLibraryDetails(true);
                      }}
                      className="w-full md:w-auto"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showLibraryDetails} onOpenChange={setShowLibraryDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto sm:top-[15%] sm:translate-y-0">
            <DialogHeader>
              <DialogTitle>
                {selectedMetricType === 'books' && 'Total Books - Library-Wise Breakdown'}
                {selectedMetricType === 'members' && 'Total Members - Library-Wise Breakdown'}
                {selectedMetricType === 'borrowed' && 'Borrowed Books - Library-Wise Breakdown'}
                {selectedMetricType === 'downloads' && 'Downloads - Library-Wise Breakdown'}
                {selectedMetricType === 'overborrowed' && 'Overborrowed Books - Library-Wise Breakdown'}
                {selectedLibraryForDetails && !selectedMetricType && `${selectedMetrics?.libraryName} - Detailed Metrics`}
              </DialogTitle>
            </DialogHeader>

            {selectedMetricType === 'books' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-muted-foreground">Total Books (All Libraries)</p>
                  <p className="text-4xl font-bold text-accent mt-2">{aggregated.totalBooks}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Breakdown by Library:</h4>
                  <div className="space-y-2">
                    {allMetrics.map(metric => (
                      <div key={metric.libraryId} className="p-3 rounded-lg bg-secondary/50 border border-secondary">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{metric.libraryName}</span>
                          <span className="text-lg font-bold text-accent">{metric.totalBooks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedMetricType === 'members' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Total Members (All Libraries)</p>
                  <p className="text-4xl font-bold text-primary mt-2">{aggregated.totalMembers}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Breakdown by Library:</h4>
                  <div className="space-y-2">
                    {allMetrics.map(metric => (
                      <div key={metric.libraryId} className="p-3 rounded-lg bg-secondary/50 border border-secondary">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{metric.libraryName}</span>
                          <span className="text-lg font-bold text-primary">{metric.totalMembers}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedMetricType === 'borrowed' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                  <p className="text-sm text-muted-foreground">Total Borrowed Books (All Libraries)</p>
                  <p className="text-4xl font-bold text-info mt-2">{aggregated.totalBorrowedBooks}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Breakdown by Library:</h4>
                  <div className="space-y-2">
                    {allMetrics.map(metric => (
                      <div key={metric.libraryId} className="p-3 rounded-lg bg-secondary/50 border border-secondary">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{metric.libraryName}</span>
                          <span className="text-lg font-bold text-info">{metric.currentBorrowedBooks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedMetricType === 'downloads' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-muted-foreground">Total Downloads (All Libraries)</p>
                  <p className="text-4xl font-bold text-success mt-2">{aggregated.totalDownloads}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Breakdown by Library:</h4>
                  <div className="space-y-2">
                    {allMetrics.map(metric => (
                      <div key={metric.libraryId} className="p-3 rounded-lg bg-secondary/50 border border-secondary">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{metric.libraryName}</span>
                          <span className="text-lg font-bold text-success">{metric.currentDownloads}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedMetricType === 'overborrowed' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-muted-foreground">Total Overborrowed Book Titles</p>
                  <p className="text-4xl font-bold text-destructive mt-2">{getOverborrowedBooksCount()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Books where active borrowings + approved requests exceed total copies</p>
                </div>
                {getOverborrowedBooks().length === 0 ? (
                  <div className="p-4 rounded-lg bg-success/10 text-center">
                    <p className="text-sm text-success font-medium">No overborrowed books right now</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Book Title</th>
                          <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Author</th>
                          <th className="text-center py-2 pr-3 text-muted-foreground font-medium">Total Copies</th>
                          <th className="text-center py-2 pr-3 text-muted-foreground font-medium">Active Borrowings</th>
                          <th className="text-center py-2 pr-3 text-muted-foreground font-medium">Pending Requests</th>
                          <th className="text-center py-2 text-muted-foreground font-medium">Overborrowed By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getOverborrowedBooks().map(book => (
                          <tr key={book.bookId} className="border-b border-destructive/20 bg-destructive/5">
                            <td className="py-2 pr-3 font-medium">{book.title}</td>
                            <td className="py-2 pr-3 text-muted-foreground">{book.author}</td>
                            <td className="py-2 pr-3 text-center">{book.totalCount}</td>
                            <td className="py-2 pr-3 text-center text-info font-semibold">{book.activeBorrowings}</td>
                            <td className="py-2 pr-3 text-center text-warning font-semibold">{book.pendingRequests}</td>
                            <td className="py-2 text-center">
                              <span className="inline-block bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                                +{book.overborrowedCount}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {selectedLibraryForDetails && !selectedMetricType && selectedMetrics && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <p className="text-xs text-muted-foreground">Total Books</p>
                    <p className="text-2xl font-bold text-accent mt-1">{selectedMetrics.totalBooks}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="text-2xl font-bold text-primary mt-1">{selectedMetrics.totalMembers}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-info/10">
                    <p className="text-xs text-muted-foreground">Borrowed</p>
                    <p className="text-2xl font-bold text-info mt-1">{selectedMetrics.currentBorrowedBooks}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10">
                    <p className="text-xs text-muted-foreground">Downloads</p>
                    <p className="text-2xl font-bold text-success mt-1">{selectedMetrics.currentDownloads}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10">
                    <p className="text-xs text-muted-foreground">Utilization</p>
                    <p className="text-2xl font-bold text-warning mt-1">{selectedMetrics.utilizationPercentage}%</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      
        <AdminSmartInsights />

      </div>
    </DashboardLayout>
  );
}

function AdminAdvancedAnalytics() {
  const overdue = useMemo(() => getOverdueAnalytics(), []);
  const finesData = useMemo(() => getFinesAnalytics(), []);
  const activeUsers = useMemo(() => getActiveUsersAnalytics(), []);
  const newMembers = useMemo(() => getNewMembersAnalytics(), []);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">Advanced Analytics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {/* Overdue Books */}
        <Card className="stat-card">
          <CardContent className="p-3 md:p-5">
            <p className="text-xs text-muted-foreground">Overdue Books</p>
            <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{overdue.overdue}</p>
            <p className="text-xs text-destructive/70 mt-1">{overdue.pct}% of borrowed</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total borrowed: {overdue.totalBorrowed}</p>
          </CardContent>
        </Card>

        {/* Total Fines */}
        <Card className="stat-card">
          <CardContent className="p-3 md:p-5">
            <p className="text-xs text-muted-foreground">Total Fines</p>
            <p className="text-2xl md:text-3xl font-bold text-warning mt-1">₹{finesData.collected + finesData.pending}</p>
            <p className="text-xs text-success mt-1">Collected: ₹{finesData.collected}</p>
            <p className="text-xs text-destructive mt-0.5">Pending: ₹{finesData.pending}</p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="stat-card">
          <CardContent className="p-3 md:p-5">
            <p className="text-xs text-muted-foreground">Active Users</p>
            <p className="text-2xl md:text-3xl font-bold text-info mt-1">{activeUsers.active}</p>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            <p className="text-xs text-muted-foreground mt-0.5">Inactive: {activeUsers.inactive}</p>
          </CardContent>
        </Card>

        {/* New Members */}
        <Card className="stat-card">
          <CardContent className="p-3 md:p-5">
            <p className="text-xs text-muted-foreground">New Members</p>
            <p className="text-2xl md:text-3xl font-bold text-success mt-1">{newMembers.thisMonth}</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
            <p className={`text-xs mt-0.5 font-medium ${newMembers.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
              {newMembers.growth >= 0 ? '↑' : '↓'} {Math.abs(newMembers.growth)}% vs last month
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ============================================================================
// PERFORMANCE METRICS SECTION
// ============================================================================

function AdminPerformanceMetrics() {
  const onTime = useMemo(() => getOnTimeReturnRate(), []);
  const avgDuration = useMemo(() => getAvgBorrowDuration(), []);
  const utilization = useMemo(() => getBookUtilizationRate(), []);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">Performance Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* On-Time Return Rate */}
        <Card className="stat-card">
          <CardContent className="p-3 md:p-5">
            <p className="text-xs text-muted-foreground">On-Time Return Rate</p>
            <p className="text-2xl md:text-3xl font-bold text-success mt-1">{onTime.rate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Books returned on time</p>
            <p className="text-xs text-muted-foreground mt-0.5">{onTime.onTime} of {onTime.total} returns</p>
          </CardContent>
        </Card>

        {/* Average Borrow Duration */}
        <Card className="stat-card">
          <CardContent className="p-3 md:p-5">
            <p className="text-xs text-muted-foreground">Avg Borrow Duration</p>
            <p className="text-2xl md:text-3xl font-bold text-accent mt-1">{avgDuration} <span className="text-base font-normal">days</span></p>
            <p className="text-xs text-muted-foreground mt-1">Average time a book is kept</p>
          </CardContent>
        </Card>

        {/* Book Utilization Rate */}
        <Card className="stat-card">
          <CardContent className="p-3 md:p-5">
            <p className="text-xs text-muted-foreground">Book Utilization Rate</p>
            <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{utilization.rate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Borrowed / Total copies</p>
            <p className="text-xs text-muted-foreground mt-0.5">{utilization.borrowed} of {utilization.totalCopies} copies</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ============================================================================
// SMART INSIGHTS + ALERTS SECTION
// ============================================================================

function AdminSmartInsights() {
  const top5 = useMemo(() => getTop5BorrowedBooks(), []);
  const lowStock = useMemo(() => getLowStockAlerts(), []);
  const peakTime = useMemo(() => getPeakUsageTime(), []);
  const alerts = useMemo(() => getDashboardAlerts(), []);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">Smart Insights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left: Most Borrowed + Low Stock */}
        <div className="lg:col-span-2 space-y-4">

          {/* Most Borrowed Books */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Most Borrowed Books</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {top5.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data available</p>
              ) : (
                <div className="space-y-2">
                  {top5.map((book, i) => (
                    <div key={book.bookId} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0 text-xs">{book.count} borrows</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                Low Stock Alert
                {lowStock.length > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">{lowStock.length}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {lowStock.length === 0 ? (
                <p className="text-xs text-success font-medium">All books have adequate stock</p>
              ) : (
                <div className="space-y-2">
                  {lowStock.map(item => (
                    <div key={`${item.bookId}-${item.libraryId}`} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.available} of {item.total} available · {item.pendingRequests} pending</p>
                      </div>
                      <span className={`text-xs font-bold ml-2 shrink-0 ${item.available === 0 ? 'text-destructive' : 'text-warning'}`}>
                        {item.available === 0 ? 'Out of stock' : 'Low'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Peak Usage Time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Peak Usage Time</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold text-accent">{peakTime}</p>
                  <p className="text-xs text-muted-foreground">Most active check-in window</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right: Alerts Panel */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">

              <div className={`flex items-start gap-3 p-3 rounded-lg ${alerts.overdue > 0 ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'}`}>
                <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${alerts.overdue > 0 ? 'text-destructive' : 'text-success'}`} />
                <div>
                  <p className={`text-sm font-semibold ${alerts.overdue > 0 ? 'text-destructive' : 'text-success'}`}>
                    Overdue Books
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alerts.overdue > 0 ? `${alerts.overdue} book(s) are overdue` : 'No overdue books'}
                  </p>
                </div>
                {alerts.overdue > 0 && (
                  <span className="ml-auto text-xs font-bold text-destructive shrink-0">{alerts.overdue}</span>
                )}
              </div>

              <div className={`flex items-start gap-3 p-3 rounded-lg ${alerts.lowStock > 0 ? 'bg-warning/10 border border-warning/20' : 'bg-success/10 border border-success/20'}`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alerts.lowStock > 0 ? 'text-warning' : 'text-success'}`} />
                <div>
                  <p className={`text-sm font-semibold ${alerts.lowStock > 0 ? 'text-warning' : 'text-success'}`}>
                    Low Stock
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alerts.lowStock > 0 ? `${alerts.lowStock} book title(s) running low` : 'Stock levels are healthy'}
                  </p>
                </div>
                {alerts.lowStock > 0 && (
                  <span className="ml-auto text-xs font-bold text-warning shrink-0">{alerts.lowStock}</span>
                )}
              </div>

              <div className={`flex items-start gap-3 p-3 rounded-lg ${alerts.pendingReservations > 0 ? 'bg-info/10 border border-info/20' : 'bg-success/10 border border-success/20'}`}>
                <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${alerts.pendingReservations > 0 ? 'text-info' : 'text-success'}`} />
                <div>
                  <p className={`text-sm font-semibold ${alerts.pendingReservations > 0 ? 'text-info' : 'text-success'}`}>
                    Pending Reservations
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alerts.pendingReservations > 0 ? `${alerts.pendingReservations} request(s) awaiting approval` : 'No pending requests'}
                  </p>
                </div>
                {alerts.pendingReservations > 0 && (
                  <span className="ml-auto text-xs font-bold text-info shrink-0">{alerts.pendingReservations}</span>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

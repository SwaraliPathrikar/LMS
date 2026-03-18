import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getLibraryAnalytics, 
  getAllLibrariesAnalytics, 
  getMostUtilizedLibrary, 
  getLibraryWithMostDefaulters,
  getTopBorrowedBooks,
  getSystemStatistics,
  libraryBranches,
} from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertCircle, BookOpen, Download } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ReportsAnalyticsPage() {
  const { user, selectedLibrary } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role === 'citizen') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Reports & Analytics</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can access reports.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (user.role === 'admin') {
    return <AdminReports />;
  }

  return <LibrarianReports />;
}

// ============================================================================
// ADMIN REPORTS & ANALYTICS
// ============================================================================

function AdminReports() {
  const [showLibraryDetails, setShowLibraryDetails] = useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);

  const systemStats = useMemo(() => getSystemStatistics(), []);
  const allAnalytics = useMemo(() => getAllLibrariesAnalytics(), []);
  const mostUtilized = useMemo(() => getMostUtilizedLibrary(), []);
  const mostDefaulters = useMemo(() => getLibraryWithMostDefaulters(), []);
  const topBooks = useMemo(() => getTopBorrowedBooks(5), []);

  const selectedAnalytics = selectedLibraryId ? allAnalytics.find(a => a.libraryId === selectedLibraryId) : null;

  const utilizationData = allAnalytics.map(a => ({
    name: a.libraryName.substring(0, 15),
    utilization: a.utilizationPercentage,
  }));

  const defaultersData = allAnalytics.map(a => ({
    name: a.libraryName.substring(0, 15),
    defaulters: a.defaultersCount,
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">System-wide analytics and insights</p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{systemStats.totalMembers}</p>
                <p className="text-xs text-muted-foreground mt-1">{systemStats.totalActiveMembers} active</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Defaulters</p>
                <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{systemStats.totalDefaulters}</p>
                <p className="text-xs text-muted-foreground mt-1">With pending fines</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Pending Fines</p>
                <p className="text-2xl md:text-3xl font-bold text-warning mt-1">₹{systemStats.totalPendingFines}</p>
                <p className="text-xs text-muted-foreground mt-1">To be collected</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Overdue Books</p>
                <p className="text-2xl md:text-3xl font-bold text-info mt-1">{systemStats.totalBooksOverdue}</p>
                <p className="text-xs text-muted-foreground mt-1">Not returned</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-accent/50 bg-accent/5 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setSelectedLibraryId(mostUtilized?.libraryId || null); setShowLibraryDetails(true); }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-8 h-8 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Most Utilized Library</p>
                  <p className="text-2xl font-bold text-accent mt-1">{mostUtilized?.libraryName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{mostUtilized?.utilizationPercentage}% utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 bg-destructive/5 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setSelectedLibraryId(mostDefaulters?.libraryId || null); setShowLibraryDetails(true); }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Library with Most Defaulters</p>
                  <p className="text-2xl font-bold text-destructive mt-1">{mostDefaulters?.libraryName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{mostDefaulters?.defaultersCount} defaulters</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Library Utilization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Library Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={utilizationData} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Defaulters by Library */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Defaulters by Library</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={defaultersData} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="defaulters" fill="#ef4444" name="Defaulters" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Borrowed Books */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Top 5 Most Borrowed Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBooks.map((book, idx) => (
                <div key={book.bookId} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-accent text-accent-foreground">{idx + 1}</Badge>
                    <div>
                      <p className="font-medium text-sm">{book.title}</p>
                    </div>
                  </div>
                  <p className="font-bold text-accent">{book.borrowCount} borrows</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Library Breakdown Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Library-Wise Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allAnalytics.map(analytics => (
                <div key={analytics.libraryId} className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-sm md:text-base">{analytics.libraryName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Members</p>
                          <p className="font-bold text-primary">{analytics.totalMembers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Defaulters</p>
                          <Badge variant={analytics.defaultersCount > 0 ? 'destructive' : 'secondary'} className="mt-1">
                            {analytics.defaultersCount}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pending Fines</p>
                          <p className="font-bold text-warning">₹{analytics.totalFinesPending}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <p className="font-bold text-accent">{analytics.utilizationPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-bold text-success">Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Library Details Dialog */}
        <Dialog open={showLibraryDetails} onOpenChange={setShowLibraryDetails}>
          <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>{selectedAnalytics?.libraryName} - Detailed Analytics</DialogTitle>
            </DialogHeader>
            {selectedAnalytics && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="text-2xl font-bold text-primary mt-1">{selectedAnalytics.totalMembers}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10">
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-success mt-1">{selectedAnalytics.activeMembers}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <p className="text-xs text-muted-foreground">Defaulters</p>
                    <p className="text-2xl font-bold text-destructive mt-1">{selectedAnalytics.defaultersCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10">
                    <p className="text-xs text-muted-foreground">Pending Fines</p>
                    <p className="text-2xl font-bold text-warning mt-1">₹{selectedAnalytics.totalFinesPending}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-info/10">
                    <p className="text-xs text-muted-foreground">Issued Books</p>
                    <p className="text-2xl font-bold text-info mt-1">{selectedAnalytics.totalBooksIssued}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/10">
                    <p className="text-xs text-muted-foreground">Utilization</p>
                    <p className="text-2xl font-bold text-accent mt-1">{selectedAnalytics.utilizationPercentage}%</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm"><strong>Most Borrowed Book:</strong> {selectedAnalytics.mostBorrowedBook}</p>
                  <p className="text-sm mt-2"><strong>Avg Borrows/Member:</strong> {selectedAnalytics.averageBorrowsPerMember}</p>
                  <p className="text-sm mt-2"><strong>Overdue Books:</strong> {selectedAnalytics.totalBooksOverdue}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// LIBRARIAN REPORTS & ANALYTICS
// ============================================================================

function LibrarianReports() {
  const { selectedLibrary } = useAuth();

  const analytics = useMemo(() => {
    if (!selectedLibrary) return null;
    return getLibraryAnalytics(selectedLibrary);
  }, [selectedLibrary]);

  if (!selectedLibrary || !analytics) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Reports & Analytics</h1>
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
        {/* Header */}
        <div>
          <h1 className="page-header">Library Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Analytics for {analytics.libraryName}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{analytics.totalMembers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Defaulters</p>
                <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{analytics.defaultersCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Pending Fines</p>
                <p className="text-2xl md:text-3xl font-bold text-warning mt-1">₹{analytics.totalFinesPending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Issued Books</p>
                <p className="text-2xl md:text-3xl font-bold text-info mt-1">{analytics.totalBooksIssued}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl md:text-3xl font-bold text-accent mt-1">{analytics.totalBooksOverdue}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl md:text-3xl font-bold text-success mt-1">{analytics.utilizationPercentage}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Library Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
              <span className="text-sm">Most Borrowed Book</span>
              <span className="font-semibold">{analytics.mostBorrowedBook}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
              <span className="text-sm">Average Borrows per Member</span>
              <span className="font-semibold">{analytics.averageBorrowsPerMember}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
              <span className="text-sm">Active Members</span>
              <span className="font-semibold">{analytics.activeMembers}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

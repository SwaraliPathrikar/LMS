import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { checkInRecords, members, libraryBranches } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ReadersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Citizens cannot access this page
  if (user.role === 'citizen') {
    return <AccessDenied />;
  }

  if (user.role === 'librarian') {
    return <LibrarianReadersPage />;
  }

  return <AdminReadersPage />;
}

// ============================================================================
// ACCESS DENIED - Citizens cannot view readers
// ============================================================================

function AccessDenied() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="page-header">Checked-In Readers</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Access Denied</p>
            <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can view reader check-in information.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// LIBRARIAN READERS PAGE - Readers of their library only
// ============================================================================

function LibrarianReadersPage() {
  const { selectedLibrary } = useAuth();

  const libraryRecords = useMemo(() => {
    if (!selectedLibrary) return [];
    return checkInRecords.filter(r => r.libraryId === selectedLibrary);
  }, [selectedLibrary]);

  const activeReaders = libraryRecords.filter(r => !r.checkOutTime);
  const selectedBranch = libraryBranches.find(b => b.id === selectedLibrary);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Checked-In Readers</h1>
          <p className="text-muted-foreground mt-1">
            {selectedBranch ? `Readers at ${selectedBranch.name}` : 'Select a library to view readers'}
          </p>
        </div>

        {!selectedLibrary ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Please select a library from the sidebar to view readers</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Currently In</p>
                      <p className="text-2xl md:text-3xl font-bold text-success mt-1">{activeReaders.length}</p>
                    </div>
                    <UserCheck className="w-8 h-8 md:w-10 md:h-10 text-success/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Total Today</p>
                      <p className="text-2xl md:text-3xl font-bold text-info mt-1">{libraryRecords.length}</p>
                    </div>
                    <Clock className="w-8 h-8 md:w-10 md:h-10 text-info/30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Readers Table */}
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reader</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {libraryRecords.length > 0 ? (
                      libraryRecords.map(rec => {
                        const member = members.find(m => m.id === rec.memberId);
                        return (
                          <TableRow key={rec.id}>
                            <TableCell className="font-medium text-sm">{member?.name}</TableCell>
                            <TableCell className="text-sm">{new Date(rec.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</TableCell>
                            <TableCell className="text-sm">{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—'}</TableCell>
                            <TableCell>
                              <Badge className={rec.checkOutTime ? 'bg-muted text-muted-foreground border-0' : 'bg-success/15 text-success border-0'}>
                                {rec.checkOutTime ? 'Left' : 'Present'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No check-in records for today
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// ADMIN READERS PAGE - All readers across all libraries
// ============================================================================

function AdminReadersPage() {
  const activeReaders = checkInRecords.filter(r => !r.checkOutTime);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Checked-In Readers</h1>
          <p className="text-muted-foreground mt-1">All readers across all library branches</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Currently In</p>
                  <p className="text-2xl md:text-3xl font-bold text-success mt-1">{activeReaders.length}</p>
                </div>
                <UserCheck className="w-8 h-8 md:w-10 md:h-10 text-success/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Today</p>
                  <p className="text-2xl md:text-3xl font-bold text-info mt-1">{checkInRecords.length}</p>
                </div>
                <Clock className="w-8 h-8 md:w-10 md:h-10 text-info/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Readers Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reader</TableHead>
                  <TableHead>Library</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkInRecords.length > 0 ? (
                  checkInRecords.map(rec => {
                    const member = members.find(m => m.id === rec.memberId);
                    const lib = libraryBranches.find(l => l.id === rec.libraryId);
                    return (
                      <TableRow key={rec.id}>
                        <TableCell className="font-medium text-sm">{member?.name}</TableCell>
                        <TableCell className="text-sm">{lib?.name}</TableCell>
                        <TableCell className="text-sm">{new Date(rec.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</TableCell>
                        <TableCell className="text-sm">{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—'}</TableCell>
                        <TableCell>
                          <Badge className={rec.checkOutTime ? 'bg-muted text-muted-foreground border-0' : 'bg-success/15 text-success border-0'}>
                            {rec.checkOutTime ? 'Left' : 'Present'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No check-in records for today
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

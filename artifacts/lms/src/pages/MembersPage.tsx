import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { members, libraryBranches, circulationTransactions, fines } from '@/data/mockData';

// Live helpers
const getMemberBorrowed = (memberId: string) =>
  circulationTransactions.filter(t => t.memberId === memberId && (t.status === 'issued' || t.status === 'overdue')).length;

const getMemberFinesDue = (memberId: string) =>
  fines.filter(f => f.memberId === memberId && f.status === 'pending').reduce((s, f) => s + f.amount, 0);
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users2, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function MembersPage() {
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
    return <LibrarianMembersPage />;
  }

  return <AdminMembersPage />;
}


function AccessDenied() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="page-header">Members</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Access Denied</p>
            <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can view member information.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


function LibrarianMembersPage() {
  const { selectedLibrary } = useAuth();
  const [query, setQuery] = useState('');

  const libraryMembers = useMemo(() => {
    if (!selectedLibrary) return [];
    return members.filter(m => m.libraryId === selectedLibrary);
  }, [selectedLibrary]);

  const filtered = libraryMembers.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.membershipId.toLowerCase().includes(query.toLowerCase()) ||
    m.email.toLowerCase().includes(query.toLowerCase())
  );

  const active = libraryMembers.filter(m => m.status === 'active').length;
  const expired = libraryMembers.filter(m => m.status === 'expired').length;
  const totalFines = libraryMembers.reduce((s, m) => s + getMemberFinesDue(m.id), 0);

  const selectedBranch = libraryBranches.find(b => b.id === selectedLibrary);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Members</h1>
          <p className="text-muted-foreground mt-1">
            {selectedBranch ? `Members of ${selectedBranch.name}` : 'Select a library to view members'}
          </p>
        </div>

        {!selectedLibrary ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Please select a library from the sidebar to view members</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{libraryMembers.length}</p>
                    </div>
                    <Users2 className="w-8 h-8 md:w-10 md:h-10 text-primary/30 hidden md:block" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl md:text-3xl font-bold text-success mt-1">{active}</p>
                    </div>
                    <UserCheck className="w-8 h-8 md:w-10 md:h-10 text-success/30 hidden md:block" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Expired</p>
                      <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{expired}</p>
                    </div>
                    <UserX className="w-8 h-8 md:w-10 md:h-10 text-destructive/30 hidden md:block" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Fines Due</p>
                      <p className="text-2xl md:text-3xl font-bold text-warning mt-1">₹{totalFines}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-warning/30 hidden md:block" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input className="pl-10" placeholder="Search members..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>

            {/* Members Table */}
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Membership ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Borrowed</TableHead>
                      <TableHead className="col-num">Fines</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length > 0 ? (
                      filtered.map(m => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{m.name}</p>
                              <p className="text-xs text-muted-foreground">{m.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{m.membershipId}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize text-xs">{m.membershipType}</Badge></TableCell>
                          <TableCell>
                            <Badge className={m.status === 'active' ? 'bg-success/15 text-success border-0' : 'bg-destructive/15 text-destructive border-0'}>
                              {m.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{getMemberBorrowed(m.id)}</TableCell>
                          <TableCell className="col-num text-sm">{getMemberFinesDue(m.id) > 0 ? <span className="text-warning font-semibold">₹{getMemberFinesDue(m.id)}</span> : '—'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No members found
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
// ADMIN MEMBERS PAGE - All members across all libraries
// ============================================================================

function AdminMembersPage() {
  const [query, setQuery] = useState('');

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.membershipId.toLowerCase().includes(query.toLowerCase()) ||
    m.email.toLowerCase().includes(query.toLowerCase())
  );

  const active = members.filter(m => m.status === 'active').length;
  const expired = members.filter(m => m.status === 'expired').length;
  const totalFines = members.reduce((s, m) => s + getMemberFinesDue(m.id), 0);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Members</h1>
          <p className="text-muted-foreground mt-1">All members across all library branches</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{members.length}</p>
                </div>
                <Users2 className="w-8 h-8 md:w-10 md:h-10 text-primary/30 hidden md:block" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl md:text-3xl font-bold text-success mt-1">{active}</p>
                </div>
                <UserCheck className="w-8 h-8 md:w-10 md:h-10 text-success/30 hidden md:block" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{expired}</p>
                </div>
                <UserX className="w-8 h-8 md:w-10 md:h-10 text-destructive/30 hidden md:block" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Fines Due</p>
                  <p className="text-2xl md:text-3xl font-bold text-warning mt-1">₹{totalFines}</p>
                </div>
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-warning/30 hidden md:block" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input className="pl-10" placeholder="Search members..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        {/* Members Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Membership ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Library</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Fines</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map(m => {
                    const library = libraryBranches.find(b => b.id === m.libraryId);
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{m.membershipId}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize text-xs">{m.membershipType}</Badge></TableCell>
                        <TableCell className="text-sm">{library?.name}</TableCell>
                        <TableCell>
                          <Badge className={m.status === 'active' ? 'bg-success/15 text-success border-0' : 'bg-destructive/15 text-destructive border-0'}>
                            {m.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{getMemberBorrowed(m.id)}</TableCell>
                        <TableCell className="text-sm">{getMemberFinesDue(m.id) > 0 ? <span className="text-warning font-semibold">₹{getMemberFinesDue(m.id)}</span> : '—'}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No members found
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

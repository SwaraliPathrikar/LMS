import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  if (user.role === 'citizen') return <AccessDenied />;
  if (user.role === 'librarian') return <LibrarianMembersPage />;
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
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = { role: 'citizen' };
        if (selectedLibrary) params.libraryId = selectedLibrary;
        const [usersData, finesData, libsData] = await Promise.all([
          api.users.list(params),
          selectedLibrary ? api.fines.list({ libraryId: selectedLibrary }) : Promise.resolve([]),
          api.libraries.list(),
        ]);
        setMembers(usersData);
        setFines(finesData);
        setLibraries(libsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedLibrary]);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.email.toLowerCase().includes(query.toLowerCase())
  );

  const active = members.filter(m => m.isActive !== false).length;
  const expired = members.filter(m => m.isActive === false).length;
  const getMemberFinesDue = (userId: string) =>
    fines.filter(f => f.userId === userId && f.status === 'pending').reduce((s: number, f: any) => s + f.amount, 0);
  const totalFines = members.reduce((s, m) => s + getMemberFinesDue(m.id), 0);

  const selectedBranch = libraries.find(b => b.id === selectedLibrary);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="page-header">Members</h1>
            <p className="text-muted-foreground mt-1">
              {selectedBranch ? `Members of ${selectedBranch.name}` : 'Select a library to view members'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => navigate('/members/add')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              + Add Member
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/fees')}>
              View Fines
            </Button>
          </div>
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
                      <p className="text-xs md:text-sm text-muted-foreground">Inactive</p>
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

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input className="pl-10" placeholder="Search members..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>

            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="col-num">Fines</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                      </TableRow>
                    ) : filtered.length > 0 ? (
                      filtered.map(m => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{m.name}</p>
                              <p className="text-xs text-muted-foreground">{m.email}</p>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize text-xs">{m.role}</Badge></TableCell>
                          <TableCell>
                            <Badge className={m.isActive !== false ? 'bg-success/15 text-success border-0' : 'bg-destructive/15 text-destructive border-0'}>
                              {m.isActive !== false ? 'active' : 'inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="col-num text-sm">
                            {getMemberFinesDue(m.id) > 0 ? <span className="text-warning font-semibold">₹{getMemberFinesDue(m.id)}</span> : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No members found</TableCell>
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

function AdminMembersPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [usersData, finesData, libsData] = await Promise.all([
          api.users.list({ role: 'citizen' }),
          api.fines.list({}),
          api.libraries.list(),
        ]);
        setMembers(usersData);
        setFines(finesData);
        setLibraries(libsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.email.toLowerCase().includes(query.toLowerCase())
  );

  const active = members.filter(m => m.isActive !== false).length;
  const expired = members.filter(m => m.isActive === false).length;
  const getMemberFinesDue = (userId: string) =>
    fines.filter(f => f.userId === userId && f.status === 'pending').reduce((s: number, f: any) => s + f.amount, 0);
  const totalFines = members.reduce((s, m) => s + getMemberFinesDue(m.id), 0);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">Members</h1>
          <p className="text-muted-foreground mt-1">All members across all library branches</p>
        </div>

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
                  <p className="text-xs md:text-sm text-muted-foreground">Inactive</p>
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input className="pl-10" placeholder="Search members..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Library</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fines</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map(m => {
                    const library = libraries.find(b => b.id === m.libraryId);
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize text-xs">{m.role}</Badge></TableCell>
                        <TableCell className="text-sm">{library?.name || '—'}</TableCell>
                        <TableCell>
                          <Badge className={m.isActive !== false ? 'bg-success/15 text-success border-0' : 'bg-destructive/15 text-destructive border-0'}>
                            {m.isActive !== false ? 'active' : 'inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getMemberFinesDue(m.id) > 0 ? <span className="text-warning font-semibold">₹{getMemberFinesDue(m.id)}</span> : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No members found</TableCell>
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

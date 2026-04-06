import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fmtDate, fmtDateTime, fmtTime } from '@/lib/formatDate';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ReadersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) { navigate('/login'); return null; }
  if (user.role === 'citizen') return <AccessDenied />;
  return <ReadersView />;
}

function AccessDenied() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="page-header">Checked-In Readers</h1>
        <Card><CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Access Denied</p>
        </CardContent></Card>
      </div>
    </DashboardLayout>
  );
}

function ReadersView() {
  const { user, selectedLibrary } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedLibrary) params.libraryId = selectedLibrary;
    api.checkIns.list(params).then(setRecords).catch(console.error).finally(() => setLoading(false));
  }, [selectedLibrary]);

  const active = records.filter(r => !r.checkOutTime);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">Checked-In Readers</h1>
          <p className="text-muted-foreground mt-1">{isAdmin ? 'All readers across libraries' : 'Readers at your library'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="stat-card"><CardContent className="p-3 md:p-6 flex items-center justify-between">
            <div><p className="text-xs md:text-sm text-muted-foreground">Currently In</p><p className="text-2xl md:text-3xl font-bold text-success mt-1">{active.length}</p></div>
            <UserCheck className="w-8 h-8 md:w-10 md:h-10 text-success/30" />
          </CardContent></Card>
          <Card className="stat-card"><CardContent className="p-3 md:p-6 flex items-center justify-between">
            <div><p className="text-xs md:text-sm text-muted-foreground">Total Today</p><p className="text-2xl md:text-3xl font-bold text-info mt-1">{records.length}</p></div>
            <Clock className="w-8 h-8 md:w-10 md:h-10 text-info/30" />
          </CardContent></Card>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reader</TableHead>
                  {isAdmin && <TableHead>Library</TableHead>}
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : records.length > 0 ? records.map(rec => (
                  <TableRow key={rec.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{rec.user?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{rec.user?.email}</p>
                    </TableCell>
                    {isAdmin && <TableCell className="text-sm">{rec.library?.name ?? '—'}</TableCell>}
                    <TableCell className="text-sm">{fmtTime(rec.checkInTime)}</TableCell>
                    <TableCell className="text-sm">{rec.checkOutTime ? fmtTime(rec.checkOutTime) : '—'}</TableCell>
                    <TableCell>
                      <Badge className={rec.checkOutTime ? 'bg-muted text-muted-foreground border-0' : 'bg-success/15 text-success border-0'}>
                        {rec.checkOutTime ? 'Left' : 'Present'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No check-in records</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

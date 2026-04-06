import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, History, Calendar } from 'lucide-react';
import { fmtDateTime } from '@/lib/formatDate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function CitizenHistoryPage() {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState('');
  const [allRecords, setAllRecords] = useState<any[]>([]);

  useEffect(() => { api.checkIns.list({}).then(setAllRecords).catch(console.error); }, []);

  if (!user || user.role !== 'citizen') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">My History</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only citizens can view their personal history.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const userRecords = useMemo(() => allRecords.filter(r => r.userId === user.id), [allRecords, user.id]);

  // Filter by date if selected
  const filteredRecords = useMemo(() => {
    if (!dateFilter) return userRecords;
    return userRecords.filter(record => {
      const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
      return recordDate === dateFilter;
    });
  }, [userRecords, dateFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalVisits = userRecords.length;
    const completedVisits = userRecords.filter(r => r.checkOutTime).length;
    const activeVisits = userRecords.filter(r => !r.checkOutTime).length;

    return { totalVisits, completedVisits, activeVisits };
  }, [userRecords]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">My History</h1>
          <p className="text-muted-foreground mt-1">View your library check-in and check-out records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs md:text-sm text-muted-foreground">Total Visits</p>
              <p className="text-2xl md:text-3xl font-bold text-primary mt-2">{stats.totalVisits}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs md:text-sm text-muted-foreground">Completed Visits</p>
              <p className="text-2xl md:text-3xl font-bold text-success mt-2">{stats.completedVisits}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs md:text-sm text-muted-foreground">Active Visits</p>
              <p className="text-2xl md:text-3xl font-bold text-warning mt-2">{stats.activeVisits}</p>
            </CardContent>
          </Card>
        </div>

        {/* Date Filter */}
        <div className="max-w-xs">
          <label className="text-sm font-medium">Filter by Date</label>
          <div className="relative mt-2">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="date"
              className="pl-10"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="w-4 h-4" />
              Check-In/Check-Out Records ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Library</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map(record => {
                      const checkInTime = new Date(record.checkInTime);
                      const checkOutTime = record.checkOutTime ? new Date(record.checkOutTime) : null;
                      
                      let duration = '';
                      if (checkOutTime) {
                        const durationMinutes = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 60000);
                        const hours = Math.floor(durationMinutes / 60);
                        const minutes = durationMinutes % 60;
                        duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                      }

                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium text-sm">{record.library?.name ?? '—'}</TableCell>
                          <TableCell className="text-sm">{fmtDateTime(record.checkInTime)}</TableCell>
                          <TableCell className="text-sm">{checkOutTime ? fmtDateTime(record.checkOutTime) : '—'}</TableCell>
                          <TableCell className="text-sm">{duration || '—'}</TableCell>
                          <TableCell>
                            <Badge className={checkOutTime ? 'bg-success/15 text-success border-0' : 'bg-warning/15 text-warning border-0'}>
                              {checkOutTime ? 'Completed' : 'Active'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

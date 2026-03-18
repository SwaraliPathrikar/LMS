import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { members, checkInRecords, libraryBranches } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, History, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ReadersHistoryPage() {
  const { user, selectedLibrary } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  if (!user || user.role === 'citizen') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Readers History</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can view reader history.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const libraryRecords = useMemo(() => {
    if (!selectedLibrary) return [];
    return checkInRecords.filter(r => r.libraryId === selectedLibrary);
  }, [selectedLibrary]);

  const filteredRecords = useMemo(() => {
    return libraryRecords.filter(record => {
      const member = members.find(m => m.id === record.memberId);
      if (!member) return false;

      const matchesSearch = !searchQuery || 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.membershipId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!dateFilter) return matchesSearch;

      const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
      return matchesSearch && recordDate === dateFilter;
    });
  }, [libraryRecords, searchQuery, dateFilter]);

  const selectedBranch = libraryBranches.find(b => b.id === selectedLibrary);

  const stats = useMemo(() => {
    const totalVisits = libraryRecords.length;
    const completedVisits = libraryRecords.filter(r => r.checkOutTime).length;
    const uniqueMembers = new Set(libraryRecords.map(r => r.memberId)).size;

    return { totalVisits, completedVisits, uniqueMembers };
  }, [libraryRecords]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Readers History</h1>
          <p className="text-muted-foreground mt-1">
            {selectedBranch ? `Check-in history for ${selectedBranch.name}` : 'Select a library to view history'}
          </p>
        </div>

        {!selectedLibrary ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Please select a library from the sidebar</p>
            </CardContent>
          </Card>
        ) : (
          <>
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
                  <p className="text-xs md:text-sm text-muted-foreground">Unique Members</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{stats.uniqueMembers}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Member</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    className="pl-10"
                    placeholder="Name, ID, or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type="date"
                    className="pl-10"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                  />
                </div>
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
                          <TableHead>Member</TableHead>
                          <TableHead>Membership ID</TableHead>
                          <TableHead>Check-In</TableHead>
                          <TableHead>Check-Out</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map(record => {
                          const member = members.find(m => m.id === record.memberId);
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
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{member?.name}</p>
                                  <p className="text-xs text-muted-foreground">{member?.email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{member?.membershipId}</TableCell>
                              <TableCell className="text-sm">{checkInTime.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</TableCell>
                              <TableCell className="text-sm">
                                {checkOutTime ? checkOutTime.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '—'}
                              </TableCell>
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

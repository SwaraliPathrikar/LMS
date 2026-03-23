import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { members, checkInRecords, libraryBranches } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, LogIn, LogOut, Search, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from '@/components/ui/use-toast';

export default function LibraryReadersPage() {
  const { user, selectedLibrary, setSelectedLibrary } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  if (!user || user.role === 'citizen') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Check-In User</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can manage check-ins.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const libraryMembers = useMemo(() => {
    if (!selectedLibrary) return [];
    return members.filter(m => m.libraryId === selectedLibrary && m.status === 'active');
  }, [selectedLibrary]);

  const filteredMembers = libraryMembers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.membershipId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentlyCheckedIn = useMemo(() => {
    return checkInRecords.filter(ci => ci.libraryId === selectedLibrary && !ci.checkOutTime);
  }, [selectedLibrary]);

  const handleCheckIn = (memberId: string) => {
    const now = new Date().toISOString();
    const newRecord = {
      id: `ci${Math.floor(Math.random() * 10000)}`,
      memberId,
      libraryId: selectedLibrary || '',
      checkInTime: now,
    };
    checkInRecords.push(newRecord);
    setSearchQuery('');
    setSelectedMemberId('');
    toast({ title: 'Success', description: 'Member checked in successfully!' });
  };

  const handleCheckOut = (recordId: string) => {
    const record = checkInRecords.find(r => r.id === recordId);
    if (record) {
      record.checkOutTime = new Date().toISOString();
      toast({ title: 'Success', description: 'Member checked out successfully!' });
    }
  };

  const selectedBranch = libraryBranches.find(b => b.id === selectedLibrary);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Check-In / Check-Out</h1>
          <p className="text-muted-foreground mt-1">
            {selectedBranch ? `Manage member check-ins at ${selectedBranch.name}` : 'Select a library to manage check-ins'}
          </p>
        </div>

        {/* Library Selection for Admin */}
        {user?.role === 'admin' && (
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">Select Library</label>
            <Select value={selectedLibrary || ''} onValueChange={setSelectedLibrary}>
              <SelectTrigger>
                <SelectValue placeholder="Select a library..." />
              </SelectTrigger>
              <SelectContent>
                {libraryBranches.map(lib => (
                  <SelectItem key={lib.id} value={lib.id}>
                    {lib.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!selectedLibrary ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Please select a library from the sidebar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Check-In Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LogIn className="w-4 h-4" />
                    Check-In Member
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {searchQuery && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map(m => (
                          <button
                            key={m.id}
                            onClick={() => {
                              handleCheckIn(m.id);
                            }}
                            className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <p className="font-medium text-sm">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.membershipId}</p>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No members found</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Currently Checked-In Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-4 h-4" />
                    Currently Checked-In ({currentlyCheckedIn.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentlyCheckedIn.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Check-In Time</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentlyCheckedIn.map(record => {
                            const member = members.find(m => m.id === record.memberId);
                            const checkInTime = new Date(record.checkInTime);
                            const now = new Date();
                            const durationMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / 60000);
                            const hours = Math.floor(durationMinutes / 60);
                            const minutes = durationMinutes % 60;

                            return (
                              <TableRow key={record.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{member?.name}</p>
                                    <p className="text-xs text-muted-foreground">{member?.membershipId}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">{checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</TableCell>
                                <TableCell className="text-sm">
                                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCheckOut(record.id)}
                                    className="text-xs"
                                  >
                                    Check-Out
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No members currently checked in</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

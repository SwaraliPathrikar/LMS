import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, LogIn, Search, Clock } from 'lucide-react';
import { fmtTime } from '@/lib/formatDate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function LibraryReadersPage() {
  const { user, selectedLibrary, setSelectedLibrary } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [libraries, setLibraries] = useState<any[]>([]);

  useEffect(() => { api.libraries.list().then(setLibraries).catch(console.error); }, []);

  useEffect(() => {
    if (!selectedLibrary) return;
    api.users.list({ role: 'citizen', libraryId: selectedLibrary }).then(setMembers).catch(console.error);
    api.checkIns.list({ libraryId: selectedLibrary, active: 'true' }).then(setCheckIns).catch(console.error);
  }, [selectedLibrary]);

  if (!user || user.role === 'citizen') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Check-In User</h1>
          <Card><CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Access Denied</p>
          </CardContent></Card>
        </div>
      </DashboardLayout>
    );
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckIn = async (userId: string) => {
    if (!selectedLibrary) return;
    try {
      const record = await api.checkIns.checkIn({ userId, libraryId: selectedLibrary });
      setCheckIns(prev => [...prev, record]);
      setSearchQuery('');
      toast.success('Member checked in successfully!');
    } catch (e: any) { toast.error(e.message ?? 'Check-in failed'); }
  };

  const handleCheckOut = async (recordId: string) => {
    try {
      await api.checkIns.checkOut(recordId);
      setCheckIns(prev => prev.filter(r => r.id !== recordId));
      toast.success('Member checked out successfully!');
    } catch (e: any) { toast.error(e.message ?? 'Check-out failed'); }
  };

  const selectedBranch = libraries.find(b => b.id === selectedLibrary);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Check-In / Check-Out</h1>
          <p className="text-muted-foreground mt-1">{selectedBranch ? `Manage check-ins at ${selectedBranch.name}` : 'Select a library'}</p>
        </div>

        {user?.role === 'admin' && (
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">Select Library</label>
            <Select value={selectedLibrary || ''} onValueChange={setSelectedLibrary}>
              <SelectTrigger><SelectValue placeholder="Select a library..." /></SelectTrigger>
              <SelectContent>{libraries.map(lib => <SelectItem key={lib.id} value={lib.id}>{lib.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}

        {!selectedLibrary ? (
          <Card><CardContent className="p-8 text-center"><AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Please select a library</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><LogIn className="w-4 h-4" /> Check-In Member</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search Member</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input className="pl-10" placeholder="Name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                  </div>
                  {searchQuery && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredMembers.length > 0 ? filteredMembers.map(m => (
                        <button key={m.id} onClick={() => handleCheckIn(m.id)} className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                          <p className="font-medium text-sm">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </button>
                      )) : <p className="text-sm text-muted-foreground text-center py-4">No members found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock className="w-4 h-4" /> Currently Checked-In ({checkIns.length})</CardTitle></CardHeader>
                <CardContent>
                  {checkIns.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Check-In</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {checkIns.map(record => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <p className="font-medium text-sm">{record.user?.name ?? '—'}</p>
                                <p className="text-xs text-muted-foreground">{record.user?.email}</p>
                              </TableCell>
                              <TableCell className="text-sm">{fmtTime(record.checkInTime)}</TableCell>
                              <TableCell><Button size="sm" variant="outline" onClick={() => handleCheckOut(record.id)} className="text-xs">Check-Out</Button></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : <div className="text-center py-8"><p className="text-muted-foreground">No members currently checked in</p></div>}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

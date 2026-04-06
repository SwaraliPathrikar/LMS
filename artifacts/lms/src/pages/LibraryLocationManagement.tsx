import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MapPin, Phone, User, ExternalLink, AlertCircle, Plus } from 'lucide-react';
import * as api from '@/lib/api';
import { canAccessFeature } from '@/lib/rbac';
import { toast } from 'sonner';

export default function LibraryLocationManagement() {
  const { user } = useAuth();
  const [libraries, setLibraries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '', mapLink: '', librarianName: '', departmentId: 'dept-edu' });

  useEffect(() => { api.libraries.list().then(setLibraries).catch(console.error); }, []);

  if (!user || !canAccessFeature(user.role, 'access-control')) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  const filtered = libraries.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.address || !form.phone || !form.librarianName) {
      toast.error('Please fill all required fields'); return;
    }
    try {
      const lib = await api.libraries.create({ name: form.name, address: form.address, phone: form.phone, mapLink: form.mapLink || undefined, librarian: `Lib: ${form.librarianName}`, departmentId: form.departmentId });
      setLibraries(prev => [...prev, lib]);
      toast.success(`${form.name} has been added successfully.`);
      setShowAddDialog(false);
      setForm({ name: '', address: '', phone: '', mapLink: '', librarianName: '', departmentId: 'dept-edu' });
    } catch (e: any) { toast.error(e.message ?? 'Failed to add library'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Library Locations</h1>
            <p className="text-muted-foreground mt-2">Manage library branch locations and details</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-accent hover:bg-accent/90 flex items-center gap-2">
            <Plus size={16} /> Add Library
          </Button>
        </div>

        <Input placeholder="Search libraries..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(location => (
            <Card key={location.id}>
              <CardHeader><CardTitle className="text-lg">{location.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><span className="text-muted-foreground">{location.address}</span></div>
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{location.phone}</span></div>
                {location.librarian && <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{location.librarian}</span></div>}
                {location.mapLink && (
                  <div className="pt-2 space-y-2">
                    <Label className="text-xs text-muted-foreground">Google Maps Link</Label>
                    <div className="flex gap-2">
                      <Input value={location.mapLink} readOnly className="text-xs" />
                      <Button size="sm" variant="outline" onClick={() => window.open(location.mapLink, '_blank')}><ExternalLink className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No libraries found.</p></div>}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Library</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Library Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Address *</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Librarian Name *</Label><Input value={form.librarianName} onChange={e => setForm(f => ({ ...f, librarianName: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Google Maps Link</Label><Input placeholder="https://maps.app.goo.gl/..." value={form.mapLink} onChange={e => setForm(f => ({ ...f, mapLink: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90">Add Library</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

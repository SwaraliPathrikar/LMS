import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MapPin, Phone, User, ExternalLink, AlertCircle, Plus } from 'lucide-react';
import { libraryBranches } from '@/data/mockData';
import { canAccessFeature } from '@/lib/rbac';
import { toast } from '@/components/ui/use-toast';

export default function LibraryLocationManagement() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    mapLink: '',
    lat: '',
    lng: '',
    librarianName: '',
    librarianEmail: '',
    librarianPhone: '',
  });

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

  const filteredLocations = libraryBranches.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.address || !form.phone || !form.librarianName) {
      toast({ title: 'Missing Fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    const newBranch = {
      id: `lib${libraryBranches.length + 1}`,
      name: form.name,
      address: form.address,
      phone: form.phone,
      mapLink: form.mapLink || '#',
      lat: parseFloat(form.lat) || 0,
      lng: parseFloat(form.lng) || 0,
      departmentId: 'edu',
      librarian: form.librarianName,
    };
    libraryBranches.push(newBranch);
    toast({ title: 'Library Added', description: `${form.name} has been added successfully.` });
    setShowAddDialog(false);
    setForm({ name: '', address: '', phone: '', mapLink: '', lat: '', lng: '', librarianName: '', librarianEmail: '', librarianPhone: '' });
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

        <Input
          placeholder="Search libraries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location) => (
            <Card key={location.id}>
              <CardHeader>
                <CardTitle className="text-lg">{location.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{location.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{location.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{location.librarian}</span>
                </div>
                <div className="pt-2 space-y-2">
                  <Label className="text-xs text-muted-foreground">Google Maps Link</Label>
                  <div className="flex gap-2">
                    <Input value={location.mapLink} readOnly className="text-xs" />
                    <Button size="sm" variant="outline" onClick={() => window.open(location.mapLink, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  Coordinates: {location.lat}, {location.lng}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No libraries found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add Library Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Library Name *</Label>
              <Input placeholder="e.g. Nanded Central Library" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Address *</Label>
              <Input placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Assign Librarian — Name *</Label>
              <Input placeholder="Full name" value={form.librarianName} onChange={e => setForm(f => ({ ...f, librarianName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Librarian Email</Label>
              <Input placeholder="email@example.com" type="email" value={form.librarianEmail} onChange={e => setForm(f => ({ ...f, librarianEmail: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Librarian Phone</Label>
              <Input placeholder="+91 XXXXX XXXXX" value={form.librarianPhone} onChange={e => setForm(f => ({ ...f, librarianPhone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Google Maps Link</Label>
              <Input placeholder="https://maps.app.goo.gl/..." value={form.mapLink} onChange={e => setForm(f => ({ ...f, mapLink: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Latitude</Label>
                <Input placeholder="19.1383" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Longitude</Label>
                <Input placeholder="77.3210" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} />
              </div>
            </div>
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

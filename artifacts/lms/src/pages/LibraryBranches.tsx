import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, User, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function LibraryBranches() {
  const { user, setSelectedLibrary } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [editBranch, setEditBranch] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', address: '', phone: '', mapLink: '', librarian: '' });

  useEffect(() => { api.libraries.list().then(setBranches).catch(console.error); }, []);

  const handleSelectLibrary = (branch: any) => { setSelectedLibrary(branch.id); navigate('/books/search'); };

  const openEdit = (branch: any) => {
    setEditBranch(branch);
    setEditForm({ name: branch.name, address: branch.address, phone: branch.phone, mapLink: branch.mapLink ?? '', librarian: branch.librarian ?? '' });
  };

  const handleEditSave = async () => {
    if (!editBranch) return;
    if (!editForm.name || !editForm.address || !editForm.phone) {
      toast.error('Name, address and phone are required.'); return;
    }
    try {
      const updated = await api.libraries.update(editBranch.id, editForm);
      setBranches(bs => bs.map(b => b.id === updated.id ? updated : b));
      toast.success(`${updated.name} updated.`);
      setEditBranch(null);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Library Branches</h1>
          <p className="text-muted-foreground mt-1">Select a library to manage or browse its collection</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {branches.map(branch => (
            <Card key={branch.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground leading-snug">{branch.name}</h3>
                  {isAdmin && (
                    <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8" onClick={() => openEdit(branch)}>
                      <Pencil size={14} />
                    </Button>
                  )}
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-accent mt-0.5 shrink-0" />
                    <span className="break-words">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-accent shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-accent shrink-0" />
                    <span>{branch.librarian}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" onClick={() => handleSelectLibrary(branch)} className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1 sm:flex-none">
                    Enter Library
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedBranch(branch)} className="flex-1 sm:flex-none">
                    <MapPin size={14} className="mr-1" /> View Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Location Dialog */}
        <Dialog open={!!selectedBranch} onOpenChange={() => setSelectedBranch(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBranch?.name}</DialogTitle>
            </DialogHeader>
            {selectedBranch && (
              <div className="space-y-4">
                <div className="bg-secondary rounded-lg p-4 space-y-2">
                  <p className="text-sm"><strong>Address:</strong> {selectedBranch.address}</p>
                  <p className="text-sm"><strong>Librarian:</strong> {selectedBranch.librarian}</p>
                  <p className="text-sm"><strong>Phone:</strong> {selectedBranch.phone}</p>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <a href={selectedBranch.mapLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} className="mr-2" /> Open in Google Maps
                  </a>
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Branch Dialog (admin only) */}
        <Dialog open={!!editBranch} onOpenChange={() => setEditBranch(null)}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Branch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Branch Name</Label>
                <Input id="edit-name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-librarian">Librarian Name</Label>
                <Input id="edit-librarian" value={editForm.librarian} onChange={e => setEditForm(f => ({ ...f, librarian: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-maplink">Google Maps Link</Label>
                <Input id="edit-maplink" placeholder="https://maps.app.goo.gl/..." value={editForm.mapLink} onChange={e => setEditForm(f => ({ ...f, mapLink: e.target.value }))} />
              </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setEditBranch(null)}>Cancel</Button>
              <Button onClick={handleEditSave} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

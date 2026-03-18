import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { libraryBranches } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LibraryBranch } from '@/types/library';

export default function LibraryBranches() {
  const { selectedDepartment, setSelectedLibrary } = useAuth();
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState<LibraryBranch | null>(null);

  const branches = selectedDepartment
    ? libraryBranches.filter(b => b.departmentId === selectedDepartment)
    : libraryBranches;

  const handleSelectLibrary = (branch: LibraryBranch) => {
    setSelectedLibrary(branch.id);
    navigate('/books/search');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Library Branches</h1>
          <p className="text-muted-foreground mt-1">Select a library to manage or browse its collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {branches.map(branch => (
            <Card key={branch.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-lg text-foreground">{branch.name}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-accent" />
                    <span>{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-accent" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-accent" />
                    <span>{branch.librarian}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => handleSelectLibrary(branch)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Enter Library
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedBranch(branch)}>
                    <MapPin size={14} className="mr-1" /> View Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!selectedBranch} onOpenChange={() => setSelectedBranch(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBranch?.name}</DialogTitle>
            </DialogHeader>
            {selectedBranch && (
              <div className="space-y-4">
                <div className="bg-secondary rounded-lg p-4 space-y-2">
                  <p className="text-sm"><strong>Address:</strong> {selectedBranch.address}</p>
                  <p className="text-sm"><strong>Latitude:</strong> {selectedBranch.lat}</p>
                  <p className="text-sm"><strong>Longitude:</strong> {selectedBranch.lng}</p>
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
      </div>
    </DashboardLayout>
  );
}

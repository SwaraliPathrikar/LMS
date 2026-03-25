import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { systemSettings, updateSystemSettings, updateLibrarySettings, getLibrarySettings, libraryBranches, addLibrary, deleteLibrary } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, Save, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
  const { user, selectedLibrary } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Only admin and librarian can access settings
  if (user.role === 'citizen') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Settings</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can access settings.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (user.role === 'admin') {
    return <AdminSettings />;
  }

  return <LibrarianSettings />;
}



function AdminSettings() {
  const [maxBorrowDays, setMaxBorrowDays] = useState(systemSettings.maxBorrowPeriodDays.toString());
  const [maxRenewals, setMaxRenewals] = useState(systemSettings.maxRenewals.toString());
  const [membershipFee, setMembershipFee] = useState(systemSettings.membershipFee.toString());
  const [maxBooks, setMaxBooks] = useState(systemSettings.maxBooksPerMember.toString());

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);

  const handleSave = () => {
    updateSystemSettings({
      maxBorrowPeriodDays: parseInt(maxBorrowDays),
      maxRenewals: parseInt(maxRenewals),
      membershipFee: parseInt(membershipFee),
      maxBooksPerMember: parseInt(maxBooks),
    });
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    setMaxBorrowDays(systemSettings.maxBorrowPeriodDays.toString());
    setMaxRenewals(systemSettings.maxRenewals.toString());
    setMembershipFee(systemSettings.membershipFee.toString());
    setMaxBooks(systemSettings.maxBooksPerMember.toString());
    toast.info('Settings reset to current values');
  };

  const handleAddLibrary = () => {
    toast.info('Use Library Management page to add libraries');
  };

  const handleDeleteLibrary = () => {
    if (!selectedLibraryId) return;
    
    const library = libraryBranches.find(lib => lib.id === selectedLibraryId);
    const success = deleteLibrary(selectedLibraryId);
    
    if (success) {
      toast.success(`Library "${library?.name}" deleted successfully!`);
    } else {
      toast.error('Failed to delete library');
    }
    
    setShowDeleteConfirm(false);
    setSelectedLibraryId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure system-wide parameters and manage libraries</p>
        </div>

        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="system">System Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-4">

            {/* Borrowing Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Borrowing Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Maximum Borrow Period (days)</label>
                    <Input
                      type="number"
                      value={maxBorrowDays}
                      onChange={e => setMaxBorrowDays(e.target.value)}
                      className="mt-2"
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Maximum days a member can borrow a book</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Maximum Renewals</label>
                    <Input
                      type="number"
                      value={maxRenewals}
                      onChange={e => setMaxRenewals(e.target.value)}
                      className="mt-2"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Maximum times a book can be renewed</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Maximum Books Per Member</label>
                    <Input
                      type="number"
                      value={maxBooks}
                      onChange={e => setMaxBooks(e.target.value)}
                      className="mt-2" 
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Maximum books one member can borrow at once</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Membership Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Annual Membership Fee (₹)</label>
                  <Input
                    type="number"
                    value={membershipFee}
                    onChange={e => setMembershipFee(e.target.value)}
                    className="mt-2"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Annual fee for membership renewal</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Save size={16} className="mr-2" /> Save Settings
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw size={16} className="mr-2" /> Reset
              </Button>
            </div>

            {/* Info Box */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> These settings apply system-wide to all libraries. Changes will affect all members and transactions going forward.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Library?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <strong>{libraryBranches.find(lib => lib.id === selectedLibraryId)?.name}</strong>?
              </p>
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">
                    <strong>Warning:</strong> This action cannot be undone. All associated data including members, inventory, and transactions will need to be reassigned.
                  </p>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleDeleteLibrary} variant="destructive">
                <Trash2 size={16} className="mr-2" /> Delete Library
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}


function LibrarianSettings() {
  const { selectedLibrary } = useAuth();
  const [operatingHours, setOperatingHours] = useState('');
  const [closedDays, setClosedDays] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');

  const currentSettings = useMemo(() => {
    if (!selectedLibrary) return null;
    return getLibrarySettings(selectedLibrary);
  }, [selectedLibrary]);

  // Initialize form when settings load
  useState(() => {
    if (currentSettings) {
      setOperatingHours(currentSettings.operatingHours);
      setClosedDays(currentSettings.closedDays.join(', '));
      setMaxCapacity(currentSettings.maxCapacity.toString());
    }
  });

  const handleSave = () => {
    if (!selectedLibrary) {
      toast.error('Please select a library');
      return;
    }

    updateLibrarySettings(selectedLibrary, {
      operatingHours,
      closedDays: closedDays.split(',').map(d => d.trim()),
      maxCapacity: parseInt(maxCapacity),
    });
    toast.success('Library settings saved successfully!');
  };

  if (!selectedLibrary) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Library Settings</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Please select a library from the sidebar</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Library Settings</h1>
          <p className="text-muted-foreground mt-1">Configure settings for {currentSettings?.libraryName}</p>
        </div>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Operating Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Operating Hours</label>
              <Input
                type="text"
                value={operatingHours}
                onChange={e => setOperatingHours(e.target.value)}
                placeholder="e.g., 9:00 AM - 6:00 PM"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">Library operating hours</p>
            </div>

            <div>
              <label className="text-sm font-medium">Closed Days</label>
              <Input
                type="text"
                value={closedDays}
                onChange={e => setClosedDays(e.target.value)}
                placeholder="e.g., Sunday, Monday"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">Days when library is closed (comma-separated)</p>
            </div>
          </CardContent>
        </Card>

        {/* Capacity Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capacity Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Maximum Library Capacity</label>
              <Input
                type="number"
                value={maxCapacity}
                onChange={e => setMaxCapacity(e.target.value)}
                className="mt-2"
                min="1"
              />
              <p className="text-xs text-muted-foreground mt-1">Maximum members that can be in library at once</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Save size={16} className="mr-2" /> Save Settings
          </Button>
        </div>

        {/* Info Box */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> These settings apply only to your library. Changes will be reflected in library operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

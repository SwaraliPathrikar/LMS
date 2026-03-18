import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { systemSettings, librarySettings, updateSystemSettings, updateLibrarySettings, getLibrarySettings, libraryBranches, departments, addLibrary, deleteLibrary } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Save, RotateCcw, Plus, Trash2, MapPin, Phone, User } from 'lucide-react';
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
  const [standardRate, setStandardRate] = useState(systemSettings.standardFineRate.toString());
  const [premiumRate, setPremiumRate] = useState(systemSettings.premiumFineRate.toString());
  const [maxBorrowDays, setMaxBorrowDays] = useState(systemSettings.maxBorrowPeriodDays.toString());
  const [maxRenewals, setMaxRenewals] = useState(systemSettings.maxRenewals.toString());
  const [membershipFee, setMembershipFee] = useState(systemSettings.membershipFee.toString());
  const [maxBooks, setMaxBooks] = useState(systemSettings.maxBooksPerMember.toString());

  // Library Management State
  const [showAddLibrary, setShowAddLibrary] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [newLibrary, setNewLibrary] = useState({
    name: '',
    departmentId: 'edu',
    address: '',
    lat: 0,
    lng: 0,
    phone: '',
    librarian: '',
  });

  const handleSave = () => {
    updateSystemSettings({
      standardFineRate: parseInt(standardRate),
      premiumFineRate: parseInt(premiumRate),
      maxBorrowPeriodDays: parseInt(maxBorrowDays),
      maxRenewals: parseInt(maxRenewals),
      membershipFee: parseInt(membershipFee),
      maxBooksPerMember: parseInt(maxBooks),
    });
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    setStandardRate(systemSettings.standardFineRate.toString());
    setPremiumRate(systemSettings.premiumFineRate.toString());
    setMaxBorrowDays(systemSettings.maxBorrowPeriodDays.toString());
    setMaxRenewals(systemSettings.maxRenewals.toString());
    setMembershipFee(systemSettings.membershipFee.toString());
    setMaxBooks(systemSettings.maxBooksPerMember.toString());
    toast.info('Settings reset to current values');
  };

  const handleAddLibrary = () => {
    if (!newLibrary.name || !newLibrary.address || !newLibrary.phone || !newLibrary.librarian) {
      toast.error('Please fill all required fields');
      return;
    }

    const mapLink = `https://maps.google.com/?q=${newLibrary.lat},${newLibrary.lng}`;
    const added = addLibrary({ ...newLibrary, mapLink });
    
    toast.success(`Library "${added.name}" added successfully!`);
    setShowAddLibrary(false);
    setNewLibrary({
      name: '',
      departmentId: 'edu',
      address: '',
      lat: 0,
      lng: 0,
      phone: '',
      librarian: '',
    });
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="system">System Configuration</TabsTrigger>
            <TabsTrigger value="libraries">Library Management</TabsTrigger>
          </TabsList>

          {/* System Configuration Tab */}
          <TabsContent value="system" className="space-y-4">
            {/* Fine Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fine Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Standard Book Fine Rate (₹/day)</label>
                    <Input
                      type="number"
                      value={standardRate}
                      onChange={e => setStandardRate(e.target.value)}
                      className="mt-2"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Fine for standard books like fiction, history, etc.</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Premium Book Fine Rate (₹/day)</label>
                    <Input
                      type="number"
                      value={premiumRate}
                      onChange={e => setPremiumRate(e.target.value)}
                      className="mt-2"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Fine for reference books, law, technical, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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

          {/* Library Management Tab */}
          <TabsContent value="libraries" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Manage Library Locations</h3>
                <p className="text-sm text-muted-foreground">Add, edit, or remove library branches</p>
              </div>
              <Button onClick={() => setShowAddLibrary(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus size={16} className="mr-2" /> Add Library
              </Button>
            </div>

            {/* Libraries List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {libraryBranches.map(library => (
                <Card key={library.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{library.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{library.id}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLibraryId(library.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{library.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{library.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{library.librarian}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Library Dialog */}
        <Dialog open={showAddLibrary} onOpenChange={setShowAddLibrary}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Library</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Library Name *</label>
                <Input
                  value={newLibrary.name}
                  onChange={e => setNewLibrary({ ...newLibrary, name: e.target.value })}
                  placeholder="e.g., Gandhisagar Community Library"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Department *</label>
                <Select
                  value={newLibrary.departmentId}
                  onValueChange={value => setNewLibrary({ ...newLibrary, departmentId: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Address *</label>
                <Input
                  value={newLibrary.address}
                  onChange={e => setNewLibrary({ ...newLibrary, address: e.target.value })}
                  placeholder="e.g., Gandhisagar, Nanded - 431607"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Latitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newLibrary.lat}
                    onChange={e => setNewLibrary({ ...newLibrary, lat: parseFloat(e.target.value) })}
                    placeholder="19.1383"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Longitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newLibrary.lng}
                    onChange={e => setNewLibrary({ ...newLibrary, lng: parseFloat(e.target.value) })}
                    placeholder="77.3210"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  value={newLibrary.phone}
                  onChange={e => setNewLibrary({ ...newLibrary, phone: e.target.value })}
                  placeholder="+91 2462 234 5678"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Librarian Name *</label>
                <Input
                  value={newLibrary.librarian}
                  onChange={e => setNewLibrary({ ...newLibrary, librarian: e.target.value })}
                  placeholder="e.g., Dr. Amit Sharma"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddLibrary(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLibrary} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus size={16} className="mr-2" /> Add Library
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

// ============================================================================
// LIBRARIAN SETTINGS
// ============================================================================

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

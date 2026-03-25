import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fines, members, books, libraryBranches, circulationTransactions, getFineDetails, systemSettings, librarySettings, updateLibrarySettingsById } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IndianRupee, CheckCircle, AlertCircle, Info, Save } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function FeesPage() {
  const { user, selectedLibrary } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role === 'citizen') {
    return <CitizenFeesPage />;
  }

  return <AdminLibrarianFeesPage />;
}

// ============================================================================
// CITIZEN FEES PAGE - Personal Fines Only
// ============================================================================

function CitizenFeesPage() {
  const { user } = useAuth();
  const [selectedFine, setSelectedFine] = useState<string | null>(null);

  const userFines = useMemo(() => {
    return fines.filter(f => f.memberId === user?.id);
  }, [user?.id]);

  const pending = userFines.filter(f => f.status === 'pending');
  const totalPending = pending.reduce((s, f) => s + f.amount, 0);
  const paid = userFines.filter(f => f.status === 'paid');

  const selectedFineData = userFines.find(f => f.id === selectedFine);
  const fineDetails = selectedFineData ? getFineDetails(selectedFineData) : null;

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">My Fines & Payments</h1>
          <p className="text-muted-foreground mt-1">View and pay your pending fines</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl md:text-3xl font-bold text-warning mt-1">₹{totalPending}</p>
                </div>
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-warning/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Pending Fines</p>
                  <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{pending.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-destructive/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Paid Fines</p>
                  <p className="text-2xl md:text-3xl font-bold text-success mt-1">{paid.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-success/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert for pending fines */}
        {totalPending > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">You have ₹{totalPending} in pending fines</p>
                  <p className="text-xs text-muted-foreground mt-1">Please pay to avoid suspension of borrowing privileges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fines Table */}
        {userFines.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Rate/Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userFines.map(fine => {
                    const book = books.find(b => b.id === fine.bookId);
                    const details = getFineDetails(fine);
                    return (
                      <TableRow key={fine.id}>
                        <TableCell className="font-medium text-sm">{book?.title}</TableCell>
                        <TableCell className="font-semibold">₹{fine.amount}</TableCell>
                        <TableCell className="text-sm">{details.daysOverdue} days</TableCell>
                        <TableCell className="text-sm">₹{details.dailyRate}/day</TableCell>
                        <TableCell>
                          <Badge className={fine.status === 'paid' ? 'bg-success/15 text-success border-0' : fine.status === 'waived' ? 'bg-muted text-muted-foreground border-0' : 'bg-warning/15 text-warning border-0'}>
                            {fine.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {fine.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedFine(fine.id)}
                            >
                              <Info size={14} className="mr-1" /> Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No fines on your account. Great job!</p>
            </CardContent>
          </Card>
        )}

        {/* Fine Details Dialog */}
        <Dialog open={!!selectedFine} onOpenChange={() => setSelectedFine(null)}>
          <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Fine Calculation Details</DialogTitle>
            </DialogHeader>
            {selectedFineData && fineDetails && (
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Book:</span>
                    <span className="font-medium">{books.find(b => b.id === selectedFineData.bookId)?.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{selectedFineData.dueDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Return Date:</span>
                    <span className="font-medium">{selectedFineData.returnDate || 'Not returned'}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-semibold text-sm">Fine Calculation</h4>
                  <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Days Overdue:</span>
                      <span className="font-bold text-lg">{fineDetails.daysOverdue} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily Fine Rate:</span>
                      <span className="font-bold text-lg">₹{fineDetails.dailyRate}/day</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between items-center">
                      <span className="text-sm font-medium">Total Fine:</span>
                      <span className="font-bold text-xl text-accent">₹{fineDetails.calculatedAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-medium mb-1">How it's calculated:</p>
                  <p>{fineDetails.daysOverdue} days × ₹{fineDetails.dailyRate}/day = ₹{fineDetails.calculatedAmount}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// ADMIN / LIBRARIAN FEES PAGE - All Fines for Selected Library
// ============================================================================

function AdminLibrarianFeesPage() {
  const { user, selectedLibrary } = useAuth();
  const [localSelectedLibrary, setLocalSelectedLibrary] = useState<string | null>(selectedLibrary);
  const [selectedFine, setSelectedFine] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const libraryToUse = isAdmin ? localSelectedLibrary : selectedLibrary;

  const currentLibSettings = librarySettings.find(s => s.libraryId === libraryToUse);
  const [libStdFine, setLibStdFine] = useState(
    String(currentLibSettings?.standardFineRate ?? systemSettings.standardFineRate)
  );
  const [libPremFine, setLibPremFine] = useState(
    String(currentLibSettings?.premiumFineRate ?? systemSettings.premiumFineRate)
  );
  const [libMembershipFee, setLibMembershipFee] = useState(
    String(currentLibSettings?.membershipFee ?? systemSettings.membershipFee)
  );

  // Update fee states when library selection changes
  const handleLibraryChange = (libId: string | null) => {
    setLocalSelectedLibrary(libId);
    const settings = librarySettings.find(s => s.libraryId === libId);
    setLibStdFine(String(settings?.standardFineRate ?? systemSettings.standardFineRate));
    setLibPremFine(String(settings?.premiumFineRate ?? systemSettings.premiumFineRate));
    setLibMembershipFee(String(settings?.membershipFee ?? systemSettings.membershipFee));
  };

  const handleSaveLibFees = () => {
    if (!libraryToUse) { toast.error('No library selected'); return; }
    const std = parseFloat(libStdFine);
    const prem = parseFloat(libPremFine);
    const mem = parseFloat(libMembershipFee);
    if (isNaN(std) || isNaN(prem) || isNaN(mem) || std < 0 || prem < 0 || mem < 0) {
      toast.error('Please enter valid positive numbers');
      return;
    }
    updateLibrarySettingsById(libraryToUse, { standardFineRate: std, premiumFineRate: prem, membershipFee: mem });
    toast.success('Fee settings saved for ' + (selectedBranch?.name || 'library'));
  };

  const libraryFines = useMemo(() => {
    const lib = isAdmin ? localSelectedLibrary : selectedLibrary;
    if (!lib) return [];

    // Get all circulation transactions for this library
    const libraryTransactions = circulationTransactions.filter(t => t.libraryId === lib);
    const libraryMemberIds = new Set(libraryTransactions.map(t => t.memberId));

    // Filter fines for members in this library
    return fines.filter(f => libraryMemberIds.has(f.memberId));
  }, [selectedLibrary, localSelectedLibrary, isAdmin]);

  const pending = libraryFines.filter(f => f.status === 'pending');
  const totalPending = pending.reduce((s, f) => s + f.amount, 0);
  const paid = libraryFines.filter(f => f.status === 'paid');
  const waived = libraryFines.filter(f => f.status === 'waived');

  const selectedBranch = libraryBranches.find(b => b.id === libraryToUse);
  const selectedFineData = libraryFines.find(f => f.id === selectedFine);
  const fineDetails = selectedFineData ? getFineDetails(selectedFineData) : null;

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Fines Management</h1>
          <p className="text-muted-foreground mt-1">
            {selectedBranch ? `Manage fines for ${selectedBranch.name}` : 'Select a library to view fines'}
          </p>
        </div>

        {/* Library Selector for Admin — always first */}
        {isAdmin && (
          <Card>
            <CardContent className="p-4">
              <label className="text-sm font-medium">Select Library</label>
              <select
                value={localSelectedLibrary || ''}
                onChange={e => handleLibraryChange(e.target.value || null)}
                className="w-full p-2 border rounded-lg mt-2 text-sm"
              >
                <option value="">-- Select a Library --</option>
                {libraryBranches.map(lib => (
                  <option key={lib.id} value={lib.id}>
                    {lib.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {!libraryToUse ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isAdmin ? 'Please select a library from the dropdown above' : 'Please select a library from the sidebar to view fines'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Fee Settings Card — shown after library is selected */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <IndianRupee size={18} /> Fee Settings — {selectedBranch?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground mb-3">
                  {isAdmin
                    ? 'Set fine rates and membership fee for this library. These override system defaults.'
                    : `Set the fine rate and membership fee for this library. System default fine: ₹${systemSettings.standardFineRate}/day.`}
                </p>
                {isAdmin ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Standard Fine Rate (₹/day)</label>
                      <Input type="number" min={0} value={libStdFine} onChange={e => setLibStdFine(e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Premium Fine Rate (₹/day)</label>
                      <Input type="number" min={0} value={libPremFine} onChange={e => setLibPremFine(e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Membership Fee (₹/year)</label>
                      <Input type="number" min={0} value={libMembershipFee} onChange={e => setLibMembershipFee(e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Standard Fine Rate (₹/day)</label>
                      <Input type="number" min={0} value={libStdFine} onChange={e => setLibStdFine(e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Membership Fee (₹/year)</label>
                      <Input type="number" min={0} value={libMembershipFee} onChange={e => setLibMembershipFee(e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                  </div>
                )}
                <Button size="sm" className="mt-3" onClick={handleSaveLibFees}>
                  <Save size={14} className="mr-1" /> Save Fee Settings
                </Button>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Total Pending</p>
                      <p className="text-2xl md:text-3xl font-bold text-warning mt-1">₹{totalPending}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-warning/30 hidden md:block" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Pending Count</p>
                      <p className="text-2xl md:text-3xl font-bold text-destructive mt-1">{pending.length}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-destructive/30 hidden md:block" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Collected</p>
                      <p className="text-2xl md:text-3xl font-bold text-success mt-1">{paid.length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-success/30 hidden md:block" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Waived</p>
                      <p className="text-2xl md:text-3xl font-bold text-info mt-1">{waived.length}</p>
                    </div>
                    <IndianRupee className="w-8 h-8 md:w-10 md:h-10 text-info/30 hidden md:block" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fines Table */}
            {libraryFines.length > 0 ? (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Book</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Days Overdue</TableHead>
                        <TableHead>Rate/Day</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {libraryFines.map(fine => {
                        const member = members.find(m => m.id === fine.memberId);
                        const book = books.find(b => b.id === fine.bookId);
                        const details = getFineDetails(fine);
                        return (
                          <TableRow key={fine.id}>
                            <TableCell className="font-medium text-sm">{member?.name}</TableCell>
                            <TableCell className="text-sm">{book?.title}</TableCell>
                            <TableCell className="font-semibold">₹{fine.amount}</TableCell>
                            <TableCell className="text-sm">{details.daysOverdue} days</TableCell>
                            <TableCell className="text-sm">₹{details.dailyRate}/day</TableCell>
                            <TableCell>
                              <Badge className={fine.status === 'paid' ? 'bg-success/15 text-success border-0' : fine.status === 'waived' ? 'bg-muted text-muted-foreground border-0' : 'bg-warning/15 text-warning border-0'}>
                                {fine.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {fine.status === 'pending' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedFine(fine.id)}
                                  >
                                    <Info size={14} className="mr-1" /> Details
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => toast.info('Fine waived')}>Waive</Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No fines for this library</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Fine Details Dialog */}
        <Dialog open={!!selectedFine} onOpenChange={() => setSelectedFine(null)}>
          <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Fine Calculation Details</DialogTitle>
            </DialogHeader>
            {selectedFineData && fineDetails && (
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Member:</span>
                    <span className="font-medium">{members.find(m => m.id === selectedFineData.memberId)?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Book:</span>
                    <span className="font-medium">{books.find(b => b.id === selectedFineData.bookId)?.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{selectedFineData.dueDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Return Date:</span>
                    <span className="font-medium">{selectedFineData.returnDate || 'Not returned'}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-semibold text-sm">Fine Calculation</h4>
                  <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Days Overdue:</span>
                      <span className="font-bold text-lg">{fineDetails.daysOverdue} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily Fine Rate:</span>
                      <span className="font-bold text-lg">₹{fineDetails.dailyRate}/day</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between items-center">
                      <span className="text-sm font-medium">Total Fine:</span>
                      <span className="font-bold text-xl text-accent">₹{fineDetails.calculatedAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-medium mb-1">How it's calculated:</p>
                  <p>{fineDetails.daysOverdue} days × ₹{fineDetails.dailyRate}/day = ₹{fineDetails.calculatedAmount}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

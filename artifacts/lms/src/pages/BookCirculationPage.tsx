import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { books, bookInventory, members, circulationTransactions, libraryBranches } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, BookOpen, UserCheck, ArrowRight, ArrowLeft, Camera, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from '@/components/ui/use-toast';

export default function BookCirculationPage() {
  const { user, selectedLibrary, setSelectedLibrary } = useAuth();
  const [activeTab, setActiveTab] = useState('issue');
  
  // Issue Book State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [borrowPeriod, setBorrowPeriod] = useState('14');
  
  // Return Book State
  const [returnSearchQuery, setReturnSearchQuery] = useState('');
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Barcode Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<string>('');
  const scannerRef = useRef<any>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setShowScanner(false);
    setScannerStatus('');
  };

  const handleBarcodeScan = (barcode: string) => {
    stopScanner();
    // Try to find the book by ISBN (barcode) in the current library
    const found = libraryBooks.find(
      (b: any) => b.isbn === barcode || b.id === barcode
    );
    if (found) {
      setSelectedBook(found);
      setBookSearchQuery(found.title);
      const inventory = bookInventory.find(
        (inv: any) => inv.bookId === found.id && inv.libraryId === selectedLibrary
      );
      if (!inventory || inventory.availableCount <= 0) {
        setScannerStatus('unavailable');
        toast({ title: 'Book Unavailable', description: `"${found.title}" is currently not available for issue.`, variant: 'destructive' });
      } else {
        setScannerStatus('available');
        toast({ title: 'Book Found', description: `"${found.title}" by ${found.author} is available.` });
      }
    } else {
      setScannerStatus('not-found');
      toast({ title: 'Book Not Found', description: `No book found with barcode: ${barcode}`, variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (!showScanner || !scannerDivRef.current) return;
    let html5QrCode: any;
    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      html5QrCode = new Html5QrcodeScanner(
        'lms-barcode-reader',
        { fps: 10, qrbox: { width: 260, height: 160 }, rememberLastUsedCamera: true },
        false
      );
      html5QrCode.render(
        (decodedText: string) => { handleBarcodeScan(decodedText); },
        () => { /* ignore per-frame errors */ }
      );
      scannerRef.current = html5QrCode;
    }).catch(() => {
      setScannerStatus('error');
    });
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
        html5QrCode.clear().catch(() => {});
      }
    };
  }, [showScanner]);

  if (!user || user.role === 'citizen') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Book Circulation</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can manage book circulation.</p>
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

  const libraryBooks = useMemo(() => {
    if (!selectedLibrary) return [];
    const inventory = bookInventory.filter(inv => inv.libraryId === selectedLibrary && inv.availableCount > 0);
    return books.filter(b => inventory.some(inv => inv.bookId === b.id));
  }, [selectedLibrary]);

  const issuedTransactions = useMemo(() => {
    if (!selectedLibrary) return [];
    return circulationTransactions.filter(t => 
      t.libraryId === selectedLibrary && 
      (t.status === 'issued' || t.status === 'overdue')
    );
  }, [selectedLibrary]);

  const filteredMembers = libraryMembers.filter(m =>
    m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    m.membershipId.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const filteredBooks = libraryBooks.filter(b =>
    b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    b.isbn.toLowerCase().includes(bookSearchQuery.toLowerCase())
  );

  const filteredTransactions = issuedTransactions.filter(t => {
    const member = members.find(m => m.id === t.memberId);
    const book = books.find(b => b.id === t.bookId);
    return (
      member?.name.toLowerCase().includes(returnSearchQuery.toLowerCase()) ||
      member?.membershipId.toLowerCase().includes(returnSearchQuery.toLowerCase()) ||
      book?.title.toLowerCase().includes(returnSearchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(returnSearchQuery.toLowerCase())
    );
  });

  const getInventory = (bookId: string) => {
    return bookInventory.find(inv => inv.bookId === bookId && inv.libraryId === selectedLibrary);
  };

  const handleIssueBook = () => {
    if (!selectedMember || !selectedBook || !selectedLibrary) return;

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(borrowPeriod));

    const newTransaction = {
      id: `ct${Math.floor(Math.random() * 100000)}`,
      bookId: selectedBook.id,
      memberId: selectedMember.id,
      libraryId: selectedLibrary,
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'issued' as const,
      renewalCount: 0,
      fineAmount: 0,
    };

    circulationTransactions.push(newTransaction);

    // Update inventory
    const inventory = getInventory(selectedBook.id);
    if (inventory) {
      inventory.availableCount--;
    }

    // Update member borrowed books count
    const member = members.find(m => m.id === selectedMember.id);
    if (member) {
      member.borrowedBooks++;
    }

    toast({
      title: 'Book Issued Successfully',
      description: `"${selectedBook.title}" issued to ${selectedMember.name}. Due date: ${dueDate.toLocaleDateString()}`,
    });

    setShowIssueDialog(false);
    setSelectedMember(null);
    setSelectedBook(null);
    setMemberSearchQuery('');
    setBookSearchQuery('');
  };

  const handleReturnBook = () => {
    if (!selectedTransaction) return;

    const transaction = circulationTransactions.find(t => t.id === selectedTransaction.id);
    if (transaction) {
      transaction.status = 'returned';
      transaction.returnDate = new Date().toISOString().split('T')[0];

      // Calculate fine if overdue
      const dueDate = new Date(transaction.dueDate);
      const returnDate = new Date(transaction.returnDate);
      if (returnDate > dueDate) {
        const daysOverdue = Math.floor((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const fineAmount = daysOverdue * 10; // ₹10 per day
        transaction.fineAmount = fineAmount;

        // Update member fines
        const member = members.find(m => m.id === transaction.memberId);
        if (member) {
          member.finesDue += fineAmount;
        }
      }

      // Update inventory
      const inventory = getInventory(transaction.bookId);
      if (inventory) {
        inventory.availableCount++;
      }

      // Update member borrowed books count
      const member = members.find(m => m.id === transaction.memberId);
      if (member) {
        member.borrowedBooks--;
      }

      const book = books.find(b => b.id === transaction.bookId);
      toast({
        title: 'Book Returned Successfully',
        description: transaction.fineAmount > 0 
          ? `"${book?.title}" returned. Fine: ₹${transaction.fineAmount}` 
          : `"${book?.title}" returned on time.`,
      });
    }

    setShowReturnDialog(false);
    setSelectedTransaction(null);
    setReturnSearchQuery('');
  };

  const selectedBranch = libraryBranches.find(b => b.id === selectedLibrary);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Book Circulation</h1>
          <p className="text-muted-foreground mt-1">
            {selectedLibrary ? `Issue and return books at ${libraryBranches.find(l => l.id === selectedLibrary)?.name}` : 'Select a library to manage book circulation'}
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="issue" className="flex items-center gap-2">
                <ArrowRight size={16} />
                Issue Book
              </TabsTrigger>
              <TabsTrigger value="return" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Return Book
              </TabsTrigger>
            </TabsList>

            {/* ISSUE BOOK TAB */}
            <TabsContent value="issue" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Select Member */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <UserCheck className="w-4 h-4" />
                      Step 1: Select Member
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
                          value={memberSearchQuery}
                          onChange={e => setMemberSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {selectedMember ? (
                      <div className="p-4 rounded-lg border-2 border-accent bg-accent/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{selectedMember.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedMember.membershipId}</p>
                            <p className="text-xs text-muted-foreground mt-1">{selectedMember.email}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                Borrowed: {selectedMember.borrowedBooks}
                              </Badge>
                              {selectedMember.finesDue > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Fines: ₹{selectedMember.finesDue}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedMember(null)}>
                            Change
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {memberSearchQuery && filteredMembers.length > 0 ? (
                          filteredMembers.map(m => (
                            <button
                              key={m.id}
                              onClick={() => setSelectedMember(m)}
                              className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                            >
                              <p className="font-medium text-sm">{m.name}</p>
                              <p className="text-xs text-muted-foreground">{m.membershipId} • {m.email}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {m.membershipType}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Borrowed: {m.borrowedBooks}
                                </Badge>
                              </div>
                            </button>
                          ))
                        ) : memberSearchQuery ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No members found</p>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">Start typing to search members</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Select Book */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="w-4 h-4" />
                      Step 2: Select Book
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search Book</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            className="pl-10"
                            placeholder="Title, author, or ISBN..."
                            value={bookSearchQuery}
                            onChange={e => setBookSearchQuery(e.target.value)}
                            disabled={!selectedMember}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 flex items-center gap-1.5 min-w-[44px]"
                          disabled={!selectedMember}
                          onClick={() => setShowScanner(true)}
                          title="Scan Book Barcode"
                        >
                          <Camera size={15} />
                          <span className="hidden sm:inline text-xs">📷 Scan Book Barcode</span>
                        </Button>
                      </div>
                      {scannerStatus === 'unavailable' && (
                        <p className="text-xs text-destructive mt-1">⚠ This book is currently unavailable. Issuing is disabled.</p>
                      )}
                    </div>

                    {!selectedMember && (
                      <div className="text-center py-8">
                        <AlertCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Select a member first</p>
                      </div>
                    )}

                    {selectedMember && selectedBook ? (
                      <div className="p-4 rounded-lg border-2 border-accent bg-accent/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{selectedBook.title}</p>
                            <p className="text-sm text-muted-foreground">{selectedBook.author}</p>
                            <p className="text-xs text-muted-foreground mt-1">ISBN: {selectedBook.isbn}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                Available: {getInventory(selectedBook.id)?.availableCount}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedBook(null)}>
                            Change
                          </Button>
                        </div>
                      </div>
                    ) : selectedMember && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {bookSearchQuery && filteredBooks.length > 0 ? (
                          filteredBooks.map(b => {
                            const inventory = getInventory(b.id);
                            return (
                              <button
                                key={b.id}
                                onClick={() => setSelectedBook(b)}
                                className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                              >
                                <p className="font-medium text-sm">{b.title}</p>
                                <p className="text-xs text-muted-foreground">{b.author}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {b.genre}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Available: {inventory?.availableCount || 0}
                                  </Badge>
                                </div>
                              </button>
                            );
                          })
                        ) : bookSearchQuery ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No books found</p>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">Start typing to search books</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Issue Button */}
              {selectedMember && selectedBook && (
                <Card className="border-accent">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Ready to Issue</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Issue "{selectedBook.title}" to {selectedMember.name}
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowIssueDialog(true)}
                        className="bg-accent hover:bg-accent/90"
                        disabled={scannerStatus === 'unavailable'}
                        title={scannerStatus === 'unavailable' ? 'Book is unavailable for issue' : undefined}
                      >
                        <ArrowRight size={16} className="mr-2" />
                        Issue Book
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* RETURN BOOK TAB */}
            <TabsContent value="return" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowLeft className="w-4 h-4" />
                    Currently Issued Books ({issuedTransactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      className="pl-10"
                      placeholder="Search by member name, book title, or transaction ID..."
                      value={returnSearchQuery}
                      onChange={e => setReturnSearchQuery(e.target.value)}
                    />
                  </div>

                  {filteredTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Book</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.map(transaction => {
                            const member = members.find(m => m.id === transaction.memberId);
                            const book = books.find(b => b.id === transaction.bookId);
                            const isOverdue = new Date(transaction.dueDate) < new Date();

                            return (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{member?.name}</p>
                                    <p className="text-xs text-muted-foreground">{member?.membershipId}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{book?.title}</p>
                                    <p className="text-xs text-muted-foreground">{book?.author}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">{transaction.issueDate}</TableCell>
                                <TableCell className="text-sm">{transaction.dueDate}</TableCell>
                                <TableCell>
                                  <Badge variant={isOverdue ? 'destructive' : 'secondary'} className="text-xs">
                                    {isOverdue ? 'Overdue' : 'Issued'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTransaction(transaction);
                                      setShowReturnDialog(true);
                                    }}
                                  >
                                    Return
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
                      <p className="text-muted-foreground">No issued books found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Issue Confirmation Dialog */}
        <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Book Issue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <p className="text-sm"><strong>Member:</strong> {selectedMember?.name}</p>
                <p className="text-sm"><strong>Book:</strong> {selectedBook?.title}</p>
                <p className="text-sm"><strong>Author:</strong> {selectedBook?.author}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Borrow Period (Days)</label>
                <Select value={borrowPeriod} onValueChange={setBorrowPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days (Default)</SelectItem>
                    <SelectItem value="21">21 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Due date: {new Date(Date.now() + parseInt(borrowPeriod) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIssueDialog(false)}>Cancel</Button>
              <Button onClick={handleIssueBook} className="bg-accent hover:bg-accent/90">
                Confirm Issue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Return Confirmation Dialog */}
        <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Book Return</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (() => {
              const member = members.find(m => m.id === selectedTransaction.memberId);
              const book = books.find(b => b.id === selectedTransaction.bookId);
              const dueDate = new Date(selectedTransaction.dueDate);
              const today = new Date();
              const isOverdue = today > dueDate;
              const daysOverdue = isOverdue ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
              const fineAmount = daysOverdue * 10;

              return (
                <div className="space-y-4">
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>Member:</strong> {member?.name}</p>
                    <p className="text-sm"><strong>Book:</strong> {book?.title}</p>
                    <p className="text-sm"><strong>Issue Date:</strong> {selectedTransaction.issueDate}</p>
                    <p className="text-sm"><strong>Due Date:</strong> {selectedTransaction.dueDate}</p>
                  </div>
                  {isOverdue && (
                    <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-destructive">Overdue Return</p>
                      <p className="text-sm mt-1">Days overdue: {daysOverdue}</p>
                      <p className="text-sm">Fine amount: ₹{fineAmount} (₹10/day)</p>
                    </div>
                  )}
                  {!isOverdue && (
                    <div className="bg-success/10 border border-success/50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-success">On-Time Return</p>
                      <p className="text-sm mt-1">No fine applicable</p>
                    </div>
                  )}
                </div>
              );
            })()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Cancel</Button>
              <Button onClick={handleReturnBook} className="bg-accent hover:bg-accent/90">
                Confirm Return
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barcode Scanner Modal Overlay */}
      {showScanner && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) stopScanner(); }}
        >
          <div style={{
            background: 'white', borderRadius: '0.75rem',
            padding: '1.5rem', width: '100%', maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} />
                <span style={{ fontWeight: 600 }}>Scan Book Barcode</span>
              </div>
              <button
                onClick={stopScanner}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: '0.25rem' }}
                aria-label="Close scanner"
              >
                <X size={18} />
              </button>
            </div>
            <div ref={scannerDivRef} id="lms-barcode-reader" style={{ width: '100%' }} />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem', textAlign: 'center' }}>
              Point the camera at the book's barcode or QR code
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

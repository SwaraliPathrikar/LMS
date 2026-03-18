import { useState, useMemo } from 'react';
import { useBooks } from '@/contexts/BooksContext';
import { bookInventory, libraryBranches, genres, borrowRequests, members } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Book, IssueType } from '@/types/library';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, BookOpen, Download, ShoppingCart, Lock, Unlock, MapPin, Package, ArrowLeft, Eye, Send } from 'lucide-react';
import AudiobookIcon from '@/components/icons/AudiobookIcon';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AccessibilityBadge } from '@/components/AccessibilityBadge';
import { BookCover } from '@/components/BookCover';
import { toast } from 'sonner';

const issueTypeConfig: Record<IssueType, { label: string; icon: React.ElementType; color: string }> = {
  physical: { label: 'Physical Book', icon: BookOpen, color: 'bg-primary text-primary-foreground' },
  pdf: { label: 'PDF / E-Book', icon: Download, color: 'bg-info text-info-foreground' },
  movie: { label: 'Movie / Documentary', icon: Eye, color: 'bg-warning text-warning-foreground' },
  mp4: { label: 'Video / MP4', icon: Eye, color: 'bg-accent text-accent-foreground' },
  accessibility: { label: 'Accessibility (PwD)', icon: BookOpen, color: 'bg-success text-success-foreground' },
  audiobook: { label: 'Audiobook', icon: AudiobookIcon, color: 'bg-indigo-500 text-white' },
  'e-document': { label: 'E-Document', icon: Download, color: 'bg-purple-500 text-white' },
  'content-file': { label: 'Content File', icon: Package, color: 'bg-blue-500 text-white' },
  article: { label: 'Article', icon: BookOpen, color: 'bg-cyan-500 text-white' },
  'news-item': { label: 'News Item', icon: BookOpen, color: 'bg-red-500 text-white' },
  'loose-issue': { label: 'Loose Issue', icon: Package, color: 'bg-orange-500 text-white' },
  'internet-resource': { label: 'Internet Resource', icon: Download, color: 'bg-green-500 text-white' },
};

export default function BookSearch() {
  const { selectedLibrary } = useAuth();
  const { user } = useAuth();
  const { books } = useBooks();
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedResourceType, setSelectedResourceType] = useState<IssueType | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);
  const [showBookDetail, setShowBookDetail] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestBook, setRequestBook] = useState<Book | null>(null); // holds book for request form independently
  const [requestFormData, setRequestFormData] = useState({
    issueType: '',    reason: '',
    purpose: '',
    mobile: '',
  });

  const totalBooks = books.length;

  const filtered = useMemo(() => {
    let result = books;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.keywords.some(k => k.toLowerCase().includes(q))
      );
    }
    if (selectedGenre) {
      result = result.filter(b => b.genre === selectedGenre);
    }
    if (selectedResourceType) {
      result = result.filter(b => b.issueTypes.includes(selectedResourceType));
    }
    return result;
  }, [query, selectedGenre, selectedResourceType]);

  const getInventory = (bookId: string) =>
    bookInventory.filter(i => i.bookId === bookId);

  const handleIssueType = (type: IssueType) => {
    setSelectedIssueType(type);
  };

  const resetSelection = () => {
    setSelectedBook(null);
    setRequestBook(null);
    setSelectedIssueType(null);
    setShowBookDetail(false);
    setShowPayment(false);
    setShowRequestForm(false);
    setRequestFormData({ issueType: '', reason: '', purpose: '', mobile: '' });
  };

  const handleRequestBook = () => {
    if (!user || user.role !== 'citizen') {
      toast.error('Only citizens can request books');
      return;
    }

    if (!requestBook || !requestFormData.issueType || !requestFormData.reason || !requestFormData.purpose || !requestFormData.mobile) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newRequest = {
      id: `br${Date.now()}`,
      userId: user.id,
      userName: user.name,
      bookId: requestBook.id,
      libraryId: selectedLibrary || '',
      issueType: requestFormData.issueType as IssueType,
      reason: requestFormData.reason,
      purpose: requestFormData.purpose,
      mobile: requestFormData.mobile,
      email: user.email,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      responseDate: null,
      rejectionReason: null,
      notificationSent: false,
    };

    borrowRequests.push(newRequest);
    toast.success(
      <div className="flex items-start gap-2">
        <Send className="w-5 h-5 text-success mt-0.5" />
        <div>
          <p className="font-semibold">Request Submitted!</p>
          <p className="text-sm text-muted-foreground">Your request for "{requestBook.title}" has been sent to the librarian</p>
        </div>
      </div>
    );
    resetSelection();
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-header">Book Mapping</h1>
              <p className="text-muted-foreground mt-1">Search, browse and access library resources</p>
            </div>
            <Card className="stat-card px-6 py-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{totalBooks}</p>
                <p className="text-xs text-muted-foreground">Total Books</p>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search by title, author, or keywords..."
              className="pl-10 h-12 text-base"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Genre</label>
              <Select value={selectedGenre || 'all'} onValueChange={(value) => setSelectedGenre(value === 'all' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Resource Type</label>
              <Select value={selectedResourceType || 'all'} onValueChange={(value) => setSelectedResourceType(value === 'all' ? null : value as IssueType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resource type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(issueTypeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Book Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(book => (
              <Card
                key={book.id}
                className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden"
                onClick={() => { setSelectedBook(book); setShowBookDetail(true); setSelectedIssueType(null); }}
              >
                <div className="h-48 bg-primary/5 flex items-center justify-center overflow-hidden">
                  <BookCover
                    title={book.title}
                    author={book.author}
                    genre={book.genre}
                    bookId={book.id}
                    coverImage={book.coverImage}
                    className="w-full h-full"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {book.issueTypes.slice(0, 3).map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {issueTypeConfig[t]?.label?.split(' ')[0]}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {book.accessType === 'public' ? (
                      <span className="flex items-center text-xs text-success"><Unlock size={12} className="mr-1" /> Public</span>
                    ) : (
                      <span className="flex items-center text-xs text-warning"><Lock size={12} className="mr-1" /> Restricted</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No books found</p>
              <p className="text-sm">Try different search terms or genre filters</p>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Book Detail Dialog */}
      <Dialog open={showBookDetail} onOpenChange={(open) => { setShowBookDetail(open); if (!open && !showRequestForm) setSelectedBook(null); }}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
            <DialogDescription>Book details and information</DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Author:</span> <strong>{selectedBook.author}</strong></div>
                <div><span className="text-muted-foreground">Genre:</span> <strong>{selectedBook.genre}</strong></div>
                <div><span className="text-muted-foreground">ISBN:</span> <strong>{selectedBook.isbn}</strong></div>
                <div><span className="text-muted-foreground">Language:</span> <strong>{selectedBook.language}</strong></div>
                <div><span className="text-muted-foreground">Year:</span> <strong>{selectedBook.publishedYear > 0 ? selectedBook.publishedYear : `${Math.abs(selectedBook.publishedYear)} BCE`}</strong></div>
                <div><span className="text-muted-foreground">Pages:</span> <strong>{selectedBook.pages}</strong></div>
              </div>
              {selectedBook.description && (
                <p className="text-sm text-muted-foreground">{selectedBook.description}</p>
              )}
              <div>
                <p className="text-sm font-medium mb-2">Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {selectedBook.keywords.map(k => (
                    <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                  ))}
                </div>
              </div>
              {selectedBook.accessibilityFeatures && selectedBook.accessibilityFeatures.length > 0 && (
                <div>
                  <AccessibilityBadge features={selectedBook.accessibilityFeatures} />
                </div>
              )}
              {selectedBook.cost && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Cost</p>
                  <p className="text-lg font-bold text-warning">₹{selectedBook.cost}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowBookDetail(false)} variant="outline" className="flex-1">
                  Close
                </Button>
                {user?.role === 'citizen' && (
                  <Button onClick={() => {
                    const book = selectedBook!;
                    setRequestBook(book);
                    // pre-fill if only one issue type
                    if (book.issueTypes?.length === 1) {
                      setRequestFormData(prev => ({ ...prev, issueType: book.issueTypes[0] }));
                    }
                    setShowBookDetail(false);
                    setShowRequestForm(true);
                  }} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Send size={16} className="mr-2" /> Request This Book
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Gateway</DialogTitle>
            <DialogDescription>Complete your payment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Book: <strong className="text-foreground">{selectedBook?.title}</strong></p>
              <p className="text-sm text-muted-foreground">Amount: <strong className="text-foreground">₹{selectedBook?.cost}</strong></p>
            </div>
            <div className="space-y-3">
              <Input placeholder="Card Number" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="MM/YY" />
                <Input placeholder="CVV" />
              </div>
              <Input placeholder="Cardholder Name" />
            </div>
            <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
              Pay ₹{selectedBook?.cost}
            </Button>
            <p className="text-xs text-center text-muted-foreground">This is a demo payment gateway</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Book Form Dialog */}
      <Dialog open={showRequestForm} onOpenChange={(open) => { if (!open) resetSelection(); else setShowRequestForm(true); }}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Book</DialogTitle>
            <DialogDescription>Submit your book request</DialogDescription>
          </DialogHeader>
          {requestBook && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleRequestBook(); }}>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-sm font-medium">{requestBook.title}</p>
                <p className="text-xs text-muted-foreground mt-1">by {requestBook.author}</p>
              </div>

              <div className="space-y-2">
                <Label>Issue Type *</Label>
                {requestBook.issueTypes?.length === 1 ? (
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {issueTypeConfig[requestBook.issueTypes[0]]?.label ?? requestBook.issueTypes[0]}
                  </div>
                ) : (
                  <Select value={requestFormData.issueType} onValueChange={(value) => setRequestFormData({ ...requestFormData, issueType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {(requestBook.issueTypes ?? []).map(type => (
                        <SelectItem key={type} value={type}>
                          {issueTypeConfig[type]?.label ?? type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reason *</Label>
                <Textarea 
                  placeholder="Why do you need this book?" 
                  value={requestFormData.reason}
                  onChange={e => setRequestFormData({ ...requestFormData, reason: e.target.value })}
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label>Purpose *</Label>
                <Input 
                  placeholder="e.g., Academic / Research / Personal" 
                  value={requestFormData.purpose}
                  onChange={e => setRequestFormData({ ...requestFormData, purpose: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input 
                  placeholder="+91 XXXXX XXXXX" 
                  value={requestFormData.mobile}
                  onChange={e => setRequestFormData({ ...requestFormData, mobile: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={resetSelection}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Send size={16} className="mr-2" /> Submit Request
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

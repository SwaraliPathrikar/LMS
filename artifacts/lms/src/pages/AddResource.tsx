import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBooks } from '@/contexts/BooksContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { libraryBranches, genres } from '@/data/mockData';
import { toast } from 'sonner';

export default function AddResource() {
  const { user, selectedLibrary } = useAuth();
  const { books, addBook } = useBooks();
  const navigate = useNavigate();
  
  // Check access - only admin and librarian can add resources
  if (!user || (user.role !== 'admin' && user.role !== 'librarian')) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Add Resource / Book</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can add resources.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Librarians must have a selected library
  if (user.role === 'librarian' && !selectedLibrary) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Add Resource / Book</h1>
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
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('English');
  const [year, setYear] = useState('');
  const [pages, setPages] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [issueTypes, setIssueTypes] = useState<Record<string, boolean>>({
    physical: false,
    pdf: false,
    audiobook: false,
    movie: false,
    mp4: false,
    accessibility: false,
    'e-document': false,
    'content-file': false,
    article: false,
    'news-item': false,
    'loose-issue': false,
    'internet-resource': false,
  });
  const [accessConfig, setAccessConfig] = useState({ free: false, payable: false });
  const [cost, setCost] = useState('');
  const [accessType, setAccessType] = useState<'public' | 'restricted'>('public');
  const [borrowPeriod, setBorrowPeriod] = useState('14');
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([]);
  const [quantity, setQuantity] = useState('1');
  const [showConflict, setShowConflict] = useState(false);
  const [conflictLibrary, setConflictLibrary] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageName, setCoverImageName] = useState('');
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<string[]>([]);

  const accessibilityOptions = [
    { id: 'large-print', label: 'Large Print' },
    { id: 'audiobook', label: 'Audiobook' },
    { id: 'braille', label: 'Braille' },
    { id: 'high-contrast', label: 'High Contrast' },
    { id: 'screen-reader-optimized', label: 'Screen Reader Optimized' },
    { id: 'dyslexia-friendly', label: 'Dyslexia Friendly' },
  ];

  const toggleAccessibilityFeature = (featureId: string) => {
    setAccessibilityFeatures(prev =>
      prev.includes(featureId) ? prev.filter(f => f !== featureId) : [...prev, featureId]
    );
  };

  const addKeyword = () => {
    if (keywordInput.trim() && keywords.length < 10) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (idx: number) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  const toggleLibrary = (id: string) => {
    setSelectedLibraries(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.length < 5) {
      toast.error('Please add at least 5 keywords for better searchability');
      return;
    }

    // Simulate conflict detection
    const existingBook = books.find(b => b.title.toLowerCase() === title.toLowerCase());
    if (existingBook && selectedLibraries.length > 0) {
      setConflictLibrary(libraryBranches.find(l => l.id === selectedLibraries[0])?.name || '');
      setShowConflict(true);
      return;
    }

    // Create new book object
    const newBook = {
      id: `b${Date.now()}`,
      title,
      author,
      isbn,
      genre,
      keywords,
      coverImage: coverImage || undefined,
      pdfUrl: pdfFile || undefined,
      issueTypes: (Object.keys(issueTypes).filter(k => issueTypes[k]) as any[]),
      accessType: accessType,
      category: Object.keys(accessConfig).filter(k => accessConfig[k as keyof typeof accessConfig]) as any[],
      cost: accessConfig.payable ? parseInt(cost) || 0 : undefined,
      borrowPeriodDays: parseInt(borrowPeriod),
      downloadCount: 0,
      publisher: '',
      language,
      publishedYear: parseInt(year) || new Date().getFullYear(),
      pages: parseInt(pages) || 0,
      description,
      accessibilityFeatures: accessibilityFeatures as any,
    };

    // Add book to books array using context
    addBook(newBook);

    // For librarians, auto-select their library
    if (user.role === 'librarian' && selectedLibrary) {
      setSelectedLibraries([selectedLibrary]);
    }

    // Reset form
    setTitle('');
    setAuthor('');
    setIsbn('');
    setGenre('');
    setLanguage('English');
    setYear('');
    setPages('');
    setDescription('');
    setKeywords([]);
    setKeywordInput('');
    setIssueTypes({ physical: false, pdf: false, audiobook: false, movie: false, mp4: false, accessibility: false, 'e-document': false, 'content-file': false, article: false, 'news-item': false, 'loose-issue': false, 'internet-resource': false });
    setAccessConfig({ free: false, payable: false });
    setCost('');
    setAccessType('public');
    setBorrowPeriod('14');
    setSelectedLibraries([]);
    setQuantity('1');
    setCoverImage(null);
    setCoverImageName('');
    setPdfFile(null);
    setPdfFileName('');
    setAccessibilityFeatures([]);

    toast.success('Resource added successfully to selected libraries!');
  };

  const handleConflictResolve = (increaseCount: boolean) => {
    setShowConflict(false);
    if (increaseCount) {
      toast.success('Book count increased in the existing inventory');
    } else {
      toast.info('Skipped duplicate entry');
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
        setCoverImageName(file.name);
        toast.success(`Cover image "${file.name}" uploaded successfully`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        toast.error('Please upload a PDF file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPdfFile(event.target?.result as string);
        setPdfFileName(file.name);
        toast.success(`PDF "${file.name}" uploaded successfully`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="page-header">Add Resource / Book</h1>
          <p className="text-muted-foreground mt-1">Upload and catalog new resources to the library inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Book title" required />
                </div>
                <div className="space-y-2">
                  <Label>Author *</Label>
                  <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" required />
                </div>
                <div className="space-y-2">
                  <Label>ISBN</Label>
                  <Input value={isbn} onChange={e => setIsbn(e.target.value)} placeholder="ISBN number" />
                </div>
                <div className="space-y-2">
                  <Label>Genre *</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
                    <SelectContent>
                      {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input value={language} onChange={e => setLanguage(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Published Year</Label>
                  <Input type="number" value={year} onChange={e => setYear(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pages</Label>
                  <Input type="number" value={pages} onChange={e => setPages(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the book" rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Keywords (min. 5 required)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={keywordInput} onChange={e => setKeywordInput(e.target.value)} placeholder="Add keyword" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())} />
                <Button type="button" onClick={addKeyword} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((k, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {k}
                    <button type="button" onClick={() => removeKeyword(i)}><X size={12} /></button>
                  </Badge>
                ))}
              </div>
              {keywords.length < 5 && <p className="text-xs text-warning">Add {5 - keywords.length} or more keyword(s)</p>}
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Accessibility Features</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Select all applicable accessibility features for this resource:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {accessibilityOptions.map(option => (
                  <label key={option.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                    <Checkbox 
                      checked={accessibilityFeatures.includes(option.id)} 
                      onCheckedChange={() => toggleAccessibilityFeature(option.id)} 
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              {accessibilityFeatures.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {accessibilityFeatures.map(feature => (
                    <Badge key={feature} variant="secondary" className="gap-1">
                      {accessibilityOptions.find(o => o.id === feature)?.label}
                      <button type="button" onClick={() => toggleAccessibilityFeature(feature)}><X size={12} /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload & Category */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Issue Types & Category</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Issue Types (select all that apply) *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'physical', label: 'Physical Copy' },
                    { key: 'pdf', label: 'PDF / E-Book' },
                    { key: 'audiobook', label: 'Audiobook' },
                    { key: 'movie', label: 'Movie / Documentary' },
                    { key: 'mp4', label: 'Video / MP4' },
                    { key: 'accessibility', label: 'Accessibility (PwD)' },
                    { key: 'e-document', label: 'E-Document' },
                    { key: 'content-file', label: 'Content File' },
                    { key: 'article', label: 'Article' },
                    { key: 'news-item', label: 'News Item' },
                    { key: 'loose-issue', label: 'Loose Issue' },
                    { key: 'internet-resource', label: 'Internet Resource' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                      <Checkbox
                        checked={!!issueTypes[key]}
                        onCheckedChange={(c) => setIssueTypes({ ...issueTypes, [key]: !!c })}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <Checkbox checked={accessConfig.free} onCheckedChange={(c) => setAccessConfig({ ...accessConfig, free: !!c })} />
                  <span className="text-sm">Free</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={accessConfig.payable} onCheckedChange={(c) => setAccessConfig({ ...accessConfig, payable: !!c })} />
                  <span className="text-sm">Payable</span>
                </label>
              </div>

              {accessConfig.payable && (
                <div className="space-y-2">
                  <Label>Cost (₹)</Label>
                  <Input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="Price" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Access Type</Label>
                  <Select value={accessType} onValueChange={(v) => setAccessType(v as 'public' | 'restricted')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public Access</SelectItem>
                      <SelectItem value="restricted">Restricted (Login Required)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Borrow Period (days)</Label>
                  <Input type="number" value={borrowPeriod} onChange={e => setBorrowPeriod(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                    id="cover-image-input"
                  />
                  <label htmlFor="cover-image-input" className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors block">
                    {coverImage ? (
                      <div className="space-y-2">
                        <img src={coverImage} alt="Cover preview" className="w-24 h-32 mx-auto object-cover rounded" />
                        <p className="text-sm text-success font-medium">{coverImageName}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload cover image (optional)</p>
                        <p className="text-xs text-muted-foreground mt-1">Click to select or drag and drop</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {issueTypes['pdf'] && (
                <div className="space-y-2">
                  <Label>Upload PDF/Document</Label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      id="pdf-input"
                    />
                    <label htmlFor="pdf-input" className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors block">
                      {pdfFile ? (
                        <div className="space-y-2">
                          <Upload size={24} className="mx-auto mb-2 text-success" />
                          <p className="text-sm text-success font-medium">{pdfFileName}</p>
                          <p className="text-xs text-muted-foreground">Click to change</p>
                        </div>
                      ) : (
                        <div>
                          <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Upload PDF, EPUB, or document file</p>
                          <p className="text-xs text-muted-foreground mt-1">Click to select or drag and drop</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Library Assignment */}
          {issueTypes['physical'] && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Assign to Libraries</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Quantity per Library</Label>
                  <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" className="w-32" />
                </div>
                <div className="space-y-2">
                  {user.role === 'admin' ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">Select libraries to add this book:</p>
                      {libraryBranches.map(lib => (
                        <label key={lib.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer">
                          <Checkbox checked={selectedLibraries.includes(lib.id)} onCheckedChange={() => toggleLibrary(lib.id)} />
                          <div>
                            <span className="text-sm font-medium">{lib.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{lib.address}</span>
                          </div>
                        </label>
                      ))}
                    </>
                  ) : (
                    <div className="p-4 rounded-lg bg-secondary/50 border border-secondary">
                      <p className="text-sm font-medium mb-2">Your Library:</p>
                      <div className="p-3 rounded-lg bg-background border border-accent/50">
                        <p className="text-sm font-semibold">{libraryBranches.find(l => l.id === selectedLibrary)?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{libraryBranches.find(l => l.id === selectedLibrary)?.address}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">As a librarian, you can only add books to your assigned library.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 h-11">
            Add Resource
          </Button>
        </form>

        {/* Conflict Dialog */}
        <Dialog open={showConflict} onOpenChange={setShowConflict}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle size={20} /> Duplicate Detected
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                "<strong className="text-foreground">{title}</strong>" already exists at <strong className="text-foreground">{conflictLibrary}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                This book may have been added by the branch librarian. Would you like to increase the count?
              </p>
              <div className="flex gap-3">
                <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleConflictResolve(true)}>
                  Yes, Increase Count
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleConflictResolve(false)}>
                  No, Skip
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

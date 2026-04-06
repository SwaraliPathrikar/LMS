import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { useBooks } from '@/contexts/BooksContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, BookOpen, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { IssueType } from '@/types/library';

const issueTypeLabels: Record<string, string> = {
  physical: 'Physical Copy',
  pdf: 'Digital / PDF',
  mp4: 'Video (MP4)',
  audiobook: 'Audiobook',
  'e-document': 'E-Document',
  'content-file': 'Content File',
  article: 'Article',
  'news-item': 'News Item',
  'loose-issue': 'Loose Issue',
  'internet-resource': 'Internet Resource',
  accessibility: 'Accessibility Format',
  movie: 'Movie',
};

// A book is considered a research paper if it has researchDomain/researchField,
// or its genre is Research/Library Science/Social Science, or issueTypes include article/loose-issue
function isResearchPaper(book: any): boolean {
  if (book.researchDomain || book.researchField) return true;
  const researchGenres = ['research', 'library science', 'social science'];
  if (researchGenres.includes(book.genre?.toLowerCase())) return true;
  const researchTypes = ['article', 'loose-issue'];
  return book.issueTypes?.some((t: string) => researchTypes.includes(t)) ?? false;
}

export default function BorrowRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { books } = useBooks();

  const bookId = searchParams.get('bookId');
  const book = bookId ? books.find(b => b.id === bookId) : null;

  const [issueType, setIssueType] = useState<string>('');
  const [libraryId, setLibraryId] = useState<string>('');
  const [libraries, setLibraries] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [purpose, setPurpose] = useState('');

  const isResearch = book ? isResearchPaper(book) : false;

  useEffect(() => {
    api.libraries.list().then(setLibraries).catch(console.error);
    if (book?.issueTypes?.length === 1) setIssueType(book.issueTypes[0]);
  }, [book]);

  if (!book) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
          <BookOpen size={48} className="opacity-30" />
          <p className="text-lg">No book selected.</p>
          <Button variant="outline" onClick={() => navigate('/resources')}>
            <ArrowLeft size={16} className="mr-2" /> Browse Resources
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async () => {
    if (!issueType)     { toast.error('Please select an issue type'); return; }
    if (!libraryId)     { toast.error('Please select a library'); return; }
    if (isResearch && !reason.trim())  { toast.error('Please provide a reason'); return; }
    if (isResearch && !purpose.trim()) { toast.error('Please provide a purpose'); return; }

    try {
      await api.borrow.create({
        bookId: book!.id, libraryId,
        issueType, reason: reason || 'General borrowing',
        purpose: purpose || 'Personal use', mobile: '',
      });
      toast.success('Request submitted! The librarian will review it shortly.');
      navigate('/user/requests');
    } catch (e: any) { toast.error(e.message ?? 'Failed to submit request'); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl space-y-5">

        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>

        <div>
          <h1 className="page-header">Request Book</h1>
          <p className="text-muted-foreground mt-1">Fill in the details to submit your borrow request</p>
        </div>

        {/* Book info card */}
        <Card className="bg-accent/10 border-accent/30">
          <CardContent className="p-4 flex gap-4 items-start">
            <BookOpen size={36} className="text-accent mt-1 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-base leading-tight">{book.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">{book.genre}</Badge>
                <Badge variant="outline" className="text-xs">{book.language}</Badge>
                {book.publishedYear > 0 && (
                  <Badge variant="outline" className="text-xs">{book.publishedYear}</Badge>
                )}
                {isResearch && (
                  <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">Research</Badge>
                )}
              </div>
              {book.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{book.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Issue Type */}
            <div className="space-y-1.5">
              <Label>Issue Type <span className="text-destructive">*</span></Label>
              {book.issueTypes.length === 1 ? (
                <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
                  {issueTypeLabels[book.issueTypes[0]] ?? book.issueTypes[0]}
                </div>
              ) : (
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select how you want this resource..." />
                  </SelectTrigger>
                  <SelectContent>
                    {book.issueTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {issueTypeLabels[type] ?? type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Library */}
            <div className="space-y-1.5">
              <Label>Library <span className="text-destructive">*</span></Label>
              <Select value={libraryId} onValueChange={setLibraryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a library..." />
                </SelectTrigger>
                <SelectContent>
                  {libraries.map(lib => (
                    <SelectItem key={lib.id} value={lib.id}>{lib.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason & Purpose — only for research papers */}
            {isResearch && (
              <>
                <div className="space-y-1.5">
                  <Label>Reason <span className="text-destructive">*</span></Label>
                  <Textarea
                    placeholder="Why do you need this research paper?"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="min-h-20 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Purpose / Use <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g. MSc thesis, project work, academic study..."
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button onClick={handleSubmit} className="w-full mt-2">
              <Send size={15} className="mr-2" /> Submit Request
            </Button>

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBooks } from '@/contexts/BooksContext';
import * as api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BookCover } from '@/components/BookCover';

export default function AllResourcesPage() {
  const { user, selectedLibrary } = useAuth();
  const { books } = useBooks();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [allLibraries, setAllLibraries] = useState<any[]>([]);
  const [allInventory, setAllInventory] = useState<any[]>([]);

  useEffect(() => {
    api.libraries.list().then(setAllLibraries).catch(console.error);
    if (selectedLibrary) {
      api.books.list({ libraryId: selectedLibrary, limit: '500' })
        .then(d => setAllInventory((d.books ?? d).flatMap((b: any) => b.inventory ?? [])))
        .catch(console.error);
    }
  }, [selectedLibrary]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const filtered = useMemo(() => {
    return books.filter(b =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase()) ||
      b.isbn.toLowerCase().includes(query.toLowerCase())
    );
  }, [books, query]);

  const getInventory = (bookId: string) => {
    if (!selectedLibrary) return null;
    return allInventory.find((bi: any) => bi.bookId === bookId && bi.libraryId === selectedLibrary);
  };

  const library = allLibraries.find(l => l.id === selectedLibrary);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">All Resources</h1>
          <p className="text-muted-foreground mt-1">
            {library ? `Browse all resources in ${library.name}` : 'Browse all library resources'}
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Search className="w-5 h-5 text-muted-foreground mt-2.5" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Physical & Digital Resources ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No resources found</p>
                  <p className="text-sm">Try different search terms</p>
                </div>
              ) : (
                filtered.map(book => {
                  const inv = getInventory(book.id);
                  return (
                    <Card
                      key={book.id}
                      className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden flex flex-col"
                      onClick={() => setSelectedBook(book)}
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
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-2">{book.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {book.issueTypes.slice(0, 2).map(type => (
                            <Badge key={type} variant="secondary" className="text-[10px]">
                              {type}
                            </Badge>
                          ))}
                          {book.issueTypes.length > 2 && (
                            <Badge variant="secondary" className="text-[10px]">
                              +{book.issueTypes.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-auto pt-3 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Genre:</span>
                            <span className="font-medium">{book.genre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Available:</span>
                            <span className={`font-medium ${inv && inv.availableCount > 0 ? 'text-success' : 'text-destructive'}`}>
                              {inv ? `${inv.availableCount}/${inv.totalCount}` : '-'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Book Details Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Author</p>
                  <p className="font-semibold">{selectedBook.author}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISBN</p>
                  <p className="font-semibold">{selectedBook.isbn}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Genre</p>
                  <p className="font-semibold">{selectedBook.genre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-semibold">{selectedBook.language}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published Year</p>
                  <p className="font-semibold">{selectedBook.publishedYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="font-semibold">{selectedBook.pages || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{selectedBook.description || 'No description available'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Issue Types</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBook.issueTypes.map((type: string) => (
                    <Badge key={type} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Accessibility Features</p>
                {selectedBook.accessibilityFeatures && selectedBook.accessibilityFeatures.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedBook.accessibilityFeatures.map((feature: string) => (
                      <Badge key={feature} className="bg-green-100 text-green-800">{feature}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No accessibility features</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Access Type</p>
                  <Badge className={selectedBook.accessType === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {selectedBook.accessType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="font-semibold">{selectedBook.downloadCount}</p>
                </div>
              </div>

              {selectedBook.cost && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Cost</p>
                  <p className="text-lg font-bold text-warning">₹{selectedBook.cost}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setSelectedBook(null)} variant="outline" className="flex-1">
                  Close
                </Button>
                {user?.role === 'citizen' ? (
                  <Button
                    onClick={() => navigate(`/borrow-requests?bookId=${selectedBook.id}`)}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    Request This Book
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/books/search')} className="flex-1 bg-accent hover:bg-accent/90">
                    Borrow This Book
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

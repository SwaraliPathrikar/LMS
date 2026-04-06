import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Book } from '@/types/library';
import * as api from '@/lib/api';

interface BooksContextType {
  books: Book[];
  loading: boolean;
  addBook: (book: Omit<Book, 'id'>) => Promise<Book>;
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  refetch: () => Promise<void>;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export const BooksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.books.list({ limit: '500' });
      setBooks(data.books ?? data);
    } catch (e) {
      console.error('Failed to load books', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const addBook = useCallback(async (book: Omit<Book, 'id'>) => {
    const created = await api.books.create(book);
    setBooks(prev => [...prev, created]);
    return created;
  }, []);

  const updateBook = useCallback(async (bookId: string, updates: Partial<Book>) => {
    const updated = await api.books.update(bookId, updates);
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, ...updated } : b));
  }, []);

  return (
    <BooksContext.Provider value={{ books, loading, addBook, updateBook, refetch: fetchBooks }}>
      {children}
    </BooksContext.Provider>
  );
};

export const useBooks = () => {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks must be used within BooksProvider');
  return ctx;
};

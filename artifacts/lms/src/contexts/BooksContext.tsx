import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Book } from '@/types/library';
import { books as initialBooks } from '@/data/mockData';

const STORAGE_KEY = 'lms_books';

function loadBooks(): Book[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return initialBooks;
}

interface BooksContextType {
  books: Book[];
  addBook: (book: Book) => void;
  updateBook: (bookId: string, updates: Partial<Book>) => void;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export const BooksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(loadBooks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = useCallback((book: Book) => {
    setBooks(prev => [...prev, book]);
  }, []);

  const updateBook = useCallback((bookId: string, updates: Partial<Book>) => {
    setBooks(prev =>
      prev.map(book =>
        book.id === bookId ? { ...book, ...updates } : book
      )
    );
  }, []);

  return (
    <BooksContext.Provider value={{ books, addBook, updateBook }}>
      {children}
    </BooksContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks must be used within BooksProvider');
  }
  return context;
};

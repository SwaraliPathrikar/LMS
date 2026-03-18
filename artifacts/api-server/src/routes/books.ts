import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Minimal book data mirroring the LMS mock — used for barcode lookup
const books = [
  { id: 'b1', title: 'The Discovery of India', author: 'Jawaharlal Nehru', isbn: '978-0-14-303103-5', genre: 'History' },
  { id: 'b2', title: 'Wings of Fire', author: 'Dr APJ Abdul Kalam', isbn: '978-81-7371-146-6', genre: 'Biography' },
  { id: 'b3', title: 'Malgudi Days', author: 'R.K. Narayan', isbn: '978-0-14-018564-5', genre: 'Fiction' },
  { id: 'b4', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0-262-03384-8', genre: 'Technology' },
  { id: 'b5', title: 'Gitanjali', author: 'Rabindranath Tagore', isbn: '978-0-14-044-5', genre: 'Poetry' },
  { id: 'b6', title: 'My Experiments with Truth', author: 'Mahatma Gandhi', isbn: '978-0-14-044-6', genre: 'Autobiography' },
  { id: 'b7', title: 'The White Tiger', author: 'Aravind Adiga', isbn: '978-1-4165-6259-7', genre: 'Fiction' },
  { id: 'b8', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0-553-38016-3', genre: 'Science' },
];

/**
 * GET /api/book/:barcode
 * Looks up a book by ISBN or ID (barcode value).
 * Returns book info + availability status.
 */
router.get("/book/:barcode", (req, res) => {
  const { barcode } = req.params;
  const book = books.find(b => b.isbn === barcode || b.id === barcode);

  if (!book) {
    return res.status(404).json({ error: "Book not found", barcode });
  }

  return res.json({
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    genre: book.genre,
    barcode: book.isbn,
  });
});

export default router;

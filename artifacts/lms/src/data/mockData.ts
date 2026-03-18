import { Department, LibraryBranch, Book, BookInventory, Member, BorrowRequest, Fine, CheckInRecord, User, Event, EventRegistration, DigitalResource, DownloadLog, CirculationTransaction, Renewal, Notification, SystemSettings, LibrarySettings } from '@/types/library';


export interface UserCredential extends User {
  password: string;
  libraryId?: string; 
}

export const users: UserCredential[] = [
  // ADMIN
  { id: 'u1', name: 'Admin', email: 'admin@corp.gov.in', role: 'admin', password: 'admin@123', avatar: '' },

  // LIBRARIANS (each assigned to a specific library)
  { id: 'u2', name: 'Dr. Meera Kulkarni', email: 'meera.kulkarni@lib.gov.in', role: 'librarian', password: 'librarian@123', libraryId: 'lib1', avatar: '' },
  { id: 'u3', name: 'Shri. Ramesh Patil', email: 'ramesh.patil@lib.gov.in', role: 'librarian', password: 'librarian@456', libraryId: 'lib2', avatar: '' },
  { id: 'u4', name: 'Smt. Anita Joshi', email: 'anita.joshi@lib.gov.in', role: 'librarian', password: 'librarian@789', libraryId: 'lib3', avatar: '' },

  // CITIZENS
  { id: 'u5', name: 'Rajesh Sharma', email: 'rajesh@email.com', role: 'citizen', password: 'citizen@123', avatar: '' },
  { id: 'u6', name: 'Priya Desai', email: 'priya@email.com', role: 'citizen', password: 'citizen@456', avatar: '' },
  { id: 'u7', name: 'Amit Kulkarni', email: 'amit@email.com', role: 'citizen', password: 'citizen@789', avatar: '' },
];

export const mockUser: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@corp.gov.in',
  role: 'admin',
  avatar: '',
};

export const departments: Department[] = [
  { id: 'edu', name: 'Education Department', cluster: 'Education', description: 'Libraries under education cluster', icon: 'GraduationCap' },
  { id: 'gov', name: 'Government Services', cluster: 'Government', description: 'Government documentation & public records', icon: 'Landmark' },
  { id: 'culture', name: 'Arts & Culture', cluster: 'Culture', description: 'Cultural heritage & arts collections', icon: 'Palette' },
  { id: 'tech', name: 'Science & Technology', cluster: 'Technology', description: 'Technical & scientific resources', icon: 'Cpu' },
  { id: 'health', name: 'Health & Welfare', cluster: 'Health', description: 'Medical & public health resources', icon: 'Heart' },
  { id: 'law', name: 'Law & Justice', cluster: 'Legal', description: 'Legal documentation & law libraries', icon: 'Scale' },
];

export let libraryBranches: LibraryBranch[] = [
  { id: 'lib1', name: 'Central Municipal Library', departmentId: 'edu', address: 'Shivaji Chowk, Nanded - 431601', lat: 19.1383, lng: 77.3210, mapLink: 'https://maps.google.com/?q=19.1383,77.3210', phone: '+91 2462 253 1234', librarian: 'Dr. Meera Kulkarni' },
  { id: 'lib2', name: 'Vazirabad Branch Library', departmentId: 'edu', address: 'Vazirabad, Nanded - 431602', lat: 19.1520, lng: 77.3150, mapLink: 'https://maps.google.com/?q=19.1520,77.3150', phone: '+91 2462 267 5678', librarian: 'Shri. Ramesh Patil' },
  { id: 'lib3', name: 'Taroda Reading Center', departmentId: 'edu', address: 'Taroda, Nanded - 431605', lat: 19.1250, lng: 77.2980, mapLink: 'https://maps.google.com/?q=19.1250,77.2980', phone: '+91 2462 246 9012', librarian: 'Smt. Anita Joshi' },
  { id: 'lib4', name: 'Vishnupuri Community Library', departmentId: 'edu', address: 'Vishnupuri, Nanded - 431606', lat: 19.1450, lng: 77.3350, mapLink: 'https://maps.google.com/?q=19.1450,77.3350', phone: '+91 2462 287 3456', librarian: 'Shri. Vijay More' },
  { id: 'lib5', name: 'MIDC Digital Library', departmentId: 'tech', address: 'MIDC Area, Nanded - 431603', lat: 19.1600, lng: 77.3100, mapLink: 'https://maps.google.com/?q=19.1600,77.3100', phone: '+91 2462 242 7890', librarian: 'Dr. Sunil Deshmukh' },
  { id: 'lib6', name: 'Government Records Archive', departmentId: 'gov', address: 'Civil Lines, Nanded - 431604', lat: 19.1400, lng: 77.3280, mapLink: 'https://maps.google.com/?q=19.1400,77.3280', phone: '+91 2462 212 0123', librarian: 'Shri. Prakash Gaikwad' },
];

// Helper function to generate book cover images - returns undefined to use SVG fallback
const generateBookCover = (title: string, author: string, color: string): string | undefined => {
  // Return undefined to use the BookCover component's SVG fallback
  return undefined;
};

export const books: Book[] = [
  { id: 'b1', title: 'The Discovery of India', author: 'Jawaharlal Nehru', isbn: '978-0-14-303103-5', genre: 'History', keywords: ['india', 'history', 'freedom', 'nehru', 'independence', 'culture'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 1250, language: 'English', publishedYear: 1946, pages: 595, description: 'An exploration of Indian history, culture, and philosophy.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('The Discovery of India', 'Jawaharlal Nehru', '8B4513') },
  { id: 'b2', title: 'Wings of Fire', author: 'Dr APJ Abdul Kalam', isbn: '978-81-7371-146-6', genre: 'Biography', keywords: ['autobiography', 'missile', 'science', 'india', 'inspiration', 'kalam'], issueTypes: ['physical', 'pdf', 'accessibility'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 3400, language: 'English', publishedYear: 1999, pages: 180, description: 'The autobiography of APJ Abdul Kalam.', accessibilityFeatures: ['audiobook', 'large-print', 'dyslexia-friendly', 'screen-reader-optimized'], coverImage: generateBookCover('Wings of Fire', 'APJ Abdul Kalam', 'FF6B35') },
  { id: 'b3', title: 'Malgudi Days', author: 'R.K. Narayan', isbn: '978-0-14-018564-5', genre: 'Fiction', keywords: ['stories', 'malgudi', 'indian fiction', 'short stories', 'classic', 'narayan'], issueTypes: ['physical'], accessType: 'public', category: ['physical'], downloadCount: 0, language: 'English', publishedYear: 1943, pages: 256, description: 'Collection of short stories set in the fictional town of Malgudi.', accessibilityFeatures: ['large-print'], coverImage: generateBookCover('Malgudi Days', 'R.K. Narayan', '4ECDC4') },
  { id: 'b4', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0-262-03384-8', genre: 'Technology', keywords: ['algorithms', 'computer science', 'data structures', 'programming', 'CLRS', 'textbook'], issueTypes: ['physical', 'pdf'], accessType: 'restricted', category: ['physical', 'digital', 'payable'], cost: 299, downloadCount: 890, language: 'English', publishedYear: 2009, pages: 1312, description: 'Comprehensive textbook on algorithms.', accessibilityFeatures: ['high-contrast', 'screen-reader-optimized'], coverImage: generateBookCover('Intro to Algorithms', 'Thomas Cormen', '2C3E50') },
  { id: 'b5', title: 'Arthashastra', author: 'Kautilya', isbn: '978-0-14-044603-6', genre: 'Political Science', keywords: ['governance', 'ancient india', 'statecraft', 'economics', 'chanakya', 'politics'], issueTypes: ['physical', 'pdf', 'accessibility'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 670, language: 'English', publishedYear: -300, pages: 800, description: 'Ancient Indian treatise on statecraft and economic policy.', accessibilityFeatures: ['braille', 'audiobook', 'screen-reader-optimized'], coverImage: generateBookCover('Arthashastra', 'Kautilya', 'D4A574') },
  { id: 'b6', title: 'Constitution of India', author: 'Government of India', isbn: '978-93-5267-650-1', genre: 'Law', keywords: ['constitution', 'law', 'rights', 'governance', 'india', 'fundamental rights'], issueTypes: ['physical', 'pdf', 'movie'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 5600, language: 'English', publishedYear: 1950, pages: 448, description: 'The supreme law of India.', accessibilityFeatures: ['large-print', 'high-contrast', 'screen-reader-optimized'], coverImage: generateBookCover('Constitution of India', 'Govt of India', '1E3A8A') },
  { id: 'b7', title: 'Yoga Sutras of Patanjali', author: 'Patanjali', isbn: '978-1-58394-023-1', genre: 'Health & Wellness', keywords: ['yoga', 'meditation', 'wellness', 'health', 'spirituality', 'patanjali'], issueTypes: ['physical', 'pdf', 'mp4', 'accessibility'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 2100, language: 'English', publishedYear: -200, pages: 200, description: 'Classical yoga philosophy text.', accessibilityFeatures: ['audiobook', 'dyslexia-friendly'], coverImage: generateBookCover('Yoga Sutras', 'Patanjali', '9B59B6') },
  { id: 'b8', title: 'Digital India: Technology & Governance', author: 'Dr. Arvind Kumar', isbn: '978-93-8764-201-3', genre: 'Technology', keywords: ['digital india', 'e-governance', 'technology', 'smart cities', 'IT policy', 'digital transformation'], issueTypes: ['pdf'], accessType: 'restricted', category: ['digital', 'payable'], cost: 499, downloadCount: 340, language: 'English', publishedYear: 2020, pages: 320, description: 'Technology initiatives in Indian governance.', accessibilityFeatures: ['screen-reader-optimized', 'high-contrast'], coverImage: generateBookCover('Digital India', 'Dr. Arvind Kumar', '3498DB') },
  // Additional realistic books
  { id: 'b9', title: 'The God of Small Things', author: 'Arundhati Roy', isbn: '978-0-06-097344-8', genre: 'Fiction', keywords: ['indian literature', 'kerala', 'family', 'love', 'tragedy'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 2800, language: 'English', publishedYear: 1997, pages: 534, description: 'A poignant tale of a family in Kerala and the events that change their lives.', accessibilityFeatures: ['large-print', 'audiobook'], coverImage: generateBookCover('God of Small Things', 'Arundhati Roy', 'E74C3C') },
  { id: 'b10', title: 'Midnight\'s Children', author: 'Salman Rushdie', isbn: '978-0-394-50143-5', genre: 'Fiction', keywords: ['partition', 'india', 'magical realism', 'independence'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 1950, language: 'English', publishedYear: 1981, pages: 663, description: 'Epic novel about children born at the moment of India\'s independence.', accessibilityFeatures: ['large-print'], coverImage: generateBookCover('Midnights Children', 'Salman Rushdie', 'F39C12') },
  { id: 'b11', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0-553-38016-3', genre: 'Science', keywords: ['physics', 'cosmology', 'universe', 'black holes', 'time'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 3200, language: 'English', publishedYear: 1988, pages: 256, description: 'Exploration of space, time, and the nature of the universe.', accessibilityFeatures: ['audiobook', 'screen-reader-optimized'], coverImage: generateBookCover('Brief History of Time', 'Stephen Hawking', '16A085') },
  { id: 'b12', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '978-0-06-231609-7', genre: 'History', keywords: ['human history', 'evolution', 'civilization', 'society'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 4100, language: 'English', publishedYear: 2011, pages: 443, description: 'A sweeping history of humankind from the Stone Age to modern times.', accessibilityFeatures: ['large-print', 'audiobook'], coverImage: generateBookCover('Sapiens', 'Yuval Noah Harari', 'C0392B') },
  { id: 'b13', title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '978-0-19-286092-7', genre: 'Science', keywords: ['evolution', 'genetics', 'biology', 'natural selection'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 1650, language: 'English', publishedYear: 1976, pages: 224, description: 'Revolutionary perspective on evolution and genetics.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('The Selfish Gene', 'Richard Dawkins', '8E44AD') },
  { id: 'b14', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '978-0-374-27563-1', genre: 'Psychology', keywords: ['psychology', 'decision making', 'cognitive bias', 'behavior'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 2750, language: 'English', publishedYear: 2011, pages: 499, description: 'Insights into the two systems of human thought and decision-making.', accessibilityFeatures: ['large-print', 'audiobook'], coverImage: generateBookCover('Thinking Fast Slow', 'Daniel Kahneman', '27AE60') },
  { id: 'b15', title: 'The Lean Startup', author: 'Eric Ries', isbn: '978-0-307-88789-4', genre: 'Business', keywords: ['entrepreneurship', 'startup', 'innovation', 'lean methodology'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 1890, language: 'English', publishedYear: 2011, pages: 320, description: 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses.', accessibilityFeatures: ['audiobook'], coverImage: generateBookCover('The Lean Startup', 'Eric Ries', '2980B9') },
  { id: 'b16', title: 'Atomic Habits', author: 'James Clear', isbn: '978-0-735-21159-4', genre: 'Self-Help', keywords: ['habits', 'productivity', 'personal development', 'behavior change'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 3600, language: 'English', publishedYear: 2018, pages: 320, description: 'Practical strategies for building good habits and breaking bad ones.', accessibilityFeatures: ['large-print', 'audiobook', 'dyslexia-friendly'], coverImage: generateBookCover('Atomic Habits', 'James Clear', 'D35400') },
  { id: 'b17', title: 'The Art of Computer Programming', author: 'Donald Knuth', isbn: '978-0-201-89683-1', genre: 'Technology', keywords: ['programming', 'algorithms', 'computer science', 'advanced'], issueTypes: ['physical', 'pdf'], accessType: 'restricted', category: ['physical', 'digital', 'payable'], cost: 599, downloadCount: 450, language: 'English', publishedYear: 1968, pages: 1000, description: 'Comprehensive treatment of computer programming and algorithms.', accessibilityFeatures: ['high-contrast'], coverImage: generateBookCover('Art of Programming', 'Donald Knuth', '34495E') },
  { id: 'b18', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0-13-235088-4', genre: 'Technology', keywords: ['programming', 'software development', 'code quality', 'best practices'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 2200, language: 'English', publishedYear: 2008, pages: 464, description: 'A handbook of agile software craftsmanship and writing clean code.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Clean Code', 'Robert C. Martin', '7F8C8D') },
  { id: 'b19', title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', isbn: '978-0-13-595705-9', genre: 'Technology', keywords: ['programming', 'software development', 'practical tips', 'career'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 1750, language: 'English', publishedYear: 1999, pages: 352, description: 'Practical advice for software developers on becoming more effective.', accessibilityFeatures: ['audiobook'], coverImage: generateBookCover('Pragmatic Programmer', 'Thomas & Hunt', '95A5A6') },
  { id: 'b20', title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0-201-63361-0', genre: 'Technology', keywords: ['design patterns', 'software architecture', 'object-oriented', 'programming'], issueTypes: ['physical', 'pdf'], accessType: 'restricted', category: ['physical', 'digital', 'payable'], cost: 399, downloadCount: 980, language: 'English', publishedYear: 1994, pages: 395, description: 'Elements of reusable object-oriented software and design patterns.', accessibilityFeatures: ['high-contrast', 'screen-reader-optimized'], coverImage: generateBookCover('Design Patterns', 'Gang of Four', 'BDC3C7') },
  // Additional realistic books with new resource types
  { id: 'b21', title: 'Indian Government E-Documents Archive', author: 'Ministry of Information', isbn: '978-93-0000-001-0', genre: 'Government', keywords: ['government', 'documents', 'policy', 'india', 'official'], issueTypes: ['e-document', 'pdf'], accessType: 'public', category: ['digital', 'free'], downloadCount: 4200, language: 'English', publishedYear: 2023, pages: 0, description: 'Collection of official government documents and policies.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Govt E-Documents', 'Ministry Info', '1A5276') },
  { id: 'b22', title: 'Municipal Corporation Annual Report 2024', author: 'Municipal Corporation', isbn: '978-93-0000-002-0', genre: 'Government', keywords: ['municipal', 'report', 'governance', 'annual', 'administration'], issueTypes: ['content-file', 'pdf'], accessType: 'public', category: ['digital', 'free'], downloadCount: 1850, language: 'English', publishedYear: 2024, pages: 0, description: 'Comprehensive annual report of municipal corporation activities and achievements.', accessibilityFeatures: ['large-print'], coverImage: generateBookCover('Municipal Report 2024', 'Mun Corp', '2E86AB') },
  { id: 'b23', title: 'Smart Cities in India', author: 'Dr. Priya Sharma', authors: ['Dr. Priya Sharma', 'Prof. Vikram Singh', 'Dr. Rajesh Kumar'], isbn: '978-93-0000-003-0', genre: 'Technology', keywords: ['smart cities', 'research', 'urban development', 'technology', 'india'], issueTypes: ['article', 'pdf'], accessType: 'restricted', category: ['digital', 'payable'], cost: 199, downloadCount: 650, language: 'English', publishedYear: 2023, pages: 0, description: 'Peer-reviewed research article on smart city implementations in India.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Smart Cities India', 'Dr. Priya Sharma', '4A90E2'), researchDomain: 'Urban Development & Smart Cities', researchField: 'Technology & Urban Planning' },
  { id: 'b24', title: 'Daily News Archives - March 2026', author: 'News Bureau', isbn: '978-93-0000-004-0', genre: 'News', keywords: ['news', 'current affairs', 'daily', 'archives', 'events'], issueTypes: ['news-item', 'pdf'], accessType: 'public', category: ['digital', 'free'], downloadCount: 3100, language: 'English', publishedYear: 2026, pages: 0, description: 'Daily news items and current affairs from March 2026.', accessibilityFeatures: [], coverImage: generateBookCover('Daily News March 26', 'News Bureau', 'E74C3C') },
  { id: 'b25', title: 'Journal of Library Science - Vol 45 Issue 3', author: 'Library Association', isbn: '978-93-0000-005-0', genre: 'Library Science', keywords: ['journal', 'library', 'science', 'research', 'academic'], issueTypes: ['loose-issue', 'pdf'], accessType: 'restricted', category: ['digital', 'payable'], cost: 299, downloadCount: 420, language: 'English', publishedYear: 2024, pages: 0, description: 'Latest issue of the Journal of Library Science with peer-reviewed articles.', accessibilityFeatures: ['high-contrast'], coverImage: generateBookCover('Journal Lib Science', 'Lib Association', '6C5CE7') },
  { id: 'b26', title: 'Internet Resources Guide for Researchers', author: 'Digital Library Team', isbn: '978-93-0000-006-0', genre: 'Technology', keywords: ['internet', 'resources', 'research', 'online', 'guide'], issueTypes: ['internet-resource', 'pdf'], accessType: 'public', category: ['digital', 'free'], downloadCount: 2750, language: 'English', publishedYear: 2025, pages: 0, description: 'Comprehensive guide to internet resources and online databases for research.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Internet Resources', 'Digital Lib Team', '00B894') },
  { id: 'b27', title: 'Marathi Literature Classics Collection', author: 'Various Authors', isbn: '978-93-0000-007-0', genre: 'Literature', keywords: ['marathi', 'literature', 'classics', 'poetry', 'stories'], issueTypes: ['physical', 'pdf', 'audiobook'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 1920, language: 'Marathi', publishedYear: 2022, pages: 450, description: 'Collection of classic Marathi literature including poetry and short stories.', accessibilityFeatures: ['audiobook', 'large-print'], coverImage: generateBookCover('Marathi Classics', 'Various Authors', 'A29BFE') },
  { id: 'b28', title: 'Environmental Science Textbook', author: 'Prof. Rajesh Kumar', isbn: '978-93-0000-008-0', genre: 'Science', keywords: ['environment', 'ecology', 'sustainability', 'climate', 'nature'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 2340, language: 'English', publishedYear: 2023, pages: 520, description: 'Comprehensive textbook on environmental science and sustainability.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Environmental Science', 'Prof. Rajesh Kumar', '00A86B') },
  { id: 'b29', title: 'Indian History: From Ancient to Modern', author: 'Dr. Vikram Singh', isbn: '978-93-0000-009-0', genre: 'History', keywords: ['history', 'india', 'ancient', 'medieval', 'modern'], issueTypes: ['physical', 'pdf', 'audiobook'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 3450, language: 'English', publishedYear: 2024, pages: 680, description: 'Comprehensive history of India from ancient times to the present day.', accessibilityFeatures: ['audiobook', 'large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Indian History', 'Dr. Vikram Singh', 'D4A574') },
  { id: 'b30', title: 'Business Management Essentials', author: 'Dr. Anita Patel', isbn: '978-93-0000-010-0', genre: 'Business', keywords: ['business', 'management', 'leadership', 'strategy', 'organization'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 1680, language: 'English', publishedYear: 2023, pages: 400, description: 'Essential concepts and practices in modern business management.', accessibilityFeatures: ['large-print'], coverImage: generateBookCover('Business Management', 'Dr. Anita Patel', 'F39C12') },
  { id: 'b31', title: 'Medical Science Handbook', author: 'Dr. Suresh Desai', isbn: '978-93-0000-011-0', genre: 'Health & Wellness', keywords: ['medicine', 'health', 'medical', 'science', 'handbook'], issueTypes: ['physical', 'pdf'], accessType: 'restricted', category: ['physical', 'digital', 'payable'], cost: 599, downloadCount: 890, language: 'English', publishedYear: 2024, pages: 750, description: 'Comprehensive medical science handbook for healthcare professionals.', accessibilityFeatures: ['high-contrast', 'screen-reader-optimized'], coverImage: generateBookCover('Medical Science', 'Dr. Suresh Desai', 'E91E63') },
  { id: 'b32', title: 'Art and Culture of India', author: 'Prof. Meera Nair', isbn: '978-93-0000-012-0', genre: 'Arts', keywords: ['art', 'culture', 'india', 'heritage', 'tradition'], issueTypes: ['physical', 'pdf', 'movie'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 2100, language: 'English', publishedYear: 2023, pages: 380, description: 'Exploration of Indian art, culture, and heritage through history.', accessibilityFeatures: ['large-print', 'audiobook'], coverImage: generateBookCover('Art & Culture India', 'Prof. Meera Nair', 'C2185B') },
  { id: 'b33', title: 'Mathematics for Engineers', author: 'Dr. Arun Verma', isbn: '978-93-0000-013-0', genre: 'Technology', keywords: ['mathematics', 'engineering', 'calculus', 'algebra', 'geometry'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 1450, language: 'English', publishedYear: 2023, pages: 600, description: 'Advanced mathematics concepts for engineering students and professionals.', accessibilityFeatures: ['high-contrast', 'screen-reader-optimized'], coverImage: generateBookCover('Math for Engineers', 'Dr. Arun Verma', '5DADE2') },
  { id: 'b34', title: 'Philosophy and Ethics', author: 'Dr. Ramakrishnan', isbn: '978-93-0000-014-0', genre: 'Philosophy', keywords: ['philosophy', 'ethics', 'morality', 'wisdom', 'thought'], issueTypes: ['physical', 'pdf', 'audiobook'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 980, language: 'English', publishedYear: 2022, pages: 420, description: 'Exploration of philosophical concepts and ethical principles.', accessibilityFeatures: ['audiobook', 'large-print'], coverImage: generateBookCover('Philosophy Ethics', 'Dr. Ramakrishnan', '9B59B6') },
  { id: 'b35', title: 'Social Sciences Research Methods', author: 'Prof. Neha Gupta', isbn: '978-93-0000-015-0', genre: 'Social Science', keywords: ['research', 'methodology', 'social', 'science', 'academic'], issueTypes: ['physical', 'pdf'], accessType: 'public', category: ['physical', 'digital', 'free'], downloadCount: 1320, language: 'English', publishedYear: 2024, pages: 480, description: 'Comprehensive guide to research methods in social sciences.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Research Methods', 'Prof. Neha Gupta', '3498DB') },
  // Corporation-related materials
  { id: 'b36', title: 'Municipal Corporation Gazette - March 2026', author: 'Municipal Corporation', isbn: '978-93-0000-016-0', genre: 'Government', keywords: ['gazette', 'municipal', 'official', 'notices', 'announcements', 'corporation'], issueTypes: ['news-item', 'pdf', 'content-file'], accessType: 'public', category: ['digital', 'free'], downloadCount: 2450, language: 'English', publishedYear: 2026, pages: 0, description: 'Official gazette containing municipal corporation notices, tenders, and announcements.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Mun Corp Gazette', 'Mun Corp', '8B0000') },
  { id: 'b37', title: 'Corporation Budget & Financial Report 2025-26', author: 'Finance Department', isbn: '978-93-0000-017-0', genre: 'Government', keywords: ['budget', 'finance', 'corporation', 'expenditure', 'revenue', 'financial'], issueTypes: ['e-document', 'pdf', 'content-file'], accessType: 'public', category: ['digital', 'free'], downloadCount: 1680, language: 'English', publishedYear: 2025, pages: 0, description: 'Detailed financial report and budget allocation for municipal corporation fiscal year 2025-26.', accessibilityFeatures: ['high-contrast', 'screen-reader-optimized'], coverImage: generateBookCover('Corp Budget 2025-26', 'Finance Dept', '1C1C1C') },
  { id: 'b38', title: 'Corporation Policies & Procedures Manual', author: 'Administration Department', isbn: '978-93-0000-018-0', genre: 'Government', keywords: ['policies', 'procedures', 'corporation', 'guidelines', 'administration', 'rules'], issueTypes: ['e-document', 'pdf'], accessType: 'restricted', category: ['digital', 'free'], downloadCount: 890, language: 'English', publishedYear: 2024, pages: 0, description: 'Comprehensive manual of corporation policies, procedures, and administrative guidelines.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Corp Policies Manual', 'Admin Dept', '2F4F4F') },
  { id: 'b39', title: 'Urban Development & Infrastructure Plan 2026-2035', author: 'Planning Department', isbn: '978-93-0000-019-0', genre: 'Government', keywords: ['urban development', 'infrastructure', 'planning', 'smart city', 'corporation', 'development'], issueTypes: ['e-document', 'pdf', 'content-file'], accessType: 'public', category: ['digital', 'free'], downloadCount: 3200, language: 'English', publishedYear: 2025, pages: 0, description: 'Long-term urban development and infrastructure plan for the corporation area.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Urban Dev Plan', 'Planning Dept', '4B0082') },
  { id: 'b40', title: 'Corporation Tender Documents & Notices', author: 'Procurement Department', isbn: '978-93-0000-020-0', genre: 'Government', keywords: ['tender', 'procurement', 'notices', 'bids', 'corporation', 'contracts'], issueTypes: ['news-item', 'pdf', 'content-file'], accessType: 'public', category: ['digital', 'free'], downloadCount: 2100, language: 'English', publishedYear: 2026, pages: 0, description: 'Official tender documents and procurement notices issued by the corporation.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Corp Tenders', 'Procurement', 'DC143C') },
  { id: 'b41', title: 'Public Health & Sanitation Guidelines', author: 'Health Department', isbn: '978-93-0000-021-0', genre: 'Government', keywords: ['health', 'sanitation', 'public health', 'hygiene', 'corporation', 'welfare'], issueTypes: ['e-document', 'pdf', 'article'], accessType: 'public', category: ['digital', 'free'], downloadCount: 1950, language: 'English', publishedYear: 2025, pages: 0, description: 'Corporation guidelines for public health, sanitation, and hygiene standards.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Health Guidelines', 'Health Dept', '228B22') },
  { id: 'b42', title: 'Property Tax & Revenue Collection Manual', author: 'Revenue Department', isbn: '978-93-0000-022-0', genre: 'Government', keywords: ['tax', 'revenue', 'property', 'collection', 'corporation', 'finance'], issueTypes: ['e-document', 'pdf'], accessType: 'restricted', category: ['digital', 'free'], downloadCount: 1420, language: 'English', publishedYear: 2024, pages: 0, description: 'Manual for property tax assessment and revenue collection procedures.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Tax Manual', 'Revenue Dept', '8B4513') },
  { id: 'b43', title: 'Environmental Protection & Waste Management Policy', author: 'Environmental Department', isbn: '978-93-0000-023-0', genre: 'Government', keywords: ['environment', 'waste', 'pollution', 'sustainability', 'corporation', 'green'], issueTypes: ['e-document', 'pdf', 'article'], accessType: 'public', category: ['digital', 'free'], downloadCount: 2680, language: 'English', publishedYear: 2025, pages: 0, description: 'Corporation policy on environmental protection and waste management.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Env Protection', 'Env Dept', '006400') },
  { id: 'b44', title: 'Education & Skill Development Programs', author: 'Education Department', isbn: '978-93-0000-024-0', genre: 'Government', keywords: ['education', 'skill development', 'training', 'programs', 'corporation', 'learning'], issueTypes: ['e-document', 'pdf', 'content-file'], accessType: 'public', category: ['digital', 'free'], downloadCount: 1780, language: 'English', publishedYear: 2025, pages: 0, description: 'Corporation initiatives for education and skill development programs.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Education Programs', 'Edu Dept', '4169E1') },
  { id: 'b45', title: 'Traffic & Transportation Management System', author: 'Transportation Department', isbn: '978-93-0000-025-0', genre: 'Government', keywords: ['traffic', 'transportation', 'roads', 'mobility', 'corporation', 'urban'], issueTypes: ['e-document', 'pdf', 'article'], accessType: 'public', category: ['digital', 'free'], downloadCount: 2340, language: 'English', publishedYear: 2025, pages: 0, description: 'Corporation traffic and transportation management system guidelines.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Traffic Mgmt', 'Transport Dept', 'FF8C00') },
  { id: 'b46', title: 'Citizen Charter & Service Standards', author: 'Citizen Services', isbn: '978-93-0000-026-0', genre: 'Government', keywords: ['citizen', 'charter', 'services', 'standards', 'corporation', 'accountability'], issueTypes: ['e-document', 'pdf', 'content-file'], accessType: 'public', category: ['digital', 'free'], downloadCount: 1620, language: 'English', publishedYear: 2025, pages: 0, description: 'Corporation citizen charter defining service standards and accountability.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Citizen Charter', 'Citizen Svcs', '1E90FF') },
  { id: 'b47', title: 'Water Supply & Sewerage Management', author: 'Water Department', isbn: '978-93-0000-027-0', genre: 'Government', keywords: ['water', 'sewerage', 'utilities', 'infrastructure', 'corporation', 'management'], issueTypes: ['e-document', 'pdf', 'article'], accessType: 'public', category: ['digital', 'free'], downloadCount: 2050, language: 'English', publishedYear: 2025, pages: 0, description: 'Corporation water supply and sewerage management policies and procedures.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Water Mgmt', 'Water Dept', '00CED1') },
  { id: 'b48', title: 'Social Welfare & Community Development Schemes', author: 'Social Welfare Department', isbn: '978-93-0000-028-0', genre: 'Government', keywords: ['welfare', 'community', 'schemes', 'development', 'corporation', 'social'], issueTypes: ['e-document', 'pdf', 'content-file'], accessType: 'public', category: ['digital', 'free'], downloadCount: 1890, language: 'English', publishedYear: 2025, pages: 0, description: 'Corporation social welfare and community development schemes and programs.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Social Welfare', 'Welfare Dept', 'FF69B4') },
  { id: 'b49', title: 'Municipal Governance Best Practices', author: 'Dr. Rajesh Sharma', authors: ['Dr. Rajesh Sharma', 'Prof. Anita Joshi', 'Dr. Meera Kulkarni'], isbn: '978-93-0000-029-0', genre: 'Government', keywords: ['governance', 'municipal', 'best practices', 'research', 'corporation', 'management'], issueTypes: ['article', 'pdf'], accessType: 'restricted', category: ['digital', 'payable'], cost: 249, downloadCount: 650, language: 'English', publishedYear: 2025, pages: 0, description: 'Peer-reviewed research article on municipal governance best practices.', accessibilityFeatures: ['screen-reader-optimized'], coverImage: generateBookCover('Governance Research', 'Dr. Rajesh Sharma', '8A2BE2'), researchDomain: 'Municipal Governance & Administration', researchField: 'Public Administration & Government' },
  { id: 'b50', title: 'Corporation Annual Report 2024-25', author: 'Corporate Affairs', isbn: '978-93-0000-030-0', genre: 'Government', keywords: ['annual report', 'corporation', 'performance', 'achievements', 'statistics', 'review'], issueTypes: ['e-document', 'pdf', 'content-file'], accessType: 'public', category: ['digital', 'free'], downloadCount: 3100, language: 'English', publishedYear: 2025, pages: 0, description: 'Comprehensive annual report detailing corporation performance, achievements, and statistics.', accessibilityFeatures: ['large-print', 'screen-reader-optimized'], coverImage: generateBookCover('Corp Annual Report', 'Corp Affairs', '2F4F4F') },
];

export const bookInventory: BookInventory[] = [
  // b1 – The Discovery of India
  { bookId: 'b1', libraryId: 'lib1', totalCount: 20, availableCount: 11, returningIn2Days: 4 },
  { bookId: 'b1', libraryId: 'lib2', totalCount: 15, availableCount: 8, returningIn2Days: 2 },
  { bookId: 'b1', libraryId: 'lib3', totalCount: 10, availableCount: 5, returningIn2Days: 3 },
  // b2 – Wings of Fire
  { bookId: 'b2', libraryId: 'lib1', totalCount: 25, availableCount: 18, returningIn2Days: 3 },
  { bookId: 'b2', libraryId: 'lib2', totalCount: 12, availableCount: 4, returningIn2Days: 5 },
  // b3 – Malgudi Days
  { bookId: 'b3', libraryId: 'lib1', totalCount: 8, availableCount: 3, returningIn2Days: 1 },
  { bookId: 'b3', libraryId: 'lib2', totalCount: 6, availableCount: 4, returningIn2Days: 0 },
  // b4 – Introduction to Algorithms
  { bookId: 'b4', libraryId: 'lib5', totalCount: 5, availableCount: 2, returningIn2Days: 1 },
  { bookId: 'b4', libraryId: 'lib1', totalCount: 4, availableCount: 3, returningIn2Days: 0 },
  // b5 – Arthashastra
  { bookId: 'b5', libraryId: 'lib1', totalCount: 12, availableCount: 7, returningIn2Days: 2 },
  { bookId: 'b5', libraryId: 'lib3', totalCount: 8, availableCount: 5, returningIn2Days: 1 },
  // b6 – Constitution of India
  { bookId: 'b6', libraryId: 'lib6', totalCount: 30, availableCount: 22, returningIn2Days: 3 },
  { bookId: 'b6', libraryId: 'lib1', totalCount: 20, availableCount: 14, returningIn2Days: 2 },
  // b7 – Yoga Sutras
  { bookId: 'b7', libraryId: 'lib1', totalCount: 10, availableCount: 6, returningIn2Days: 2 },
  { bookId: 'b7', libraryId: 'lib3', totalCount: 7, availableCount: 5, returningIn2Days: 1 },
  // b8 – Digital India
  { bookId: 'b8', libraryId: 'lib5', totalCount: 6, availableCount: 4, returningIn2Days: 1 },
  { bookId: 'b8', libraryId: 'lib1', totalCount: 5, availableCount: 3, returningIn2Days: 0 },
  // b9 – The God of Small Things
  { bookId: 'b9', libraryId: 'lib1', totalCount: 10, availableCount: 7, returningIn2Days: 1 },
  { bookId: 'b9', libraryId: 'lib2', totalCount: 8, availableCount: 5, returningIn2Days: 2 },
  // b10 – Midnight's Children
  { bookId: 'b10', libraryId: 'lib1', totalCount: 8, availableCount: 5, returningIn2Days: 1 },
  { bookId: 'b10', libraryId: 'lib3', totalCount: 6, availableCount: 4, returningIn2Days: 0 },
  // b11 – A Brief History of Time
  { bookId: 'b11', libraryId: 'lib1', totalCount: 12, availableCount: 8, returningIn2Days: 2 },
  { bookId: 'b11', libraryId: 'lib5', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
  // b12 – Sapiens
  { bookId: 'b12', libraryId: 'lib1', totalCount: 15, availableCount: 10, returningIn2Days: 3 },
  { bookId: 'b12', libraryId: 'lib2', totalCount: 10, availableCount: 7, returningIn2Days: 1 },
  // b13 – The Selfish Gene
  { bookId: 'b13', libraryId: 'lib1', totalCount: 7, availableCount: 5, returningIn2Days: 1 },
  { bookId: 'b13', libraryId: 'lib5', totalCount: 5, availableCount: 3, returningIn2Days: 0 },
  // b14 – Thinking, Fast and Slow
  { bookId: 'b14', libraryId: 'lib1', totalCount: 10, availableCount: 7, returningIn2Days: 2 },
  { bookId: 'b14', libraryId: 'lib2', totalCount: 8, availableCount: 5, returningIn2Days: 1 },
  // b15 – The Lean Startup
  { bookId: 'b15', libraryId: 'lib1', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
  { bookId: 'b15', libraryId: 'lib5', totalCount: 6, availableCount: 4, returningIn2Days: 0 },
  // b16 – Atomic Habits
  { bookId: 'b16', libraryId: 'lib1', totalCount: 15, availableCount: 11, returningIn2Days: 2 },
  { bookId: 'b16', libraryId: 'lib2', totalCount: 10, availableCount: 7, returningIn2Days: 1 },
  { bookId: 'b16', libraryId: 'lib3', totalCount: 8, availableCount: 5, returningIn2Days: 1 },
  // b17 – The Art of Computer Programming
  { bookId: 'b17', libraryId: 'lib5', totalCount: 4, availableCount: 3, returningIn2Days: 0 },
  { bookId: 'b17', libraryId: 'lib1', totalCount: 3, availableCount: 2, returningIn2Days: 0 },
  // b18 – Clean Code
  { bookId: 'b18', libraryId: 'lib1', totalCount: 10, availableCount: 7, returningIn2Days: 1 },
  { bookId: 'b18', libraryId: 'lib5', totalCount: 8, availableCount: 5, returningIn2Days: 2 },
  // b19 – The Pragmatic Programmer
  { bookId: 'b19', libraryId: 'lib1', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
  { bookId: 'b19', libraryId: 'lib5', totalCount: 6, availableCount: 4, returningIn2Days: 0 },
  // b20 – Design Patterns
  { bookId: 'b20', libraryId: 'lib5', totalCount: 5, availableCount: 3, returningIn2Days: 1 },
  { bookId: 'b20', libraryId: 'lib1', totalCount: 4, availableCount: 3, returningIn2Days: 0 },
  // b21–b50: government/digital resources — physical copies at lib1 & lib6
  { bookId: 'b21', libraryId: 'lib6', totalCount: 10, availableCount: 8, returningIn2Days: 1 },
  { bookId: 'b22', libraryId: 'lib6', totalCount: 8, availableCount: 6, returningIn2Days: 0 },
  { bookId: 'b23', libraryId: 'lib5', totalCount: 5, availableCount: 4, returningIn2Days: 0 },
  { bookId: 'b24', libraryId: 'lib6', totalCount: 12, availableCount: 10, returningIn2Days: 1 },
  { bookId: 'b25', libraryId: 'lib1', totalCount: 6, availableCount: 5, returningIn2Days: 0 },
  { bookId: 'b26', libraryId: 'lib5', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
  { bookId: 'b27', libraryId: 'lib1', totalCount: 10, availableCount: 7, returningIn2Days: 2 },
  { bookId: 'b27', libraryId: 'lib3', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
  { bookId: 'b28', libraryId: 'lib1', totalCount: 12, availableCount: 9, returningIn2Days: 1 },
  { bookId: 'b28', libraryId: 'lib3', totalCount: 8, availableCount: 6, returningIn2Days: 0 },
  { bookId: 'b29', libraryId: 'lib1', totalCount: 15, availableCount: 11, returningIn2Days: 2 },
  { bookId: 'b29', libraryId: 'lib2', totalCount: 10, availableCount: 7, returningIn2Days: 1 },
  { bookId: 'b30', libraryId: 'lib1', totalCount: 10, availableCount: 7, returningIn2Days: 1 },
  { bookId: 'b31', libraryId: 'lib1', totalCount: 6, availableCount: 4, returningIn2Days: 1 },
  { bookId: 'b32', libraryId: 'lib1', totalCount: 8, availableCount: 6, returningIn2Days: 0 },
  { bookId: 'b32', libraryId: 'lib3', totalCount: 6, availableCount: 4, returningIn2Days: 1 },
  { bookId: 'b33', libraryId: 'lib1', totalCount: 10, availableCount: 7, returningIn2Days: 1 },
  { bookId: 'b33', libraryId: 'lib5', totalCount: 8, availableCount: 5, returningIn2Days: 2 },
  { bookId: 'b34', libraryId: 'lib1', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
  { bookId: 'b35', libraryId: 'lib1', totalCount: 10, availableCount: 7, returningIn2Days: 1 },
  { bookId: 'b36', libraryId: 'lib6', totalCount: 15, availableCount: 12, returningIn2Days: 1 },
  { bookId: 'b37', libraryId: 'lib6', totalCount: 10, availableCount: 8, returningIn2Days: 0 },
  { bookId: 'b38', libraryId: 'lib6', totalCount: 8, availableCount: 6, returningIn2Days: 0 },
  { bookId: 'b39', libraryId: 'lib6', totalCount: 10, availableCount: 8, returningIn2Days: 1 },
  { bookId: 'b40', libraryId: 'lib6', totalCount: 12, availableCount: 9, returningIn2Days: 1 },
  { bookId: 'b41', libraryId: 'lib6', totalCount: 8, availableCount: 6, returningIn2Days: 0 },
  { bookId: 'b42', libraryId: 'lib6', totalCount: 6, availableCount: 5, returningIn2Days: 0 },
  { bookId: 'b43', libraryId: 'lib6', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
  { bookId: 'b44', libraryId: 'lib6', totalCount: 10, availableCount: 8, returningIn2Days: 0 },
  { bookId: 'b45', libraryId: 'lib6', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
  { bookId: 'b46', libraryId: 'lib6', totalCount: 10, availableCount: 8, returningIn2Days: 0 },
  { bookId: 'b47', libraryId: 'lib6', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
  { bookId: 'b48', libraryId: 'lib6', totalCount: 10, availableCount: 8, returningIn2Days: 0 },
  { bookId: 'b49', libraryId: 'lib1', totalCount: 6, availableCount: 4, returningIn2Days: 0 },
  { bookId: 'b50', libraryId: 'lib1', totalCount: 8, availableCount: 6, returningIn2Days: 1 },
];

export const members: Member[] = [
  { id: 'u5', name: 'Rajesh Sharma', email: 'rajesh@email.com', mobile: '+91 98765 43210', membershipId: 'MEM-2024-001', membershipType: 'premium', joinDate: '2024-01-15', expiryDate: '2025-01-15', status: 'active', borrowedBooks: 3, finesDue: 0, libraryId: 'lib1' },
  { id: 'u6', name: 'Priya Desai', email: 'priya@email.com', mobile: '+91 87654 32109', membershipId: 'MEM-2024-002', membershipType: 'student', joinDate: '2024-03-20', expiryDate: '2025-03-20', status: 'active', borrowedBooks: 5, finesDue: 50, libraryId: 'lib1' },
  { id: 'u7', name: 'Amit Kulkarni', email: 'amit@email.com', mobile: '+91 76543 21098', membershipId: 'MEM-2024-003', membershipType: 'standard', joinDate: '2024-06-10', expiryDate: '2025-06-10', status: 'active', borrowedBooks: 1, finesDue: 0, libraryId: 'lib2' },
  { id: 'm4', name: 'Sneha Patil', email: 'sneha@email.com', mobile: '+91 65432 10987', membershipId: 'MEM-2023-015', membershipType: 'standard', joinDate: '2023-09-01', expiryDate: '2024-09-01', status: 'expired', borrowedBooks: 0, finesDue: 120, libraryId: 'lib2' },
  { id: 'm5', name: 'Vikram Joshi', email: 'vikram@email.com', mobile: '+91 54321 09876', membershipId: 'MEM-2024-004', membershipType: 'senior', joinDate: '2024-02-28', expiryDate: '2025-02-28', status: 'active', borrowedBooks: 2, finesDue: 0, libraryId: 'lib1' },
];

export const borrowRequests: BorrowRequest[] = [
  { id: 'br1', bookId: 'b4', userId: 'u6', userName: 'Priya Desai', libraryId: 'lib5', issueType: 'pdf', status: 'pending', reason: 'Academic research on algorithms', purpose: 'MSc Computer Science thesis', email: 'priya@email.com', mobile: '+91 87654 32109', requestDate: '2026-03-10' },
  { id: 'br2', bookId: 'b8', userId: 'u5', userName: 'Rajesh Sharma', libraryId: 'lib1', issueType: 'pdf', status: 'approved', reason: 'Government policy research', purpose: 'Policy analysis for smart city project', email: 'rajesh@email.com', mobile: '+91 98765 43210', requestDate: '2026-03-08', responseDate: '2026-03-09', notificationSent: true },
  { id: 'br3', bookId: 'b1', userId: 'u7', userName: 'Amit Kulkarni', libraryId: 'lib2', issueType: 'physical', status: 'pending', reason: 'Personal reading interest', purpose: 'General knowledge', email: 'amit@email.com', mobile: '+91 76543 21098', requestDate: '2026-03-11' },
];

export const fines: Fine[] = [
  { id: 'f1', memberId: 'u6', bookId: 'b2', amount: 50, reason: 'Late return - 5 days overdue @ ₹10/day', status: 'pending', dueDate: '2026-03-05', returnDate: '2026-03-10', daysOverdue: 5, dailyFineRate: 10 },
  { id: 'f2', memberId: 'm4', bookId: 'b3', amount: 60, reason: 'Late return - 12 days overdue @ ₹5/day', status: 'pending', dueDate: '2026-02-15', daysOverdue: 12, dailyFineRate: 5 },
  { id: 'f3', memberId: 'u5', bookId: 'b1', amount: 15, reason: 'Late return - 3 days overdue @ ₹5/day', status: 'paid', dueDate: '2026-01-20', returnDate: '2026-01-23', paidDate: '2026-01-25', daysOverdue: 3, dailyFineRate: 5 },
];

export const checkInRecords: CheckInRecord[] = [
  { id: 'ci1', memberId: 'u5', libraryId: 'lib1', checkInTime: '2026-03-11T09:30:00', checkOutTime: '2026-03-11T14:15:00' },
  { id: 'ci2', memberId: 'u6', libraryId: 'lib1', checkInTime: '2026-03-11T10:00:00' },
  { id: 'ci3', memberId: 'u7', libraryId: 'lib2', checkInTime: '2026-03-11T11:45:00' },
  { id: 'ci4', memberId: 'm5', libraryId: 'lib1', checkInTime: '2026-03-11T08:00:00', checkOutTime: '2026-03-11T12:30:00' },
];

export const genres = ['History', 'Biography', 'Fiction', 'Technology', 'Political Science', 'Law', 'Health & Wellness', 'Science', 'Literature', 'Arts', 'Business', 'Psychology', 'Self-Help', 'Government', 'News', 'Library Science', 'Philosophy', 'Social Science'];

export const resourceTypes = ['Book', 'Journal', 'Magazine', 'Newspaper', 'DVD', 'Audio Book', 'E-Book', 'Thesis', 'Report', 'Map'];

export const events: Event[] = [
  { id: 'e1', title: 'Summer Reading Program', description: 'Encourage reading during summer holidays', category: 'reading', startDate: '2026-04-01', endDate: '2026-06-30', location: 'Central Municipal Library', libraryId: 'lib1', capacity: 100, registeredCount: 45, status: 'upcoming' },
  { id: 'e2', title: 'Annual Book Fair 2026', description: 'Largest book fair with 500+ titles', category: 'book_fair', startDate: '2026-03-20', endDate: '2026-03-25', location: 'Vazirabad Branch Library', libraryId: 'lib2', capacity: 500, registeredCount: 320, status: 'upcoming' },
  { id: 'e3', title: 'Storytelling for Kids', description: 'Interactive storytelling sessions for children', category: 'storytelling', startDate: '2026-03-15', endDate: '2026-03-15', location: 'Taroda Reading Center', libraryId: 'lib3', capacity: 50, registeredCount: 38, status: 'upcoming' },
  { id: 'e4', title: 'Author Talk: Indian Literature', description: 'Discussion with renowned Indian authors', category: 'author_talk', startDate: '2026-04-10', endDate: '2026-04-10', location: 'Central Municipal Library', libraryId: 'lib1', capacity: 150, registeredCount: 89, status: 'upcoming' },
  { id: 'e5', title: 'Digital Literacy Workshop', description: 'Learn to access digital resources', category: 'workshop', startDate: '2026-03-18', endDate: '2026-03-18', location: 'MIDC Digital Library', libraryId: 'lib5', capacity: 75, registeredCount: 62, status: 'upcoming' },
];

export const eventRegistrations: EventRegistration[] = [
  { id: 'er1', eventId: 'e1', memberId: 'u5', registrationDate: '2026-03-01', status: 'registered' },
  { id: 'er2', eventId: 'e1', memberId: 'u6', registrationDate: '2026-03-02', status: 'registered' },
  { id: 'er3', eventId: 'e2', memberId: 'u7', registrationDate: '2026-03-05', status: 'registered' },
  { id: 'er4', eventId: 'e3', memberId: 'u5', registrationDate: '2026-03-10', status: 'registered' },
  { id: 'er5', eventId: 'e5', memberId: 'u6', registrationDate: '2026-03-08', status: 'registered' },
];

export const digitalResources: DigitalResource[] = [
  { id: 'dr1', title: 'Indian Constitution', author: 'Government of India', type: 'pdf', description: 'Complete Indian Constitution document', accessType: 'open', downloadCount: 2340, fileSize: 5.2, uploadDate: '2025-01-15', keywords: ['constitution', 'law', 'india', 'governance', 'rights'], language: 'English' },
  { id: 'dr2', title: 'Wings of Fire', author: 'APJ Abdul Kalam', type: 'audiobook', description: 'Audiobook version of Wings of Fire autobiography', accessType: 'restricted', downloadCount: 890, fileSize: 450, uploadDate: '2025-02-20', keywords: ['autobiography', 'inspiration', 'science', 'india', 'kalam'], language: 'English' },
  { id: 'dr3', title: 'Digital India Initiative', author: 'Ministry of Electronics', type: 'video', description: 'Documentary on Digital India program', accessType: 'open', downloadCount: 1560, fileSize: 1200, uploadDate: '2025-03-01', keywords: ['digital', 'india', 'technology', 'governance', 'innovation'], language: 'English' },
  { id: 'dr4', title: 'AI in Libraries', author: 'Dr. Sharma', authors: ['Dr. Sharma', 'Prof. Rajesh Kumar', 'Dr. Anita Patel'], type: 'research_paper', description: 'Academic research on AI applications in library systems', accessType: 'restricted', downloadCount: 340, fileSize: 2.8, uploadDate: '2025-02-10', publishedYear: 2024, keywords: ['ai', 'libraries', 'technology', 'research', 'automation'], language: 'English', researchDomain: 'Artificial Intelligence', researchField: 'Library Science & Technology' },
  { id: 'dr5', title: 'Yoga Sutras', author: 'Patanjali', type: 'audiobook', description: 'Classical yoga philosophy in audio format', accessType: 'open', downloadCount: 1200, fileSize: 380, uploadDate: '2025-01-25', keywords: ['yoga', 'meditation', 'wellness', 'spirituality', 'health'], language: 'English' },
];

export const downloadLogs: DownloadLog[] = [
  { id: 'dl1', resourceId: 'dr1', memberId: 'u5', downloadDate: '2026-03-10' },
  { id: 'dl2', resourceId: 'dr1', memberId: 'u6', downloadDate: '2026-03-09' },
  { id: 'dl3', resourceId: 'dr2', memberId: 'u7', downloadDate: '2026-03-08' },
  { id: 'dl4', resourceId: 'dr3', memberId: 'u5', downloadDate: '2026-03-07' },
  { id: 'dl5', resourceId: 'dr5', memberId: 'm5', downloadDate: '2026-03-06' },
];

export const circulationTransactions: CirculationTransaction[] = [
  { id: 'ct1', memberId: 'u5', bookId: 'b1', libraryId: 'lib1', issueDate: '2026-02-15', dueDate: '2026-03-15', returnDate: '2026-03-10', renewalCount: 0, fineAmount: 0, status: 'returned' },
  { id: 'ct2', memberId: 'u6', bookId: 'b2', libraryId: 'lib1', issueDate: '2026-02-20', dueDate: '2026-03-20', renewalCount: 1, fineAmount: 50, status: 'overdue' },
  { id: 'ct3', memberId: 'u7', bookId: 'b3', libraryId: 'lib2', issueDate: '2026-03-01', dueDate: '2026-03-31', renewalCount: 0, fineAmount: 0, status: 'issued' },
  { id: 'ct4', memberId: 'u5', bookId: 'b4', libraryId: 'lib5', issueDate: '2026-02-25', dueDate: '2026-03-25', renewalCount: 0, fineAmount: 0, status: 'issued' },
  { id: 'ct5', memberId: 'm5', bookId: 'b5', libraryId: 'lib1', issueDate: '2026-01-15', dueDate: '2026-02-15', returnDate: '2026-02-20', renewalCount: 2, fineAmount: 0, status: 'returned' },
];

export const renewals: Renewal[] = [
  { id: 'r1', transactionId: 'ct2', memberId: 'u6', bookId: 'b2', renewalDate: '2026-03-15', newDueDate: '2026-04-15', status: 'pending' },
  { id: 'r2', transactionId: 'ct3', memberId: 'u7', bookId: 'b3', renewalDate: '2026-03-20', newDueDate: '2026-04-20', status: 'approved' },
];

export const notifications: Notification[] = [
  { id: 'n1', userId: 'u5', type: 'due_reminder', title: 'Book Due Soon', message: 'Your book "Introduction to Algorithms" is due on 2026-03-25', read: false, createdAt: '2026-03-11', channel: 'in_system' },
  { id: 'n2', userId: 'u6', type: 'fine_alert', title: 'Fine Amount Due', message: 'You have a pending fine of ₹50 for overdue book', read: false, createdAt: '2026-03-10', channel: 'in_system' },
  { id: 'n3', userId: 'u5', type: 'event', title: 'New Event: Author Talk', message: 'Join us for "Author Talk: Indian Literature" on 2026-04-10', read: true, createdAt: '2026-03-08', channel: 'in_system' },
  { id: 'n4', userId: 'u7', type: 'approval', title: 'Request Approved', message: 'Your borrow request for "Wings of Fire" has been approved', read: true, createdAt: '2026-03-07', channel: 'in_system' },
  { id: 'n5', userId: 'm5', type: 'membership_expiry', title: 'Membership Expiring Soon', message: 'Your membership expires on 2026-02-28. Please renew to continue', read: false, createdAt: '2026-02-20', channel: 'in_system' },
];


export interface LibraryMetrics {
  libraryId: string;
  libraryName: string;
  totalBooks: number;
  totalMembers: number;
  currentBorrowedBooks: number;
  currentDownloads: number;
  utilizationPercentage: number;
}

export const getLibraryMetrics = (libraryId: string): LibraryMetrics => {
  const library = libraryBranches.find(b => b.id === libraryId);
  
  // Total books (physical + digital)
  const physicalBooks = bookInventory
    .filter(bi => bi.libraryId === libraryId)
    .reduce((sum, bi) => sum + bi.totalCount, 0);
  
  const digitalBooks = digitalResources.length;
  const totalBooks = physicalBooks + digitalBooks;
  
  // Member count for this library
  const totalMembers = members.filter(m => m.libraryId === libraryId).length;
  
  // Current borrowed books (physical)
  const currentBorrowedBooks = circulationTransactions
    .filter(ct => ct.libraryId === libraryId && (ct.status === 'issued' || ct.status === 'overdue'))
    .length;
  
  // Current downloads (digital)
  const currentDownloads = downloadLogs
    .filter(dl => {
      const resource = digitalResources.find(dr => dr.id === dl.resourceId);
      return resource !== undefined;
    })
    .length;
  
  // Library utilization (members checked in today / total members * 100)
  const checkedInToday = checkInRecords
    .filter(ci => ci.libraryId === libraryId)
    .length;
  const utilizationPercentage = totalMembers > 0 ? Math.round((checkedInToday / totalMembers) * 100) : 0;
  
  return {
    libraryId,
    libraryName: library?.name || 'Unknown Library',
    totalBooks,
    totalMembers,
    currentBorrowedBooks,
    currentDownloads,
    utilizationPercentage,
  };
};

export const getAllLibrariesMetrics = (): LibraryMetrics[] => {
  return libraryBranches.map(lib => getLibraryMetrics(lib.id));
};

export const getAggregatedMetrics = () => {
  const allMetrics = getAllLibrariesMetrics();
  return {
    totalBooks: allMetrics.reduce((sum, m) => sum + m.totalBooks, 0),
    totalMembers: allMetrics.reduce((sum, m) => sum + m.totalMembers, 0),
    totalBorrowedBooks: allMetrics.reduce((sum, m) => sum + m.currentBorrowedBooks, 0),
    totalDownloads: allMetrics.reduce((sum, m) => sum + m.currentDownloads, 0),
    averageUtilization: Math.round(allMetrics.reduce((sum, m) => sum + m.utilizationPercentage, 0) / allMetrics.length),
  };
};

// Calculate overborrowed: citizens holding books past their due date
export const getOverbookedMembers = (libraryId?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get active transactions that are past due date (not yet returned)
  const overdueTransactions = circulationTransactions.filter(ct => {
    if (ct.status === 'returned') return false;
    if (libraryId && ct.libraryId !== libraryId) return false;
    const due = new Date(ct.dueDate);
    due.setHours(0, 0, 0, 0);
    return today > due;
  });

  // Get unique member IDs with overdue books
  const uniqueMemberIds = [...new Set(overdueTransactions.map(ct => ct.memberId))];

  return uniqueMemberIds.map(memberId => {
    const member = members.find(m => m.id === memberId);
    const overdueCount = overdueTransactions.filter(ct => ct.memberId === memberId).length;
    return { member, overdueCount };
  });
};

export const getOverbookedCount = (libraryId?: string): number => {
  return getOverbookedMembers(libraryId).length;
};

// Overborrowed Books: books where issued copies exceed available copies
export const getOverborrowedBooks = (libraryId?: string) => {
  const relevantInventory = libraryId
    ? bookInventory.filter(bi => bi.libraryId === libraryId)
    : bookInventory;

  // Group inventory by bookId, sum across libraries if no libraryId filter
  const bookMap = new Map<string, { totalCount: number }>();
  relevantInventory.forEach(bi => {
    const existing = bookMap.get(bi.bookId) || { totalCount: 0 };
    bookMap.set(bi.bookId, { totalCount: existing.totalCount + bi.totalCount });
  });

  const result: {
    bookId: string; title: string; author: string;
    totalCount: number; activeBorrowings: number; pendingRequests: number;
    demand: number; overborrowedCount: number;
  }[] = [];

  bookMap.forEach(({ totalCount }, bookId) => {
    // Active borrowings = issued or overdue transactions not yet returned
    const activeBorrowings = circulationTransactions.filter(ct =>
      ct.bookId === bookId &&
      (ct.status === 'issued' || ct.status === 'overdue') &&
      (!libraryId || ct.libraryId === libraryId)
    ).length;

    // Pending approved requests = approved borrow requests not yet issued
    const pendingRequests = borrowRequests.filter(br =>
      br.bookId === bookId &&
      br.status === 'approved' &&
      (!libraryId || br.libraryId === libraryId)
    ).length;

    const demand = activeBorrowings + pendingRequests;

    if (demand > totalCount) {
      const book = books.find(b => b.id === bookId);
      if (!book) return;
      result.push({
        bookId, title: book.title, author: book.author,
        totalCount, activeBorrowings, pendingRequests,
        demand, overborrowedCount: demand - totalCount,
      });
    }
  });

  return result;
};

export const getOverborrowedBooksCount = (libraryId?: string): number => {
  return getOverborrowedBooks(libraryId).length;
};

// Fine rates per day 
export const FINE_RATES = {
  standard: 5,      
  premium: 10,      
  default: 5,       
};

export const calculateDaysOverdue = (dueDate: string, returnDate?: string): number => {
  const due = new Date(dueDate);
  const returned = returnDate ? new Date(returnDate) : new Date('2026-03-12'); // Using today's date from context
  
  if (returned <= due) return 0; // Not overdue
  
  const diffTime = returned.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calculate fine amount based on days overdue and daily rate
 */
export const calculateFineAmount = (daysOverdue: number, dailyRate: number = FINE_RATES.default): number => {
  if (daysOverdue <= 0) return 0;
  return daysOverdue * dailyRate;
};

/**
 * Get daily fine rate for a book based on its type
 */
export const getDailyFineRate = (bookId: string): number => {
  const book = books.find(b => b.id === bookId);
  if (!book) return FINE_RATES.default;
  
  // Reference/premium books have higher fine rate
  if (book.genre === 'Political Science' || book.genre === 'Law') {
    return FINE_RATES.premium;
  }
  
  return FINE_RATES.standard;
};

/**
 * Calculate fine for a circulation transaction
 */
export const calculateTransactionFine = (transaction: CirculationTransaction): { amount: number; daysOverdue: number; dailyRate: number } => {
  const daysOverdue = calculateDaysOverdue(transaction.dueDate, transaction.returnDate);
  const dailyRate = getDailyFineRate(transaction.bookId);
  const amount = calculateFineAmount(daysOverdue, dailyRate);
  
  return { amount, daysOverdue, dailyRate };
};

/**
 * Get fine details with calculated values
 */
export const getFineDetails = (fine: Fine): { 
  daysOverdue: number; 
  dailyRate: number; 
  calculatedAmount: number;
  reason: string;
} => {
  const daysOverdue = fine.daysOverdue || calculateDaysOverdue(fine.dueDate, fine.returnDate);
  const dailyRate = fine.dailyFineRate || getDailyFineRate(fine.bookId);
  const calculatedAmount = calculateFineAmount(daysOverdue, dailyRate);
  
  const reason = `Late return - ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue @ ₹${dailyRate}/day`;
  
  return { daysOverdue, dailyRate, calculatedAmount, reason };
};

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export let systemSettings: SystemSettings = {
  id: 'sys-1',
  standardFineRate: 5,
  premiumFineRate: 10,
  maxBorrowPeriodDays: 30,
  maxRenewals: 2,
  membershipFee: 500,
  maxBooksPerMember: 5,
  lastUpdated: '2026-03-12',
  updatedBy: 'u1',
};

export let librarySettings: LibrarySettings[] = [
  {
    libraryId: 'lib1',
    libraryName: 'Central Municipal Library',
    operatingHours: '9:00 AM - 6:00 PM',
    closedDays: ['Sunday'],
    maxCapacity: 200,
    lastUpdated: '2026-03-12',
    updatedBy: 'u2',
  },
  {
    libraryId: 'lib2',
    libraryName: 'Vazirabad Branch Library',
    operatingHours: '10:00 AM - 5:00 PM',
    closedDays: ['Sunday', 'Monday'],
    maxCapacity: 150,
    lastUpdated: '2026-03-12',
    updatedBy: 'u3',
  },
  {
    libraryId: 'lib3',
    libraryName: 'Taroda Reading Center',
    operatingHours: '9:00 AM - 7:00 PM',
    closedDays: ['Sunday'],
    maxCapacity: 100,
    lastUpdated: '2026-03-12',
    updatedBy: 'u4',
  },
];

/**
 * Update system settings
 */
export const updateSystemSettings = (updates: Partial<SystemSettings>) => {
  systemSettings = { ...systemSettings, ...updates, lastUpdated: '2026-03-12' };
};

/**
 * Update library settings
 */
export const updateLibrarySettings = (libraryId: string, updates: Partial<LibrarySettings>) => {
  const index = librarySettings.findIndex(s => s.libraryId === libraryId);
  if (index !== -1) {
    librarySettings[index] = { ...librarySettings[index], ...updates, lastUpdated: '2026-03-12' };
  }
};

/**
 * Get library settings
 */
export const getLibrarySettings = (libraryId: string): LibrarySettings | undefined => {
  return librarySettings.find(s => s.libraryId === libraryId);
};

// ============================================================================
// ANALYTICS & REPORTS
// ============================================================================

export interface LibraryAnalytics {
  libraryId: string;
  libraryName: string;
  utilizationPercentage: number;
  totalMembers: number;
  activeMembers: number;
  defaultersCount: number;
  totalFinesPending: number;
  totalBooksIssued: number;
  totalBooksOverdue: number;
  averageBorrowsPerMember: number;
  mostBorrowedBook: string;
}

/**
 * Get analytics for a specific library
 */
export const getLibraryAnalytics = (libraryId: string): LibraryAnalytics => {
  const library = libraryBranches.find(b => b.id === libraryId);
  const libraryMembers = members.filter(m => m.libraryId === libraryId);
  const libraryTransactions = circulationTransactions.filter(t => t.libraryId === libraryId);
  const libraryFines = fines.filter(f => libraryMembers.some(m => m.id === f.memberId));
  
  // Utilization
  const checkedInToday = checkInRecords.filter(ci => ci.libraryId === libraryId).length;
  const utilizationPercentage = libraryMembers.length > 0 ? Math.round((checkedInToday / libraryMembers.length) * 100) : 0;
  
  // Members
  const activeMembers = libraryMembers.filter(m => m.status === 'active').length;
  
  // Defaulters (members with pending fines)
  const defaultersCount = libraryMembers.filter(m => libraryFines.some(f => f.memberId === m.id && f.status === 'pending')).length;
  
  // Fines
  const totalFinesPending = libraryFines.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
  
  // Books
  const issuedBooks = libraryTransactions.filter(t => t.status === 'issued' || t.status === 'overdue').length;
  const overdueBooks = libraryTransactions.filter(t => t.status === 'overdue').length;
  
  // Average borrows
  const averageBorrowsPerMember = libraryMembers.length > 0 ? Math.round(libraryTransactions.length / libraryMembers.length) : 0;
  
  // Most borrowed book
  const bookCounts: Record<string, number> = {};
  libraryTransactions.forEach(t => {
    bookCounts[t.bookId] = (bookCounts[t.bookId] || 0) + 1;
  });
  const mostBorrowedBookId = Object.keys(bookCounts).reduce((a, b) => bookCounts[a] > bookCounts[b] ? a : b, '');
  const mostBorrowedBook = books.find(b => b.id === mostBorrowedBookId)?.title || 'N/A';
  
  return {
    libraryId,
    libraryName: library?.name || 'Unknown',
    utilizationPercentage,
    totalMembers: libraryMembers.length,
    activeMembers,
    defaultersCount,
    totalFinesPending,
    totalBooksIssued: issuedBooks,
    totalBooksOverdue: overdueBooks,
    averageBorrowsPerMember,
    mostBorrowedBook,
  };
};

/**
 * Get analytics for all libraries
 */
export const getAllLibrariesAnalytics = (): LibraryAnalytics[] => {
  return libraryBranches.map(lib => getLibraryAnalytics(lib.id));
};

/**
 * Get library with highest utilization
 */
export const getMostUtilizedLibrary = (): LibraryAnalytics | null => {
  const allAnalytics = getAllLibrariesAnalytics();
  return allAnalytics.length > 0 ? allAnalytics.reduce((max, current) => 
    current.utilizationPercentage > max.utilizationPercentage ? current : max
  ) : null;
};

/**
 * Get library with most defaulters
 */
export const getLibraryWithMostDefaulters = (): LibraryAnalytics | null => {
  const allAnalytics = getAllLibrariesAnalytics();
  return allAnalytics.length > 0 ? allAnalytics.reduce((max, current) => 
    current.defaultersCount > max.defaultersCount ? current : max
  ) : null;
};

/**
 * Get top 3 most borrowed books across all libraries
 */
export const getTopBorrowedBooks = (limit: number = 3): Array<{ bookId: string; title: string; borrowCount: number }> => {
  const bookCounts: Record<string, number> = {};
  circulationTransactions.forEach(t => {
    bookCounts[t.bookId] = (bookCounts[t.bookId] || 0) + 1;
  });
  
  return Object.entries(bookCounts)
    .map(([bookId, count]) => ({
      bookId,
      title: books.find(b => b.id === bookId)?.title || 'Unknown',
      borrowCount: count,
    }))
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, limit);
};

/**
 * Get total system statistics
 */
export const getSystemStatistics = () => {
  const allAnalytics = getAllLibrariesAnalytics();
  
  return {
    totalLibraries: libraryBranches.length,
    totalMembers: members.length,
    totalActiveMembers: members.filter(m => m.status === 'active').length,
    totalDefaulters: allAnalytics.reduce((sum, a) => sum + a.defaultersCount, 0),
    totalPendingFines: allAnalytics.reduce((sum, a) => sum + a.totalFinesPending, 0),
    totalBooksIssued: allAnalytics.reduce((sum, a) => sum + a.totalBooksIssued, 0),
    totalBooksOverdue: allAnalytics.reduce((sum, a) => sum + a.totalBooksOverdue, 0),
    averageUtilization: Math.round(allAnalytics.reduce((sum, a) => sum + a.utilizationPercentage, 0) / allAnalytics.length),
  };
};

/**
 * Get total downloads for a library
 */
export const getLibraryDownloads = (libraryId: string): number => {
  // Count downloads from digital resources (all libraries have access to all digital resources)
  const totalDownloads = downloadLogs.length;
  
  // For now, distribute downloads proportionally based on members
  const libraryMembers = members.filter(m => m.libraryId === libraryId).length;
  const totalMembers = members.length;
  
  if (totalMembers === 0) return 0;
  
  // Proportional distribution of downloads
  return Math.round((libraryMembers / totalMembers) * totalDownloads);
};

/**
 * Get total downloads across all libraries
 */
export const getTotalDownloads = (): number => {
  return downloadLogs.length;
};

// ============================================================================
// LIBRARY MANAGEMENT
// ============================================================================

/**
 * Add a new library
 */
export const addLibrary = (library: Omit<LibraryBranch, 'id'>): LibraryBranch => {
  // Generate new library ID
  const existingIds = libraryBranches.map(lib => parseInt(lib.id.replace('lib', '')));
  const maxId = Math.max(...existingIds, 0);
  const newId = `lib${maxId + 1}`;
  
  const newLibrary: LibraryBranch = {
    id: newId,
    ...library,
  };
  
  libraryBranches.push(newLibrary);
  
  // Also create default library settings for the new library
  librarySettings.push({
    libraryId: newId,
    libraryName: library.name,
    operatingHours: '9:00 AM - 6:00 PM',
    closedDays: ['Sunday'],
    maxCapacity: 100,
    lastUpdated: '2026-03-12',
    updatedBy: 'u1', // Admin
  });
  
  return newLibrary;
};

/**
 * Delete a library
 */
export const deleteLibrary = (libraryId: string): boolean => {
  const index = libraryBranches.findIndex(lib => lib.id === libraryId);
  
  if (index === -1) {
    return false; // Library not found
  }
  
  // Remove library
  libraryBranches.splice(index, 1);
  
  // Remove library settings
  const settingsIndex = librarySettings.findIndex(s => s.libraryId === libraryId);
  if (settingsIndex !== -1) {
    librarySettings.splice(settingsIndex, 1);
  }
  
  // Note: In a real application, you would also need to handle:
  // - Reassigning members to other libraries
  // - Handling book inventory
  // - Handling circulation transactions
  // - Notifying affected users
  // For this demo, we're just removing the library record
  
  return true;
};

/**
 * Update library details
 */
export const updateLibrary = (libraryId: string, updates: Partial<Omit<LibraryBranch, 'id'>>): boolean => {
  const index = libraryBranches.findIndex(lib => lib.id === libraryId);
  
  if (index === -1) {
    return false; // Library not found
  }
  
  libraryBranches[index] = {
    ...libraryBranches[index],
    ...updates,
  };
  
  // Update library name in settings if name changed
  if (updates.name) {
    const settingsIndex = librarySettings.findIndex(s => s.libraryId === libraryId);
    if (settingsIndex !== -1) {
      librarySettings[settingsIndex].libraryName = updates.name;
    }
  }
  
  return true;
};

/**
 * Get all libraries
 */
export const getAllLibraries = (): LibraryBranch[] => {
  return [...libraryBranches];
};

/**
 * Get library by ID
 */
export const getLibraryById = (libraryId: string): LibraryBranch | undefined => {
  return libraryBranches.find(lib => lib.id === libraryId);
};

// ============================================================================
// ADVANCED ANALYTICS (Dashboard Enhancement)
// ============================================================================

/** Overdue books count + % vs total borrowed */
export const getOverdueAnalytics = () => {
  const overdue = circulationTransactions.filter(ct => ct.status === 'overdue').length;
  const totalBorrowed = circulationTransactions.filter(ct => ct.status === 'issued' || ct.status === 'overdue').length;
  const pct = totalBorrowed > 0 ? Math.round((overdue / totalBorrowed) * 100) : 0;
  return { overdue, totalBorrowed, pct };
};

/** Fines: collected this month + pending */
export const getFinesAnalytics = () => {
  const now = new Date('2026-03-17');
  const monthStart = new Date('2026-03-01');
  const collected = fines
    .filter(f => f.status === 'paid' && f.paidDate && new Date(f.paidDate) >= monthStart && new Date(f.paidDate) <= now)
    .reduce((s, f) => s + f.amount, 0);
  const pending = fines.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);
  return { collected, pending };
};

/** Active users (checked in last 30 days) vs inactive */
export const getActiveUsersAnalytics = () => {
  const cutoff = new Date('2026-02-15');
  const activeIds = new Set(
    checkInRecords
      .filter(ci => new Date(ci.checkInTime) >= cutoff)
      .map(ci => ci.memberId)
  );
  const active = activeIds.size;
  const inactive = members.length - active;
  return { active, inactive, total: members.length };
};

/** New members this month + growth vs last month (mock) */
export const getNewMembersAnalytics = () => {
  const thisMonthStart = new Date('2026-03-01');
  const lastMonthStart = new Date('2026-02-01');
  const thisMonth = members.filter(m => new Date(m.joinDate) >= thisMonthStart).length;
  const lastMonth = members.filter(m => {
    const d = new Date(m.joinDate);
    return d >= lastMonthStart && d < thisMonthStart;
  }).length;
  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;
  return { thisMonth, lastMonth, growth };
};

/** On-time return rate */
export const getOnTimeReturnRate = () => {
  const returned = circulationTransactions.filter(ct => ct.status === 'returned');
  if (returned.length === 0) return { rate: 100, onTime: 0, total: 0 };
  const onTime = returned.filter(ct => {
    if (!ct.returnDate) return false;
    return new Date(ct.returnDate) <= new Date(ct.dueDate);
  }).length;
  return { rate: Math.round((onTime / returned.length) * 100), onTime, total: returned.length };
};

/** Average borrow duration in days */
export const getAvgBorrowDuration = () => {
  const returned = circulationTransactions.filter(ct => ct.status === 'returned' && ct.returnDate);
  if (returned.length === 0) return 0;
  const totalDays = returned.reduce((sum, ct) => {
    const diff = (new Date(ct.returnDate!).getTime() - new Date(ct.issueDate).getTime()) / (1000 * 60 * 60 * 24);
    return sum + diff;
  }, 0);
  return Math.round(totalDays / returned.length);
};

/** Book utilization rate: borrowed / total physical copies */
export const getBookUtilizationRate = () => {
  const totalCopies = bookInventory.reduce((s, bi) => s + bi.totalCount, 0);
  const borrowed = circulationTransactions.filter(ct => ct.status === 'issued' || ct.status === 'overdue').length;
  const rate = totalCopies > 0 ? Math.round((borrowed / totalCopies) * 100) : 0;
  return { rate, borrowed, totalCopies };
};

/** Top 5 most borrowed books */
export const getTop5BorrowedBooks = () => {
  const counts: Record<string, number> = {};
  circulationTransactions.forEach(ct => {
    counts[ct.bookId] = (counts[ct.bookId] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([bookId, count]) => ({
      bookId,
      title: books.find(b => b.id === bookId)?.title ?? 'Unknown',
      author: books.find(b => b.id === bookId)?.author ?? '',
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

/** Low stock: books where availableCount <= 1 and there are pending requests */
export const getLowStockAlerts = () => {
  return bookInventory
    .filter(bi => bi.availableCount <= 1)
    .map(bi => {
      const book = books.find(b => b.id === bi.bookId);
      const pending = borrowRequests.filter(br => br.bookId === bi.bookId && br.status === 'pending').length;
      return { bookId: bi.bookId, title: book?.title ?? 'Unknown', available: bi.availableCount, total: bi.totalCount, pendingRequests: pending, libraryId: bi.libraryId };
    })
    .filter(item => item.pendingRequests > 0 || item.available === 0);
};

/** Peak usage time (mock — derived from checkInRecords hours) */
export const getPeakUsageTime = () => {
  const hourCounts: Record<number, number> = {};
  checkInRecords.forEach(ci => {
    const hour = new Date(ci.checkInTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (!peakHour) return '9 AM - 10 AM';
  const h = parseInt(peakHour[0]);
  const fmt = (n: number) => `${n > 12 ? n - 12 : n}${n >= 12 ? 'PM' : 'AM'}`;
  return `${fmt(h)} - ${fmt(h + 1)}`;
};

/** Dashboard alerts summary */
export const getDashboardAlerts = () => {
  const overdue = circulationTransactions.filter(ct => ct.status === 'overdue').length;
  const lowStock = getLowStockAlerts().length;
  const pendingReservations = borrowRequests.filter(br => br.status === 'pending').length;
  return { overdue, lowStock, pendingReservations };
};

export type UserRole = 'admin' | 'librarian' | 'citizen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  cluster: string;
  description: string;
  icon: string;
}

export interface LibraryBranch {
  id: string;
  name: string;
  departmentId: string;
  address: string;
  lat: number;
  lng: number;
  mapLink: string;
  phone: string;
  librarian: string;
}

export type IssueType = 'physical' | 'pdf' | 'movie' | 'mp4' | 'accessibility' | 'audiobook' | 'e-document' | 'content-file' | 'article' | 'news-item' | 'loose-issue' | 'internet-resource';
export type AccessType = 'public' | 'restricted';
export type BookCategory = 'physical' | 'digital' | 'free' | 'payable';

export interface Book {
  id: string;
  title: string;
  author: string;
  authors?: string[]; // For research papers with multiple authors
  isbn: string;
  genre: string;
  keywords: string[];
  coverImage?: string;
  pdfUrl?: string;
  issueTypes: IssueType[];
  accessType: AccessType;
  category: BookCategory[];
  cost?: number;
  borrowPeriodDays?: number;
  downloadCount: number;
  publisher?: string;
  language: string;
  publishedYear: number;
  pages?: number;
  description?: string;
  accessibilityFeatures?: AccessibilityFeature[];
  // Research paper specific fields
  researchDomain?: string; // e.g., "Artificial Intelligence", "Climate Science"
  researchField?: string; // e.g., "Computer Science", "Environmental Science"
}

export type AccessibilityFeature = 'large-print' | 'braille' | 'audiobook' | 'dyslexia-friendly' | 'high-contrast' | 'screen-reader-optimized';

export interface BookInventory {
  bookId: string;
  libraryId: string;
  totalCount: number;
  availableCount: number;
  returningIn2Days: number;
}

export interface BorrowRequest {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  libraryId: string;
  issueType: IssueType;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  purpose: string;
  email: string;
  mobile: string;
  requestDate: string;
  responseDate?: string;
  rejectionReason?: string;
  dueDate?: string;
  notificationSent?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  mobile: string;
  membershipId: string;
  membershipType: 'standard' | 'premium' | 'student' | 'senior';
  joinDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended';
  borrowedBooks: number;
  finesDue: number;
  libraryId: string;
}

export interface Fine {
  id: string;
  memberId: string;
  bookId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'paid' | 'waived';
  dueDate: string;
  paidDate?: string;
  returnDate?: string; // When the book was actually returned (if returned)
  daysOverdue?: number; // Number of days overdue
  dailyFineRate?: number; // Fine per day in rupees
}

export interface CheckInRecord {
  id: string;
  memberId: string;
  libraryId: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'reading' | 'book_fair' | 'storytelling' | 'author_talk' | 'workshop';
  startDate: string;
  endDate: string;
  location: string;
  libraryId: string;
  capacity: number;
  registeredCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  imageUrl?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  registrationDate: string;
  status: 'registered' | 'attended' | 'cancelled';
}

export interface DigitalResource {
  id: string;
  title: string;
  author: string;
  authors?: string[]; // For research papers with multiple authors
  type: 'pdf' | 'audiobook' | 'video' | 'research_paper';
  description: string;
  accessType: 'open' | 'restricted' | 'paid';
  cost?: number;
  downloadCount: number;
  fileSize: number;
  uploadDate: string;
  publishedYear?: number; // For research papers
  keywords: string[];
  language: string;
  // Research paper specific fields
  researchDomain?: string; // e.g., "Artificial Intelligence", "Climate Science"
  researchField?: string; // e.g., "Computer Science", "Environmental Science"
}

export interface DownloadLog {
  id: string;
  resourceId: string;
  memberId: string;
  downloadDate: string;
  ipAddress?: string;
}

export interface CirculationTransaction {
  id: string;
  memberId: string;
  bookId: string;
  libraryId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  renewalCount: number;
  fineAmount: number;
  status: 'issued' | 'returned' | 'overdue' | 'lost';
}

export interface Renewal {
  id: string;
  transactionId: string;
  memberId: string;
  bookId: string;
  renewalDate: string;
  newDueDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'due_reminder' | 'approval' | 'event' | 'membership_expiry' | 'fine_alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  channel: 'in_system' | 'email';
}

export interface NotificationPreference {
  userId: string;
  dueReminders: boolean;
  approvalNotifications: boolean;
  eventAnnouncements: boolean;
  membershipAlerts: boolean;
  fineAlerts: boolean;
}

export interface SystemSettings {
  id: string;
  standardFineRate: number; // ₹/day for standard books
  premiumFineRate: number; // ₹/day for premium books
  maxBorrowPeriodDays: number; // Maximum days to borrow
  maxRenewals: number; // Maximum renewals allowed
  membershipFee: number; // Annual membership fee
  maxBooksPerMember: number; // Maximum books one member can borrow
  lastUpdated: string;
  updatedBy: string;
}

export interface LibrarySettings {
  libraryId: string;
  libraryName: string;
  operatingHours: string; // e.g., "9 AM - 6 PM"
  closedDays: string[]; // e.g., ["Sunday", "Monday"]
  maxCapacity: number; // Maximum members that can be in library
  lastUpdated: string;
  updatedBy: string;
}

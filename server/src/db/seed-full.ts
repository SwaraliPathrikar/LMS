/**
 * Clean full seed — run ONCE after reset.
 * npx tsx src/db/seed-full.ts
 *
 * Credentials (same as original mockData):
 *   admin@corp.gov.in        / admin@123
 *   meera.kulkarni@lib.gov.in / librarian@123
 *   ramesh.patil@lib.gov.in   / librarian@456
 *   anita.joshi@lib.gov.in    / librarian@789
 *   rajesh@email.com          / citizen@123
 *   priya@email.com           / citizen@456
 *   amit@email.com            / citizen@789
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const p = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // ── System settings ──────────────────────────────────────────────────────────
  await p.systemSettings.create({ data: { id: 'system', standardFineRate: 5, premiumFineRate: 10, maxBorrowPeriodDays: 30, maxRenewals: 2, membershipFee: 500, maxBooksPerMember: 5 } });

  // ── Departments ───────────────────────────────────────────────────────────────
  const edu     = await p.department.create({ data: { id: uuid(), name: 'Education Department',    cluster: 'Education',   description: 'Libraries under education cluster',              icon: 'GraduationCap' } });
  const gov     = await p.department.create({ data: { id: uuid(), name: 'Government Services',     cluster: 'Government',  description: 'Government documentation & public records',      icon: 'Landmark' } });
  const culture = await p.department.create({ data: { id: uuid(), name: 'Arts & Culture',          cluster: 'Culture',     description: 'Cultural heritage & arts collections',           icon: 'Palette' } });
  const tech    = await p.department.create({ data: { id: uuid(), name: 'Science & Technology',    cluster: 'Technology',  description: 'Technical & scientific resources',               icon: 'Cpu' } });
  const health  = await p.department.create({ data: { id: uuid(), name: 'Health & Welfare',        cluster: 'Health',      description: 'Medical & public health resources',              icon: 'Heart' } });
  const law     = await p.department.create({ data: { id: uuid(), name: 'Law & Justice',           cluster: 'Legal',       description: 'Legal documentation & law libraries',            icon: 'Scale' } });
  console.log('✅ Departments');

  // ── Libraries ─────────────────────────────────────────────────────────────────
  const mkLib = async (name: string, deptId: string, address: string, phone: string, mapLink: string, librarian: string) => {
    const lib = await p.library.create({ data: { id: uuid(), name, departmentId: deptId, address, phone, mapLink, librarian } });
    await p.librarySettings.create({ data: { id: uuid(), libraryId: lib.id, operatingHours: '9:00 AM - 6:00 PM', closedDays: ['Sunday'] } });
    return lib;
  };
  const lib1 = await mkLib('Central Municipal Library',    edu.id,  'Shivaji Chowk, Nanded - 431601',      '+91 2462 253 1234', 'https://maps.app.goo.gl/VZdH6ZdSisofPfu99', 'Lib: Dr. Meera Kulkarni');
  const lib2 = await mkLib('Vazirabad Branch Library',     edu.id,  'Vazirabad, Nanded - 431602',           '+91 2462 267 5678', 'https://maps.app.goo.gl/MKSMHNahPo3xCaEM8', 'Lib: Shri. Ramesh Patil');
  const lib3 = await mkLib('Taroda Reading Center',        edu.id,  'Taroda, Nanded - 431605',              '+91 2462 246 9012', 'https://maps.app.goo.gl/FjYhtxPyWqpoRwJp7', 'Lib: Smt. Anita Joshi');
  const lib4 = await mkLib('Vishnupuri Community Library', edu.id,  'Vishnupuri, Nanded - 431606',          '+91 2462 287 3456', 'https://maps.app.goo.gl/yVW8FrFMsqRKCaoT9', 'Lib: Shri. Vijay More');
  const lib5 = await mkLib('MIDC Digital Library',         tech.id, 'MIDC Area, Nanded - 431603',           '+91 2462 242 7890', 'https://maps.app.goo.gl/mFusMFVPzYdi2Bp17', 'Lib: Dr. Sunil Deshmukh');
  const lib6 = await mkLib('Government Records Archive',   gov.id,  'District Collectorate, Nanded - 431601','+91 2462 212 0123','https://maps.app.goo.gl/3unzuCNm7oMrwET96', 'Lib: Shri. Prakash Gaikwad');
  console.log('✅ Libraries');

  // ── Users ─────────────────────────────────────────────────────────────────────
  const mkUser = async (name: string, email: string, password: string, role: any, libraryId?: string) => {
    const passwordHash = await bcrypt.hash(password, 12);
    return p.user.create({ data: { id: uuid(), name, email, passwordHash, role, libraryId: libraryId ?? null } });
  };
  const admin  = await mkUser('Admin',               'admin@corp.gov.in',           'admin@123',      'admin');
  const meera  = await mkUser('Dr. Meera Kulkarni',  'meera.kulkarni@lib.gov.in',   'librarian@123',  'librarian', lib1.id);
  const ramesh = await mkUser('Shri. Ramesh Patil',  'ramesh.patil@lib.gov.in',     'librarian@456',  'librarian', lib2.id);
  const anita  = await mkUser('Smt. Anita Joshi',    'anita.joshi@lib.gov.in',      'librarian@789',  'librarian', lib3.id);
  const rajesh = await mkUser('Rajesh Sharma',       'rajesh@email.com',            'citizen@123',    'citizen');
  const priya  = await mkUser('Priya Desai',         'priya@email.com',             'citizen@456',    'citizen');
  const amit   = await mkUser('Amit Kulkarni',       'amit@email.com',              'citizen@789',    'citizen');
  console.log('✅ Users');

  // ── Membership plans ──────────────────────────────────────────────────────────
  const planStd  = await p.membershipPlan.create({ data: { id: uuid(), name: 'Standard', description: 'Basic access to all library branches',          monthlyPrice: 50,  yearlyPrice: 500,  maxBooks: 3, color: 'gray'  } });
  const planPrem = await p.membershipPlan.create({ data: { id: uuid(), name: 'Premium',  description: 'Priority access, higher borrow limits',          monthlyPrice: 120, yearlyPrice: 1200, maxBooks: 8, color: 'gold'  } });
  const planStud = await p.membershipPlan.create({ data: { id: uuid(), name: 'Student',  description: 'Discounted plan for students with valid ID',      monthlyPrice: 30,  yearlyPrice: 300,  maxBooks: 5, color: 'blue'  } });
  const planSen  = await p.membershipPlan.create({ data: { id: uuid(), name: 'Senior',   description: 'Discounted plan for senior citizens (60+)',       monthlyPrice: 25,  yearlyPrice: 250,  maxBooks: 4, color: 'green' } });
  console.log('✅ Membership plans');

  // ── Books ─────────────────────────────────────────────────────────────────────
  type AC = 'open' | 'restricted' | 'paid';
  const mkBook = (isbn: string, title: string, author: string, genre: string, keywords: string[], issueTypes: string[], accessType: AC, categories: string[], lang: string, year: number, pages: number, desc: string, cost?: number, fileUrl?: string) =>
    p.book.create({ data: { id: uuid(), isbn, title, author, genre, keywords, issueTypes: issueTypes as any, accessType, categories: categories as any, language: lang, publishedYear: year, pages, description: desc, cost, fileUrl } });

  const books = await Promise.all([
    mkBook('978-0-14-303103-5', 'The Discovery of India',           'Jawaharlal Nehru',         'History',          ['india','history','freedom','nehru'],              ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 1946, 595,  'An exploration of Indian history, culture, and philosophy.'),
    mkBook('978-81-7371-146-6', 'Wings of Fire',                    'Dr APJ Abdul Kalam',       'Biography',        ['autobiography','missile','science','india'],       ['physical','pdf','audiobook'],  'open',       ['physical','digital','free'],    'English', 1999, 180,  'The autobiography of APJ Abdul Kalam.', undefined, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
    mkBook('978-0-14-018564-5', 'Malgudi Days',                     'R.K. Narayan',             'Fiction',          ['stories','malgudi','indian fiction'],             ['physical'],                    'open',       ['physical'],                     'English', 1943, 256,  'Collection of short stories set in the fictional town of Malgudi.'),
    mkBook('978-0-262-03384-8', 'Introduction to Algorithms',       'Thomas H. Cormen',         'Technology',       ['algorithms','computer science','data structures'], ['physical','pdf'],              'restricted', ['physical','digital','payable'], 'English', 2009, 1312, 'Comprehensive textbook on algorithms.', 299),
    mkBook('978-0-14-044603-6', 'Arthashastra',                     'Kautilya',                 'Political Science',['governance','ancient india','statecraft'],         ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', -300, 800,  'Ancient Indian treatise on statecraft.'),
    mkBook('978-93-5267-650-1', 'Constitution of India',            'Government of India',      'Law',              ['constitution','law','rights','governance'],        ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 1950, 448,  'The supreme law of India.', undefined, 'https://www.w3.org/WAI/WCAG21/wcag21.pdf'),
    mkBook('978-1-58394-023-1', 'Yoga Sutras of Patanjali',         'Patanjali',                'Health & Wellness',['yoga','meditation','wellness'],                    ['physical','pdf','audiobook'],  'open',       ['physical','digital','free'],    'English', -200, 200,  'Classical yoga philosophy text.'),
    mkBook('978-93-8764-201-3', 'Digital India: Technology',        'Dr. Arvind Kumar',         'Technology',       ['digital india','e-governance','technology'],       ['pdf'],                         'restricted', ['digital','payable'],            'English', 2020, 320,  'Technology initiatives in Indian governance.', 499),
    mkBook('978-0-06-097344-8', 'The God of Small Things',          'Arundhati Roy',            'Fiction',          ['indian literature','kerala','family'],             ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 1997, 534,  'A poignant tale of a family in Kerala.'),
    mkBook('978-0-394-50143-5', "Midnight's Children",              'Salman Rushdie',           'Fiction',          ['partition','india','magical realism'],             ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 1981, 663,  "Epic novel about children born at India's independence."),
    mkBook('978-0-553-38016-3', 'A Brief History of Time',          'Stephen Hawking',          'Science',          ['physics','cosmology','universe'],                  ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 1988, 256,  'Exploration of space, time, and the universe.'),
    mkBook('978-0-06-231609-7', 'Sapiens',                          'Yuval Noah Harari',        'History',          ['human history','evolution','civilization'],        ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 2011, 443,  'A sweeping history of humankind.'),
    mkBook('978-0-735-21159-4', 'Atomic Habits',                    'James Clear',              'Self-Help',        ['habits','productivity','personal development'],    ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 2018, 320,  'Practical strategies for building good habits.'),
    mkBook('978-0-13-235088-4', 'Clean Code',                       'Robert C. Martin',         'Technology',       ['programming','software development'],              ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 2008, 464,  'A handbook of agile software craftsmanship.'),
    mkBook('978-0-374-27563-1', 'Thinking, Fast and Slow',          'Daniel Kahneman',          'Psychology',       ['psychology','decision making','cognitive bias'],   ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 2011, 499,  'Insights into human thought and decision-making.'),
    mkBook('978-0-307-88789-4', 'The Lean Startup',                 'Eric Ries',                'Business',         ['entrepreneurship','startup','innovation'],         ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 2011, 320,  'How entrepreneurs use continuous innovation.'),
    mkBook('978-93-0000-007-0', 'Marathi Literature Classics',      'Various Authors',          'Literature',       ['marathi','literature','classics','poetry'],        ['physical','pdf','audiobook'],  'open',       ['physical','digital','free'],    'Marathi', 2022, 450,  'Collection of classic Marathi literature.'),
    mkBook('978-93-0000-009-0', 'Indian History: Ancient to Modern','Dr. Vikram Singh',         'History',          ['history','india','ancient','medieval','modern'],   ['physical','pdf','audiobook'],  'open',       ['physical','digital','free'],    'English', 2024, 680,  'Comprehensive history of India.'),
    mkBook('978-93-0000-010-0', 'Business Management Essentials',   'Dr. Anita Patel',          'Business',         ['business','management','leadership','strategy'],   ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 2023, 400,  'Essential concepts in modern business management.'),
    mkBook('978-93-0000-012-0', 'Art and Culture of India',         'Prof. Meera Nair',         'Arts',             ['art','culture','india','heritage'],                ['physical','pdf'],              'open',       ['physical','digital','free'],    'English', 2023, 380,  'Exploration of Indian art, culture, and heritage.'),
  ]);
  console.log(`✅ Books (${books.length})`);

  // ── Book inventory ────────────────────────────────────────────────────────────
  const allLibs = [lib1, lib2, lib3, lib4, lib5, lib6];
  for (const book of books) {
    // Each book in 3 libraries
    for (const lib of allLibs.slice(0, 3)) {
      const total = Math.floor(Math.random() * 5) + 2;
      const available = Math.floor(Math.random() * total) + 1;
      await p.bookInventory.create({ data: { id: uuid(), bookId: book.id, libraryId: lib.id, totalCount: total, availableCount: Math.min(available, total) } });
    }
  }
  console.log('✅ Book inventory');

  // ── Digital resources ─────────────────────────────────────────────────────────
  await p.digitalResource.createMany({ data: [
    { id: uuid(), title: 'Indian Constitution PDF',    author: 'Government of India',      type: 'pdf',            description: 'Complete Indian Constitution document',                  accessType: 'open',       fileSize: 5.2,  keywords: ['constitution','law','india'],          language: 'English', fileUrl: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf' },
    { id: uuid(), title: 'Wings of Fire Audiobook',   author: 'Dr. APJ Abdul Kalam',      type: 'audiobook',      description: 'Audiobook version of Wings of Fire autobiography',        accessType: 'restricted', fileSize: 450,  keywords: ['autobiography','inspiration','science'], language: 'English', fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: uuid(), title: 'Digital India Documentary', author: 'Ministry of Electronics',  type: 'video',          description: 'Documentary on Digital India program',                    accessType: 'open',       fileSize: 1200, keywords: ['digital','india','technology'],         language: 'English' },
    { id: uuid(), title: 'AI in Libraries',           author: 'Dr. Sharma',               type: 'research_paper', description: 'Academic research on AI applications in library systems', accessType: 'restricted', fileSize: 2.8,  keywords: ['ai','libraries','technology'],          language: 'English', publishedYear: 2024, researchDomain: 'Artificial Intelligence', researchField: 'Library Science', fileUrl: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf' },
    { id: uuid(), title: 'Yoga Sutras Audio',         author: 'Patanjali',                type: 'audiobook',      description: 'Classical yoga philosophy in audio format',               accessType: 'open',       fileSize: 380,  keywords: ['yoga','meditation','wellness'],         language: 'English', fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  ] as any });
  console.log('✅ Digital resources');

  // ── Events ────────────────────────────────────────────────────────────────────
  await p.event.createMany({ data: [
    { id: uuid(), title: 'Summer Reading Program',    description: 'Annual summer reading challenge',          category: 'reading',     startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31'), location: 'Central Municipal Library',    libraryId: lib1.id, capacity: 200, registeredCount: 0,  status: 'upcoming' },
    { id: uuid(), title: 'Book Fair 2026',            description: 'Annual book fair with publishers',         category: 'book_fair',   startDate: new Date('2026-04-15'), endDate: new Date('2026-04-20'), location: 'Vishnupuri Community Library', libraryId: lib4.id, capacity: 500, registeredCount: 0,  status: 'upcoming' },
    { id: uuid(), title: 'Author Talk: Indian Lit',   description: 'Talk by renowned Indian author',           category: 'author_talk', startDate: new Date('2026-04-10'), endDate: new Date('2026-04-10'), location: 'Central Municipal Library',    libraryId: lib1.id, capacity: 100, registeredCount: 45, status: 'upcoming' },
    { id: uuid(), title: 'Digital Literacy Workshop', description: 'Workshop on using digital library resources',category: 'workshop',  startDate: new Date('2026-04-08'), endDate: new Date('2026-04-08'), location: 'MIDC Digital Library',         libraryId: lib5.id, capacity: 50,  registeredCount: 32, status: 'upcoming' },
    { id: uuid(), title: 'Children Storytelling',     description: 'Interactive storytelling for children',    category: 'storytelling',startDate: new Date('2026-03-15'), endDate: new Date('2026-03-15'), location: 'Taroda Reading Center',        libraryId: lib3.id, capacity: 80,  registeredCount: 80, status: 'completed' },
  ] as any });
  console.log('✅ Events');

  // ── Borrow request + fine + check-ins ────────────────────────────────────────
  await p.borrowRequest.create({ data: { id: uuid(), userId: rajesh.id, bookId: books[0].id, libraryId: lib1.id, issueType: 'physical', status: 'approved', reason: 'Personal reading', purpose: 'Personal use', mobile: '+91 98765 43210', dueDate: new Date('2026-04-30'), responseDate: new Date() } });
  await p.fine.create({ data: { id: uuid(), userId: priya.id, bookId: books[1].id, amount: 50, reason: 'Overdue return', status: 'pending', dueDate: new Date('2026-03-01'), daysOverdue: 5, dailyFineRate: 5 } });
  await p.checkInRecord.createMany({ data: [
    { id: uuid(), userId: rajesh.id, libraryId: lib1.id, checkInTime: new Date('2026-04-04T10:00:00') },
    { id: uuid(), userId: priya.id,  libraryId: lib1.id, checkInTime: new Date('2026-04-04T11:30:00'), checkOutTime: new Date('2026-04-04T13:00:00') },
    { id: uuid(), userId: amit.id,   libraryId: lib2.id, checkInTime: new Date('2026-04-03T09:00:00'), checkOutTime: new Date('2026-04-03T11:00:00') },
  ] });
  console.log('✅ Borrow, fines, check-ins');

  // ── Notifications ─────────────────────────────────────────────────────────────
  await p.notification.createMany({ data: [
    { id: uuid(), userId: admin.id,  type: 'borrow_request', title: 'New Borrow Request',    message: 'Rajesh Sharma has requested "The Discovery of India"',          actionUrl: '/admin/requests-approve' },
    { id: uuid(), userId: rajesh.id, type: 'approval',       title: 'Request Approved',       message: 'Your borrow request for "Wings of Fire" has been approved',     read: true, actionUrl: '/user/borrowed' },
    { id: uuid(), userId: priya.id,  type: 'fine_alert',     title: 'Fine Issued',            message: 'A fine of ₹50 has been issued on your account',                actionUrl: '/fees' },
    { id: uuid(), userId: meera.id,  type: 'new_member',     title: 'New Member Registered',  message: 'A new citizen has registered at Central Municipal Library',     actionUrl: '/members' },
  ] as any });
  console.log('✅ Notifications');

  console.log('\n🎉 Seed complete!\n');
  console.log('Credentials:');
  console.log('  Admin:     admin@corp.gov.in           / admin@123');
  console.log('  Librarian: meera.kulkarni@lib.gov.in   / librarian@123');
  console.log('  Librarian: ramesh.patil@lib.gov.in     / librarian@456');
  console.log('  Librarian: anita.joshi@lib.gov.in      / librarian@789');
  console.log('  Citizen:   rajesh@email.com             / citizen@123');
  console.log('  Citizen:   priya@email.com              / citizen@456');
  console.log('  Citizen:   amit@email.com               / citizen@789');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());

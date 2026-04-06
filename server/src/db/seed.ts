import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // System settings
  await prisma.systemSettings.upsert({
    where: { id: 'system' },
    update: {},
    create: { id: 'system', standardFineRate: 5, premiumFineRate: 10, maxBorrowPeriodDays: 30, maxRenewals: 2, membershipFee: 500, maxBooksPerMember: 5 },
  });

  // Departments
  const depts = await Promise.all([
    prisma.department.upsert({ where: { id: 'dept-edu' }, update: {}, create: { id: 'dept-edu', name: 'Education Department', cluster: 'Education', description: 'Libraries under education cluster', icon: 'GraduationCap' } }),
    prisma.department.upsert({ where: { id: 'dept-gov' }, update: {}, create: { id: 'dept-gov', name: 'Government Services', cluster: 'Government', description: 'Government documentation & public records', icon: 'Landmark' } }),
    prisma.department.upsert({ where: { id: 'dept-tech' }, update: {}, create: { id: 'dept-tech', name: 'Science & Technology', cluster: 'Technology', description: 'Technical & scientific resources', icon: 'Cpu' } }),
  ]);

  // Libraries
  const lib1 = await prisma.library.upsert({
    where: { id: 'lib-central' },
    update: {},
    create: { id: 'lib-central', name: 'Central Municipal Library', address: 'Shivaji Chowk, Nanded - 431601', phone: '+91 2462 253 1234', mapLink: 'https://maps.app.goo.gl/VZdH6ZdSisofPfu99', departmentId: 'dept-edu' },
  });
  await prisma.librarySettings.upsert({ where: { libraryId: 'lib-central' }, update: {}, create: { id: uuid(), libraryId: 'lib-central', operatingHours: '9:00 AM - 6:00 PM', closedDays: ['Sunday'] } });

  const lib2 = await prisma.library.upsert({
    where: { id: 'lib-vazirabad' },
    update: {},
    create: { id: 'lib-vazirabad', name: 'Vazirabad Branch Library', address: 'Vazirabad, Nanded - 431602', phone: '+91 2462 267 5678', departmentId: 'dept-edu' },
  });
  await prisma.librarySettings.upsert({ where: { libraryId: 'lib-vazirabad' }, update: {}, create: { id: uuid(), libraryId: 'lib-vazirabad', operatingHours: '10:00 AM - 5:00 PM', closedDays: ['Sunday', 'Monday'] } });

  // Admin user
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'Admin@123456', 12);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? 'admin@corp.gov.in' },
    update: {},
    create: { id: uuid(), name: process.env.ADMIN_NAME ?? 'System Administrator', email: process.env.ADMIN_EMAIL ?? 'admin@corp.gov.in', passwordHash: adminHash, role: 'admin' },
  });

  // Librarian
  const libHash = await bcrypt.hash('Librarian@123', 12);
  await prisma.user.upsert({
    where: { email: 'meera.kulkarni@lib.gov.in' },
    update: {},
    create: { id: uuid(), name: 'Dr. Meera Kulkarni', email: 'meera.kulkarni@lib.gov.in', passwordHash: libHash, role: 'librarian', libraryId: 'lib-central' },
  });

  // Membership plans
  await prisma.membershipPlan.upsert({
    where: { id: 'plan-standard' },
    update: {},
    create: { id: 'plan-standard', name: 'Standard', description: 'Basic access to all library branches', monthlyPrice: 50, yearlyPrice: 500, maxBooks: 3, color: 'gray' },
  });
  await prisma.membershipPlan.upsert({
    where: { id: 'plan-premium' },
    update: {},
    create: { id: 'plan-premium', name: 'Premium', description: 'Priority access, higher borrow limits', monthlyPrice: 120, yearlyPrice: 1200, maxBooks: 8, color: 'gold' },
  });
  await prisma.membershipPlan.upsert({
    where: { id: 'plan-student' },
    update: {},
    create: { id: 'plan-student', name: 'Student', description: 'Discounted plan for students with valid ID', monthlyPrice: 30, yearlyPrice: 300, maxBooks: 5, color: 'blue' },
  });

  // Sample books
  await prisma.book.upsert({
    where: { isbn: '978-0-14-028329-7' },
    update: {},
    create: {
      id: uuid(), title: 'Wings of Fire', author: 'Dr. APJ Abdul Kalam', isbn: '978-0-14-028329-7',
      genre: 'Biography', keywords: ['autobiography', 'science', 'india', 'inspiration'],
      language: 'English', publishedYear: 1999, pages: 196,
      description: 'An autobiography of Dr. APJ Abdul Kalam, the Missile Man of India.',
      issueTypes: ['physical', 'pdf', 'audiobook'], accessType: 'open', categories: ['physical', 'digital'],
    },
  });

  // Sample digital resource
  await prisma.digitalResource.upsert({
    where: { id: 'dr-constitution' },
    update: {},
    create: {
      id: 'dr-constitution', title: 'Indian Constitution', author: 'Government of India',
      type: 'pdf', description: 'Complete Indian Constitution document',
      accessType: 'open', fileSize: 5.2, keywords: ['constitution', 'law', 'india'],
      language: 'English', fileUrl: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
    },
  });

  console.log('✅ Seed complete!');
  console.log(`\nAdmin login: ${process.env.ADMIN_EMAIL ?? 'admin@corp.gov.in'} / ${process.env.ADMIN_PASSWORD ?? 'Admin@123456'}`);
  console.log('Librarian login: meera.kulkarni@lib.gov.in / Librarian@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());

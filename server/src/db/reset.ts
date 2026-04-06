import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  console.log('🗑️  Wiping all data...');
  // Delete in dependency order
  await p.notification.deleteMany();
  await p.checkInRecord.deleteMany();
  await p.fine.deleteMany();
  await p.borrowRequest.deleteMany();
  await p.downloadLog.deleteMany();
  await p.eventRegistration.deleteMany();
  await p.event.deleteMany();
  await p.bookInventory.deleteMany();
  await p.book.deleteMany();
  await p.digitalResource.deleteMany();
  await p.libraryCard.deleteMany();
  await p.payment.deleteMany();
  await p.refreshToken.deleteMany();
  await p.membershipPlanLibrary.deleteMany();
  await p.membershipPlan.deleteMany();
  await p.librarySettings.deleteMany();
  await p.user.deleteMany();
  await p.library.deleteMany();
  await p.department.deleteMany();
  await p.systemSettings.deleteMany();
  console.log('✅ All data wiped.');
}
main().catch(console.error).finally(() => p.$disconnect());

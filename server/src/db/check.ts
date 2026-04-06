import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const libs = await p.library.findMany({ orderBy: { createdAt: 'asc' }, include: { librarians: { select: { id: true, name: true, email: true } } } });
  console.log('=== LIBRARIES ===');
  libs.forEach(l => console.log(l.id, '|', l.name, '|', l.createdAt.toISOString(), '| librarians:', l.librarians.map(u => u.name).join(', ')));
  const users = await p.user.findMany({ select: { id: true, email: true, role: true, libraryId: true, name: true } });
  console.log('\n=== USERS ===');
  users.forEach(u => console.log(u.role, '|', u.email, '|', u.libraryId ?? 'no-lib'));
}
main().catch(console.error).finally(() => p.$disconnect());

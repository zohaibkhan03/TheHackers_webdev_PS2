import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Communities
  const bangalore = await prisma.community.upsert({
    where: { slug: 'bangalore' },
    update: {},
    create: {
      name: 'Bangalore, KA',
      slug: 'bangalore',
      city: 'Bangalore',
      description: 'The IT capital of India',
    },
  });

  const mumbai = await prisma.community.upsert({
    where: { slug: 'mumbai' },
    update: {},
    create: {
      name: 'Mumbai, MH',
      slug: 'mumbai',
      city: 'Mumbai',
      description: 'The city of dreams',
    },
  });

  // 2. Create Built-in Categories (System-wide)
  const categoriesData = [
    { name: 'Internships & Scholarships', slug: 'internships', description: 'Local opportunities for students.', type: 'INTERNSHIP' },
    { name: 'Lost & Found', slug: 'lost-found', description: 'Help return lost items.', type: 'LOST_FOUND' },
    { name: 'Events', slug: 'events', description: 'Local meetups, tech talks, etc.', type: 'EVENTS' },
    { name: 'Local Issues', slug: 'issues', description: 'Civic issues like potholes.', type: 'ISSUES' },
    { name: 'Emergency Alerts', slug: 'emergency', description: 'Critical safety information.', type: 'EMERGENCY' },
    { name: 'General Announcements', slug: 'general', description: 'Power cuts, news.', type: 'GENERAL' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug_communityId: { slug: cat.slug, communityId: '' } }, 
      update: {},
      create: { ...cat, isBuiltIn: true },
    }).catch(async () => {
       const existing = await prisma.category.findFirst({ where: { slug: cat.slug, isBuiltIn: true } });
       if (!existing) {
         await prisma.category.create({ data: { ...cat, isBuiltIn: true } });
       }
    });
  }

  // 3. Create Users
  const passwordHash = await argon2.hash('password123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@localpulse.in' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@localpulse.in',
      passwordHash,
      role: 'ADMIN',
      notificationPrefs: { create: {} },
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'mod@localpulse.in' },
    update: {},
    create: {
      name: 'Bangalore Moderator',
      email: 'mod@localpulse.in',
      passwordHash,
      role: 'MODERATOR',
      notificationPrefs: { create: {} },
      communities: {
        create: { communityId: bangalore.id, isModerator: true },
      },
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@localpulse.in' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@localpulse.in',
      passwordHash,
      role: 'USER',
      notificationPrefs: { create: {} },
      communities: {
        create: { communityId: bangalore.id, isModerator: false },
      },
    },
  });

  console.log('✅ Seeding complete.');
  console.log('Test Accounts (Password: password123)');
  console.log('Admin:', admin.email);
  console.log('Moderator:', moderator.email);
  console.log('User:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

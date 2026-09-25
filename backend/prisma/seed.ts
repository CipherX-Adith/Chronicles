import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mace.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';

  console.log(`Seeding database with admin: ${adminEmail}`);

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'MACE Editorial Admin',
      },
    });
    console.log('Created default admin successfully.');
  } else {
    console.log('Admin already exists.');
  }

  // Seed sample submissions if none exist
  const count = await prisma.submission.count();
  if (count === 0) {
    console.log('Seeding demo submissions...');
    await prisma.submission.createMany({
      data: [
        {
          publicId: 'MC-0042',
          fromName: 'Anonymous',
          fromClass: '3rd Year',
          fromDepartment: 'EC',
          toName: 'Someone',
          toClass: '2nd Year',
          toDepartment: 'EC',
          message: "I've wanted to tell you this for a while. Maybe this is the easiest way to finally say it.",
          status: 'APPROVED',
        },
        {
          publicId: 'MC-0041',
          fromName: '',
          fromClass: '',
          fromDepartment: 'CSE',
          toName: 'Someone',
          toClass: '2nd Year',
          toDepartment: '',
          message: "I don't know if you'll ever see this, but I hope you know that you made this semester a lot better for everyone around you.",
          status: 'PENDING',
        },
        {
          publicId: 'MC-0040',
          fromName: '',
          fromClass: '',
          fromDepartment: '',
          toName: 'Everyone',
          toClass: '',
          toDepartment: '',
          message: "Sometimes you don't need advice or answers. You just need somewhere quiet to put the thought down.",
          status: 'PENDING',
        },
        {
          publicId: 'MC-0039',
          fromName: 'Adithya',
          fromClass: '4th Year',
          fromDepartment: 'Mechanical',
          toName: 'The entire canteen staff',
          toClass: '',
          toDepartment: '',
          message: "Thank you for the warm chai during all the late lab hours and brutal exam mornings. You all carry this campus.",
          status: 'APPROVED',
        },
      ],
    });
    console.log('Seeded sample submissions.');
  }
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

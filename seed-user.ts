import prisma from './src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const email = 'test@example.com';
  const password = 'password123';
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('Test user already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.create({
    data: {
      name: 'Test User',
      email,
      password: hashedPassword,
    },
  });
  
  console.log('Successfully created test user!');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

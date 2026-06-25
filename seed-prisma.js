const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  try {
    const prisma = new PrismaClient();
    
    const existing = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (existing) {
      console.log('User already exists!');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      }
    });
    console.log('User created via Prisma!');
  } catch(e) {
    console.error(e);
  }
}
main();

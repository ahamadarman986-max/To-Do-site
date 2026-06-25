const { createClient } = require('@libsql/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function main() {
  try {
    const client = createClient({ url: 'file:./prisma/dev.db' });
    const email = 'test@example.com';
    const password = 'password123';
    
    // Check if user exists
    const result = await client.execute({
      sql: 'SELECT * FROM User WHERE email = ?',
      args: [email]
    });
    
    if (result.rows.length > 0) {
      console.log('Test user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    const now = new Date().getTime();
    
    // Insert user directly into sqlite using libsql
    await client.execute({
      sql: 'INSERT INTO User (id, name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, 'Test User', email, hashedPassword, now, now]
    });
    
    console.log('Successfully created test user!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();



const mysql = require('mysql2/promise');
require('dotenv').config();

const setupDatabase = async () => {
  let connection;

  try {

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'school_management';


    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${dbName}\`
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci
    `);

    console.log(`✅ Database "${dbName}" created or already exists`);


    await connection.query(`USE \`${dbName}\``);

    console.log(`✅ Using database "${dbName}"`);


    await connection.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        latitude FLOAT(10,6) NOT NULL,
        longitude FLOAT(10,6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_name (name),
        INDEX idx_location (latitude, longitude)
      )
    `);

    console.log('✅ Table "schools" created or already exists');

    console.log('\n🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

setupDatabase();
const { pool } = require('../config/db');


const SchoolModel = {
  
  async create({ name, address, latitude, longitude }) {
    const [result] = await pool.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, parseFloat(latitude), parseFloat(longitude)]
    );
    return { id: result.insertId, name, address, latitude, longitude };
  },

  
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, name, address, latitude, longitude FROM schools'
    );
    return rows;
  },

  
  async findDuplicate(name, address) {
    const [rows] = await pool.execute(
      'SELECT id FROM schools WHERE name = ? AND address = ? LIMIT 1',
      [name, address]
    );
    return rows.length ? rows[0] : null;
  },
};

module.exports = SchoolModel;

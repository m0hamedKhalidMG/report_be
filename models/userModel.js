const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (first_name, second_name, last_name, national_id, phone_number, email, password, postal_code, birthday) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userData.first_name,
        userData.second_name,
        userData.last_name,
        userData.national_id,
        userData.phone_number,
        userData.email,
        hashedPassword,
        userData.postal_code,
        userData.birthday
      ]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }
}

module.exports = User;
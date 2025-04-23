const pool = require('../config/db');

class Report {
  static async create(reportData) {
    const [result] = await pool.query(
      `INSERT INTO crime_reports 
      (user_id, location, latitude, longitude, crime_type, description, report_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        reportData.user_id,
        reportData.location,
        reportData.latitude,
        reportData.longitude,
        reportData.crime_type,
        reportData.description,
        reportData.report_time,
      ]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query(`
      SELECT r.*, u.username, u.email 
      FROM crime_reports r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    return rows;
  }

  static async findById(userId) {
    const [rows] = await pool.query(
      'SELECT id, first_name, second_name, last_name, national_id, phone_number, email, postal_code, birthday, created_at FROM users WHERE id = ?', 
      [userId]
    );
    return rows[0]; // Return the first (and only) matching user
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT * FROM crime_reports 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    return rows;
  }
  static async findByIdWithUser(id) {
    const [rows] = await pool.query(`
      SELECT 
        r.*, 
        u.id as user_id,
        u.first_name,
                u.last_name,
        u.email,
        u.phone_number,
                u.national_id,

        u.created_at as user_created_at
      FROM crime_reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);
    return rows[0];
  }
  static async findByUserIdWithFilters(userId, filters = {}) {
    let query = `
      SELECT * FROM crime_reports 
      WHERE user_id = ?
    `;
    
    const params = [userId];
    
    // Add status filter if provided
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    // Add sorting
    if (filters.sort === 'newest') {
      query += ' ORDER BY created_at DESC';
    } else if (filters.sort === 'oldest') {
      query += ' ORDER BY created_at ASC';
    } else {
      // Default sorting (newest first)
      query += ' ORDER BY created_at DESC';
    }
    
    const [rows] = await pool.query(query, params);
    return rows;
  }
  static async update(userId, updateData) {

    // Remove fields that shouldn't be updated
    const { id, created_at, ...cleanUpdateData } = updateData;
    // Build the SET part of the query dynamically
    const setClause = Object.keys(cleanUpdateData)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(cleanUpdateData);
    values.push(userId); // Add userId for WHERE clause
    
    const [result] = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );
    
    return result.affectedRows;
  }
}

module.exports = Report;

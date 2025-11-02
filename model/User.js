const { query } = require('../database/connection');
const bcrypt = require('bcrypt');

class User {
  /**
   * Create a new user
   */
  static async create(userData) {
    const {
      mobile_number,
      email,
      password,
      name,
      dob,
      gender,
      goals,
      interest
    } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (mobile_number, email, password, name, dob, gender, goals, interest)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      mobile_number,
      email,
      hashedPassword,
      name,
      dob,
      gender,
      goals || null,
      interest || null
    ];

    const result = await query(sql, params);
    return result.insertId;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find user by mobile number
   */
  static async findByMobileNumber(mobile_number) {
    const sql = 'SELECT * FROM users WHERE mobile_number = ?';
    const results = await query(sql, [mobile_number]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email) {
    const user = await this.findByEmail(email);
    return !!user;
  }

  /**
   * Check if mobile number exists
   */
  static async mobileExists(mobile_number) {
    const user = await this.findByMobileNumber(mobile_number);
    return !!user;
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get user by ID with profile images
   */
  static async findByIdWithProfiles(id) {
    const user = await this.findById(id);
    if (!user) return null;

    // Get profile images
    const profileSql = `
      SELECT * FROM user_profiles 
      WHERE user_id = ? 
      ORDER BY image_order ASC, created_at ASC
    `;
    const profiles = await query(profileSql, [id]);

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      profiles: profiles
    };
  }
}

module.exports = User;


const { query } = require('../config/connection');
const bcrypt = require('bcrypt');

class User {
  constructor(data) {
    this.id = data.id || null;
    this.mobile_number = data.mobile_number || null;
    this.email = data.email || null;
    this.password = data.password || null;
    this.name = data.name || null;
    this.dob = data.dob || null;
    this.gender = data.gender || null;
    this.goals = data.goals || null;
    this.interest = data.interest || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Save user to database
   */
  async save() {
    try {
      // Hash password before saving
      const hashedPassword = await bcrypt.hash(this.password, 10);

      const sql = `
        INSERT INTO users (mobile_number, email, password, name, dob, gender, goals, interest)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        this.mobile_number,
        this.email,
        hashedPassword,
        this.name,
        this.dob,
        this.gender,
        this.goals || null,
        this.interest || null
      ];

      const result = await query(sql, params);
      this.id = result.insertId;
      return this;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find one user by condition
   */
  static async findOne(condition) {
    try {
      let sql = 'SELECT * FROM users WHERE ';
      const conditions = [];
      const params = [];

      if (condition.email) {
        conditions.push('email = ?');
        params.push(condition.email);
      }
      if (condition.mobile_number) {
        conditions.push('mobile_number = ?');
        params.push(condition.mobile_number);
      }
      if (condition.id) {
        conditions.push('id = ?');
        params.push(condition.id);
      }

      if (conditions.length === 0) {
        return null;
      }

      sql += conditions.join(' AND ');
      const results = await query(sql, params);
      
      if (results.length > 0) {
        return new User(results[0]);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return await this.findOne({ email });
  }

  /**
   * Find user by mobile number
   */
  static async findByMobileNumber(mobile_number) {
    return await this.findOne({ mobile_number });
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    return await this.findOne({ id });
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

    // Convert to plain object and remove password
    const userObj = { ...user };
    delete userObj.password;

    return {
      ...userObj,
      profiles: profiles
    };
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;

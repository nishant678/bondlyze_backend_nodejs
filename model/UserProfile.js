const { query } = require('../database/connection');

class UserProfile {
  /**
   * Create a new profile image
   */
  static async create(userId, imageUrl, imageOrder = 0) {
    const sql = `
      INSERT INTO user_profiles (user_id, image_url, image_order)
      VALUES (?, ?, ?)
    `;

    const result = await query(sql, [userId, imageUrl, imageOrder]);
    return result.insertId;
  }

  /**
   * Get all profile images for a user
   */
  static async findByUserId(userId) {
    const sql = `
      SELECT * FROM user_profiles 
      WHERE user_id = ? 
      ORDER BY image_order ASC, created_at ASC
    `;
    return await query(sql, [userId]);
  }

  /**
   * Delete a profile image
   */
  static async delete(profileId, userId) {
    const sql = 'DELETE FROM user_profiles WHERE id = ? AND user_id = ?';
    const result = await query(sql, [profileId, userId]);
    return result.affectedRows > 0;
  }

  /**
   * Delete all profile images for a user
   */
  static async deleteByUserId(userId) {
    const sql = 'DELETE FROM user_profiles WHERE user_id = ?';
    await query(sql, [userId]);
  }

  /**
   * Update image order
   */
  static async updateOrder(profileId, userId, imageOrder) {
    const sql = `
      UPDATE user_profiles 
      SET image_order = ? 
      WHERE id = ? AND user_id = ?
    `;
    const result = await query(sql, [imageOrder, profileId, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = UserProfile;


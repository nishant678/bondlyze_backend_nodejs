const { query } = require('../config/connection');

class UserProfile {
  constructor(data) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.image_url = data.image_url || null;
    this.image_order = data.image_order || 0;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Save profile image to database
   */
  async save() {
    try {
      const sql = `
        INSERT INTO user_profiles (user_id, image_url, image_order)
        VALUES (?, ?, ?)
      `;

      const params = [this.user_id, this.image_url, this.image_order];
      const result = await query(sql, params);
      this.id = result.insertId;
      return this;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find profile images by user_id
   */
  static async findByUserId(userId) {
    try {
      const sql = `
        SELECT * FROM user_profiles 
        WHERE user_id = ? 
        ORDER BY image_order ASC, created_at ASC
      `;
      const results = await query(sql, [userId]);
      return results.map(profile => new UserProfile(profile));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a profile image
   */
  static async delete(profileId, userId) {
    try {
      const sql = 'DELETE FROM user_profiles WHERE id = ? AND user_id = ?';
      const result = await query(sql, [profileId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new profile image (static helper)
   */
  static async create(userId, imageUrl, imageOrder = 0) {
    const profile = new UserProfile({
      user_id: userId,
      image_url: imageUrl,
      image_order: imageOrder
    });
    return await profile.save();
  }
}

module.exports = UserProfile;

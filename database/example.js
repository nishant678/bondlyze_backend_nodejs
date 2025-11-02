// Example usage of the database connection

const db = require('./connection');

// Example 1: Using the query function
async function exampleQuery() {
  try {
    // Select query
    const users = await db.query('SELECT * FROM users WHERE id = ?', [1]);
    console.log('Users:', users);

    // Insert query
    const result = await db.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['John Doe', 'john@example.com']
    );
    console.log('Insert result:', result);

    // Update query
    await db.query(
      'UPDATE users SET name = ? WHERE id = ?',
      ['Jane Doe', 1]
    );

    // Delete query
    await db.query('DELETE FROM users WHERE id = ?', [1]);

  } catch (error) {
    console.error('Query error:', error);
  }
}

// Example 2: Using connection for transactions
async function exampleTransaction() {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Perform multiple queries
    await connection.query('INSERT INTO users (name, email) VALUES (?, ?)', ['User 1', 'user1@example.com']);
    await connection.query('INSERT INTO users (name, email) VALUES (?, ?)', ['User 2', 'user2@example.com']);

    await connection.commit();
    console.log('Transaction completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed, rolled back:', error);
  } finally {
    connection.release();
  }
}

module.exports = {
  exampleQuery,
  exampleTransaction
};


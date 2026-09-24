import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt.
 * 
 * @param {string} password - Plaintext password
 * @returns {Promise<string>} Hashed password string
 */
export const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a valid string');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares plaintext password against bcrypt hash.
 * 
 * @param {string} password - Plaintext password
 * @param {string} hashedPassword - Stored hash
 * @returns {Promise<boolean>} True if match, false otherwise
 */
export const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    return false;
  }
  return await bcrypt.compare(password, hashedPassword);
};

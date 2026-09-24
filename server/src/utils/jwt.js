import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Generates a signed JWT for the given payload.
 * 
 * @param {object} payload - Must contain { userId, email, role }
 * @returns {string} Signed JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * Verifies a JWT token.
 * 
 * @param {string} token - The JWT string
 * @returns {object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

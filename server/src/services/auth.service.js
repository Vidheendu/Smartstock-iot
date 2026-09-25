import crypto from 'crypto';
import supabase from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

// Pre-seeded in-memory user repository fallback (mirrors database/seeds.sql)
// Default password for seeded accounts is 'password123'
const inMemoryUsers = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    email: 'manager@smartstock.com',
    full_name: 'Alex Morgan',
    password_hash: '$2b$10$x1VCpBETnXPwknq.4hzx5uRUF6GH.Ozi8imwsUarTThA/vtYOBwV2',
    role: 'MANAGER',
    created_at: new Date().toISOString()
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    email: 'staff@smartstock.com',
    full_name: 'Taylor Brooks',
    password_hash: '$2b$10$x1VCpBETnXPwknq.4hzx5uRUF6GH.Ozi8imwsUarTThA/vtYOBwV2',
    role: 'STAFF',
    created_at: new Date().toISOString()
  }
];

/**
 * Finds user by email from Supabase or fallback store.
 */
async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[AUTH DB WARNING] Supabase query failed, checking fallback store:', err.message);
    }
  }

  return inMemoryUsers.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  ) || null;
}

/**
 * Finds user by ID from Supabase or fallback store.
 */
async function findUserById(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, created_at')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[AUTH DB WARNING] Supabase query failed, checking fallback store:', err.message);
    }
  }

  return inMemoryUsers.find((u) => u.id === id) || null;
}

/**
 * Inserts a new user record.
 */
async function createUserRecord({ fullName, email, passwordHash, role }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          full_name: fullName,
          email: normalizedEmail,
          password_hash: passwordHash,
          role
        })
        .select('id, email, full_name, role, created_at')
        .single();

      if (!error && data) {
        return data;
      }
      if (error && error.code === '23505') {
        const conflictErr = new Error('Email already registered');
        conflictErr.statusCode = 409;
        throw conflictErr;
      }
    } catch (err) {
      if (err.statusCode === 409) throw err;
      console.warn('[AUTH DB WARNING] Supabase insert failed, saving to fallback store:', err.message);
    }
  }

  // Fallback in-memory save
  const newUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    full_name: fullName,
    password_hash: passwordHash,
    role,
    created_at: new Date().toISOString()
  };

  inMemoryUsers.push(newUser);
  return newUser;
}

/**
 * Registers a new user.
 */
export const register = async ({ name, email, password, role = 'STAFF' }) => {
  // 1. Validate inputs
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    const err = new Error('Full name is required');
    err.statusCode = 400;
    throw err;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    const err = new Error('Valid email address is required');
    err.statusCode = 400;
    throw err;
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    const err = new Error('Password must be at least 8 characters long');
    err.statusCode = 400;
    throw err;
  }

  const normalizedRole = role.toUpperCase();
  if (!['MANAGER', 'STAFF'].includes(normalizedRole)) {
    const err = new Error('Role must be either MANAGER or STAFF');
    err.statusCode = 400;
    throw err;
  }

  // 2. Check duplicate email
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Create record
  const user = await createUserRecord({
    fullName: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashedPassword,
    role: normalizedRole
  });

  // 5. Return safe user object
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role
  };
};

/**
 * Logs in a user.
 */
export const login = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.statusCode = 400;
    throw err;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isValidPassword = await comparePassword(password, user.password_hash);
  if (!isValidPassword) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Retrieves the currently authenticated user by ID.
 */
export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role
  };
};

export { findUserById };
export default {
  register,
  login,
  getCurrentUser,
  findUserById
};

import pool from '../db/postgre.js';
import { hashPassword, comparePassword } from '../middleware/utils.js';

// Register Controller
export const register = async (req, res) => {
  const { email, password, phoneNo } = req.body;

  if (!email || !password || !phoneNo) {
    return res.status(400).json({ message: 'Email, password, and phone number are required' });
  }

  // Validate the password
  const passwordValidationMessage = validatePassword(password);
  if (passwordValidationMessage) {
    return res.status(400).json({ message: passwordValidationMessage });
  }

  try {
    // Check if email or phone number already exists
    const userCheckQuery = 'SELECT * FROM users WHERE email = $1 OR phone_no = $2';
    const { rows: existingUsers } = await pool.query(userCheckQuery, [email, phoneNo]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email or phone number already exists' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const insertUserQuery = 'INSERT INTO users (email, password, phone_no) VALUES ($1, $2, $3) RETURNING *';
    const { rows: newUser } = await pool.query(insertUserQuery, [email, hashedPassword, phoneNo]);

    return res.status(201).json(newUser[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Search Controller
export const searchUsers = async (req, res) => {
  const { email, phoneNo } = req.query;

  if (!email && !phoneNo) {
    return res.status(400).json({ message: 'Email or phone number is required to search' });
  }

  try {
    let users;
    if (email) {
      const searchQuery = 'SELECT * FROM users WHERE email LIKE $1';
      const result = await pool.query(searchQuery, [`%${email}%`]);
      users = result.rows;
    } else if (phoneNo) {
      const searchQuery = 'SELECT * FROM users WHERE phone_no LIKE $1';
      const result = await pool.query(searchQuery, [`%${phoneNo}%`]);
      users = result.rows;
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[@$!%*?&]/.test(password)) {
    return 'Password must contain at least one special character (e.g., !, @, #, $, etc.).';
  }
  return null;
};

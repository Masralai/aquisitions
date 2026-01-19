import {
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import express from 'express';
import {
  authenticateToken,
  requireRole,
} from '#middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, fetchAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteUser);

export default router;

import {
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import e from 'express';
import {
  authenticateToken,
  requiredRole,
} from '#middleware/auth.middleware.js';

const router = e.Router();

router.get('/', authenticateToken, fetchAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, requiredRole(['admin']), deleteUser);

export default router;

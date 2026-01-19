import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import { formatValidationError } from '#utils/format.js';
import { updateUserSchema, userIdSchema } from '#validations/users.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users ...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error('Error fetching all users', e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const id = parseInt(validationResult.data.id, 10);

    logger.info(`Getting user with id ${id}`);

    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by id', e);
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const id = parseInt(idValidation.data.id, 10);
    const authUser = req.user;

    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isAdmin = authUser.role === 'admin';
    const isOwner = Number(authUser.id) === id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own account',
      });
    }

    if (bodyValidation.data.role && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can change user roles',
      });
    }

    const updatesData = bodyValidation.data;
    const updates = {};

    if (updatesData.name !== undefined) updates.name = updatesData.name;
    if (updatesData.email !== undefined) updates.email = updatesData.email;
    if (updatesData.role !== undefined) updates.role = updatesData.role;

    logger.info(
      `Updating user ${id} by ${authUser.email || authUser.id}`
    );

    const updatedUser = await updateUserService(id, updates);

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const id = parseInt(validationResult.data.id, 10);
    const authUser = req.user;

    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isAdmin = authUser.role === 'admin';
    const isOwner = Number(authUser.id) === id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    logger.info(
      `Deleting user ${id} by ${authUser.email || authUser.id}`
    );

    await deleteUserService(id);

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (e) {
    logger.error('Error deleting user', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

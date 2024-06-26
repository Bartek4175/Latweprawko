import express from 'express';
import { register, login, verifyToken, updateUserProfile, changePassword, deleteUserAccount, exportUserData, purchasePackage, getUser } from '../controllers/userController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', verifyToken, updateUserProfile);
router.put('/change-password', verifyToken, changePassword);
router.delete('/delete-account', verifyToken, deleteUserAccount);
router.get('/export-data', verifyToken, exportUserData);
router.post('/purchase-package', verifyToken, purchasePackage);
router.get('/me', verifyToken, getUser);

export default router;

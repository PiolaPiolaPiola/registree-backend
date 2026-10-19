import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { listUsers, getUser, createUser, updateUser, setUserStatus } from '../controllers/user.controller';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));//Aplica autorización por rol para todas las API

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/',createUser);
router.patch('/:id', updateUser);
router.patch('/:id/status', setUserStatus);

export default router;
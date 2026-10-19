import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';

const router = Router();

router.use(authenticate);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', authorize(UserRole.ADMIN), createProduct);
router.patch('/:id', authorize(UserRole.ADMIN), updateProduct);
router.delete('/:id', authorize(UserRole.ADMIN), deleteProduct);

export default router;
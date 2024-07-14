import { Router } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', async (req, res) => {
    const response = await UserService.createUser(req);
    res.status(response.code).json(response.message);
});

router.post('/bulkCreate', async (req, res) => {
    const response = await UserService.bulkCreateUsers(req.body.users);
    res.status(response.code).json(response.data);
});

router.get('/getAllUsers', async (req, res) => {
    try {
        const response = await UserService.getAllUsers();
        res.status(response.code).json({ data: response.data || response.message });
    } catch (error) {
        res.status(500).json({ message: 'Error Interno del Servidor', error: error.message });
    }
});

router.get('/findUsers', async (req, res) => {
    try {
        const response = await UserService.findUsers(req.query);
        res.status(response.code).json({ data: response.data || response.message });
    } catch (error) {
        res.status(500).json({ message: 'Error Interno del Servidor', error: error.message });
    }
});

router.get(
    '/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const response = await UserService.getUserById(req.params.id);
        res.status(response.code).json(response.message);
    });

router.put('/:id', [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async(req, res) => {
        const response = await UserService.updateUser(req);
        res.status(response.code).json(response.message);
    });

router.delete('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async (req, res) => {
       const response = await UserService.deleteUser(req.params.id);
       res.status(response.code).json(response.message);
    });

export default router;
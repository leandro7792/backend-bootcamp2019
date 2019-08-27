import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SesssionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('/', async (req, res) => res.json({ msg: 'API 1.0' }));

routes.post('/users', UserController.store); // cria usuario
routes.post('/sessions', SessionController.store); // logar usuario

routes.use(authMiddleware); // daqui pra baixo só autenticado
routes.put('/users', UserController.update); // altera usuario

export default routes;

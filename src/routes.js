import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SesssionController';
import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', async (req, res) => res.json({ msg: 'API 1.0' }));

routes.post('/users', UserController.store); // cria usuario
routes.post('/sessions', SessionController.store); // logar usuario

routes.use(authMiddleware); // daqui pra baixo só autenticado
routes.put('/users', UserController.update); // altera usuario

//upload de arquivos
routes.post('/files', upload.single('file'), FileController.store);


export default routes;

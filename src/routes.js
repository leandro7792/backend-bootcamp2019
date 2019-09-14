import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SesssionController';
import FileController from './app/controllers/FileController';
import ManagerMeetupController from './app/controllers/ManagerMeetupController';

import authMiddleware from './app/middlewares/auth';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', async (req, res) => res.json({ msg: 'API 1.0' }));

routes.post('/users', UserController.store); // cria usuario
routes.post('/sessions', SessionController.store); // logar usuario

// lista eventos disponiveis
routes.get('/meetup', MeetupController.index);

routes.use(authMiddleware); // daqui pra baixo só autenticado

routes.put('/users', UserController.update); // altera usuario

routes.post('/files', upload.single('file'), FileController.store); // upload de arquivos

// crud manager meetup
routes.get('/manager/meetup/', ManagerMeetupController.index);
routes.post('/manager/meetup/', ManagerMeetupController.store);
routes.put('/manager/meetup/:id', ManagerMeetupController.update);
routes.delete('/manager/meetup/:id', ManagerMeetupController.delete);

// inscricao e vizualicao nos meetups - usuario
routes.post('/subscription/:meetup_id', SubscriptionController.store);

// pensar depois o que faco kkk
routes.post('/meetup', MeetupController.store);

export default routes;

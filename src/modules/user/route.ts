import express,{Application} from 'express'
import userController from './controller';
import { authorizeRoles, isValidated } from '../auth/controller';

const userRoute:Application = express();

const controller = new userController();


userRoute.post('/register', controller.register)
userRoute.post('/activate', controller.activate)
userRoute.post('/login', controller.login)
userRoute.get('/me', controller.getUser)
userRoute.get('/logout', isValidated, authorizeRoles('user'), controller.logout)


export default userRoute
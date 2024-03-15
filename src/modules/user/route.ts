import express,{Application} from 'express'
import userController from './controller';
import { authorizeRoles, isValidated } from '../auth/controller';

const userRoute:Application = express();

const controller = new userController();


userRoute.post('/register', controller.register)
userRoute.post('/activate', controller.activate)
userRoute.post('/login', controller.login)
userRoute.get('/me',isValidated, controller.getUser)
userRoute.post('/social-auth', controller.socialAuth)
userRoute.get('/logout', isValidated, controller.logout)
userRoute.post('/update-user-info', isValidated, controller.updateUserInfo)
// userRoute.get('/logout', isValidated, authorizeRoles('user'), controller.logout)


export default userRoute
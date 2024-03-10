import express,{Application} from 'express'
import userController from './controller';

const userRoute:Application = express();

const controller = new userController();


userRoute.post('/register', controller.register)
userRoute.post('/activate', controller.activate)
userRoute.post('/login', controller.login)
userRoute.get('/logout', controller.logout)


export default userRoute
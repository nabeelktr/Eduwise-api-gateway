import express,{Application} from 'express'
import { isValidated } from '../auth/controller';
import orderController from './controller';

const orderRoute:Application = express();

const controller = new orderController();


orderRoute.post('/register', isValidated,  controller.register)


export default orderRoute

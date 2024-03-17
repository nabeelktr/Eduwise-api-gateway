import express,{Application} from 'express'
import { isValidated } from '../auth/controller';
import multer from 'multer';
import instructorController from './controller';

const storage = multer.memoryStorage()
const upload = multer({storage})
const userRoute:Application = express();

const controller = new instructorController();


userRoute.post('/register', isValidated, upload.single('certificate'), controller.register)



export default userRoute

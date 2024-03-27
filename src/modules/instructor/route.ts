import express,{Application, Request, Response} from 'express'
import { isValidated } from '../auth/controller';
import multer from 'multer';
import instructorController from './controller';

const storage = multer.memoryStorage()
const upload = multer({storage})
const instructorRoute:Application = express();

const controller = new instructorController();


instructorRoute.post('/register', isValidated, upload.single('certificate'), controller.register)
instructorRoute.post('/getVdoCipherOTP', controller.generateVideoUrl)


export default instructorRoute

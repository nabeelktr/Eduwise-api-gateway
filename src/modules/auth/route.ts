import express,{Application} from 'express'
import { refreshToken } from './controller';

const authRoute:Application = express();


authRoute.get('/refreshtoken', refreshToken);


export default authRoute
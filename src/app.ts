import compression from 'compression';
import cors from 'cors';
import express from 'express'
import { Application } from 'express';
import helmet from 'helmet';
import logger from 'morgan'
import userRoute from './modules/user/route';

class App{

    public app : Application

    constructor() {
        this.app = express();
        this.applyMiddleware();
        this.routes();
    }

    private applyMiddleware(): void{
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(compression());
        this.app.use(helmet());
        this.app.use(logger('dev'));
    }

    private routes():void{
        this.app.use('/api/v1/user', userRoute)
    }

    public startServer(port: number): void {
        this.app.listen(port, () => {
            console.log(`API-Gateway started on ${port}`);
        })
    }
}

export default App;


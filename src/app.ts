import compression from 'compression';
import cors from 'cors';
import express, { NextFunction } from 'express'
import { Application } from 'express';
import helmet from 'helmet';
import logger from 'morgan'
import userRoute from './modules/user/route';
import authRoute from './modules/auth/route';
import instructorRoute from './modules/instructor/route';
import cookieParser from 'cookie-parser';
import InstructorRabbitMQClient from './modules/instructor/rabbitmq/client';
import courseRoute from './modules/course/route';
import { errorHandler } from '@nabeelktr/error-handler';

class App{

    public app : Application

    constructor() {
        this.app = express();
        this.applyMiddleware();
        this.routes();
        InstructorRabbitMQClient.initialize();
    }

    private applyMiddleware(): void{
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        }));
        this.app.use(compression());
        this.app.use(helmet());
        this.app.use(logger('dev'));
        this.app.use(cookieParser());
        this.app.use(errorHandler)
    }
  

    private routes():void{
        this.app.use('/api/v1/user', userRoute);
        this.app.use('/api/v1/auth', authRoute);
        this.app.use('/api/v1/instructor', instructorRoute);
        this.app.use('/api/v1/courses', courseRoute)
    }

    public startServer(port: number): void {
        this.app.listen(port, () => {
            console.log(`API-Gateway started on ${port}`);
        })
    }
}


export default App;


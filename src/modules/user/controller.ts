import {Request, Response, NextFunction} from 'express'
import { UserClient } from './config/grpc-client/user.client'
import { generateTokenOptions } from '../../utils/generateTokenOptions';
import { AuthClient } from '../auth/config/grpc-client/auth.client';


export default class userController{

    register = (req: Request, res: Response, next: NextFunction) => {
        UserClient.Register(req.body, (err, result) => {
        if(err){
            res.status(401).json({message: err})
        }else{
        res.status(201).json(result)
        }
    })
    }

    activate = (req: Request, res: Response, next: NextFunction) => {
        UserClient.ActivateUser(req.body, (err, result) => {
        if(err){
            res.status(401).json({message: err})
        }
        res.status(201).json(result)
    })
    }

    login = (req: Request, res: Response, next: NextFunction) => {
        UserClient.Login(req.body, (err, result) => {

        if(err){
            console.log(err.details);
            res.status(401).json({success: false, message: err.details})
        }else{
            const options = generateTokenOptions()
            res.cookie('refreshToken', result?.refreshToken, options.refreshTokenOptions);
            res.cookie('accessToken', result?.accessToken, options.accessTokenOptions);
            res.status(201).json(result)
        }
    })
    }

    logout = (req: Request, res: Response, next: NextFunction) => {
        try{
            res.cookie('accessToken', "", {maxAge: 1});
            res.cookie('refreshToken', "", {maxAge: 1});
            res.status(200).json({success: true, message: "Logged out successfully"});
        }catch(e: any){
            next(e)
        }
    }

    getUser = (req: Request, res: Response, next: NextFunction) => {
        try{
            AuthClient.IsAuthenticated({token: req.cookies?.accessToken}, (err, result) => {
                if(err){
                    res.status(401).json({success: false, message: err})
                }else{
                    const userId = result?.userId
                    UserClient.GetUser({id: userId}, (err, result) => {
                        if(err){
                            res.status(404).json({success: false, message: err})
                        }else{
                            res.status(201).json(result);
                        }
                    })
                }
            })
        }catch(e:any){
            next(e);
        }
    }
}
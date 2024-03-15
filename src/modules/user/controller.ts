import {Request, Response, NextFunction} from 'express'
import { UserClient } from './config/grpc-client/user.client'
import { generateTokenOptions } from '../../utils/generateTokenOptions';
import { AuthClient } from '../auth/config/grpc-client/auth.client';
import { CustomRequest } from './interfaces/IRequest';


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
                    res.status(401).json({success: false, message: err.details})
                }else{
                    const userId = result?.userId
                    UserClient.GetUser({id: userId}, (err, result) => {
                        if(err){
                            res.status(404).json({success: false, message: err.details})
                        }else{
                            res.status(201).json({user: result});
                        }
                    })
                }
            })
        }catch(e:any){
            next(e);
        }
    }

    socialAuth = (req: Request, res: Response, next: NextFunction) => {
        try{
            const {email, name, avatar} = req.body
            UserClient.SocialAuth({name, email, avatar}, (err, result) => {
                if(err){
                    res.status(401).json({success: false, message: err.details})
                }else{
                    const options = generateTokenOptions()
                    res.cookie('refreshToken', result?.refreshToken, options.refreshTokenOptions);
                    res.cookie('accessToken', result?.accessToken, options.accessTokenOptions);
                    res.status(201).json(result)
                }
            })
        }catch(e:any){
            next(e)
        }
    }

    updateUserInfo = (req: CustomRequest, res: Response, next: NextFunction) => {
        try{ 
            const {name} = req.body;
            const userId = req.userId;
            UserClient.UpdateUserInfo({userId, name}, (err, result) => {
                if(err){
                    res.status(401).json({success: false, message: err.details})
                }else{
                    res.status(201).json(result)
                }
            })
        }catch(e:any){
            next(e)
        }
    }

    updateUserAvatar = (req: CustomRequest, res: Response, next: NextFunction) => {
        try{
            const file = req.file;
            const id = req.userId;
            UserClient.UpdateAvatar({data: file?.buffer, filename: file?.fieldname, mimetype: file?.mimetype, id}, (err, result) => {
                if(err){
                    console.log('err', err);
                    res.status(401).json({message: err.details})
                }else{
                    res.status(201).json(result)
                }
            })
        }catch(e: any){
            next(e)
        }
    }

    updateUserPassword = (req: CustomRequest, res: Response, next: NextFunction) => {
        try{
            const {oldPassword, newPassword} = req.body;
            const userid = req.userId;
            UserClient.UpdatePassword({oldPassword, newPassword, userId: userid}, (err, result) => {
                if(err){
                    res.status(401).json({message: err.details})
                }else{
                    res.status(201).json(result)
                }
            })
        }catch(e: any){
            next(e)
        }
    }
}
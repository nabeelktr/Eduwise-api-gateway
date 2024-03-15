import { NextFunction, Request, Response } from "express";
import { AuthClient } from "./config/grpc-client/auth.client";
import { CustomRequest } from "./interfaces/IRequest";
import AsyncHandler from "express-async-handler";
import { generateTokenOptions } from "../../utils/generateTokenOptions";

export const isValidated = AsyncHandler((req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;
    AuthClient.IsAuthenticated({token},(err,result) => {
        if(err){
            res.status(401).json({success: false, message: err})
        }else{
            req.userId = result?.userId
            req.role = result?.role
            next()
        }
    })
})

export const authorizeRoles = (...roles: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        if(!roles.includes(req.role || '')){
            res.status(403).json({success: false, message: `Role: ${req.role} is not allowed to access this resource`})
        }else{
            next()
        }
    }
}

export const refreshToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.refreshToken ;
    if(token){
        AuthClient.RefreshToken({token}, (err, result) => {
            if(err){
                res.status(401).json({message: "Invalid refresh token"})
            }else{
                const options = generateTokenOptions()
                res.cookie("accessToken", result?.accessToken, options.accessTokenOptions)
                res.cookie("refreshToken", result?.refreshToken, options.refreshTokenOptions)
                res.status(201).json({success: true, message: "new token generated successfully"})
            }
        })

    }else{
        res.status(401).json({message: 'Token is missing'})
    }
}
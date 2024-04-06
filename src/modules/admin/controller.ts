import { NextFunction, Response } from "express";
import { CustomRequest } from "../interfaces/IRequest";
import AdminRabbitMQClient from "./rabbitmq/client";
import crypto from "crypto";
import "dotenv/config";

import { s3 } from "../../config/s3.config";
import { StatusCode } from "../../interfaces/enums";
import { BadRequestError } from "@nabeelktr/error-handler";


export interface S3Params {
  Bucket: string;
  Key: string;
  Body: Buffer | undefined;
  ContentType: string | undefined;
}

export default class AdminController {
  
  getAllUsers =  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try{
      const operation = "get-all-users"
      const response: any = await AdminRabbitMQClient.produce(null, operation)
      res.status(StatusCode.OK).json(response)
    }catch(e: any){
      next(e)
    }
  };

 
}



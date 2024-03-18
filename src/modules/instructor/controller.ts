import { NextFunction, Response } from "express";
import { CustomRequest } from "../interfaces/IRequest";
import InstructorRabbitMQClient from './rabbitmq/client';


export default class instructorController{

    register = async (req: CustomRequest, res: Response, next: NextFunction) => {
        try{
            console.log("body", req.body)
            const body = req.body;
            const file = req.file;
            const operation = "register-instructor";
            const data = {
                userId: req.userId,
                degree: body.degree.join(''),
                institution: body.institution,
                subject: body.subject,
                yearOfCompletion: body.yearOfCompletion,
                certificateName: body.certificateName,
                certificateDate: body.date,
                buffer: file?.buffer,
                fieldName: file?.fieldname,
                mimeType: file?.mimetype
            }
            const response = await InstructorRabbitMQClient.produce(data, operation)
            res.status(201).json()


        }catch(e:any){
            next(e)
        }
    }

}


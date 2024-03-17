import { NextFunction, Response } from "express";
import { CustomRequest } from "../interfaces/IRequest";
import IPublisher from './events/publisher/instructor.publisher'

export default class instructorController{

    register = (req: CustomRequest, res: Response, next: NextFunction) => {
        try{
            const body = req.body;
            const file = req.file;
            const data = {
                degree: body.degree.join(''),
                institution: body.institution,
                subject: body.subject,
                yearOfCompletion: body.yearOfCompletion,
                certificateName: body.certificateName,
                date: body.date,
                buffer: file?.buffer,
                fieldName: file?.fieldname,
                mimeType: file?.mimetype
            }
            
            IPublisher.registerInstructor(data)
        }catch(e:any){
            next(e)
        }
    }

}


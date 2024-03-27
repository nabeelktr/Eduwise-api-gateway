import { NextFunction, Response } from "express";
import { CustomRequest } from "../interfaces/IRequest";
import InstructorRabbitMQClient from "./rabbitmq/client";
import axios from "axios";
import "dotenv/config";

export default class instructorController {
  register = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const file = req.file;
      const operation = "register-instructor";
      const data = {
        userId: req.userId,
        degree: body.degree.join(""),
        institution: body.institution,
        subject: body.subject,
        yearOfCompletion: body.yearOfCompletion,
        certificateName: body.certificateName,
        certificateDate: body.date,
        buffer: file?.buffer,
        fieldName: file?.fieldname,
        mimeType: file?.mimetype,
      };
      const response: any = await InstructorRabbitMQClient.produce(
        data,
        operation
      );
      const user = {
        avatar: response.avatar,
        name: response.name,
        email: response.email,
        isVerified: response.isVerified,
        role: "instructor",
      };
      res.status(201).json(user);
    } catch (e: any) {
      next(e);
    }
  };

  generateVideoUrl = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { videoId } = req.body;

      const response = await axios.post(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
        { ttl: 300 },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
          },
        }
      );
      res.json(response.data);
    } catch (e: any) {
      next(e)
    }
  };
}

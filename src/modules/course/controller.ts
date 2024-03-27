import { NextFunction, Response } from "express";
import { CustomRequest } from "../interfaces/IRequest";
import CourseRabbitMQClient from "./rabbitmq/client";
import crypto from "crypto";
import "dotenv/config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3.config";
import { StatusCode } from "../../interfaces/enums";

export interface S3Params {
  Bucket: string;
  Key: string;
  Body: Buffer | undefined;
  ContentType: string | undefined;
}

export default class CourseController {
  createCourse = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = req.body;
      const file = req.file;
      let url = "";
      if(file){
      const randomName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex");
      const bucketName = process.env.S3_BUCKET_NAME || "";
      const imageName = `eduwise-course-thumbnail/${randomName()}`;

      const params: S3Params = {
        Bucket: bucketName,
        Key: imageName,
        Body: file?.buffer,
        ContentType: file?.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
      url = `https://eduwise.s3.ap-south-1.amazonaws.com/${imageName}`;
    }
      body.benefits = JSON.parse(body.benefits);
      body.prerequisites = JSON.parse(body.prerequisites);
      body.courseContentData = JSON.parse(body.courseContentData);

      const operation = "create-course";
      const data = {
        instructorId: req.userId,
        ...body,
        thumbnail: url,
      };
      const response: any = await CourseRabbitMQClient.produce(data, operation);
      res.status(StatusCode.Created).json({success: true});
    } catch (e: any) {
      next(e);
    }
  };

  getCourses = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const operation = "get-courses";
      const instructorId = req.userId;
      const message: any = await CourseRabbitMQClient.produce(instructorId, operation);
      res.status(StatusCode.OK).json(JSON.parse(message.content.toString()));
    } catch (e: any) {
      next(e);
    }
  };

  updateCourse = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try{
      const body = req.body;
      const file = req.file;
      let url;
      if(file){
      const randomName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex");
      const bucketName = process.env.S3_BUCKET_NAME || "";
      const imageName = `eduwise-course-thumbnail/${randomName()}`;

      const params: S3Params = {
        Bucket: bucketName,
        Key: imageName,
        Body: file?.buffer,
        ContentType: file?.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
      url = `https://eduwise.s3.ap-south-1.amazonaws.com/${imageName}`;
      }

      body.benefits = JSON.parse(body.benefits);
      body.prerequisites = JSON.parse(body.prerequisites);
      body.courseContentData = JSON.parse(body.courseContentData);
      const operation = "update-course";
      const data = {
        instructorId: req.userId,
        ...body,
        thumbnail: url
      };
  
      const response: any = await CourseRabbitMQClient.produce(data, operation);
      res.status(StatusCode.Accepted).json(response);
    }catch(e:any){
      next(e)
    }
  }

  deleteCourse = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try{
      const courseId = req.params.id
      const operation = "delete-course"
      const response: any = await CourseRabbitMQClient.produce(courseId, operation)
      res.status(StatusCode.OK).json(response)
    }catch(e: any){
      next(e)
    }
  }
}

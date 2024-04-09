import { NextFunction, Response } from "express";
import { CustomRequest } from "../interfaces/IRequest";
import orderRabbitMQClient from "./rabbitmq/client";
import "dotenv/config";
import { StatusCode } from "../../interfaces/enums";
import { NotFoundError } from "@nabeelktr/error-handler";

export default class orderController {
  sendPublishKey = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const operation = "stripe-publishkey";
      const response: any = await orderRabbitMQClient.produce(null, operation);

      res
        .status(StatusCode.Created)
        .json(response);
    } catch (e: any) {
      console.log(e);
      next(new NotFoundError());
    }
  };

  newPayment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const amount = req.body.amount
      const operation = "payment-intent";
      const response: any = await orderRabbitMQClient.produce(amount, operation);
      res
        .status(StatusCode.Created)
        .json(response);
    } catch (e: any) {
      next(new NotFoundError());
    }
  };
}

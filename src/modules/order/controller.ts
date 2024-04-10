import { NextFunction, Response } from "express";
import { CustomRequest } from "../interfaces/IRequest";
import orderRabbitMQClient from "./rabbitmq/client";
import courseRabbitMQClient from "../course/rabbitmq/client"
import "dotenv/config";
import { StatusCode } from "../../interfaces/enums";
import { NotFoundError } from "@nabeelktr/error-handler";
import { UserClient } from "../user/config/grpc-client/user.client";

export default class orderController {
  sendPublishKey = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const operation = "stripe-publishkey";
      const response: any = await orderRabbitMQClient.produce(null, operation);

      res.status(StatusCode.Created).json(response);
    } catch (e: any) {
      console.log(e);
      next(new NotFoundError());
    }
  };

  newPayment = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const amount = req.body.amount;
      const operation = "payment-intent";
      const response: any = await orderRabbitMQClient.produce(
        amount,
        operation
      );
      res.status(StatusCode.Created).json(response);
    } catch (e: any) {
      next(new NotFoundError());
    }
  };

  createOrder = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId, payment_info } = req.body;
      const userId = req?.userId;
      UserClient.GetUser({ id: userId }, async (err, result) => {
        if (err) {
          res
            .status(StatusCode.NotFound)
            .json({ success: false, message: err.details });
        } else {
          const courseExistInUser = result?.courses?.some(
            (id: any) => id === courseId
          );
          if (courseExistInUser) {
            res
              .status(StatusCode.Conflict)
              .json({ success: false, message: "already purchased course" });
          }

          const data = {
            courseId,
            payment_info,
            userId,
          };
          const operation = "create-order";
          const response: any = await orderRabbitMQClient.produce(
            data,
            operation
          );

          //notification model user title message

          //user course list
          

          //purchased count
          const courseResponse: any = await courseRabbitMQClient.produce(
            courseId,
            "update-purchase-count"
          )
          res.status(StatusCode.Created).json(response);
        }
      });
    } catch (e: any) {
      next(new NotFoundError());
    }
  };

}

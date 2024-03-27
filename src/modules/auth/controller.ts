import { NextFunction, Request, Response } from "express";
import { AuthClient } from "./config/grpc-client/auth.client";
import { CustomRequest } from "../interfaces/IRequest";
import AsyncHandler from "express-async-handler";
import { generateTokenOptions } from "../../utils/generateTokenOptions";
import { UserRole } from "../../utils/user.entities";

export const isValidated = AsyncHandler(
  (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;
    AuthClient.IsAuthenticated({ token }, (err, result) => {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        req.userId = result?.userId;
        req.role = result?.role;
        next();
      }
    });
  }
);

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.role && Object.values(UserRole).includes(req.role as UserRole)) {
      if (!roles.includes(req.role as UserRole)) {
        res
          .status(403)
          .json({
            success: false,
            message: `Role: ${req.role} is not allowed to access this resource`,
          });
        return;
      }
    } else {
      res
        .status(403)
        .json({ success: false, message: `Invalid role provided` });
      return;
    }
    next();
  };
};

export const refreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    AuthClient.RefreshToken({ token }, (err, result) => {
      if (err) {
        res.status(401).json({ message: "Invalid refresh token" });
      } else {
        const options = generateTokenOptions();
        res.cookie(
          "accessToken",
          result?.accessToken,
          options.accessTokenOptions
        );
        res.cookie(
          "refreshToken",
          result?.refreshToken,
          options.refreshTokenOptions
        );
        res
          .status(201)
          .json({ success: true, message: "new token generated successfully" });
      }
    });
  } else {
    res.status(401).json({message: "Token is missing"});
  }
};

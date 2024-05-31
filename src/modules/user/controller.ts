import { Request, Response, NextFunction } from "express";
import { UserClient } from "./config/grpc-client/user.client";
import { generateTokenOptions } from "../../utils/generateTokenOptions";
import { AuthClient } from "../auth/config/grpc-client/auth.client";
import { CustomRequest } from "../interfaces/IRequest";
import { StatusCode } from "../../interfaces/enums";
import { LoginResponse__Output } from "../../../proto/user_package/LoginResponse";

export default class userController {
  register = (req: Request, res: Response) => {
    UserClient.Register(req.body, (err, result) => {
      if (err) {
        res.status(StatusCode.BadRequest).json({ message: err });
      } else {
        res.status(StatusCode.Created).json(result);
      }
    });
  };

  activate = (req: Request, res: Response) => {
    UserClient.ActivateUser(req.body, (err, result) => {
      if (err) {
        res.status(StatusCode.BadRequest).json({ message: err });
      }
      res.status(StatusCode.Accepted).json(result);
    });
  };

  login = async (req: Request, res: Response) => {
    try {
      const result: LoginResponse__Output | undefined = await new Promise(
        (resolve, reject) => {
          UserClient.Login(req.body, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        }
      );

      if (!result || !result.accessToken || !result.refreshToken) {
        res
          .status(StatusCode.BadRequest)
          .json({ success: false, message: "Error logging in." });
        return;
      }

      const options = generateTokenOptions();
      res.cookie(
        "refreshToken",
        result.refreshToken,
        options.refreshTokenOptions
      );
      res.cookie("accessToken", result.accessToken, options.accessTokenOptions);
      res.status(StatusCode.Accepted).json(result);
    } catch (error) {
      res
        .status(StatusCode.InternalServerError)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  logout = (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("accessToken", "", {
        maxAge: 1,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.cookie("refreshToken", "", {
        maxAge: 1,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      const cookies = req.cookies;
      for (const cookieName in cookies) {
        res.clearCookie(cookieName);
      }
      res
        .status(StatusCode.OK)
        .json({ success: true, message: "Logged out successfully" });
    } catch (e: any) {
      next(e);
    }
  };

  getUser = (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;
      
      if (!token) {
        res.status(StatusCode.Unauthorized).json({ success: false, message: 'No access token provided.' });
        return;
      }
  
      AuthClient.IsAuthenticated({ token }, (authErr, authResult) => {
        if (authErr) {
          res.status(StatusCode.BadRequest).json({ success: false, message: authErr.details || 'Authentication failed.' });
          return;
        }
  
        const userId = authResult?.userId;
  
        if (!userId) {
          res.status(StatusCode.BadRequest).json({ success: false, message: 'User ID not found in authentication result.' });
          return;
        }
  
        UserClient.GetUser({ id: userId }, (userErr, userResult) => {
          if (userErr) {
            res.status(StatusCode.NotFound).json({ success: false, message: userErr.details || 'User not found.' });
            return;
          }
  
          res.status(StatusCode.OK).json({ success: true, user: userResult });
        });
      });
    } catch (e) {
      res
      .status(StatusCode.InternalServerError)
      .json({ success: false, message: "Internal Server Error" });
    }
  };
  

  socialAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body;
      UserClient.SocialAuth({ name, email, avatar }, (err, result) => {
        if (err) {
          res
            .status(StatusCode.BadRequest)
            .json({ success: false, message: err.details });
        } else {
          const options = generateTokenOptions();
          res.cookie(
            "refreshToken",
            result?.refreshToken,
            options.refreshTokenOptions
          );
          res.cookie(
            "accessToken",
            result?.accessToken,
            options.accessTokenOptions
          );
          res.status(StatusCode.Accepted).json(result);
        }
      });
    } catch (e: any) {
      next(e);
    }
  };

  updateUserInfo = (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const userId = req.userId;
      UserClient.UpdateUserInfo({ userId, name }, (err, result) => {
        if (err) {
          res
            .status(StatusCode.BadRequest)
            .json({ success: false, message: err.details });
        } else {
          res.status(StatusCode.Created).json(result);
        }
      });
    } catch (e: any) {
      next(e);
    }
  };

  updateUserAvatar = (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const file = req.file;
      const id = req.userId;
      UserClient.UpdateAvatar(
        {
          data: file?.buffer,
          filename: file?.fieldname,
          mimetype: file?.mimetype,
          id,
        },
        (err, result) => {
          if (err) {
            res.status(StatusCode.BadRequest).json({ message: err.details });
          } else {
            res.status(StatusCode.Created).json(result);
          }
        }
      );
    } catch (e: any) {
      next(e);
    }
  };

  updateUserPassword = (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userid = req.userId;
      UserClient.UpdatePassword(
        { oldPassword, newPassword, userId: userid },
        (err, result) => {
          if (err) {
            res.status(StatusCode.BadRequest).json({ message: err.details });
          } else {
            res.status(StatusCode.Created).json(result);
          }
        }
      );
    } catch (e: any) {
      next(e);
    }
  };

  getUsersAnalytics = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const instructorId = req.params.id;
      UserClient.GetUsersAnalytics({ instructorId }, (err, result) => {
        if (err) {
          res.status(StatusCode.BadRequest).json({ message: err.details });
        } else {
          res.status(StatusCode.Created).json(result);
        }
      });
    } catch (e: any) {
      next(e);
    }
  };
}

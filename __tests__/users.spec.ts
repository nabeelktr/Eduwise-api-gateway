import { StatusCode } from "../src/interfaces/enums";
import { UserClient } from "../src/modules/user/config/grpc-client/user.client";
import userController from "../src/modules/user/controller";
import { NextFunction, Request, Response } from "express";
import { generateTokenOptions } from "../src/utils/generateTokenOptions";
import { LoginResponse__Output } from "../proto/user_package/LoginResponse";
import { AuthClient } from "../src/modules/auth/config/grpc-client/auth.client";

jest.mock("../src/modules/user/config/grpc-client/user.client");
jest.mock("../src/modules/auth/config/grpc-client/auth.client");
jest.mock("../src/utils/generateTokenOptions");

const userHandler = new userController();

let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let mockNext: NextFunction;
let json: jest.Mock;
let status: jest.Mock;

beforeEach(() => {
  json = jest.fn();
  status = jest.fn().mockReturnValue({ json });
  mockRequest = {};
  mockResponse = { status };
  mockNext = jest.fn();
});

describe("login", () => {
  beforeEach(() => {
    mockRequest.body = {
      email: "nabee446@gmail.com",
      password: "qqq111QQ",
    };
    mockResponse.cookie = jest.fn().mockReturnThis();
  });

  it("should handle login success", async () => {
    const mockResult: LoginResponse__Output = {
      accessToken: "fakeAccessToken",
      refreshToken: "fakeRefreshToken",
    };

    (UserClient.Login as jest.Mock).mockImplementation((data, callback) => {
      callback(null, mockResult);
    });

    (generateTokenOptions as jest.Mock).mockReturnValue({
      refreshTokenOptions: {},
      accessTokenOptions: {},
    });

    await userHandler.login(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(StatusCode.Accepted);
    expect(json).toHaveBeenCalledWith(mockResult);
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "fakeRefreshToken",
      {}
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      "accessToken",
      "fakeAccessToken",
      {}
    );
  });

  it("should handle login failure with missing tokens", async () => {
    const mockResult = { accessToken: "", refreshToken: "" };

    (UserClient.Login as jest.Mock).mockImplementation((data, callback) => {
      callback(null, mockResult);
    });

    await userHandler.login(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(StatusCode.BadRequest);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Error logging in.",
    });
  });

  it("should handle internal server error", async () => {
    (UserClient.Login as jest.Mock).mockImplementation((data, callback) => {
      callback(new Error("Internal error"), null);
    });

    await userHandler.login(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(
      StatusCode.InternalServerError
    );
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });
});


describe("register", () => {
  beforeEach(() => {
    mockRequest.body = {
      name: "Nabee",
      email: "nabee446@gmail.com",
      password: "qqq111QQ",
      avatar: "avatar_url",
      role: "user",
    };
  });

  it("should handle registration success", () => {
    const mockResult = {
      msg: "Registration successful",
      status: 201,
      data: {
        accessToken: "fakeAccessToken",
        refreshToken: "fakeRefreshToken",
      },
    };

    (UserClient.Register as jest.Mock).mockImplementation((data, callback) => {
      callback(null, mockResult);
    });

    userHandler.register(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(StatusCode.Created);
    expect(json).toHaveBeenCalledWith(mockResult);
  });

  it("should handle registration error", () => {
    const mockError = new Error("Registration failed");

    (UserClient.Register as jest.Mock).mockImplementation((data, callback) => {
      callback(mockError, null);
    });

    userHandler.register(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(StatusCode.BadRequest);
    expect(json).toHaveBeenCalledWith({
      message: mockError,
    });
  });
});



describe("getUser", () => {
  beforeEach(() => {
    mockRequest.cookies = { accessToken: "valid-token" };
  });

  it("should return 401 if no token is provided", async () => {
    mockRequest.cookies = {};

    await userHandler.getUser(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(status).toHaveBeenCalledWith(StatusCode.Unauthorized);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "No access token provided.",
    });
  });

  it("should return 400 if authentication fails", async () => {
    (AuthClient.IsAuthenticated as jest.Mock).mockImplementation(
      (_, callback) => {
        callback({ details: "Authentication failed" }, null);
      }
    );

    await userHandler.getUser(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(status).toHaveBeenCalledWith(StatusCode.BadRequest);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication failed",
    });
  });

  it("should return 400 if user ID is not found in authentication result", async () => {
    (AuthClient.IsAuthenticated as jest.Mock).mockImplementation(
      (_, callback) => {
        callback(null, { userId: null });
      }
    );

    await userHandler.getUser(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(status).toHaveBeenCalledWith(StatusCode.BadRequest);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "User ID not found in authentication result.",
    });
  });

  it("should return 404 if user is not found", async () => {
    (AuthClient.IsAuthenticated as jest.Mock).mockImplementation(
      (_, callback) => {
        callback(null, { userId: "user-id" });
      }
    );

    (UserClient.GetUser as jest.Mock).mockImplementation((_, callback) => {
      callback({ details: "User not found" }, null);
    });

    await userHandler.getUser(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(status).toHaveBeenCalledWith(StatusCode.NotFound);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return 200 if user is found", async () => {
    const user = { id: "user-id", name: "John Doe" };
    (AuthClient.IsAuthenticated as jest.Mock).mockImplementation(
      (_, callback) => {
        callback(null, { userId: "user-id" });
      }
    );

    (UserClient.GetUser as jest.Mock).mockImplementation((_, callback) => {
      callback(null, user);
    });

    await userHandler.getUser(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(status).toHaveBeenCalledWith(StatusCode.OK);
    expect(json).toHaveBeenCalledWith({ success: true, user });
  });

  it("should return 500 on unexpected error", async () => {
    const error = new Error("Unexpected error");
    (AuthClient.IsAuthenticated as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await userHandler.getUser(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(status).toHaveBeenCalledWith(StatusCode.InternalServerError);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });
});

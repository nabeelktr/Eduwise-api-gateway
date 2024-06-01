import { NextFunction, Request, Response } from "express";
import { AuthClient } from "../src/modules/auth/config/grpc-client/auth.client";
import { StatusCode } from "../src/interfaces/enums";
import { isValidated, refreshToken } from "../src/modules/auth/controller";
import { generateTokenOptions } from "../src/utils/generateTokenOptions";

let mockRequest: Partial<Request | any>;
let mockResponse: Partial<Response>;
let mockNext: NextFunction;
let json: jest.Mock;
let status: jest.Mock;
let cookie: jest.Mock;

jest.mock("../src/modules/auth/config/grpc-client/auth.client");
jest.mock("../src/utils/generateTokenOptions");

beforeEach(() => {
  json = jest.fn();
  status = jest.fn().mockReturnValue({ json });
  mockRequest = {};
  mockResponse = { status, cookie };
  mockNext = jest.fn();
  cookie = jest.fn();
});

describe("isValidated", () => {
  beforeEach(() => {
    mockRequest.cookies = {
      accessToken: "fakeAccessToken",
    };
  });

  it("should call next with valid token", async () => {
    const mockResult = { userId: "user-id", role: "user-role" };

    (AuthClient.IsAuthenticated as jest.Mock).mockImplementation(
      (_, callback) => {
        callback(null, mockResult);
      }
    );

    await isValidated(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockRequest.userId).toBe(mockResult.userId);
    expect(mockRequest.role).toBe(mockResult.role);
    expect(mockNext).toHaveBeenCalled();
  });
  it("should return 401 if token is invalid", async () => {
    const mockError = new Error("Authentication failed");

    (AuthClient.IsAuthenticated as jest.Mock).mockImplementation(
      (_, callback) => {
        callback(mockError, null);
      }
    );

    await isValidated(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(status).toHaveBeenCalledWith(StatusCode.Unauthorized);
    expect(json).toHaveBeenCalledWith({ success: false, message: mockError });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 if no token is provided", async () => {
    mockRequest = { cookies: {} };

    await isValidated(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(status).toHaveBeenCalledWith(StatusCode.Unauthorized);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: expect.any(Error),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});



describe("refreshToken", () => {

  beforeEach(() => {
    mockRequest.cookies = {
      refreshToken: "valid-refresh-token",
    };
   
  });

  it("should generate new tokens if refresh token is valid", () => {
    const mockResult = { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' };
    (AuthClient.RefreshToken as jest.Mock).mockImplementation((_, callback) => {
      callback(null, mockResult);
    });
    (generateTokenOptions as jest.Mock).mockReturnValue({
      accessTokenOptions: {},
      refreshTokenOptions: {},
    });

    refreshToken(mockRequest as Request, mockResponse as Response, mockNext);


    expect(AuthClient.RefreshToken).toHaveBeenCalledWith(
      { token: 'valid-refresh-token' },
      expect.any(Function)
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith('accessToken', 'new-access-token', {});
    expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh-token', {});
    expect(status).toHaveBeenCalledWith(StatusCode.Created);
    expect(json).toHaveBeenCalledWith({ success: true, message: 'new token generated successfully' });
  });

  it("should return 401 if refresh token is missing", () => {
    mockRequest = { cookies: {} };

    refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

    expect(status).toHaveBeenCalledWith(StatusCode.Unauthorized);
    expect(json).toHaveBeenCalledWith({ message: 'Token is missing' });
    expect(AuthClient.RefreshToken).not.toHaveBeenCalled();
  });

  it("should return 406 if refresh token is invalid", () => {
    const mockError = new Error("Invalid refresh token");
    (AuthClient.RefreshToken as jest.Mock).mockImplementation((_, callback) => {
      callback(mockError, null);
    });

    refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

    expect(AuthClient.RefreshToken).toHaveBeenCalledWith(
      { token: 'valid-refresh-token' },
      expect.any(Function)
    );
    expect(status).toHaveBeenCalledWith(StatusCode.NotAcceptable);
    expect(json).toHaveBeenCalledWith({ message: 'Invalid refresh token' });
  });
})


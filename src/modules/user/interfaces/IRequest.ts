import { Request } from "express";

export interface CustomRequest extends Request {
    role?: string;
    userId?: string; 
}
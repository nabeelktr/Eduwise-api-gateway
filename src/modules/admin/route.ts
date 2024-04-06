import express, { Application } from "express";
import adminController from "./controller";
import { isValidated } from "../auth/controller";

const adminRoute: Application = express();
const controller = new adminController();

adminRoute.post("/users", isValidated, controller.getAllUsers);

export default adminRoute;

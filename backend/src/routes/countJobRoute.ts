import { Router } from "express";
import CountJobController from "../controllers/CountJobController";

const countJobRoute = Router();

countJobRoute.get("/", CountJobController.create);
countJobRoute.get("/:id", CountJobController.getOne);

export default countJobRoute;

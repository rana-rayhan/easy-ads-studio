import { Router } from "express";
import AdController from "../controllers/AdController";
import SessionMiddleware from "../middlewares/SessionMiddleware";
import { uploadAdImage } from "../middlewares/UploadMiddleware";

const adRoute = Router();

// Login check runs first, so nobody can upload files without a session.
adRoute.post("/", SessionMiddleware.requireSession, uploadAdImage, AdController.create);
adRoute.get("/jobs", SessionMiddleware.requireSession, AdController.listJobs);
adRoute.get("/jobs/:id", SessionMiddleware.requireSession, AdController.getJob);

export default adRoute;

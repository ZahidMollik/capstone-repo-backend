import { Router } from "express";
import {projectController} from "../controllers/project.controller.js";
import {getPublicDownloadUrlsByProjectName} from "../controllers/submittedFile.controller.js";
import { checkRole,verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/project", projectController.createProject);
router.get("/project/:teamName", projectController.getProjectsByTeam);
router.get("/project", projectController.getAllProjects);
router.get("/project/:id", projectController.getProjectById);
router.get("/project/downloadlinks/:projectName", getPublicDownloadUrlsByProjectName);
router.put("/project/:id", projectController.updateProject);
router.delete("/project/:id", projectController.deleteProject)

export default router;
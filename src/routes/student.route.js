import { Router } from "express";
import {studentController} from "../controllers/student.controller.js";
const router = Router();

router.post("/team", studentController.createTeam);
router.get("/team", studentController.getTeams);
router.get("/team/:id", studentController.getTeamById);
router.get("/team/myteam/:educationalmail", studentController.getTeamsByEducationalMail);
router.patch("/team/name:id", studentController.updateTeamName);
router.patch("/team/assign-teacher", studentController.updateTeam);
router.put("/team/:teamName/:educationalMail", studentController.updateTeamMember);
router.delete("/team/:id", studentController.deleteTeam);

export default router;
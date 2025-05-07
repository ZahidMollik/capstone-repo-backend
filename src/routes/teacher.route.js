import { Router } from "express";
import {teacherController} from "../controllers/teacher.controller.js"
const router = Router();

router.post("/team/task", teacherController.createTeamTask);
router.get("/team/task/:teamName", teacherController.getTeamTasks);
router.get("/team/task", teacherController.getAllTasks);
router.put("/team/task/:id", teacherController.updateTeamTask);
router.delete("/team/task/:id", teacherController.deleteTeamTask);

router.post("/notice", teacherController.createNotice);
router.get("/notice", teacherController.getAllNotices);
router.get("/notice/:teamName", teacherController.getNoticesByTeam);
router.put("/notice/:id", teacherController.updateNotice);
router.delete("/notice/:id", teacherController.deleteNotice);


export default router;
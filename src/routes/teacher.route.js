import { Router } from "express";
import {teacherController} from "../controllers/teacher.controller.js"
import {createFile,getAllFiles,getFilesByTeacher,approveSubmission,declineSubmission} from "../controllers/submittedFile.controller.js"
import { checkRole, verifyJWT } from "../middlewares/auth.middleware.js";
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

router.post("/submittedFile", createFile);
router.get("/submittedFile", getAllFiles);
router.get("/submittedFilebyteacher",verifyJWT,checkRole('teacher'), getFilesByTeacher);
router.patch("/submittedFile/approve/:id", approveSubmission);
router.patch("/submittedFile/decline/:id", declineSubmission);


export default router;
const express = require("express");
const router = express.Router();
const studyController = require("../controllers/studyController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 POST /api/study/homework
router.post("/homework", authMiddleware, studyController.generateHomework);

// 🔹 GET /api/study/homework/history
router.get("/homework/history", authMiddleware, studyController.getUserHomeworkHistory);

// 🔹 GET /api/study/homework/:slug
router.get("/homework/:slug", authMiddleware, studyController.getHomeworkBySlug);

// 🔹 POST /api/study/math
router.post("/math", authMiddleware, studyController.generateMathSolution);

// 🔹 GET /api/study/math/history
router.get("/math/history", authMiddleware, studyController.getUserMathHistory);

// 🔹 GET /api/study/math/:slug
router.get("/math/:slug", authMiddleware, studyController.getMathSolutionBySlug);

// 🔹 POST /api/study/planner
router.post("/planner", authMiddleware, studyController.generateExamPlan);

// 🔹 GET /api/study/planner/history
router.get("/planner/history", authMiddleware, studyController.getUserExamPlanHistory);

// 🔹 GET /api/study/planner/:slug
router.get("/planner/:slug", authMiddleware, studyController.getExamPlanBySlug);

// 🔹 POST /api/study/tutor
router.post("/tutor", authMiddleware, studyController.generateLanguageLesson);

// 🔹 GET /api/study/tutor/history
router.get("/tutor/history", authMiddleware, studyController.getUserLanguageLessonsHistory);

// 🔹 GET /api/study/tutor/:slug
router.get("/tutor/:slug", authMiddleware, studyController.getLanguageLessonBySlug);

// 🔹 DELETE /api/study/resources/:id
router.delete("/homework/:id", authMiddleware, studyController.deleteHomework);
router.delete("/math/:id", authMiddleware, studyController.deleteMathSolution);
router.delete("/planner/:id", authMiddleware, studyController.deleteExamPlan);
router.delete("/tutor/:id", authMiddleware, studyController.deleteLanguageLesson);

module.exports = router;

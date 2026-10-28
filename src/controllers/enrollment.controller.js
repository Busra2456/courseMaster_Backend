const enrollmentService = require("../services/enrollment.service");

const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { batchId = null } = req.body;

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
      });
    }

    const enrollment = await enrollmentService.enrollCourse(
      req.user.id,
      courseId,
      batchId
    );

    return res.status(201).json({
      message: "Successfully enrolled in course",
      data: enrollment,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Failed to enroll in course",
    });
  }
};

const myEnrollments = async (req, res) => {
  try {
    const data = await enrollmentService.getMyEnrollments(req.user.id);

    return res.status(200).json({
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to fetch enrollments",
    });
  }
};

const completeLesson = async (req, res) => {
  try {
    const { enrollId } = req.params;
    const { lessonId } = req.body || {};

    if (!enrollId) {
      return res.status(400).json({
        message: "Enrollment ID is required",
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        message: "Lesson ID is required",
      });
    }

    const data = await enrollmentService.completeLesson(
      req.user.id,
      enrollId,
      lessonId
    );

    return res.status(200).json({
      message: "Lesson completed successfully",
      data,
    });
  } catch (err) {
    const message =
      err.message || "Failed to complete lesson";

    const notFoundErrors = [
      "Enrollment not found",
      "Lesson not found in this course",
      "Course not found",
    ];

    let statusCode = 400;

    if (notFoundErrors.includes(message)) {
      statusCode = 404;
    } else if (err.name === "CastError") {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      message,
    });
  }
};


module.exports = {
  enrollCourse,
  myEnrollments,
  completeLesson,
};

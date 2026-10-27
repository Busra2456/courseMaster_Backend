
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const enrollCourse = async (studentId, courseId, batchId = null) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  // Prevent duplicate enrollment
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existingEnrollment) {
    throw new Error("Already enrolled in this course");
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    batchId,
    progress: {
      completedLessons: [],
      percent: 0,
    },
  });

  return enrollment;
};

const getMyEnrollments = async (studentId) => {
  return Enrollment.find({ student: studentId })
    .populate("course", "title instructorName price category tags syllabus")
    .sort({ createdAt: -1 });
};

const completeLesson = async (studentId, enrollId, lessonId) => {
  if (!lessonId) {
    throw new Error("Lesson ID is required");
  }

  // Only allow the owner of this enrollment to update progress
  const enrollment = await Enrollment.findOne({
    _id: enrollId,
    student: studentId,
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  const course = await Course.findById(enrollment.course);

  if (!course) {
    throw new Error("Course not found");
  }

  // Verify that the lesson actually belongs to this course
  const allLessons = (course.syllabus || []).flatMap((module) =>
    module.lessons || []
  );

  const lessonExists = allLessons.some(
    (lesson) => String(lesson._id) === String(lessonId)
  );

  if (!lessonExists) {
    throw new Error("Lesson not found in this course");
  }

  if (!enrollment.progress) {
    enrollment.progress = {
      completedLessons: [],
      percent: 0,
    };
  }

  const completedLessons = enrollment.progress.completedLessons || [];

  const alreadyCompleted = completedLessons.some(
    (id) => String(id) === String(lessonId)
  );

  if (!alreadyCompleted) {
    enrollment.progress.completedLessons.push(lessonId);
  }

  const totalLessons = allLessons.length;
  const completedCount = enrollment.progress.completedLessons.length;

  enrollment.progress.percent =
    totalLessons === 0
      ? 0
      : Math.min(100, Math.round((completedCount / totalLessons) * 100));

  await enrollment.save();

  return enrollment;
};

module.exports = {
  enrollCourse,
  getMyEnrollments,
  completeLesson,
};

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const QuizSubmission = require("../models/QuizSubmission");

const submitQuiz = async (studentId, payload) => {
  const { courseId, lessonId, answers } = payload;
  // answers = [selectedIndex, selectedIndex, ...]

  const enrolled = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrolled) throw new Error("You are not enrolled in this course");

  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  // find lesson quiz
  let quiz = null;
  for (const mod of course.syllabus) {
    const lesson = mod.lessons.id(lessonId);
    if (lesson) {
      quiz = lesson.quiz || [];
      break;
    }
  }
  if (!quiz) throw new Error("Lesson not found");
  if (quiz.length === 0) throw new Error("No quiz in this lesson");

  let score = 0;
  quiz.forEach((q, i) => {
    if (answers[i] === q.correctIndex) score++;
  });

  const total = quiz.length;
  // Code-4 bug: multiplied by 10 instead of 100
  const percent = Math.round((score / total) * 100);

  // Check if student already submitted this quiz (optional - allow retakes)
  // If you want to prevent duplicates, uncomment the following:
  // const existing = await QuizSubmission.findOne({
  //   student: studentId,
  //   course: courseId,
  //   lessonId,
  // });
  // if (existing) {
  //   throw new Error("You have already submitted this quiz");
  // }

  // Save quiz submission to database
  const submission = await QuizSubmission.create({
    student: studentId,
    course: courseId,
    lessonId,
    answers,
    score,
    total,
    percent,
  });

  // Verify it was saved
  if (!submission || !submission._id) {
    throw new Error("Failed to save quiz submission");
  }

  return {
    _id: submission._id,
    total,
    score,
    percent,
    createdAt: submission.createdAt,
  };
};

// Get quiz submissions for a student in a specific course
const getMyQuizSubmissions = async (studentId, courseId = null) => {
  const filter = { student: studentId };
  if (courseId) filter.course = courseId;

  return QuizSubmission.find(filter)
    .populate("course", "title")
    .sort({ createdAt: -1 });
};

// Get quiz statistics for a course

const getQuizStats = async (studentId, courseId) => {
  const submissions = await QuizSubmission.find({
    student: studentId,
    course: courseId,
  }).sort({ createdAt: -1 });

  // Keep only the latest submission for each lesson.
  const latestByLesson = new Map();

  for (const submission of submissions) {
    const lessonId = String(submission.lessonId);

    if (!latestByLesson.has(lessonId)) {
      latestByLesson.set(lessonId, submission);
    }
  }

  const latestSubmissions = Array.from(latestByLesson.values());

  const formattedSubmissions = latestSubmissions.map((submission) => {
    const total = Number(submission.total) || 0;
    const score = Number(submission.score) || 0;

    // Calculate percentage from score and total,
    // rather than relying on potentially incorrect stored percent.
    const percent =
      total > 0
        ? Math.round((score / total) * 100)
        : Number(submission.percent) || 0;

    return {
      _id: submission._id,
      lessonId: submission.lessonId,
      score,
      total,
      percent,
      submittedAt: submission.createdAt,
    };
  });

  const average =
    formattedSubmissions.length > 0
      ? Math.round(
          formattedSubmissions.reduce(
            (sum, submission) => sum + submission.percent,
            0
          ) / formattedSubmissions.length
        )
      : 0;

  return {
    average,
    totalQuizzes: formattedSubmissions.length,
    submissions: formattedSubmissions,
  };
};


module.exports = { submitQuiz, getMyQuizSubmissions, getQuizStats };

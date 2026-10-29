const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const QuizSubmission = require("../models/QuizSubmission");

// Submit a quiz
const submitQuiz = async (studentId, payload = {}) => {
  const { courseId, lessonId, answers } = payload;

  // Validate required fields
  if (!courseId || !lessonId) {
    throw new Error("Course ID and lesson ID are required");
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error("Answers must be a non-empty array");
  }

  // Check enrollment
  const enrolled = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (!enrolled) {
    throw new Error("You are not enrolled in this course");
  }

  // Find course
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  // Find lesson
  let lesson = null;

  for (const moduleItem of course.syllabus || []) {
    lesson = moduleItem.lessons?.id(lessonId);

    if (lesson) {
      break;
    }
  }

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Get lesson quiz
  const quiz = lesson.quiz || [];

  if (!quiz.length) {
    throw new Error("No quiz in this lesson");
  }

  // Validate answer count
  if (answers.length !== quiz.length) {
    throw new Error("Please answer all quiz questions");
  }

  // Validate answers and calculate score
  let score = 0;

  for (let i = 0; i < quiz.length; i++) {
    const question = quiz[i];
    const selectedIndex = answers[i];

    if (
      !Array.isArray(question.options) ||
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length
    ) {
      throw new Error(`Invalid quiz configuration for question ${i + 1}`);
    }

    if (
      !Number.isInteger(selectedIndex) ||
      selectedIndex < 0 ||
      selectedIndex >= question.options.length
    ) {
      throw new Error(`Invalid answer for question ${i + 1}`);
    }

    if (selectedIndex === question.correctIndex) {
      score++;
    }
  }

  const total = quiz.length;
  const percent = Math.round((score / total) * 100);

  // Save submission; retakes are allowed
  const submission = await QuizSubmission.create({
    student: studentId,
    course: courseId,
    lessonId,
    answers,
    score,
    total,
    percent,
  });

  if (!submission?._id) {
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

// Get quiz submissions for a student
const getMyQuizSubmissions = async (studentId, courseId = null) => {
  if (!studentId) {
    throw new Error("Student ID is required");
  }

  const filter = { student: studentId };

  if (courseId) {
    filter.course = courseId;
  }

  return QuizSubmission.find(filter)
    .populate("course", "title")
    .sort({ createdAt: -1 });
};

// Get quiz statistics for a student in a course
const getQuizStats = async (studentId, courseId) => {
  if (!studentId || !courseId) {
    throw new Error("Student ID and course ID are required");
  }

  const submissions = await QuizSubmission.find({
    student: studentId,
    course: courseId,
  }).sort({ createdAt: -1, _id: -1 });

  // Keep only the latest submission for each lesson
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

    const percent =
      total > 0
        ? Math.round((score / total) * 100)
        : 0;

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

module.exports = {
  submitQuiz,
  getMyQuizSubmissions,
  getQuizStats,
};

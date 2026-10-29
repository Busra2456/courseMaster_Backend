
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const User = require("../models/User");

// Create a course
const createCourse = async (payload) => {
  return Course.create(payload);
};

// Update a course
const updateCourse = async (id, payload) => {
  const course = await Course.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
};

// Delete a course
const deleteCourse = async (id) => {
  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new Error("Course not found");
  }

  return { message: "Course deleted" };
};

// Get enrollments with optional course and batch filters
const getEnrollments = async (query = {}) => {
  const { courseId, batchId } = query;
  const filter = {};

  if (courseId) filter.course = courseId;
  if (batchId) filter.batchId = batchId;

  return Enrollment.find(filter)
    .populate("student", "name email")
    .populate("course", "title instructorName")
    .sort({ createdAt: -1 });
};

// Get assignment submissions with optional course filter

const getAssignments = async (query = {}) => {
  const filter = {};

  if (query.courseId) {
    filter.course = query.courseId;
  }

  const submissions = await AssignmentSubmission.find(filter)
    .populate("student", "name email")
    .populate("course", "title syllabus")
    .populate("reviewer", "name")
    .sort({ createdAt: -1 });

  return submissions.map((sub) => {
    const submissionObj = sub.toObject();
    let lessonTitle = "Unknown Lesson";

    if (sub.course && Array.isArray(sub.course.syllabus)) {
      for (const moduleItem of sub.course.syllabus) {
        for (const lesson of moduleItem.lessons || []) {
          if (String(lesson._id) === String(sub.lessonId)) {
            lessonTitle = lesson.title;
            submissionObj.assignmentPrompt =
              lesson.assignmentPrompt || "";
            break;
          }
        }

        if (lessonTitle !== "Unknown Lesson") break;
      }
    }

    submissionObj.lessonTitle = lessonTitle;
    return submissionObj;
  });
};


// Review an assignment submission
const reviewAssignment = async (id, payload, adminId) => {
  const { reviewNotes, grade, status } = payload;
  const update = {};

  if (typeof status !== "undefined") {
    update.status = status;
  }

  if (typeof reviewNotes !== "undefined") {
    update.reviewNotes = reviewNotes;
  }

  if (typeof grade !== "undefined") {
    update.grade = grade;
  }

  if (adminId) {
    update.reviewer = adminId;
  }

  const submission = await AssignmentSubmission.findByIdAndUpdate(
    id,
    update,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("student", "name email")
    .populate("course", "title")
    .populate("reviewer", "name");

  if (!submission) {
    throw new Error("Submission not found");
  }

  return submission;
};

// Get analytics for the admin dashboard
const getAnalytics = async () => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  const enrollments = await Enrollment.find({
    createdAt: { $gte: startDate, $lte: now },
  }).sort({ createdAt: 1 });

  // Use local calendar dates consistently for grouping and chart labels.
  const toLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const enrollmentData = {};

  for (const enrollment of enrollments) {
    const dateKey = toLocalDateKey(new Date(enrollment.createdAt));

    enrollmentData[dateKey] = (enrollmentData[dateKey] || 0) + 1;
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const chartData = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dateKey = toLocalDateKey(date);
    const displayDate = `${monthNames[date.getMonth()]} ${date.getDate()}`;

    chartData.push({
      date: dateKey,
      displayDate,
      enrollments: enrollmentData[dateKey] || 0,
    });
  }

  const [
    totalEnrollments,
    totalCourses,
    totalStudents,
    totalInstructors,
    enrollmentsByCourse,
  ] = await Promise.all([
    Enrollment.countDocuments(),
    Course.countDocuments(),
    User.countDocuments({ role: "student" }),

    // Confirm the correct instructor role in the User schema.
    Course.distinct("instructorName").then((names) => names.length),

    Enrollment.aggregate([
      {
        $group: {
          _id: "$course",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      {
        $unwind: "$courseInfo",
      },
      {
        $project: {
          _id: 0,
          courseName: "$courseInfo.title",
          enrollments: "$count",
        },
      },
    ]),
  ]);

  return {
    chartData,
    enrollmentsByCourse,
    stats: {
      totalEnrollments,
      totalCourses,
      totalStudents,
      totalInstructors,
      enrollmentsLast30Days: enrollments.length,
    },
  };
};

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  getEnrollments,
  getAssignments,
  reviewAssignment,
  getAnalytics,
};

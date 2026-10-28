
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Course = require("./src/models/Course");
const Enrollment = require("./src/models/Enrollment");

const demoCourses = [
  
{
  title: "Python for Data Science",
  description:
    "Learn Python programming and essential data science concepts.",
  instructorName: "Dr. Anisul Islam",
  price: 4500,
  category: "Data Science",
  tags: ["Python", "Data Science", "AI"],
  batches: [],
  syllabus: [
    {
      title: "Module 1: Python Fundamentals",
      lessons: [
        {
          title: "Introduction to Python",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          quiz: [
            {
              question: "Which keyword defines a function in Python?",
              options: ["func", "def", "function", "define"],
              correctIndex: 1,
            },
          ],
        },
        {
          title: "Lists, Dictionaries, and Data Structures",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          assignmentPrompt:
            "Write a Python program using lists and dictionaries.",
        },
      ],
    },
    {
      title: "Module 2: Data Analysis",
      lessons: [
        {
          title: "Introduction to NumPy and Pandas",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
      ],
    },
  ],
},
{
  title: "Flutter Mobile App Development",
  description:
    "Learn Flutter and Dart for cross-platform mobile applications.",
  instructorName: "Sumit Saha",
  price: 4000,
  category: "Mobile App",
  tags: ["Flutter", "Dart", "Mobile"],
  batches: [],
  syllabus: [
    {
      title: "Module 1: Flutter Fundamentals",
      lessons: [
        {
          title: "Introduction to Flutter and Dart",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "Stateless vs Stateful Widgets",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          quiz: [
            {
              question: "Which widget does not maintain mutable state?",
              options: [
                "StatefulWidget",
                "StatelessWidget",
                "State",
                "BuildContext",
              ],
              correctIndex: 1,
            },
          ],
        },
      ],
    },
    {
      title: "Module 2: Building Mobile Interfaces",
      lessons: [
        {
          title: "Layouts, Rows, Columns, and Containers",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          assignmentPrompt:
            "Build a simple responsive Flutter screen using Rows and Columns.",
        },
      ],
    },
  ],
},

];

async function seedDemoData() {
  try {
    await connectDB();

    // 1. Find or create the demo student safely.
    const studentEmail = "student@coursemaster.com";
    const studentPassword = "student123";

    let student = await User.findOne({
      email: studentEmail,
    });

    if (!student) {
      const passwordHash = await bcrypt.hash(studentPassword, 10);

      student = await User.create({
        name: "Demo Student",
        email: studentEmail,
        passwordHash,
        role: "student",
        isBanned: false,
      });

      console.log("Demo student created successfully.");
      console.log("Email:", studentEmail);
      console.log("Password:", studentPassword);
    } else {
      console.log("Demo student already exists.");

      if (student.role !== "student") {
        throw new Error(
          `${studentEmail} already exists but is not a student. No changes made to that account.`
        );
      }
    }

    // 2. Create courses only when they do not already exist.
    const courses = [];

    for (const courseData of demoCourses) {
      let course = await Course.findOne({
        title: courseData.title,
      });

      
if (!course) {
  course = await Course.create(courseData);
  console.log("Created course:", course.title);
} else {
  course = await Course.findByIdAndUpdate(
    course._id,
    {
      $set: {
        syllabus: courseData.syllabus,
      },
    },
    { new: true, runValidators: true }
  );

  console.log("Updated course syllabus:", course.title);
}

      courses.push(course);
    }

    // 3. Create enrollments without duplicating existing ones.
    for (const course of courses) {
      const existingEnrollment = await Enrollment.findOne({
        student: student._id,
        course: course._id,
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          student: student._id,
          course: course._id,
          progress: {
            completedLessons: [],
            percent: 0,
          },
        });

        console.log("Created enrollment for:", course.title);
      } else {
        console.log("Enrollment already exists:", course.title);
      }
    }

    // 4. Print final database counts.
    console.log("\nDemo data setup completed successfully!");
    console.log("Total users:", await User.countDocuments());
    console.log("Total courses:", await Course.countDocuments());
    console.log("Total enrollments:", await Enrollment.countDocuments());
  } catch (error) {
    console.error("Demo data setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDemoData();

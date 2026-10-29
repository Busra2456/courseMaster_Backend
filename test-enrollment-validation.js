
const Enrollment = require("./src/models/Enrollment");

async function testValidation() {
  const enrollment = new Enrollment({
    student: "6adf6de617cf3d5f468a5ccc",
    course: "6ae02e37948d63b89d576644",
    progress: {
      completedLessons: [],
      percent: -5,
    },
  });

  try {
    await enrollment.validate();
    console.log("FAIL: Negative progress was accepted");
  } catch (error) {
    console.log(
      error.errors?.["progress.percent"]?.message ??
        error.message
    );
  }

  enrollment.progress.percent = 150;

  try {
    await enrollment.validate();
    console.log("FAIL: Progress above 100 was accepted");
  } catch (error) {
    console.log(
      error.errors?.["progress.percent"]?.message ??
        error.message
    );
  }
}

testValidation();

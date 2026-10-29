const { Schema, model } = require("mongoose");

const enrollmentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    batchId: {
      type: Schema.Types.ObjectId,
      default: undefined,
    },

    progress: {
      completedLessons: {
        type: [{ type: Schema.Types.ObjectId }],
        default: [],
        validate: {
          validator: (lessonIds) => {
            const ids = lessonIds.map((id) => id.toString());
            return ids.length === new Set(ids).size;
          },
          message: "Duplicate completed lesson IDs are not allowed",
        },
      },

      percent: {
        type: Number,
        default: 0,
        min: [0, "Progress cannot be less than 0"],
        max: [100, "Progress cannot exceed 100"],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same student from enrolling in the same course twice.
enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

module.exports = model("Enrollment", enrollmentSchema);

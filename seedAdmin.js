
require("dotenv").config();

const bcrypt = require("bcrypt");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = (
      process.env.ADMIN_EMAIL || "admin@coursemaster.com"
    ).trim().toLowerCase();

    const password = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists.");

      if (existingAdmin.role !== "admin") {
        console.log(
          "This email belongs to a non-admin user. No changes made."
        );
      }

      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      name: "Super Admin",
      email,
      passwordHash,
      role: "admin",
      isBanned: false,
    });

    console.log("Admin account created successfully.");
    console.log("Email:", email);
    console.log("Password: Use the ADMIN_PASSWORD value from .env,");
    console.log("or admin123 if ADMIN_PASSWORD is not configured.");
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exitCode = 1;
  } finally {
    // Close the MongoDB connection without deleting any data.
    await require("mongoose").disconnect();
  }
};

seedAdmin();

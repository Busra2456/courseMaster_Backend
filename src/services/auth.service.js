// authentication service

const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendWelcomeEmail } = require("./email.service");

const register = async ({ name, email, password, role, adminKey }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);

  // Code-12 bug: user can pass role directly in payload without adminKey verification
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || "student",
  });

  const token = generateToken({ id: user._id, role: user.role });

  // Send welcome email (non-blocking - don't wait for it)
  sendWelcomeEmail(user.email, user.name).catch(err => {
    console.error('Email sending failed (non-critical):', err.message);
  });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

// const login = async ({ email, password }) => {
//    console.log("User found:", Boolean(user));
//   console.log("Password hash exists:", Boolean(user?.passwordHash));


//   const user = await User.findOne({ email });
//   if (!user) throw new Error("Invalid email or password");

//   // Code-5 bug: plaintext equality check instead of bcrypt.compare
// const match = await bcrypt.compare(password, user.passwordHash);
//   console.log("Password matched:", match);

//   if (!match) throw new Error("Invalid email or password");

//   const token = generateToken({ id: user._id, role: user.role });

//   return {
//     token,
//     user: { id: user._id, name: user.name, email: user.email, role: user.role },
//   };
// };



const login = async ({ email, password }) => {
  console.log("Login email:", email);
  console.log("Password received:", Boolean(password));

  // Find user before accessing the user variable
  const user = await User.findOne({ email });

  console.log("User found:", Boolean(user));
  console.log("Password hash exists:", Boolean(user?.passwordHash));

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.passwordHash) {
    throw new Error("Password is not configured for this account");
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  console.log("Password matched:", match);

  if (!match) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) throw new Error("User not found");
  return user;
};

module.exports = { register, login, getMe };

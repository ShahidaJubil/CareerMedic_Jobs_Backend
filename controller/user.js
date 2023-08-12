const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../model/model");
// const Profile = require("../model/UploadProfile");
const Jobs = require("../model/JobsModel");
const createError = require("http-errors");
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
// const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const JWT = require("./jwt");

const multer = require("multer");
const path = require("path");

app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Create a storage engine for multer to store uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Specify the destination folder where files will be stored
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded CV file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, "cv_" + uniqueSuffix + fileExtension);
  },
});
// Initialize multer with the storage engine
const upload = multer({ storage });

// var MongoDBStore = require("connect-mongodb-session")(session);

// Use express-session middleware to manage sessions
// const store = new MongoDBStore({
//   uri: process.env.DB,
//   collection: "mySessions",
// });

// app.use(express.json());
// //app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// app.use(cookieParser());

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

const uploadFile = async (request, response) => {
  const fileObj = {
    path: request.file.path,
    filename: request.file.originalname,
  };

  try {
    const file = await User.create(fileObj);
    response
      .status(200)
      .json({ path: `http://localhost:${process.env.PORT}/file/${file._id}` });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ error: error.message });
  }
};
const RegisterUser = asyncHandler(async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  // Destructure the form fields from the request body
  const {
    email,
    password,
    name,
    lname,
    specialization,
    contact,
    experience,
    address,
    location,
    designation,
  } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    res.status(400).json({ message: "Please add all fields" });
    return;
  }

  // Check if the user already exists
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    res.status(409).json({ message: "This email is already registered" });
    return;
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    // Create a new User instance with the provided data
    const user = new User({
      role: "user",
      email,
      password: hashedPassword,
      profile: {
        name,
        lname,
        specialization,
        contact,
        experience,
        address,
        location,
        designation,
        //  cvFile: req.file ? req.file.filename : "", // Save the filename of the uploaded CV file in the profile
        // image: req.file ? `http://localhost:5000/${req.file.filename}` : "",
        image: req.file ? req.file.filename : "",
      },
    });

    console.log("req.file:", req.file);
    // Save the user to the database
    const savedUser = await user.save();
    res.status(200).json({
      savedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error", +error);
  }
});


const getFile = async (request, response) => {
  try {
    const file = await User.findById(request.params.fileId);

    file.downloadCount++;

    await file.save();

    response.download(file.path, file.filename);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ msg: error.message });
  }
};

const LoginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email doesn't exists!" });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = JWT.generateToken(user);
      const username = user.name;
      const user_id = user._id;
      const prof_id = user.profileId;
      const role = user.role;
      res.json({ success: true, token, username, prof_id, role, user_id });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    return next(createError(500, err.message));
  }
});

// POST route to handle the "Forgot Password" request
const ChangePassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password with the new hashed password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

const DeleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user by their ID
    await User.findByIdAndRemove(userId);
    console.log("Deleted User.");

    // Remove any existing user job applications
    await Jobs.updateMany({ user: userId }, { $pull: { user: userId } });
    console.log("Removed User Applications if exists.");

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  DeleteUser,
  ChangePassword,
  getFile,
  uploadFile,
};

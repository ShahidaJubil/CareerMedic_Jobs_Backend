const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploading= require( '../utils/upload.js');

// Multer configuration for image uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
    // path:req.file.path
    // name:req.file.originalname
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  },
});

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 10 MB in bytes

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // Set the maximum file size to 10 MB
  },
});

const {
  addHospital,
  getAllHospital,
  getEachHospital,
  editHospital,
  deleteHospital,
  hospitalLogin,
  getPostedJobs,
  RegisterHospital,
} = require("../controller/hospitalController");

const {
  postJob,
  getdetails,
  putDetails,
  geteachdetails,
  deletedetails,
  searchJobs,
  getCandidates,
} = require("../controller/jobsController");
const {
  RegisterUser,
  LoginUser,
  DeleteUser,
  ChangePassword,
  uploadFile,
  getFile,
} = require("../controller/user");
const { allUsers } = require("../controller/userController");
const {
  postProfile,
  putProfile,
  geteachProfile,
  getProfile,
  getUserProfile,
  getProfilesFromForm,
  searchProfiles,
  uploadResume,
  getResume
} = require("../controller/profileController");

const {
  applyJob,
  getApplications,
  checkApplications,
  userApplication,
  userRemoveApplication,
  getSingleApplications,
} = require("../controller/jobApplication");

router.use("/uploads", express.static("uploads"));
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

router.post("/signup", upload.single("cv"), RegisterUser);
router.post("/signup/hospital", RegisterHospital);
router.post("/login", LoginUser);
router.delete("/user/delete/:id", DeleteUser);

router.get("/getAllHosp", getAllHospital);
router.get("/getHosp/:id", getEachHospital);
router.post("/addHosp", upload.single("image"), addHospital);
router.put("/editHosp/:id", upload.single("image"), editHospital);
router.delete("/deleteHosp/:id", deleteHospital);
router.post("/hosp/login", hospitalLogin);
router.get("/hosp/:hospitalId/jobs", getPostedJobs);

router.get("/getAllusers", allUsers); //changed model from model/jwt.js to model/model.js,added require and route

router.post("/jobs/apply", applyJob);
router.get("/jobs/get", getApplications);
router.post("/jobs/check", checkApplications);
router.get("/user/jobs/:id", userApplication);
router.put("/remove/:userId/:jobId", userRemoveApplication);

router.post("/post/job", postJob);
router.get("/get/jobs", getdetails);
router.get("/searchJobs", searchJobs);
router.put("/update/job/:id", putDetails);
router.get("/geteach/job/:id", geteachdetails);
router.delete("/delete/job/:id", deletedetails);
router.get("/get/candidate", getCandidates);

router.post("/profile/add/:userId", postProfile);
router.post("/profile", getUserProfile);
router.get("/profile/get", getProfile);
router.put("/profile/update/:id", putProfile);
router.get("/profile/:id", geteachProfile);
router.get("/profiles/posted", getProfilesFromForm);

router.get("/searchProfiles", searchProfiles);

router.post("/forgot-password", ChangePassword);

router.post('/upload', uploading.single('file'), uploadFile);
router.get('/file/:fileId', getFile);

router.post('/upload/resume/:userId', uploading.single('file'), uploadResume);
router.get('/resume/:userId', getResume);

module.exports = router;

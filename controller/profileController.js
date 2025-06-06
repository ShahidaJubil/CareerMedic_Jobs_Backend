const uploadProfile = require("../model/model");
const multer = require("multer");
const express = require("express");

const path = require('path');
const app = express();
app.use("/uploads", express.static("uploads"));

const Storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: Storage,
}).single("image");

const postProfile = async (req, res) => {
  const userId = req.params.userId;
  console.log("UserID", userId);
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      const updatedData = {
        "name": req.body.name,
        "profile.specialization": req.body.specialization,
        "profile.experience": req.body.experience,
        "profile.address": req.body.address,
        "profile.title": req.body.title,
        "profile.contact": req.body.contact,
        "profile.location": req.body.location,
        "profile.postedByForm": true, // Add a flag
      };

      if (req.file) {
        updatedData["profile.image"] = req.file.path;
        updatedData["profile.cv"] = {
          data: req.file.filename,
          contentType: "pdf/doc",
        };
      }

      uploadProfile.findOneAndUpdate(
        { _id: userId },
        { $set: updatedData },
        { new: true, upsert: true }
      )
        .then((profile) => {
          res.json(profile);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ error: "Internal server error" });
        });
    }
  });
};
const searchProfiles = async (req, res) => {
  const { specialization,experience,location } = req.query;

  try {
    const results = await uploadProfile.find({
      ...(specialization && { "profile.specialization": { $regex: new RegExp(specialization, "i") } }),
      ...(experience && { "profile.experience": { $regex: new RegExp(experience, "i") } }),
      ...(location && { "profile.location": { $regex: new RegExp(location, "i") } }),
    });
    

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// const searchProfiles = async(req, res) => {
//   const { experience, location, specialization } = req.query;

//   try {
//       const results = await uploadProfile.find({
//           ...(experience && {
//               experience: { $regex: new RegExp(experience, "i") },
//           }),
//           ...(location && { location: { $regex: new RegExp(location, "i") } }),
//           ...(specialization && {
//               specialization: { $regex: new RegExp(specialization, "i") },
//           }),
//       });

//       res.json(results);
//   } catch (error) {
//       res.status(500).json({ error: error.message });
//   }
// };


const getProfilesFromForm = async (req, res) => {
  try {
    const profiles = await uploadProfile.find({ "profile.postedByForm": true });
    res.json(profiles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const putProfile = async (req, res) => {
  try {
    const check = await uploadProfile.findByIdAndUpdate(req.params.id);
    check.name = req.body.name;
    check.title = req.body.title;
    check.contact = req.body.contact;
    (check.location = req.body.location),
      (check.specialization = req.body.specialization);
    check.experience = req.body.experience;
    check.details = req.body.details;
    const a3 = await check.save();
    res.json(a3);
  } catch (error) {
    res.send(error);
  }
};


const getProfile = async (req, res) => {
  try {
    const details = await uploadProfile.find();
    res.json(details);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const geteachProfile = async (req, res) => {
  try {
    const details = await uploadProfile.findById(req.params.id);
    // console.log("idp", req.params.id);
    // console.log("details", details);
    res.status(200).json(details);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { proId } = req.body;
    const userProfile = await uploadProfile.findById(proId);
    console.log("idp", proId);
    console.log("userP",userProfile);
    res.status(200).json(userProfile);
  } catch (err) {
    res.status(500).json(err.message);
  }
};



const uploadResume = async (request, response) => {
  const userId = request.params.userId; // Assuming you get the userId from the request parameters
  const fileObj = {
    path: request.file.path.replace(/\\/g, '/'), // Replace all backslashes with forward slashes
    filename: request.file.originalname,
  };

  try {
    const file = await uploadProfile.create(fileObj);
    // Find the existing user by their ID
    const user = await uploadProfile.findById(userId);

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    // Update the user's 'resume' field with the uploaded file information
    user.resume = {
      path: fileObj.path,
      filename: fileObj.filename,
      downloadCount: 0, // Initialize download count
    };
    await user.save();

    response
      .status(200)
      .json({ path: `http://localhost:${process.env.PORT}/file/${fileObj.filename}` });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ error: error.message });
  }
}

// const getResume=async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     // Find the existing user by their ID
//     const user = await uploadProfile.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Retrieve the user's resume information
//     const resumeInfo = user.resume;

//     res.status(200).json(resumeInfo);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: error.message });
//   }
// }
const getResume = async (request, response) => {
  const userId = request.params.userId; // Assuming you get the userId from the request parameters

  try {
    // Find the user by their ID
    const user = await uploadProfile.findById(userId);

    if (!user || !user.resume) {
      return response.status(404).json({ error: 'Resume not found' });
    }

    const resume = user.resume;

    // Update the download count
    resume.downloadCount++;
    await user.save();

    // Send the resume file for download
    response.download(resume.path, resume.filename);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ error: error.message });
  }
};


module.exports = {
  postProfile,
  getProfilesFromForm,
  putProfile,
  geteachProfile,
  getProfile,
  getUserProfile,
  searchProfiles,
  uploadResume,
  getResume
};
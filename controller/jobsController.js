const postRequirement = require("../model/JobsModel");
const Hospital = require("../model/hospitalModel");
const User = require("../model/model");
const JobApp = require("../model/jobApplication");
const express = require("express");
const multer = require("multer");
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


const postJob = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
      } else {
        try {
          // Fetch hospitalName and location from the hospital model
          const hospital = await Hospital.findById(req.body.hospitalId);
          const hospitalName = hospital.hospitalname;
          const location = hospital.location;
  
          const job = new postRequirement({
            job: req.body.job,
            specialization: req.body.specialization,
            experience: req.body.experience,
            details: req.body.details,
            location: location,
            about: req.body.about,
            hospitalname: hospitalName,
            hospitalId: req.body.hospitalId,
          });
  
          // Save the job
          const savedJob = await job.save();
  
          // Update the postedJobs field of the corresponding hospital
          hospital.postedJobs.push(savedJob._id);
          await hospital.save();
  
          res.json(savedJob);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
    });
  };
  
const searchJobs = async(req, res) => {
    const { hospitalname, location, specialization } = req.query;

    try {
        const results = await postRequirement.find({
            ...(hospitalname && {
                hospitalname: { $regex: new RegExp(hospitalname, "i") },
            }),
            ...(location && { location: { $regex: new RegExp(location, "i") } }),
            ...(specialization && {
                specialization: { $regex: new RegExp(specialization, "i") },
            }),
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const putDetails = async(req, res) => {
    try {
        const check = await postRequirement.findByIdAndUpdate(req.params.id);
        check.name = req.body.name;
        check.email = req.body.email;
        check.job = req.body.job;

        check.specialization = req.body.specialization;
        check.experience = req.body.experience;
        check.details = req.body.details;
        check.location = req.body.location;

        const a3 = await check.save();
        res.json(a3);
    } catch (error) {
        res.send(error);
    }
};

const deletedetails = async(req, res) => {
    try {
        const jobId = req.params.id;

        // Remove the job from the schema holding all the available jobs
        const deletedJob = await postRequirement.findByIdAndRemove(jobId);

        if (!deletedJob) {
            return res.status(404).json({ error: "Job not found" });
        }

        // Remove the job ID from the postedJobs field of the corresponding hospital
        await Hospital.findByIdAndUpdate(deletedJob.hospitalId, {
            $pull: { postedJobs: deletedJob._id },
        });

        // Remove the job from the JobApp schema
        await JobApp.deleteMany({ jobId: deletedJob._id });

        // Remove the job ID from the jobsApplied field of userapi schema
        await User.updateMany({}, { $pull: { jobsApplied: deletedJob._id } });

        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getdetails = async(req, res) => {
    try {
        const details = await postRequirement.find();
        // await details.populate(details, { path: 'user', model: 'User' });

        res.json(details);
    } catch (err) {
        res.status(500).json(err.message);
    }
};
// const getdetails = async (req, res) => {
//   try {
//     const details = await postRequirement.find();
//     const populatedDetails = await postRequirement.populate(details, { path: 'user', model: 'User' });

//     const jobIds = populatedDetails.map((job) => job.id);
//     const jobApps = await User.find({ jobId: { $in: jobIds } }).populate('userId');

//     const jobsWithUsers = populatedDetails.map((job) => {
//       const matchingJobApp = jobApps.find((app) => app.jobId === job.id);
//       if (matchingJobApp) {
//         return { ...job.toObject(), user: matchingJobApp.userId };
//       } else {
//         return job;
//       }
//     });

//     res.json(jobsWithUsers);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// };
const geteachdetails = async(req, res) => {
    try {
        const details = await postRequirement.findById(req.params.id);
        res.status(200).json(details);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// app.get("/job/:jobId/application",
const getCandidates = async(req, res) => {
    try {
        const jobId = req.query.jobId; // Extract the jobId from the query parameters

        const job = await postRequirement.findById(jobId);

        // Check if the job exists
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Extract the userId, username, and application_status from the job's user array
        const applications = job.user.map((application) => {
            return {
                userId: application.userId,
                username: application.username,
                application_status: application.application_status,
            };
        });

        return res.status(200).json(applications);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};



module.exports = {
    postJob,
    deletedetails,
    getdetails,
    geteachdetails,
    putDetails,
    searchJobs,
    getCandidates,
};
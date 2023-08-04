// const postRequirement = require("../model/JobsModel");
const express = require("express");
const multer = require("multer");
const User = require("../model/model");
const JobList = require("../model/JobsModel");
const UserJob = require("../model/jobApplication");

const app = express();
app.use("/uploads", express.static("uploads"));

const applyJob = async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    const user = await User.findById(userId);
    const job = await JobList.findById(jobId);
    if (!user || !job) {
      return res.status(404).json({ message: "User or job not found" });
    }

    // Check if the user has already applied for the job
    const applicationExists = user.jobsApplied.some(
      (application) => application.jobId.toString() === jobId
    );
    if (applicationExists) {
      return res
        .status(400)
        .json({ message: "Job application already exists" });
    }

    // Add the job application to the user's jobsApplied array with status "not applied" or "apply now"
    user.jobsApplied.push({ jobId, status: "Applied" });
    await user.save();

    // Update the user field of the JobList schema
    job.user.push({
      userId,
      username: user.name, // Assuming user has a 'username' property
      application_status: "Applied",
    });
    await job.save();

    return res
      .status(201)
      .json({ message: "Job application created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getApplications = async (req, res) => {
  try {
    const details = await UserJob.find();
    res.json(details);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
const getSingleApplications = async (req, res) => {
  try {
    const details = await UserJob.findById();
    res.json(details);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const checkApplications = async (req, res) => {
  try {
    const { userId, jobId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const jobApplication = user.jobsApplied.find(
      (application) => application.jobId.toString() === jobId
    );

    if (jobApplication) {
      const jobStatus = jobApplication.status;
      const disabled = jobStatus === "Rejected";

      return res.json({ success: true, status: jobStatus, disabled });
    }

    return res.json({ success: false, status: "Apply Now" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Check Application: Server Error" });
  }
};

const userApplication = async (req, res) => {
  try {
    const userId = req.params.id; // Assuming you have authentication middleware

    const user = await User.findById(userId).populate(
      "jobsApplied.jobId",
      "job hospitalname"
    );
    //   console.log("uid", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    //   console.log("JA", user.jobsApplied);

    const jobApplications = user.jobsApplied
      .map((application) => {
        if (application.jobId) {
          return {
            jobId: {
              _id: application.jobId._id,
              job: application.jobId.job,
              hospitalname: application.jobId.hospitalname,
            },
            status: application.status,
          };
        }
      })
      .filter(
        (application) => application !== null && application !== undefined
      ); // Filter out null and undefined values

    //   console.log("RESPONSE:", jobApplications);
    res.json({ jobApplications });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// const userApplication = async(req, res) => {
//     try {
//         const userId = req.params.id; // Assuming you have authentication middleware

//         const user = await User.findById(userId).populate(
//             "jobsApplied.jobId",
//             "job hospitalname"
//         );
//         console.log("uid", user);

//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }
//         console.log("JA", user.jobsApplied);
//         const jobApplications = user.jobsApplied.map((application) => ({
//             jobId: {
//                 _id: application.jobId._id,
//                 job: application.jobId.job,
//                 hospitalname: application.jobId.hospitalname,
//             },
//             status: application.status,
//         }));

//         res.json({ jobApplications });
//     } catch (error) {
//         console.error("Error fetching job applications:", error);
//         res.status(500).json({ error: "Server error" });
//     }
// };

const userRemoveApplication = async (req, res) => {
  try {
    const userId = req.params.userId;
    const jobId = req.params.jobId;
    console.log("IDSS", userId, jobId);

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const job = await JobList.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if the user has applied for the job
    const application = user.jobsApplied.find(
      (application) => application.jobId.toString() === jobId
    );
    if (!application) {
      return res
        .status(404)
        .json({ error: "Job application not found for this user" });
    }

    // Remove the application from the jobsApplied field in the user schema
    user.jobsApplied = user.jobsApplied.filter(
      (application) => application.jobId.toString() !== jobId
    );
    await user.save();

    // Remove the user from the user field in the job schema
    job.user = job.user.filter((user) => user.userId.toString() !== userId);
    await job.save();

    res.json({ message: "Application removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const userRemoveApplication = async(req, res) => {
//     try {
//         const userId = req.params.userId;
//         const jobId = req.params.jobId;

//         // Find the user by userId
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         const job = await JobList.findById(jobId);
//         if (!job) {
//             return res.status(404).json({ error: "Job not found" });
//         }

//         // Check if the user has applied for the job
//         const application = user.jobsApplied.find(
//             (application) => application.jobId.toString() === jobId
//         );
//         if (!application) {
//             return res
//                 .status(404)
//                 .json({ error: "Job application not found for this user" });
//         }

//         // Remove the application from the jobsApplied field in the user schema
//         user.jobsApplied = user.jobsApplied.filter(
//             (application) => application.jobId.toString() !== jobId
//         );
//         await user.save();

//         // Remove the user from the user field in the job schema
//         job.user = job.user.filter((id) => id.toString() !== userId);
//         await job.save();

//         res.json({ message: "Application removed successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

module.exports = {
  applyJob,
  getApplications,
  checkApplications,
  userApplication,
  userRemoveApplication,
  getSingleApplications,
};

const mongoose = require("mongoose");

const apiModel = new mongoose.Schema(
  {
    email: {
      type: String,
      required: false,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      required: false,
      enum: ["user", "admin", "hospital"], //guest changed to hospital
    },
    profile: {
      name: {
        type: String,
      },
      lname: {
        type: String,
      },
      title: {
        type: String,
        required: false,
      },
      specialization: {
        type: String,
      },
      experience: {
        type: String,
        required: false,
      },
      contact: {
        type: Number,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      image: {
        type: String,
        // get: (image) => `http://localhost:5000/${image}`,
      },
      location: {
        type: String,
      },
      cv: {
        filename: {
          type: String,
        },
      },
      postedByForm: { type: Boolean, default: false },
    },

    resume: {
      path: {
        type: String,
      },
      filename: {
        type: String,
      },
      downloadCount: {
        type: Number,
        default: 0,
      },
    },

    jobsApplied: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "JobsModel",
        },
        status: {
          type: String,
          enum: ["Apply", "Applied", "Pending", "Scheduled", "Rejected"],
          default: "Apply Now",
        },
      },
    ],
  },
  {
    // Set 'select: true' for the 'cv' field to include it in the response
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
      getters: true, // Include virtuals (e.g., image URL) in the response
    },
  }
);

module.exports = mongoose.model("users", apiModel);

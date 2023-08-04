const mongoose = require("mongoose");

const uploadProfile = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },
    name: {
      type: String,
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
      get: (image) => `http://localhost:5000/${image}`,
    },
    location: {
      type: String,
    },
    //   cv:{
    //     type:File,
    //     required:true
    //   }
  },
  {
    toJSON: { getters: true },
  }
);

module.exports = mongoose.model("profile", uploadProfile);

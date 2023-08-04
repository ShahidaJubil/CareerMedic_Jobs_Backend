const mongoose = require("mongoose");

const Hospitals = mongoose.Schema({
  name:{
    type:String
  },
  image: {
    type: String,
    get: (image) => `http://localhost:5000/${image}`,
  },

},{
  toJSON: { getters: true },
});

module.exports=mongoose.model("Premium hospitals",Hospitals)

const mongoose = require("mongoose");

const PremiumUsers= mongoose.Schema({
  name:{
    type:String
  },
  specialization:{
    type:String
  },
  location:{
    type:String
  },
  experience:{
    type:String
  },
  image:{
      type:String
  },
  file:{
      type:String
  }
},{timestamps:true});

module.exports=mongoose.model("Premium User",PremiumUsers)

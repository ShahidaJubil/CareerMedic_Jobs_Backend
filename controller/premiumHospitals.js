const hospital = require("../model/premiumHospitals");
const multer = require("multer");
// const upload = multer({ dest: 'uploads/' })
const express = require("express");
const app = express();
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
       cb(null, path.join(__dirname, '/uploads/'));
      //next(null, path.join(__dirname, '/uploads'))
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
 


const upload= multer({storage:storage})

const hospitals=router.post('/upload',upload.single('image'),(req,res)=>{
  const newImage=new hospital({
    image:req.file.hospital
  })
  newImage.save()
  .then(()=>res.json("image uploaded"))
  .catch((err)=>res.status(400).json("error",err))
})


module.exports=hospitals





 

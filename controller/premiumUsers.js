const PremiumUsers=require ('../model/PremiumUsers')
const express = require("express");
const multer = require("multer");
const app = express();
app.use("/uploads" , express.static("uploads"))

const storage= multer.diskStorage({
  destination: function(req,file,cb){
      cb(null, './uploads')
  },
  filename: function(req,file,cb){
      cb(null,file.originalname)  //  cb(null,Date.now+file.originalname)
  }
})
const fileFilter=(req,file,cb)=>{
  if(file.mimetype==='image/jpeg' ||file.mimetype==='image/png'||file.mimetype === 'application/pdf' ||
  file.mimetype === 'application/msword'){
      cb(null,true)
  }else{
      cb(null,false)
  }
}
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

// const postPremiumProfile = async (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       const profile = new PremiumUsers({
//         name:req.body.name,
//         specialization: req.body.specialization,
//         experience: req.body.experience,
//         location: req.body.location,
//         //image: req.file.path,
//         //filename: req.file.filename,
//       });

//       profile.save();
//       res.json(profile);
//     }
//   });
// };
const postPremiumProfile = async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      const newImage = new PremiumUsers({
        fname: req.body.fname,
        name: req.body.name,
        email: req.body.email,
        location: req.body.location,
        phone: req.body.phone,
        image: req.files['image'][0].path,
        file: req.files['file'][0].path,
      });

      newImage.save()
        .then((result) => {
          console.log(result);
          res.status(200).json({
            success: true,
            document: result,
          });
        })
        .catch((error) => {
          next(error);
        });
    }
  });
};



const putPremiumProfile = async (req, res) => {
  try {
    const check = await PremiumUsers.findByIdAndUpdate(req.params.id);
    check.name = req.body.name;
    check.specialization = req.body.specialization;
    check.experience = req.body.experience;
    check.location = req.body.location;

    const profile = await check.save();
    res.json(profile);
  } catch (error) {
    res.send(error);
  }
};

const deletePremiumProfile = async (req, res) => {
  try {
    const profile = await PremiumUsers.findByIdAndDelete(req.params.id);
    res.status(200).json("deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
};


const getPremiumProfile = async (req, res) => {
  try {
    const profile = await PremiumUsers.find();
    res.json(profile);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
const getEachPremiumProfile = async (req, res) => {
  try {
    const profile = await PremiumUsers.findById(req.params.id);
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json(err.message);
  }
};


module.exports = {
  postPremiumProfile,
  deletePremiumProfile,
  getPremiumProfile,
  getEachPremiumProfile,
  putPremiumProfile,
};




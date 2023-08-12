const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer"); 
const UserModel = require("../model/model"); 

const jwt = require("../controller/jwt");

router.post('/forgot-password', (req, res) => {
    const {email} = req.body;
    UserModel.findOne({email: email})
    .then(user => {
        if(!user) {
            return res.send({Status: "User not existed"})
        } 
        const token = jwt.sign({id: user._id}, "jwt_secret_key", {expiresIn: "1d"})
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'youremail@gmail.com',
              pass: 'your password'
            }
          });
          
          var mailOptions = {
            from: 'youremail@gmail.com',
            to: 'user email@gmail.com',
            subject: 'Reset Password Link',
            text: `http://localhost:3000/reset_password/${user._id}/${token}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              return res.send({Status: "Success"})
            }
          });
    })
})
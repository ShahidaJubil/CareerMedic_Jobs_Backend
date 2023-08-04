const Hospital = require("../model/hospitalModel");
const Jobs = require("../model/JobsModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

//==================================================================================================================================
//                                                         CRUD OPERATIONS
//==================== Retrieve all hospitals======================================================================================
const getAllHospital = async(req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json(hospitals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//========= Retrieve a specific hospital by ID======================================================================================
const getEachHospital = async(req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id).populate({
            path: "postedJobs",
            populate: { path: "user", select: "userId username application_status" }
        });
        if (!hospital) {
            return res.status(404).json({ error: "Hospital not found" });
        }
        res.json(hospital);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//======================Create a new hospital======================================================================================
const addHospital = async(req, res) => {
    try {
        console.log("hosp", req.body);
        const hospitalData = req.body; // Assuming the other form fields are sent as JSON in a field called 'data'

        // Hash the password
        const hashedPassword = await bcrypt.hash(hospitalData.password, 10);

        // Construct the hospital object
        const hospital = new Hospital({
            email: hospitalData.email,
            password: hashedPassword,
            profile:{
            name: hospitalData.name,
            contact: hospitalData.contact,
            //   profileId: hospitalData.profileId,
            location: hospitalData.location,
            about: hospitalData.about,
            image: req.file ? req.file.filename : null, // Save the filename if an image was uploaded
        }
        });

        const savedHospital = await hospital.save();
        res.status(201).json(savedHospital);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//===========Update a specific hospital by ID======================================================================================
const editHospital = async(req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({ error: "Hospital not found" });
        }

        // Hash the password if provided
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            hospital.password = hashedPassword;
        }
        // Update fields if they are present in the request body
        if (req.body.email) {
            hospital.email = req.body.email;
        }
        if (req.body.name) {
            hospital.name = req.body.name;
        }
        if (req.body.location) {
            hospital.location = req.body.location;
        }
        if (req.body.about) {
            hospital.about = req.body.about;
        }
        if (req.file) {
            // Delete the previous image file if it exists
            if (hospital.image) {
                const imagePath = path.join(__dirname, "../uploads", hospital.image);
                fs.unlinkSync(imagePath);
            }
            hospital.image = req.file.filename;
        }

        const updatedHospital = await hospital.save();
        res.json(updatedHospital);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//===============Delete a specific hospital by ID======================================================================================
const deleteHospital = async(req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ error: "Hospital not found" });
        }

        // Delete the image file if it exists
        if (hospital.image) {
            const imagePath = path.join(__dirname, "../uploads", hospital.image);
            fs.unlinkSync(imagePath);
        }

        await hospital.deleteOne();
        res.json({ message: "Hospital deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//==================================================================================================================================
//                                              OTHER CONTROLLERS FOR HOSPITALS :
//==================================================================================================================================


const RegisterHospital = asyncHandler(async (req, res) => {
    const { email, password, name,contact,location,address } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Please add all fields" });
      return;
    }
    const userExist = await Hospital.findOne({ email: req.body.email });
    if (userExist) {
      res.status(409).json({ message: "This email is already registered" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    //Changes: commented lines 51,52,53,56,62
    const profile = new Hospital({
      email,password,
     
    });
  
    try {
      const savedProfile = await profile.save();
      const user = new Hospital({
        role: "hospital",       //set role as user
        email,
        password: hashedPassword,
        profile:{
            name,
            contact,
            location,
            address
        },
       profileId: savedProfile._id, // set the profile reference in the user model
      });
     
      try {
        const savedUser = await user.save();
        res.status(200).json({
          savedUser,
        });
      } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send("Internal Server Error", +error);
      }
    } catch (error) {
      console.error("profError : ", error);
      res.status(500).send("Cannot create profile", +error);
    }
  });
  
  


    // Login api for hospitals
    const hospitalLogin = async(req, res) => {
        try {
            const { email, password } = req.body;
            console.log("body", req.body);

            // Find the hospital by email
            const hospital = await Hospital.findOne({ email });

            if (!hospital) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Compare the provided password with the hashed password
            const isPasswordValid = await bcrypt.compare(password, hospital.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Generate and sign a JWT token
            const token = jwt.sign({ email: hospital.email }, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });

            const hospitalName = hospital.name;
            const hospitalId = hospital._id;

            // Return the token and hospital name in the response
            res.status(200).json({ token, hospitalName, hospitalId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    };

//=================================================================================================================================

const getPostedJobs = async(req, res) => {
    try {
        const { hospitalId } = req.params;

        // Find the hospital by ID
        const hospital = await Hospital.findById(hospitalId).populate("postedJobs");
        console.log("hos", hospital);

        if (!hospital) {
            return res.status(404).json({ error: "Hospital not found" });
        }

        // Get the posted jobs for the hospital
        const jobs = hospital.postedJobs;

        res.json({ jobs });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//=================================================================================================================================

module.exports = {
    getAllHospital,
    getEachHospital,
    editHospital,
    deleteHospital,
    addHospital,
    hospitalLogin,
    getPostedJobs,
    RegisterHospital 
};
const express = require("express");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
router.get("/signin", (req,res)=>{
    return res.render("signin");
});

router.get("/signup", (req,res)=>{
    return res.render("signup");
});
router.post("/signup", async(req,res)=>{
    try{
        const { name,email,password}=req.body;
      
        //check for exisiting user
        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"})
        }

   // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

     // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });
    res.status(201).json({
      message: "User created successfully",
      user,
    });
   
    }
    catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/signin", async(req,res)=>{
    console.log("SIGNIN ROUTE HIT");
    console.log("Request Body:", req.body);
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid Login Credentials"})
        }
        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"})
        }
        const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
     res.status(500).json({ message: "Server error" });
    }
})

router.get("/projects", authMiddleware, async (req, res) => {
  const projects = await Project.find({ owner: req.user.id });
  res.json(projects);
});


module.exports = router;
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Project = require("../models/Project"); // make sure model exists
const Task = require("../models/Task");
const { createTask,updateTask, deleteTask,getProjectTasks } = require("../controllers/taskController");
// Create project
router.post("/", protect, async (req, res) => {
  try {

    console.log("REQ BODY:", req.body);
    console.log("REQ USER:", req.user);
    //Get data sent from frontend
    const { name, description, members = []} = req.body;
     const uniqueMembers = [...new Set([req.user.id, ...members])];
    const newProject = new Project({
      name,
      description,
      owner: req.user.id,
      members:  uniqueMembers

    });
//Save to MongoDB
    await newProject.save();
const populatedProject = await Project.findById(newProject._id)
      .populate("members", "name email")
      .populate("owner", "name email");

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { members: req.user.id }
      ]
    }).populate("members", "name email");

    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({
          projectId: project._id
        });

        return {
          ...project._doc,
          taskCount,
          memberCount: project.members ? project.members.length : 0
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
// Get single project
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
     
         owner: req.user.id ,
       
      
    })
      .populate("members", "name email")
      .populate("owner", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});
// CREATE TASK INSIDE PROJECT
router.post("/:projectId/tasks",protect, createTask);


// GET ALL TASKS OF PROJECT
router.get("/:projectId/tasks", protect, getProjectTasks);

router.post("/:projectId/add-member", protect, async (req, res) => {
  try {

    const { userId } = req.body;

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only owner can add members
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    const updatedProject = await Project.findById(project._id)
      .populate("members", "name email")
      .populate("owner", "name email");

    res.json(updatedProject);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
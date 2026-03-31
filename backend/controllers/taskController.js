

const Task = require("../models/Task");
const Project = require("../models/Project");


// CREATE TASK
const createTask = async (req, res) => {
  try {
console.log("REQ BODY:", req.body);
    const { title, description, assignedTo, priority,dueDate} = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
if (
  assignedTo &&
  !project.members.some(member => member.toString() === assignedTo) &&
  project.owner.toString() !== assignedTo
) {
  return res.status(400).json({
    message: "User is not a member of this project"
  });
}
    // Only project owner can create tasks
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
let taskPriority;
//if priority exists:
    //convert to lowercase
    //trim spaces
    //if not in allowed values:
        //return error
if (priority) {
      const normalized = priority.toLowerCase().trim();
      const allowed = ["low", "medium", "high"];

      if (!allowed.includes(normalized)) {
        return res.status(400).json({
          message: "Invalid priority. Allowed: low, medium, high"
        });
      }

      taskPriority = normalized;
    } else {
      taskPriority = "medium";
    }
let taskDueDate = null;

if (dueDate) {
  const parsedDate = new Date(dueDate);

  if (isNaN(parsedDate)) {
    return res.status(400).json({
      message: "Invalid due date"
    });
  }

  taskDueDate = parsedDate;
}
    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId: projectId,
       createdBy: req.user.id,
       priority: taskPriority,
       dueDate:taskDueDate
    });

    // const populatedTask = await Task.findById(createdTask._id)
    //   .populate("assignedTo", "name email");

    res.status(201).json(task);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {

    const task = await Task.findById(req.params.taskId);
const project = await Project.findById(task.projectId);

if (!project) {
  return res.status(404).json({ message: "Project not found" });
}

// Authorization check
const isOwner = project.owner.toString() === req.user.id;
const isCreator = task.createdBy.toString() === req.user.id;
const isAssigned =
  task.assignedTo && task.assignedTo.toString() === req.user.id;

if (!isOwner && !isCreator && !isAssigned) {
  return res.status(403).json({
    message: "Not authorized to update this task"
  });
}
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    if (task.status === "done") {
task.completed = true;
} else {
task.completed = false;
}
if (req.body.dueDate) {
  const parsedDate = new Date(req.body.dueDate);

  if (isNaN(parsedDate)) {
    return res.status(400).json({
      message: "Invalid due date"
    });
  }

  task.dueDate = parsedDate;
}
if (req.body.priority) {
      const normalized = req.body.priority.toLowerCase().trim();
      const allowed = ["low", "medium", "high"];

      if (!allowed.includes(normalized)) {
        return res.status(400).json({
          message: "Invalid priority. Allowed: low, medium, high"
        });
      }

      task.priority = normalized;
    }

    await task.save();

    res.json(task);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TASKS OF A PROJECT
const getProjectTasks = async (req, res) => {
   console.log("GET TASKS CONTROLLER HIT");
  try {

    const tasks = await Task.find({
      projectId: req.params.projectId
    }).populate("assignedTo", "name email")
.populate("createdBy", "name");
       console.log("POPULATED:", tasks[0]);
 
console.log(JSON.stringify(tasks, null, 2));
    res.json(tasks);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
const project = await Project.findById(task.projectId);

if (!project) {
  return res.status(404).json({ message: "Project not found" });
}

// Authorization check
const isOwner = project.owner.toString() === req.user.id;
const isCreator = task.createdBy.toString() === req.user.id;

if (!isOwner && !isCreator) {
  return res.status(403).json({
    message: "Not authorized to delete this task"
  });
}
    await task.deleteOne();

    res.json({ message: "Task deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// COMPLETE TASK
const completeTask = async (req, res) => {
  try {

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = true;

    await task.save();

    res.json(task);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  completeTask
};
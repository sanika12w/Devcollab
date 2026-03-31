const mongoose=require("mongoose");

const taskSchema=new mongoose.Schema({
   title:{
    type:String,
    required:true
   } ,
   description:{
     type:String,
   },
  //  project: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Project",
  //   required: true
  // }

   completed:{
    type:Boolean,
    default:false
   },
   status: {
  type: String,
  enum: ["todo", "in-progress", "done"],
  default: "todo"
},

   assignedTo:{
    type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // Make sure your User model name is exactly "User"
    //   required: false
   },
   createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",  // Make sure your Project model name is "Project"
      required: true
    },
    priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  dueDate: {
    type: Date
  }},
    {
    timestamps: true   // automatically adds createdAt and updatedAt
  }
);

module.exports=mongoose.model("Task",taskSchema);
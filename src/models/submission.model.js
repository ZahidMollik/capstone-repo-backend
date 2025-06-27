import { Schema, model } from "mongoose";

const submittedFileSchema = Schema({
  projectName:{
    type:String,
    required:true
  },
  filename: {
    type: String,
    required: true,
  },
  downloadurl: {
    type: String,
    required: true, 
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  intake: {
    type: String,
    required: true,
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required:true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

const SubmittedFile = model("SubmittedFile", submittedFileSchema);
  
export default SubmittedFile;
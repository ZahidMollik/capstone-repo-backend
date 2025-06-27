import { Schema, model } from "mongoose";

const submittedFileSchema = Schema({
  filename: {
    type: String,
    required: true,
  },
  downloadurl: {
    type: String,
    required: true, 
  },
  teamName: {
    type: String,
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
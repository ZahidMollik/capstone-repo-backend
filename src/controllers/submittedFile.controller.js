import { StatusCodes } from 'http-status-codes';
import SubmittedFile from '../models/submission.model.js';
import Teacher from '../models/teacher.model.js';

export const createFile = async (req, res) => {
  try {
    const { projectName,filename, downloadurl, teamName, intake,teacherId} = req.body;

    if ( !projectName ||!filename || !downloadurl || !teamName || !intake || !teacherId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: 'projectName,filename, downloadurl, teamName,intake and teacherId are required.',
      });
    }

    const newFile = await SubmittedFile.create({
      projectName,
      filename,
      downloadurl,
      teamName,
      intake,
      teacherId,
      
    });

    res.status(StatusCodes.CREATED).json({
      status: true,
      message: 'File submitted successfully.',
      data: newFile,
    });
  } catch (error) {
    console.error('Error submitting file:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Something went wrong while submitting the file.',
      error: error.message,
    });
  }
};

export const getFilesByTeacher = async (req, res) => {
  try {
    const teacher=await Teacher.findOne({userId:req.user.id});
    const files = await SubmittedFile.find({teacherId:teacher._id});
    res.status(StatusCodes.OK).json({
      status: true,
      data: files,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Could not fetch submitted files by teacher',
      error: error.message,
    });
  }
};
export const getAllFiles = async (req, res) => {
  try {
    const files = await SubmittedFile.find()
    res.status(StatusCodes.OK).json({
      status: true,
      data: files,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Could not fetch submitted files.',
      error: error.message,
    });
  }
};

export const approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await SubmittedFile.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        isPublic: true
      },
      { new: true }
    );

    if (!updated) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: 'Submission not found.',
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: 'Submission approved and made public.',
      data: updated,
    });
  } catch (error) {
    console.error('Error approving submission:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Something went wrong while approving.',
      error: error.message,
    });
  }
};

export const declineSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const updated = await SubmittedFile.findByIdAndUpdate(
      id,
      {
        status:'declined',
        message: message || 'Submission declined.',
      },
      { new: true }
    );

    if (!updated) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: 'Submission not found.',
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: 'Submission feedback saved.',
      data: updated,
    });
  } catch (error) {
    console.error('Error declining submission:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Something went wrong while declining.',
      error: error.message,
    });
  }
};


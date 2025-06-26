import Teacher from "../models/teacher.model.js";
import Team from "../models/team.model.js";
import { StatusCodes } from "http-status-codes";

const createTeam = async (req, res) => {
  try {
    const { teamName, members } = req.body;

    if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: 'Team name is required and must be a non-empty string.',
      });
    }

    if (!Array.isArray(members)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: 'Members must be an array.',
      });
    }

    if (members.length > 5) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: 'A team must have exactly 5 members.',
      });
    }

    const emails = members.map((m) => m.educationalMail);
    const emailSet = new Set(emails);
    if (emailSet.size !== emails.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: 'Each member must have a unique educationalMail within the team.',
      });
    }

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const requiredFields = ['username', 'intake', 'section', 'department', 'educationalMail', 'phone'];
      const missingFields = requiredFields.filter((field) => !member[field] || typeof member[field] !== 'string' || member[field].trim() === '');

      if (missingFields.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: `Member ${i + 1} is missing or has invalid fields: ${missingFields.join(', ')}`,
        });
      }
      const email = member.educationalMail.toLowerCase().trim();
      const dept = member.department.toLowerCase().trim();

      const subdomainMatch = email.match(/^.+@([a-z]+)\.bubt\.edu\.bd$/);
      if (subdomainMatch && subdomainMatch[1] !== dept) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: `Member ${i + 1}: department "${dept}" does not match educationalMail domain "${subdomainMatch[1]}"`,
        });
      }
    }

    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: 'A team with this name already exists.',
      });
    }

    const conflictingMembers = await Team.find({
      'members.educationalMail': { $in: emails },
    });

    if (conflictingMembers.length > 0) {
      const usedEmails = [];
      conflictingMembers.forEach((team) => {
        team.members.forEach((member) => {
          if (emails.includes(member.educationalMail)) {
            usedEmails.push(member.educationalMail);
          }
        });
      });

      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `The following member(s) are already part of another team: ${[...new Set(usedEmails)].join(', ')}`,
      });
    }

    const team = await Team.create({ teamName, members });

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: 'Team created successfully.',
      data: team,
    });
  } catch (error) {
    console.log(error);
    
    if(error.name==="ValidationError"){
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: messages,
      });  
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Something went wrong while creating the team.',
      error: error.message,
    });
  }
};

 const getTeams = async (req, res) => {
  try {
    const Teams = await Team.find();
    res.status(StatusCodes.OK).json({ status: true, data: Teams });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
  }
};

const getAllTeamByTeacher = async (req, res) => {
  
  const teacher= await Teacher.findOne({educationalMail:req.user.email});
  try {
    const team = await Team.find({assignedTeacher:teacher.fullName});
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Team retrieved successfully",
      data: team,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Something went wrong while fetching team by teacher",
      error: error.message,
    });
  }
};


const getTeamById = async (req, res) => {
  try {
    const Team = await Team.findById(req.params.id);
    if (!Team) {
      return res.status(StatusCodes.NOT_FOUND).json({ status: false, message: "Team not found" });
    }
    res.status(StatusCodes.OK).json({ status: true, data: Team });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
  }
};

 const getTeamsByEducationalMail = async (req, res) => {
  try {
    const { educationalmail } = req.params;
    console.log(educationalmail);
    

    const Teams = await Team.find({
      members: {
        $elemMatch: { educationalMail: educationalmail }
      }
    });

    if (Teams.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No Teams found for this email",
      });
    }

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Teams retrieved successfully",
      data: Teams,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

 const updateTeamName = async (req, res) => {
  try {
    const { teamName } = req.body;
    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, { teamName }, { new: true, runValidators: true });
    if (!updatedTeam) {
      return res.status(StatusCodes.NOT_FOUND).json({ status: false, message: "Team not found" });
    }
    res.status(StatusCodes.OK).json({ status: true, message: "Team updated successfully", data: updatedTeam });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
  }
};

// const updateTeamMember = async (req, res) => {
//   try {
//     const { teamName, educationalMail } = req.params;
//     const updatedData = req.body;
//     if (!teamName || !educationalMail || !updatedData) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: 'Missing teamName, educationalMail, or updatedData.',
//       });
//     }

//     if (updatedData.educationalMail && updatedData.educationalMail !== educationalMail) {
//       const exists = await Team.findOne({
//         'members.educationalMail': updatedData.educationalMail,
//       });

//       if (exists) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//           status: false,
//           message: `Educational mail "${updatedData.educationalMail}" already exists.`,
//         });
//       }
//     }
//     const updateFields = {};
//     for (const key in updatedData) {
//       updateFields[`members.$.${key}`] = updatedData[key];
//     }

//     const result = await Team.updateOne(
//       { teamName, 'members.educationalMail': educationalMail },
//       { $set: updateFields }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         status: false,
//         message: 'Member or Team not found.',
//       });
//     }

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: 'Member updated successfully.',
//     });
//   } catch (error) {
//     console.error('Error updating member:', error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: 'Something went wrong.',
//       error: error.message,
//     });
//   }
// };

const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, members } = req.body;

    // Check if team exists
    const existingTeam = await Team.findById(id);
    if (!existingTeam) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: 'Team not found.',
      });
    }

    // Validate team name if provided
    if (teamName) {
      if (typeof teamName !== 'string' || teamName.trim() === '') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: 'Team name must be a non-empty string.',
        });
      }

      if (teamName !== existingTeam.teamName) {
        const nameConflict = await Team.findOne({ teamName });
        if (nameConflict) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: 'A team with this name already exists.',
          });
        }
      }
    }

    // If members are provided, validate them
    let updatedMembers = existingTeam.members; // Start with current members

    if (Array.isArray(members)) {
      // if (members.length !== 5) {
      //   return res.status(StatusCodes.BAD_REQUEST).json({
      //     status: false,
      //     message: 'A team must have exactly 5 members.',
      //   });
      // }

      const emails = members.map((m) => m.educationalMail).filter(Boolean);
      const emailSet = new Set(emails);
      if (emailSet.size !== emails.length) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: 'Each member must have a unique educationalMail within the team.',
        });
      }

      for (let i = 0; i < members.length; i++) {
        const memberUpdate = members[i];
        const existingMember = existingTeam.members[i] || {}; // Fallback to empty

        // Merge with existing member data
        const mergedMember = { ...existingMember.toObject(), ...memberUpdate };

        // Minimal required field validation only if fields are present
        const requiredFields = ['username', 'intake', 'section', 'department', 'educationalMail', 'phone'];
        for (const field of requiredFields) {
          if (field in memberUpdate && (typeof memberUpdate[field] !== 'string' || memberUpdate[field].trim() === '')) {
            return res.status(StatusCodes.BAD_REQUEST).json({
              status: false,
              message: `Member ${i + 1}: field "${field}" must be a non-empty string if provided.`,
            });
          }
        }

        // Validate educationalMail and department match
        if (mergedMember.educationalMail && mergedMember.department) {
          const email = mergedMember.educationalMail.toLowerCase().trim();
          const dept = mergedMember.department.toLowerCase().trim();
          const subdomainMatch = email.match(/^.+@([a-z]+)\.bubt\.edu\.bd$/);

          if (subdomainMatch && subdomainMatch[1] !== dept) {
            return res.status(StatusCodes.BAD_REQUEST).json({
              status: false,
              message: `Member ${i + 1}: department "${dept}" does not match educationalMail domain "${subdomainMatch[1]}"`,
            });
          }
        }

        updatedMembers[i] = mergedMember;
      }

      // Check if any member is already in another team
      const updatedEmails = updatedMembers.map((m) => m.educationalMail);
      const conflicts = await Team.find({
        _id: { $ne: id },
        'members.educationalMail': { $in: updatedEmails },
      });

      if (conflicts.length > 0) {
        const usedEmails = [];
        conflicts.forEach((team) => {
          team.members.forEach((member) => {
            if (updatedEmails.includes(member.educationalMail)) {
              usedEmails.push(member.educationalMail);
            }
          });
        });

        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: `The following member(s) are already part of another team: ${[...new Set(usedEmails)].join(', ')}`,
        });
      }
    }

    // Final update
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      {
        ...(teamName && { teamName }),
        ...(members && { members: updatedMembers }),
      },
      { new: true, runValidators: true }
    );

    return res.status(StatusCodes.OK).json({
      status: true,
      message: 'Team updated successfully.',
      data: updatedTeam,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: messages,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Something went wrong while updating the team.',
      error: error.message,
    });
  }
};
const deleteTeam = async (req, res) => {
  try {
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);
    if (!deletedTeam) {
      return res.status(StatusCodes.NOT_FOUND).json({ status: false, message: "Team not found" });
    }
    res.status(StatusCodes.OK).json({ status: true, message: "Team deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { teamId, teacherName, teacherId } = req.body;
    const team=await Team.findById(teamId);
    if(team.assignedTeacher===teacherName){
      return res.status(StatusCodes.BAD_REQUEST).json({ status: false, message: "This teacher has already been assigned to this team." });
    }
    const updatedTeam = await Team.findByIdAndUpdate(teamId, { assignedTeacher: teacherName, teacherId }, { new: true, runValidators: true });
    if (!updatedTeam) {
      return res.status(StatusCodes.NOT_FOUND).json({ status: false, message: "Team not found" });
    }
    res.status(StatusCodes.OK).json({ status: true, message: "Team updated successfully", data: updatedTeam });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
  }
}



export const studentController={
    createTeam,
    getTeams,
    getAllTeamByTeacher,
    getTeamById,
    getTeamsByEducationalMail,
    updateTeamName,
    updateTeamMember,
    deleteTeam,
    updateTeam
}
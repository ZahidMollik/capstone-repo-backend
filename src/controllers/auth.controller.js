import User from "../models/user.model.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {sendEmail} from "../utils/emailService.js";
import { blacklist } from "../utils/blacklistStore.js";
import { generateOTP,storeOTP,verifyOTP } from "../utils/otpService.js";
async function requestRegisterOTP(req, res) {
  const { email } = req.body; 
  try {
    const otpCode =generateOTP();
    storeOTP(email,otpCode);
    const subject="Your OTP Code";
    const message=`Your OTP is: ${otpCode}. It is valid for 10 minutes.`;
    await sendEmail(email,subject,message);
    return res.status(StatusCodes.OK)
            .json({
              status:true,
              message:"send otp successfully for register"
            })
    
  } catch (error) {
    console.log(error);
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({
      status:false,
      message:"something went wrong"
    })
  }
}
const registerUser=async(req,res)=>{
  try {
    const {username,email,OtpCode,password,role}=req.body;
    const user= await User.findOne({email:email});
    if(user){
        res.status(StatusCodes.BAD_REQUEST)
        .json({
          status:false,
          message:"This email already exists",
          data:""
        })
        return;
    }
   const check=await verifyOTP(email,OtpCode);
   if(!check){
     return res.status(StatusCodes.BAD_REQUEST)
               .json({
                status:false,
                message:"invalid or expired OTP",
                data:""
              })
   }
   const hashpassword=await bcrypt.hash(password,10);
   const newUser= await User.create({username,email,password:hashpassword,role});
    
    res.status(StatusCodes.CREATED)
      .json({
        status:true,
        message:"Successfully register",
        data:newUser
     })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          status:false,
          message:"something went wrong"
        })
  }
}

const loginUser=async(req,res)=>{
  try {
    const {email,password,rememberMe}=req.body;
    
    const userByemail= await User.findOne({email:email});
    if(!userByemail){
      res.status(StatusCodes.UNAUTHORIZED)
        .json({
          status:false,
          message:"invalid credentials",
          
        })
        return;
    }
    const isMatchPassword=await bcrypt.compare(password,userByemail.password);
    if(!isMatchPassword){
      res.status(StatusCodes.UNAUTHORIZED)
        .json({
          status:false,
          message:"invalid credentials",
          
        })
      return;
    }
    const payload={
      id:userByemail._id,
      email:userByemail.email,
      role:userByemail.role
    }
    const expiresIn = rememberMe ? "7d" : "4h";
    const token=jwt.sign(payload,process.env.SECRET_KEY,{expiresIn});
    
    res.status(StatusCodes.CREATED)
      .json({
        status:true,
        message:"Successfully login",
        accesstoken:token
     })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          status:false,
          message:"something went wrong"
        })
        console.log(error);
        
  }
}

const forgotPassword = async (req, res) => {
  try {
    const {email}=req.body;
    const user= await User.findOne({email:email});
    if(!user){
        res.status(StatusCodes.NOT_FOUND)
        .json({
          status:false,
          message:"user not found",
          data:""
        })
        return;
    }
      const otpCode = generateOTP();
      await storeOTP(email,otpCode);
      const subject="Your OTP Code";
      const message=`Your OTP is: ${otpCode}. It is valid for 10 minutes.`;
      await sendEmail(email,subject,message);
    res.status(StatusCodes.OK).json({ status:true,message: "OTP sent to your email." });

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status:false,message: "Server error", error });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    
    const user = await User.findOne({ email });
    
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ status:false,message: "User not found" });
    const check= await verifyOTP(email,otp);
    if(!check){
      return res.status(StatusCodes.BAD_REQUEST)
                .json({
                 status:false,
                 message:"invalid or expired OTP",
                 data:""
               })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatePass = await User.findOneAndUpdate({ email }, { password: hashedPassword });
    res.status(StatusCodes.OK).json({  status:true,message: "Password successfully updated." });

  } catch (error) {
    console.log(error);
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({  status:false,message: "Server error", error });
  }
};

const logout =async(req,res)=>{
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (token) {
        blacklist.add(token);
    }

    res.json({ status:true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          status:false,
          message:"something went wrong"
        })
        console.log(error);
        
  }
}

export const authController={
  requestRegisterOTP,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logout
}
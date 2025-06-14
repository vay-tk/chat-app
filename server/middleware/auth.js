// middleware to protect routes

import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;
        // console.log("Token received:", token ? "Present" : "Missing");
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded userId:", decoded.userId);
        
        const user = await User.findById(decoded.userId).select("-password");
        if(!user) return res.json({ success: false, message: "User not found" });
        
        req.user = user;
        next();
    } catch (error) {
        // console.log("Auth middleware error:", error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}
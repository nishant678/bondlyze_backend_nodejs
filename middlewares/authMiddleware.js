const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../model/User");

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if(req?.headers?.authorization?.startsWith("Bearer")){
        token = req.headers.authorization.split(' ')[1];
        try{
            if(token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findOne({ id: decoded?.id });
                
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: "User not found. Token invalid."
                    });
                }
                
                // Remove password from user object
                const { password, ...userWithoutPassword } = user;
                req.user = userWithoutPassword;
                next();
            }
        }catch(error){
            return res.status(401).json({
                success: false,
                message: "Not Authorized. Token expired or invalid. Please login again."
            });
        }
    }else{
        return res.status(401).json({
            success: false,
            message: "There is no token attached to header"
        });
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findByEmail(email);
    if(!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "You are not an admin"
        });
    }
    next();
});

module.exports = { authMiddleware, isAdmin };
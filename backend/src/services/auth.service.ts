import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ApiError } from "../shared/responses/ApiError.js";

const generateToken = (id: string) => {
    return jwt.sign({id}, process.env.JWT_SECRET as string, {
        expiresIn: "30d"
    })
}

// if user is admin
const getAdminStatus = (email: string | null | undefined): boolean => {
    if(!email) return false;

    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()) : [];

    return adminEmails.includes(email.toLowerCase());
}

interface User {
    name: string;
    email: string;
    password: string;
}

const register = async (user: User) => {
    if (!user.name || !user.email || !user.password) {
        throw new ApiError(401, "All fields are required")
    }

    const userExist = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
    });
    if (userExist) {
        throw new ApiError(401, "User already exists with this email!")
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    const newUser = await prisma.user.create({ 
        data: {
            name: user.name, 
            email: user.email.toLowerCase(), 
            password: hashedPassword
        }
    });


    const token = generateToken(newUser.id)

    const userData: any = {...newUser}
    delete userData.password;
    userData.isAdmin = getAdminStatus(newUser.email)

    return {userData, token}
};

const login = async (email: string, password: string) => {
    if(!email || !password){
        throw new ApiError(401, "All fields are required")
    }

    const user = await prisma.user.findUnique({
        where: {
            email: email.toLowerCase()
        }
    })

    if(!user) throw new ApiError(404, "User not found");

    const isPassCorrect = bcrypt.compare(password, user.password)

    if(!isPassCorrect) throw new ApiError(403, "Password is incorrect");

    const token = generateToken(user.id)

    const userData: any = {...user}
    delete userData.password;
    
    return {userData, token}
}

export const authService = {
    register,
    login
}
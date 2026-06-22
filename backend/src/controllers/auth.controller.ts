import { Request, Response } from "express"
import { authService } from "../services/auth.service.js";


const register = async (req: Request, res: Response) => {
    const {name, email, password} = req.body;

    const {userData, token} = await authService.register({name, email, password})

    res.status(201).json({user: userData, token})
}

const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const {userData, token} = await authService.login(email, password)

    res.status(200).json({user: userData, token})
}


export const authController = {
    register,
    login
}
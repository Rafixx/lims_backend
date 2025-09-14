"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const { token, user } = await authService.login({ username, password });
        return res.status(200).json({
            token,
            user,
        });
    }
    catch (error) {
        console.error('[Login Error]', error);
        const err = error;
        return res.status(err.statusCode || 401).json({
            success: false,
            message: err.message || 'Credenciales inválidas',
        });
    }
};
exports.loginUser = loginUser;

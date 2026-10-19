import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models/user.model";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { AppError } from "../utils/app-error";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export const generateToken = (userId: string, role: UserRole): string => {
  const token = jwt.sign({ sub: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });

  return token;
};

export const register = async ({ name, email, password }: RegisterDTO) => {

  const newUser = await User.create({
    name,
    email,
    password,
    role: UserRole.USER, //Por defecto todos son usuarios
    active: true,
  });

  const token = generateToken(newUser._id.toString(), newUser.role);

  return {
    user: newUser,
    token: token,
  };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new AppError(401, "Credenciales inválidas");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, "Credenciales inválidas");
  }

  if (!user.active) {
    throw new AppError(403, "Usuario inactivo");
  }

  const token = generateToken(user._id.toString(), user.role);

  return {
    user: user,
    token: token,
  };
};

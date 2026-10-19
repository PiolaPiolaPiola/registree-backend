import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';
import { env } from '../config/env'
import { normalizeText } from '../utils/text'

/**Únicos roles permitidos para login y permisos */
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

/**Estructura de la colección de usuarios */
export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  active: boolean;
  creationAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      set: normalizeText,
      maxlength: [254, "El email puede tener máximo 254 caracteres"],
      match: [EMAIL_REGEX, "Por favor ingrese un correo válido",],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      //Se valida antes del hash. También se hace en el front
      minlength: [8, "La contraseña debe tener mínimo 8 caracteres"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: [true, "El rol es obligatorio"],
    },
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      set: normalizeText,
      maxLength: [100, "El campo puede tener máximo 100 caracteres"],
      match: [NAME_REGEX, "El campo solo admite letras y acentos"],
    },
    active: {
      type: Boolean,
      required: [true, "El estado es obligatorio"],
      default: true,
    },
  },
  {
    timestamps: { createdAt: "creationAt", updatedAt: "updatedAt" },
    versionKey: false,
  },
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const { password, ...rest } = ret; //Para no exponer la contraseña en la respuesta
    return rest;
  },
});

/** Se hashea la contraseña antes de guardar, solo si es nueva o fue modificada */
userSchema.pre('save', async function(){
    if (!this.isModified('password'))
        return;
    this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
});

export const User = model<IUser>("User", userSchema);

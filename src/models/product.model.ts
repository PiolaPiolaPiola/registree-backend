import { Schema, model, Types } from "mongoose";
import Decimal from "decimal.js";

/**Estructura de la colección de productos */
export interface IProduct {
  title: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  stock: number;
  active: boolean;
  creationAt?: Date;
  createdBy?: Types.ObjectId;
  updatedAt?: Date;
  updatedBy?: Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [150, "El título puede tener máximo 150 caracteres"],
      minlength: [3, "El título debe tener mínimo 3 caracteres"],
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      maxlength: [1000, "La descripción puede tener máximo 1000 caracteres"],
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0.01, "El precio debe ser mayor a 0"],
      set: (val: number) => new Decimal(val).toDecimalPlaces(2).toNumber(),
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      maxlength: [50, "La categoría puede tener máximo 50 caracteres"],
      trim: true,
    },
    images: {
      type: [
        {
          type: String,
          trim: true,
          match: [/^https?:\/\/\S+$/, "Las imágenes deben ser URLs válidas"],
        },
      ],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser un número negativo"],
      validate: {
        validator: Number.isInteger,
        message: "El stock no puede ser número decimal",
      },
    },
    active: {
      type: Boolean,
      default: true,
      required: [true, "El estado activo es obligatorio"],
    },
    createdBy: {
      type: Schema.Types.ObjectId, //Para auditorías
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId, //Para auditorías
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: "creationAt", updatedAt: "updatedAt" },
    versionKey: false,
  },
);

productSchema.index({ creationAt: -1 }); //Para ordenar y filtrar por fecha

export const Product = model<IProduct>("Product", productSchema);

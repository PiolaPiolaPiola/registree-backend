import { Schema, model, Types } from "mongoose";
import Decimal from "decimal.js";
import { normalizeText } from '../utils/text'

const IMAGES_REGEX = /^https?:\/\/\S+$/;
const CATEGORY_REGEX = /^[\p{L} ]+$/u;
const TITLE_REGEX = /^[\p{L}\p{N} .,()\/&%'+-]+$/u; //Los regex hacen las veces de sanitización
const MAX_IMAGES = 4;

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
      set: normalizeText,
      maxlength: [150, "El título puede tener máximo 150 caracteres"],
      minlength: [3, "El título debe tener mínimo 3 caracteres"],
      match: [TITLE_REGEX, "El título solo admite letras, números, espacios y los signos . , ( ) / & % ' + -"]
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      set: normalizeText,
      maxlength: [1000, "La descripción puede tener máximo 1000 caracteres"],
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      cast: 'El precio debe ser un número',
      min: [0.01, "El precio debe ser mayor a 0"],
      max: [1_000_000, 'El precio es demasiado alto'],
      set: (val: unknown) => (typeof val === 'number' ? new Decimal(val).toDecimalPlaces(2).toNumber() : val),
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      set: normalizeText,
      maxlength: [50, "La categoría puede tener máximo 50 caracteres"],
      match: [CATEGORY_REGEX, 'La categoría solo admite letras y espacios'],
    },
    images: {
      type: [
        {
          type: String,
          set: normalizeText,
          match: [IMAGES_REGEX, "Las imágenes deben ser URLs válidas"],
        },
      ],
      validate: {
        validator: (images: string[]) => images.length <= MAX_IMAGES,
        message: `Se permiten máximo ${MAX_IMAGES} imágenes`,
      },
      default: [],
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      cast: 'El stock debe ser un número',
      min: [0, "El stock no puede ser un número negativo"],
      max: [1_000_000, 'El stock es demasiado alto'],
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

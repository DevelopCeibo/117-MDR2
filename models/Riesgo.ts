import mongoose, { Model, Schema, Types } from 'mongoose'
import { RiesgoType } from '../interfaces'

export interface IRiesgo extends RiesgoType {
  _id: Types.ObjectId
  id: string
}

// 1. Definición del Schema

const riesgoSchema: Schema = new Schema({
  Contacto: {
    type: String,
  },
  Detalle_de_Cobertura: {
    type: String,
  },
  Detalle_de_Riesgo: {
    type: String,
  },
  Estado: {
    type: String,
  },
  Fecha_de_creacion: {
    type: Date,
    require: true,
  },
  Fecha_de_ultima_actualizacion: {
    type: String,
  },
  ID: {
    type: String,
  },
  Id_Tipo_Riesgo: {
    type: String,
  },
  Numero_Poliza: {
    type: String,
  },
  Patente: {
    type: String,
  },
  Poliza: {
    type: String,
  },
  Tomador_Riesgo: {
    type: String,
  },
})

// 2. Definición de índices
riesgoSchema.index({ ID: 1 })

// 2. Definición del Modelo

const Riesgo: Model<IRiesgo> =
  mongoose.models.Riesgo || mongoose.model('Riesgo', riesgoSchema)

export default Riesgo

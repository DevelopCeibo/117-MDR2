import mongoose, { Model, Schema, Types } from 'mongoose'
import { OrganizacionType } from '../interfaces'

export interface IOrganizacion extends OrganizacionType {
  _id: Types.ObjectId
  id: string
}

// 1. Definición del Schema

const orgazacionSchema: Schema = new Schema({
  Estado: {
    type: String,
    require: true,
  },
  Fecha_de_creacion: {
    type: Date,
    require: true,
  },
  Fecha_de_ultima_actualizacion: {
    type: String,
  },
  ID_de_organizacion: {
    type: String,
  },
  Jerarquia_de_organizacion_Nivel_1: {
    type: String,
  },
  Nombre_de_organizacion: {
    type: String,
  },
  Vendedor: {
    type: String,
  },
})

// 2. Definición de índices
orgazacionSchema.index({ ID_de_organizacion: 1 })
orgazacionSchema.index({ Nombre_de_organizacion: 1 })

// 2. Definición del Modelo

const Organizacion: Model<IOrganizacion> =
  mongoose.models.Organizacion ||
  mongoose.model('Organizacion', orgazacionSchema)

export default Organizacion

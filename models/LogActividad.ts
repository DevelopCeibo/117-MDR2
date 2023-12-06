import mongoose, { Model, Schema, Types } from 'mongoose'
import { LogActividadType } from '../interfaces'

export interface ILogActividad extends LogActividadType {
  _id: Types.ObjectId
  id: string
}

// 1. Definición del Schema

const logActividadSchema = new Schema({
  ID_de_contacto: {
    type: String,
  },
  ID_de_incidente: {
    type: String,
  },
  Fecha: {
    type: String,
  },
  Sector: {
    type: String,
  },
  Asesor: {
    type: String,
    require: true,
  },
  Accion_realizada: {
    type: String,
    require: true,
  },
  Descripcion: {
    type: String,
  },
  ID_de_tipo_de_transaccion: {
    type: String,
  },
  Inicial: {
    type: String,
  },
  Direccion_IP_del_cliente: {
    type: String,
  },
})
// 2. Definición de índices
logActividadSchema.index({ ID_de_incidente: 1 })

// 3. Definición del Modelo

const LogActividad: Model<ILogActividad> =
  mongoose.models.LogActividad ||
  mongoose.model('LogActividad', logActividadSchema)

export default LogActividad

import mongoose, { Model, Schema, Types } from 'mongoose'
import { TareaType } from '../interfaces'

export interface ITarea extends TareaType {
  _id: Types.ObjectId
  id: string
}

// 1. Definición del Schema

const tareaSchema = new Schema({
  Asignado: {
    type: String,
  },
  Fecha_de_creacion: {
    type: Date,
    require: true,
  },
  Fecha_de_inicio: {
    type: String,
  },
  Fecha_de_ultima_actualizacion: {
    type: String,
  },
  Fecha_de_vencimiento: {
    type: String,
  },
  Herencia: {
    type: String,
  },
  ID_de_contacto: {
    type: String,
  },
  ID_de_incidente: {
    type: String,
  },
  Motivo: {
    type: String,
  },
  Nombre: {
    type: String,
  },
  Notas: {
    type: String,
  },
  Plantilla_de_tarea: {
    type: String,
  },
})
// 2. Definición de índices
tareaSchema.index({ ID_de_incidente: 1 })
tareaSchema.index({ ID_de_contacto: 1 })

// 3. Definición del Modelo

const Tarea: Model<ITarea> =
  mongoose.models.Tarea || mongoose.model('Tarea', tareaSchema)

export default Tarea

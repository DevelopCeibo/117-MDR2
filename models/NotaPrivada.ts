import mongoose, { Model, Schema, Types } from 'mongoose'
import { NotaPrivadaType } from '../interfaces'

export interface INotaPrivada extends NotaPrivadaType {
  _id: Types.ObjectId
  id: string
}

// 1. Definición del Schema

const notaPrivadaSchema = new Schema({
  Nro_de_referencia: {
    type: String,
    require: true,
  },
  ID_de_incidente: {
    type: String,
    require: true,
  },
  ID_de_hilo_del_incidente: {
    type: String,
    require: true,
  },
  Fecha_de_creacion: {
    type: Date,
    require: true,
  },
  Fecha_de_cierre: {
    type: String,
  },
  Modo_de_Contacto: {
    type: String,
  },
  Jerarquia_de_categoria: {
    type: String,
  },
  ID_de_categoria: {
    type: String,
  },
  Estado: {
    type: String,
  },
  Texto: {
    type: String,
  },
})

// 2. Definición de índices
notaPrivadaSchema.index({ Nro_de_referencia: 1 })
notaPrivadaSchema.index({ ID_de_incidente: 1 })

// 2. Definición del Modelo

const NotaPrivada: Model<INotaPrivada> =
  mongoose.models.NotaPrivada ||
  mongoose.model('NotaPrivada', notaPrivadaSchema)

export default NotaPrivada

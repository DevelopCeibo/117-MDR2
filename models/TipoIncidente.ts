import mongoose, { Model, Schema, Types } from 'mongoose'
import { TipoIncidenteType } from '../interfaces'

export interface ITipoIncidente extends TipoIncidenteType {
  _id: Types.ObjectId
  id: string
}

// 1. Definición del Schema

const tipoIncidenteSchema = new Schema({
  Descripcion: {
    type: String,
  },
  Display_Order: {
    type: String,
  },
  ID: {
    type: String,
  },
})
// 2. Definición de índices

// 3. Definición del Modelo

const TipoIncidente: Model<ITipoIncidente> =
  mongoose.models.TipoIncidente ||
  mongoose.model('TipoIncidente', tipoIncidenteSchema)

export default TipoIncidente

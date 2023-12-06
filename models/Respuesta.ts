import mongoose, { Model, Schema, Types } from 'mongoose'
import { RespuestaType } from '../interfaces'

export interface IRespuesta extends RespuestaType {
  _id: Types.ObjectId
  id: string
}

// 1. Definición del Schema

const respuestaSchema: Schema = new Schema({
  Nro_Incidente: {
    type: String,
    require: true,
  },
  Clave_ajena: {
    type: String,
  },
  Cuenta: {
    type: String,
  },
  Fecha_de_creacion: {
    type: Date,
    require: true,
  },
  ID_de_contacto: {
    type: String,
  },
  ID_de_cuenta_de_canal: {
    type: String,
  },
  ID_de_hilo_del_incidente: {
    type: String,
  },
  Secuencia: {
    type: String,
  },
  Texto: {
    type: String,
  },
  Tipo_de_entrada_de_hilo: {
    type: String,
  },
  Peso: {
    type: String,
  },
})

// 2. Definición de índices
respuestaSchema.index({ Nro_Incidente: 1 })
respuestaSchema.index({ ID_de_contacto: 1 })

// 3. Definición del Modelo

const Respuesta: Model<IRespuesta> =
  mongoose.models.Respuesta || mongoose.model('Respuesta', respuestaSchema)

export default Respuesta

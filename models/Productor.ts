import mongoose, { Model, Schema, Types } from 'mongoose'
import { ProductorType } from '../interfaces'

export interface IProductor extends ProductorType {
  _id: Types.ObjectId
  id: string
}

// 1. Definición del Schema

const productorSchema: Schema = new Schema({
  Cliensec: {
    type: String,
  },
  Codigo_Completo: {
    type: String,
  },
  Dni_Cuit: {
    type: String,
  },
  Ejecutivo_Cuenta: {
    type: String,
  },
  Gerente: {
    type: String,
  },
  Grupo_Organizador: {
    type: String,
  },
  ID: {
    type: String,
  },
  Nombre: {
    type: String,
  },
  Segmentacion: {
    type: String,
  },
  Unidad_De_Negocio: {
    type: String,
  },
})

//2. Definición de índices
productorSchema.index({ ID: 1 })

// 3. Definición del Modelo

const Productor: Model<IProductor> =
  mongoose.models.Productor || mongoose.model('Productor', productorSchema)

export default Productor

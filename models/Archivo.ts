import mongoose, { Model, Schema, Types } from 'mongoose'
import { ArchivoType } from '../interfaces'

export interface IArchivo extends ArchivoType {
  _id: Types.ObjectId
  id: string
}

// 1. Definición del Schema

const archivoSchema = new Schema({
  Nro_de_referencia: {
    type: String,
    required: true,
  },
  Asociacion_de_tabla: {
    type: String,
  },
  Clave_ajena: {
    type: String,
  },
  Desactivado: {
    type: String,
  },
  Descripcion: {
    type: String,
  },
  Fecha_de_creacion: {
    type: Date,
    required: true,
  },
  Fecha_de_ultima_actualizacion: {
    type: String,
  },
  ID_de_archivo_anexo: {
    type: String,
  },
  Indice_de_palabras_clave: {
    type: String,
  },
  Nombre: {
    type: String,
  },
  Nombre_de_archivo_de_usuario: {
    type: String,
  },
  Nombre_de_archivo_local: {
    type: String,
  },
  Privado: {
    type: String,
  },
  Secuencia: {
    type: String,
  },
  Tamanio: {
    type: String,
  },
  Tipo: {
    type: String,
  },
  Tipo_de_contenido: {
    type: String,
  },
})

// 2. Definición de Indices
archivoSchema.index({ ID_de_archivo_anexo: 1 })
archivoSchema.index({ Nombre_de_archivo_de_usuario: 1 })
archivoSchema.index({ Clave_ajena: 1 })

// 3. Definición del Modelo

const Archivo: Model<IArchivo> =
  mongoose.models.Archivo || mongoose.model('Archivo', archivoSchema)

export default Archivo

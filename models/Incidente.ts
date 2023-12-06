import mongoose, { Model, Schema, Types } from 'mongoose'
import { IncidenteType } from '../interfaces'

export interface IIncidente extends IncidenteType {
  _id: Types.ObjectId
  id: string
  Contactos: Types.ObjectId[]
  Notas_Privadas: Types.ObjectId[]
  Tareas: Types.ObjectId[]
  Log_Actividad: Types.ObjectId[]
  Archivos: Types.ObjectId[]
}

// 1. Definición del Schema

const incidenteSchema = new Schema({
  Nro_de_referencia: {
    type: String,
    required: true,
  },
  Actualizado_por: {
    type: String,
  },
  Asunto: {
    type: String,
  },
  Buzon_de_correo: {
    type: String,
  },
  Cola: {
    type: String,
  },
  Creado_por_cuenta: {
    type: String,
  },
  Modo_de_Contacto: {
    type: String,
  },
  Usuario_Intra: {
    type: String,
  },
  Tipo_de_Incidente: {
    type: String,
  },
  Tipo_de_estado: {
    type: String,
  },
  Tipo_Cobro: {
    type: String,
  },
  Siniestro: {
    type: String,
  },
  Poliza: {
    type: String,
  },
  Nro_Cuenta: {
    type: String,
  },
  ID_de_producto: {
    type: String,
  },
  ID_de_incidente: {
    type: String,
  },
  ID_de_disposicion: {
    type: String,
  },
  ID_de_contacto: {
    type: String,
  },
  ID_de_categoria: {
    type: String,
  },
  Grupo: {
    type: String,
  },
  Fecha_Efecto: {
    type: String,
  },
  Fecha_de_ultima_respuesta: {
    type: String,
  },
  Fecha_de_ultima_actualizacion: {
    type: String,
  },
  Fecha_de_creacion: {
    type: Date,
    required: true,
  },
  Fecha_de_cierre: {
    type: String,
  },
  Estado: {
    type: String,
  },
  Cuenta_asignada: {
    type: String,
  },
  ID_de_organizacion: {
    type: String,
  },
  Contacto: {
    type: [Types.ObjectId],
    ref: 'Contacto',
  },
  Notas_Privadas: {
    type: [Types.ObjectId],
    ref: 'NotaPrivada',
  },
  Tareas: {
    type: [Types.ObjectId],
    ref: 'Tarea',
  },
  Log_Actividad: {
    type: [Types.ObjectId],
    ref: 'LogActividad',
  },
  Archivos: {
    type: [Types.ObjectId],
    ref: 'Archivo',
  },
})

// 2. Definición de indices
incidenteSchema.index({ ID_de_incidente: 1 })
incidenteSchema.index({ Tipo_de_Incidente: 1 })
incidenteSchema.index({ Fecha_de_creacion: 1 })

// 3. Definición del Modelo

const Incidente: Model<IIncidente> =
  mongoose.models.Incidente || mongoose.model('Incidente', incidenteSchema)

export default Incidente

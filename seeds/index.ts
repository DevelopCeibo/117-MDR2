import { readdirSync, readFileSync, Dirent } from 'fs'
import { join, basename } from 'path'
import { parse } from 'csv-parse/sync'
import { db } from '../db'
import {
  IIncidente,
  IContacto,
  Contacto,
  Incidente,
  NotaPrivada,
  Tarea,
  LogActividad,
  Archivo,
  Respuesta,
} from '../models'

async function seeds() {
  const inicio = new Date()
  console.log('Hora de inicio', inicio)

  const files = await getAllFiles('./assets').filter(
    (file) =>
      basename(file).startsWith('MIGRA_') && basename(file).endsWith('.csv')
  )

  const insertPromise: Promise<any>[] = []

  console.log('files', files)

  for (let i = 0; i < files.length; i++) {
    const [, model, ...rest] =
      basename(files[i]).match(/MIGRA_(.*)_v\d{2,4}.csv/) || []
    const modelName = model[0].toLowerCase() + model.slice(1)
    console.log('Accediendo al model: ', modelName)
    const environment = process.env.NODE_ENV
    const extension = environment === 'production' ? '.js' : '.ts'
    const myModel = require(`../models/${modelName}${extension}`).default

    console.log('Se accedió al modelo: ', myModel)

    const fileToRead = files[i]
    console.log('Leyendo el archivo: ', fileToRead)

    let fileContent = readFileSync(fileToRead, 'utf-8')

    if (fileContent.charCodeAt(0) === 0xfeff) {
      fileContent = fileContent.substring(1)
    }

    const fin = 'Recuento de registros'
    const indexFin = fileContent.lastIndexOf(fin)
    if (indexFin !== -1) {
      fileContent = fileContent.substring(0, indexFin)
    }

    const cvsContent = parse(fileContent, {
      delimiter: ['|'],
      columns: true,
      skip_records_with_empty_values: true,
      cast: (value, context) => {
        try {
          if (context.column.toString().includes('Fecha')) {
            value = sinComillasSimples(value)
          }
          if (context.column === 'Fecha de creación') {
            return new Date(value)
          }

          return value
        } catch (error: any) {
          console.log(`Error al convertir la fecha: ${error.message}`)
        }
      },
    })

    insertPromise.push(
      await myModel
        .insertMany(cvsContent)
        .then(() => {
          console.log(
            `Los datos del archivo ${fileToRead} fueron almacenados en la base de datos exitosamente`
          )
        })
        .catch((error: Error) => console.log(error.message))
    )
  }
  Promise.all(insertPromise)
    .then(async () => {
      console.log(
        'Todos los datos fueron almacenados en la base de datos exitosamente'
      )
      // Ahora podemos cerrar la conexión a la base de datos
      const fin = new Date()
      console.log('Hora de inicio', fin)
    })
    .catch((error: any) => {
      console.log('Un error a sucedido', error.message)
    })
}

const sinComillasSimples = (text: string): string => {
  return text[0] === "'" && text[text.length - 1] === "'"
    ? text.slice(1, -1)
    : text
}

function getAllFiles(dirPath: string): string[] {
  return readdirSync(dirPath, { withFileTypes: true }).reduce(
    (filePaths: string[], dirent: Dirent): string[] => {
      const entryPath = join(dirPath, dirent.name)
      if (dirent.isFile()) {
        return [...filePaths, entryPath]
      } else if (dirent.isDirectory()) {
        return [...filePaths, ...getAllFiles(entryPath)]
      }
      return filePaths
    },
    []
  )
}

async function relacionesContacto() {
  console.log('Iniciando relaciones de contacto')

  const cantidadDeContatos = await Contacto.countDocuments()

  for (let i = 0; i < cantidadDeContatos; i++) {
    let haCombiado = 0
    const contacto: IContacto[] = await Contacto.find().skip(i).limit(1)
    let elContacto = contacto[0]

    const incidentesDelContacto: IIncidente[] = await Incidente.find({
      ID_de_contacto: elContacto.ID_de_contacto,
    })

    if (incidentesDelContacto.length) {
      for (const j in incidentesDelContacto) {
        const idIncidente = incidentesDelContacto[j]._id
        if (!elContacto.Incidentes.includes(idIncidente)) {
          console.log(
            `Se inserta el Incidente ${idIncidente} en el contacto ${elContacto.ID_de_contacto}`
          )
          elContacto.Incidentes.push(idIncidente)
          haCombiado = 1
        }
      }
      if (haCombiado) {
        await Contacto.findOneAndUpdate({ _id: elContacto._id }, elContacto)
      }
    }
  }
}

async function relacionesIncidente() {
  console.log('Iniciando relaciones de Incidente')

  const cantidadDeIncidentes = await Incidente.countDocuments()

  for (let i = 0; i < cantidadDeIncidentes; i++) {
    let haCambiado = 0
    const incidente: IIncidente[] = await Incidente.find().skip(i).limit(1)
    const elIncidente = incidente[0]

    const contactoDelIncidente = await Contacto.findOne({
      ID_de_contacto: elIncidente.ID_de_contacto,
    })
    //console.log('contactoDelIncidente', contactoDelIncidente)
    if (
      contactoDelIncidente &&
      elIncidente.Contacto &&
      contactoDelIncidente._id !== elIncidente.Contacto._id
    ) {
      elIncidente.Contacto = contactoDelIncidente._id
      haCambiado = 1
    }

    const notasPrivadasDelIncidente = await NotaPrivada.find({
      ID_de_incidente: elIncidente.ID_de_incidente,
    })
    if (notasPrivadasDelIncidente.length) {
      for (const j in notasPrivadasDelIncidente) {
        if (
          !elIncidente.Notas_Privadas.includes(notasPrivadasDelIncidente[j]._id)
        ) {
          elIncidente.Notas_Privadas.push(notasPrivadasDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }

    const tareasDelIncidente = await Tarea.find({
      ID_de_incidente: elIncidente.ID_de_incidente,
    })
    if (tareasDelIncidente.length) {
      for (const j in tareasDelIncidente) {
        if (!elIncidente.Tareas.includes(tareasDelIncidente[j]._id)) {
          elIncidente.Tareas.push(tareasDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }

    const logActividadDelIncidente = await LogActividad.find({
      ID_de_incidente: elIncidente.ID_de_incidente,
    })
    if (logActividadDelIncidente.length) {
      for (const j in logActividadDelIncidente) {
        if (
          !elIncidente.Log_Actividad.includes(logActividadDelIncidente[j]._id)
        ) {
          elIncidente.Log_Actividad.push(logActividadDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }

    const archivosDelIncidente = await Archivo.find({
      Clave_ajena: elIncidente.ID_de_incidente,
    })
    if (archivosDelIncidente.length) {
      for (const j in archivosDelIncidente) {
        if (!elIncidente.Archivos.includes(archivosDelIncidente[j]._id)) {
          elIncidente.Archivos.push(archivosDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }

    const respuestasDelIncidente = await Respuesta.find({
      Nro_Incidente: elIncidente.Nro_de_referencia,
    })
    if (respuestasDelIncidente.length) {
      for (const j in respuestasDelIncidente) {
        if (!elIncidente.Respuestas.includes(respuestasDelIncidente[j]._id)) {
          elIncidente.Respuestas.push(respuestasDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }
    if (haCambiado) {
      await Incidente.findOneAndUpdate({ _id: elIncidente._id }, elIncidente)
      console.log('Se actualizó Incidente: ', elIncidente.ID_de_incidente)
    }
  }
}

async function main() {
  await db.connectDB()
  await seeds()
  await relacionesContacto()
  await relacionesIncidente()
  await db.disconectDB()
}

main()

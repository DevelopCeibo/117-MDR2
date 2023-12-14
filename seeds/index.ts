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
  Poliza,
  IPoliza,
  IRiesgo,
  Riesgo,
  Productor,
  IProductor,
} from '../models'

async function seeds() {
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
    .then(() => {
      console.log(
        'Todos los datos fueron almacenados en la base de datos exitosamente'
      )
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
  let contador = 0
  let cantidadDeContactos = await Contacto.countDocuments()

  const cursor = Contacto.find().cursor({
    batchSize: 100,
    noCursorTimeout: true,
  })

  for await (const contacto of cursor) {
    let haCombiado = 0

    const cursorIncidentes = Incidente.find({
      ID_de_contacto: contacto.ID_de_contacto,
    }).cursor({
      batchSize: 100,
      noCursorTimeout: true,
    })

    for await (const incidente of cursorIncidentes) {
      const idIncidente = incidente._id
      if (!contacto.Incidentes.includes(idIncidente)) {
        contacto.Incidentes.push(idIncidente)
        haCombiado = 1
      }
    }

    if (haCombiado) {
      await contacto.save()
    }

    await cursorIncidentes.close()

    contador++
    if (contador % 1000 === 0) {
      console.log(
        `Procesado ${contador} contactos de ${cantidadDeContactos} contactos`
      )
    }
  }
  await cursor.close()
}

async function relacionesIncidente() {
  console.log('Iniciando relaciones de Incidente')
  let contador = 0
  let cantidadDeIncidentes = await Incidente.countDocuments()

  const cursor = Incidente.find().cursor({
    batchSize: 100,
    noCursorTimeout: true,
  })

  for await (const incidente of cursor) {
    let haCambiado = 0

    const contactoDelIncidente = await Contacto.findOne({
      ID_de_contacto: incidente.ID_de_contacto,
    }).lean()
    if (
      contactoDelIncidente &&
      contactoDelIncidente._id !== incidente?.Contacto?._id
    ) {
      incidente.Contacto = contactoDelIncidente._id
      haCambiado = 1
    }

    const polizaDelIncidente = await Poliza.findOne({
      ID: incidente.Poliza,
    }).lean()
    if (
      polizaDelIncidente &&
      polizaDelIncidente._id !== incidente?.Poliza_Incidente
    ) {
      incidente.Poliza_Incidente = polizaDelIncidente._id
      haCambiado = 1
    }

    const notasPrivadasDelIncidente = await NotaPrivada.find({
      ID_de_incidente: incidente.ID_de_incidente,
    }).lean()

    if (notasPrivadasDelIncidente.length) {
      for (const j in notasPrivadasDelIncidente) {
        if (
          !incidente.Notas_Privadas.includes(notasPrivadasDelIncidente[j]._id)
        ) {
          incidente.Notas_Privadas.push(notasPrivadasDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }

    const tareasDelIncidente = await Tarea.find({
      ID_de_incidente: incidente.ID_de_incidente,
    }).lean()
    if (tareasDelIncidente.length) {
      for (const j in tareasDelIncidente) {
        if (!incidente.Tareas.includes(tareasDelIncidente[j]._id)) {
          incidente.Tareas.push(tareasDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }

    const logActividadDelIncidente = await LogActividad.find({
      ID_de_incidente: incidente.ID_de_incidente,
    }).lean()
    if (logActividadDelIncidente.length) {
      for (const j in logActividadDelIncidente) {
        if (
          !incidente.Log_Actividad.includes(logActividadDelIncidente[j]._id)
        ) {
          incidente.Log_Actividad.push(logActividadDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }

    const archivosDelIncidente = await Archivo.find({
      Clave_ajena: incidente.ID_de_incidente,
    }).lean()
    if (archivosDelIncidente.length) {
      for (const j in archivosDelIncidente) {
        if (!incidente.Archivos.includes(archivosDelIncidente[j]._id)) {
          incidente.Archivos.push(archivosDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }

    const respuestasDelIncidente = await Respuesta.find({
      Nro_Incidente: incidente.Nro_de_referencia,
    }).lean()
    if (respuestasDelIncidente.length) {
      for (const j in respuestasDelIncidente) {
        if (!incidente.Respuestas.includes(respuestasDelIncidente[j]._id)) {
          incidente.Respuestas.push(respuestasDelIncidente[j]._id)
          haCambiado = 1
        }
      }
    }

    if (haCambiado) {
      await incidente.save()
    }

    contador++
    if (contador % 1000 === 0) {
      console.log(
        `Procesado ${contador} incidentes de ${cantidadDeIncidentes} incidentes`
      )
    }
  }

  await cursor.close()
}

async function relacionesPoliza() {
  console.log('Iniciando relaciones de Polizas')
  let contador = 0
  const cantidadDePolizas = await Poliza.countDocuments()

  const cursor = Poliza.find().cursor({
    batchSize: 100,
    noCursorTimeout: true,
  })

  for await (const poliza of cursor) {
    let haCombiado = 0

    const riesgoDeLaPoliza: IRiesgo | null = await Riesgo.findOne({
      Poliza: poliza.ID,
    }).lean()

    if (riesgoDeLaPoliza && riesgoDeLaPoliza._id !== poliza.Riesgo) {
      poliza.Riesgo = riesgoDeLaPoliza._id
      haCombiado = 1
    }

    const productorDeLaPoliza: IProductor | null = await Productor.findOne({
      Nombre: poliza.Productor,
    }).lean()

    if (
      productorDeLaPoliza &&
      poliza.Poliza_Productor &&
      productorDeLaPoliza._id !== poliza.Poliza_Productor._id
    ) {
      poliza.Poliza_Productor = productorDeLaPoliza._id
      haCombiado = 1
    }

    if (haCombiado) {
      await poliza.save()
    }

    contador++
    if (contador % 1000 === 0) {
      console.log(
        `Procesado ${contador} polizas de ${cantidadDePolizas} polizas`
      )
    }
  }
  await cursor.close()
}

async function main() {
  const inicio = new Date()
  console.log('Hora de inicio', inicio)

  await db.connectDB()
  await seeds()
  await relacionesContacto()
  await relacionesIncidente()
  await relacionesPoliza()
  await db.disconectDB()

  const fin = new Date()
  console.log('Hora de fin', fin)
}

main()

import { readdirSync, readFileSync, Dirent } from 'fs'
import { join, basename } from 'path'
import { parse } from 'csv-parse/sync'
import { db } from '../db'
import { IIncidente, IContacto, Contacto, Incidente } from '../models'

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
    let contacto: IContacto[] = await Contacto.find().skip(i).limit(1)

    const incidentes: IIncidente[] = await Incidente.find({
      ID_de_contacto: contacto[0].ID_de_contacto,
    })

    if (incidentes.length) {
      for (const j in incidentes) {
        const idIncidente = incidentes[j]._id
        if (!contacto[0].Incidentes.includes(idIncidente)) {
          console.log(
            `Se inserta el Incidente ${idIncidente} en el contacto ${contacto[0].ID_de_contacto}`
          )
          contacto[0].Incidentes.push(idIncidente)
        }
      }
      await Contacto.findOneAndUpdate({ _id: contacto[0]._id }, contacto[0])
    }
  }
}

async function relacionesIncidente() {
  console.log('Iniciando relaciones de Incidente')

  const cantidadDeIncidentes = await Incidente.countDocuments()

  for (let i = 0; i < cantidadDeIncidentes; i++) {
    let incidente: IIncidente[] = await Incidente.find().skip(i).limit(1)
  }
}

async function main() {
  await db.connectDB()
  await seeds()
  await relacionesContacto()
  await db.disconectDB()
}

main()

import type { NextApiRequest, NextApiResponse } from 'next'
import { Incidente, IIncidente } from '../../../../models'
import { db } from '../../../../db'

type Data = IIncidente | string

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query
  console.log('id', id)
  await db.connectDB()
  if (req.method === 'GET') {
    console.log(req.method)
    const contacto = await Incidente.findOne({
      ID_de_incidente: id,
    })
      .populate('Contacto')
      .populate('Notas_Privadas')
      .populate('Respuestas')
      .populate('Tareas')
      .populate('Log_Actividad')
      .populate('Archivos')
      .exec()
    db.disconectDB()
    if (contacto) res.status(200).send(contacto)
    else res.status(404).send(`El incidente con ID ${id} no fue encontrado`)
  }
}

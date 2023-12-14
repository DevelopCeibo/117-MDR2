import type { NextApiRequest, NextApiResponse } from 'next'
import { Incidente, IIncidente } from '../../../models'
import { db } from '../../../db'

type Data = IIncidente[] | string

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await db.connectDB()
  if (req.method === 'GET') {
    console.log(req.method)
    const contacto = await Incidente.find({})
      .limit(2)
      .populate('Contacto')
      .populate('Notas_Privadas')
      .populate('Respuestas')
      .populate('Tareas')
      .populate('Log_Actividad')
      .populate('Archivos')
      .populate('Poliza_Incidente')
      .exec()
    db.disconectDB()
    if (contacto) res.status(200).send(contacto)
    else res.status(404).send(`No fue encontrado ningún incidente`)
  }
}

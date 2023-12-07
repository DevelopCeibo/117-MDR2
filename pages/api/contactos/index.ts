import type { NextApiRequest, NextApiResponse } from 'next'
import { Contacto, IContacto } from '../../../models'
import { db } from '../../../db'

type Data = IContacto[]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await db.connectDB()
  if (req.method === 'GET') {
    console.log(req.method)
    const contactos = await Contacto.find({
      _id: '6571c6a5e82c18974558c023',
    }).populate('Incidentes')
    db.disconectDB()
    res.status(200).send(contactos)
  }
}

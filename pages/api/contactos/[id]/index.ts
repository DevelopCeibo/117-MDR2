import type { NextApiRequest, NextApiResponse } from 'next'
import { Contacto, IContacto } from '../../../../models'
import { db } from '../../../../db'

type Data = IContacto | string

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query
  console.log('id', id)
  await db.connectDB()
  if (req.method === 'GET') {
    console.log(req.method)
    const contacto = await Contacto.findOne({
      ID_de_contacto: id,
    }).populate('Incidentes')
    db.disconectDB()
    if (contacto) res.status(200).send(contacto)
    else res.status(404).send(`El usuario con ID ${id} no fue encontrado`)
  }
}

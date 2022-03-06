import {NextApiRequest, NextApiResponse} from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  const users = [
    { id: 1, name: 'iago'},
    { id: 2, name: 'bla'},
    { id: 3, name: 'blue'},
  ]

  return res.json(users)
}
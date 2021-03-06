import { query as q } from 'faunadb';
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type user = {
  ref: {
    id: string;
  }
  data:{
    stripe_costumer_id: string
  }
}

export default async(req: NextApiRequest, res: NextApiResponse) => {
  if(req.method == "POST"){
    const session = await getSession({req});

    const user = await fauna.query<user>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    let costumerId = user.data.stripe_costumer_id
    
    if(!costumerId){
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email
      })
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_costumer_id: stripeCustomer.id,
            }
          }
        )
      )
      costumerId = stripeCustomer.id
    }
    
   
    const sctripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: costumerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {price: 'price_1KZFIBIFhPeQQXNhzVPjq8nn', quantity: 1}
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })
    return res.status(200).json({sessionId: sctripeCheckoutSession.id})
  } else {
    res.setHeader('allow', 'POST')
    res.status(405).send('Method not allowed')
  }
}
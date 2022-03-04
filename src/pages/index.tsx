import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { SubscribeButton } from '../components/SubscribeButton'
import { stripe } from '../services/stripe'
import styles from './home.module.scss'

interface Homeprops {
  product: {
    priceId: string,
    amount: number
  }
}

export default function Home({ product }: Homeprops) {
  return (
    <>
      <Head>
        <title> Home | IgNews</title>
      </Head>

      <main className= {styles.contentContainer}>
        <section className = {styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about <br /> the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span> for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>
        <img src="/images/avatar.svg" alt="Girl Coding" />
      </main>
    </>
  )
}

//server side rendering:
// todo código dessa função será executado primeiro no servidor node que está rodando o next e não no browser
export const getServerSideProps: GetServerSideProps = async () => {
  const price = await stripe.prices.retrieve('price_1KZFIBIFhPeQQXNhzVPjq8nn')

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US',{
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount/100)
  }

  return {
    props:{
      product,
    }
  }
}
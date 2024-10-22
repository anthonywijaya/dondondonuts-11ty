import { Header } from '@/components/Header'
import strapi from '@/lib/strapi'

async function getHomepage() {
  const homepage = await strapi.find('homepage', {
    populate: '*',
  })
  return homepage
}

export default async function Home() {
  const homepage = await getHomepage()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Header />
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">{homepage.data.attributes.title}</h1>
        <p>{homepage.data.attributes.description}</p>
      </div>
    </main>
  )
}
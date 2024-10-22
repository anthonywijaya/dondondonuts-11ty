import Link from 'next/link'
import { ModeToggle } from './ModeToggle'

export function Header() {
  return (
    <header className="bg-background w-full px-6 py-5 z-50 fixed top-0 shadow-md transition-all transform ease-in-out duration-500">
      <div className="max-w-5xl mx-auto flex items-center flex-wrap justify-between">
        <div className="sm:mr-8">
          <Link href="/" className="flex items-center">
            <span className="text-xl text-primary font-semibold self-center">Don Don Donuts</span>
          </Link>
        </div>
        <ModeToggle />
      </div>
    </header>
  )
}
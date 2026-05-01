import { Link, NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import VideosPage from '@/pages/Videos'
import VideoNew from '@/pages/VideoNew'
import VideoDetail from '@/pages/VideoDetail'
import { cn } from '@/lib/utils'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )
      }
    >
      {label}
    </NavLink>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="font-semibold">YouTube Trending Hub</Link>
          <nav className="flex items-center gap-1">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/videos" label="Videos" />
            <NavItem to="/videos/new" label="New" />
          </nav>
        </div>
      </header>
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/videos/new" element={<VideoNew />} />
          <Route path="/videos/:id" element={<VideoDetail />} />
        </Routes>
      </main>
    </div>
  )
}

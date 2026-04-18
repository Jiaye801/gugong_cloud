import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppShell } from './components/AppShell'
import { ToastViewport } from './components/ToastViewport'
import { AdminPage } from './pages/AdminPage'
import { AuthPage } from './pages/AuthPage'
import { CreativePlazaPage } from './pages/CreativePlazaPage'
import { HomePage } from './pages/HomePage'
import { PoiDetailPage } from './pages/PoiDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { QuestsPage } from './pages/QuestsPage'
import { RoutesPage } from './pages/RoutesPage'
import { StoryHubPage } from './pages/StoryHubPage'
import { TopicDetailPage } from './pages/TopicDetailPage'
import { TopicsPage } from './pages/TopicsPage'

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/poi/:slug', element: <PoiDetailPage /> },
      { path: '/routes', element: <RoutesPage /> },
      { path: '/quests', element: <QuestsPage /> },
      { path: '/creative-plaza', element: <CreativePlazaPage /> },
      { path: '/story-hub', element: <StoryHubPage /> },
      { path: '/topics', element: <TopicsPage /> },
      { path: '/topics/:slug', element: <TopicDetailPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/admin', element: <AdminPage /> },
    ],
  },
], {
  basename: import.meta.env.BASE_URL,
})

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastViewport />
    </>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AdminLayout } from '@/components/layout/admin-layout'
import Dashboard from '@/pages/Dashboard'
import Products from '@/pages/Products'
import Shipments from '@/pages/Shipments'
import Users from '@/pages/Users'
import Settings from '@/pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

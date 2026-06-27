import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import FieldOrders from './pages/FieldOrders'
import AddRecord from './pages/AddRecord'
import EditRecord from './pages/EditRecord'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="field-orders" element={<FieldOrders />} />
          <Route path="field-orders/add" element={<AddRecord />} />
          <Route path="field-orders/edit/:id" element={<EditRecord />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

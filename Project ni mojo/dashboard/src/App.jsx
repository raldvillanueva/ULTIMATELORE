import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import FieldOrders from './pages/FieldOrders'
import PendingRecords from './pages/PendingRecords'
import AddRecord from './pages/AddRecord'
import EditRecord from './pages/EditRecord'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          <Route path="field-orders" element={<FieldOrders />} />
          <Route path="field-orders/add" element={<AddRecord />} />
          <Route path="field-orders/edit/:id" element={<EditRecord />} />
          <Route path="pending-records" element={<PendingRecords />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import FieldOrders from './pages/FieldOrders'
import NewWorkOrders from './pages/NewWorkOrders'
import PendingRecords from './pages/PendingRecords'
import ArchivedWorkOrders from './pages/ArchivedWorkOrders'
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
          <Route path="new-work-orders" element={<NewWorkOrders />} />
          <Route path="field-orders/add" element={<AddRecord />} />
          <Route path="field-orders/edit/:id" element={<EditRecord />} />
          <Route path="pending-records" element={<PendingRecords />} />
          <Route path="archived-work-orders" element={<ArchivedWorkOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import FieldOrders from './pages/FieldOrders'
import AddRecord from './pages/AddRecord'
import EditRecord from './pages/EditRecord'
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<Login />} 
        />
        <Route path="/" element={<Layout />}>
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="field-orders" element={<FieldOrders />} />
          <Route path="field-orders/add" element={<AddRecord />} />
          <Route path="field-orders/edit/:id" element={<EditRecord />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

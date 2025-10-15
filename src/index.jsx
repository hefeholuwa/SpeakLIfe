import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import AdminApp from "./AdminApp"
import "./index.css"   // plain css file for styling

// Check if admin mode is requested
const urlParams = new URLSearchParams(window.location.search)
const isAdmin = urlParams.get('admin') === 'true'

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </React.StrictMode>
)

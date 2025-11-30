import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

const root = ReactDOM.createRoot(document.getElementById("root"))

// Unregister any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered');
    }
  });
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

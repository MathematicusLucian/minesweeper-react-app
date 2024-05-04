import React from 'react'
import ReactDOM from 'react-dom/client'
import Game from './Game.tsx'
import './index.css'
// import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('app')).render(
  // <Provider>
  <Game />
  // </Provider>
)
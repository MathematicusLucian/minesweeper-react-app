import React from 'react'
import ReactDOM from 'react-dom/client'
import Minesweeper from './Minesweeper.tsx'
import './index.css'
// import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('app')).render(
  // <Provider>
  <Minesweeper />
  // </Provider>
)
import { useState } from 'react'
import carlbadautoLogo from '/logo-carl.png'
import './App.css'
import TireBarChart from '../components/newTires'

function App() {

  return (
    <>
      <div>
        <a target="_blank">
          <img src={carlbadautoLogo} className="logo" alt="carlbadauto logo" />
        </a>
        <h1 style={{marginTop: 0, fontFamily: "Times New Roman", color : "orange"}}>
          Inventory Management System
        </h1>
      </div>


      <div className='tire-chart-container'>
          <TireBarChart/>
      </div>

      <div className='oil-filter-chart-container'>
          {/* <TireBarChart/> */}
      </div>

      <div className='oil-chart-container'>
          {/* <TireBarChart/> */}
      </div>

      <div className='lightbult-chart-container'>
          {/* <TireBarChart/> */}
      </div>

      <div className='headlight-chart-container'>
          {/* <TireBarChart/> */}
      </div>

      <div className='brakelines-chart-container'>
          {/* <TireBarChart/> */}
      </div>

    </>
  )
}

export default App

import { useState } from 'react'
import carlbadautoLogo from '/logo-carl.png'
import './App.css'
import TireBarChart from '../inventory/components/tirePage'
// import OilFilterBarChart from '../components/oilPage'
// import OilBarChart from '../components/oilPage'
// import LightbulbBarChart from '../components/lightbulbPage'
// import HeadlightBarChart from '../components/headlightPage'
// import BrakeLinesBarChart from '../components/brakelinePage'
// import RimBarChart from '../components/rimPage'

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
          {/* <oilFilterBarChart/> */}
      </div>

      <div className='oil-chart-container'>
          {/* <OilBarChart/> */}
      </div>

      <div className='lightbulb-chart-container'>
          {/* <LightbulbBarChart/> */}
      </div>

      <div className='headlight-chart-container'>
          {/* <headlightBarChart/> */}
      </div>

      <div className='brakeline-chart-container'>
          {/* <brakelineBarChart/> */}
      </div>

      <div className='rim-chart-container'>
          {/* <rimBarChart/> */}
      </div>

    </>
  )
}

export default App

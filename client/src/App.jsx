import { useState } from 'react'
import carlbadautoLogo from '/logo-carl.png'
import './App.css'
import TireBarChart from '../inventory/components/tirePage'
import ItemChart from '../inventory/components/ItemChart'


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
          <ItemChart category="tires"/>
      </div>
      
      <div className='oil-chart-container' style={{marginTop: "10rem"}}>
        <ItemChart category="oils"/>
      </div>
     
    
    
      <div className='oil-filter-chart-container' style={{marginTop: "5rem"}}>
        <ItemChart category="oilfilters"/>
      </div>

    
      <div className='lightbulb-chart-container' style={{marginTop: "5rem"}}>
        <ItemChart category="lightbulbs"/>
      </div>
    
    
      <div className='headlight-chart-container' style={{marginTop: "5rem"}}>
        <ItemChart category="headlights"/>
      </div>
    
    
      <div className='brakeline-chart-container' style={{marginTop: "5rem"}}>
        <ItemChart category="brakelines"/>
      </div>

      {/* <div className='rim-chart-container' style={{marginTop: "5rem"}}>
          <ItemChart category="rims"/>
      </div> */}

    </>
  )
}

export default App

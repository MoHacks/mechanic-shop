import { useState } from 'react'
import carlbadautoLogo from '/logo-carl.png'
import './App.css'
import ItemChart from '../inventory/components/ItemChart'

function App() {
  const [visibleCategories, setVisibleCategories] = useState([
    "tires", "oils", "oilfilters", "lightbulbs", "headlights", "brakelines"
  ]);

  const deleteCategory = (category) => {
    setVisibleCategories(prev => prev.filter(c => c !== category));
  };

  return (
    <>
      <div>
        <a target="_blank">
          <img src={carlbadautoLogo} className="logo" alt="carlbadauto logo" />
        </a>
        <h1 style={{ marginTop: 0, fontFamily: "Times New Roman", color: "orange" }}>
          Inventory Management System
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "7rem" }}>
        {visibleCategories.map(category => (
          <ItemChart
            key={category}
            category={category}
            onDelete={() => deleteCategory(category)}
          />
        ))}
      </div>
    </>
  );
}

export default App

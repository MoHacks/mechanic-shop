import React, {useState, useEffect} from "react";
import { updateTires } from "../api/tiresApi";

// Modal Component (for updating, i.e. add/remove tires)
export default function TireEditModal({tireList, onClose, onSave}) {
    const [selectedTireName, setSelectedTireName] = useState("");
    const [usedTireQty, setUsedTireQty] = useState(0);
    const [newTireQty, setNewTireQty] = useState(0);
  
    // Whenever the selection changes, update the quantities from the tireList
    useEffect(() => {
  
      console.log("tireList triggered!: ", tireList)
      if (!selectedTireName){
        // Reset to empty if no tire selected
        setNewTireQty("");
        setUsedTireQty("");
        return;
      }
  
      const found = tireList.find(t => t.name === selectedTireName);
      if(found){
        // populate with the tire's curent values
        setNewTireQty(found.new ?? 0);
        setUsedTireQty(found.used ?? 0);
      } else{
        //fallback if not found
        setNewTireQty("");
        setUsedTireQty("");
      }
  
    }, [selectedTireName, tireList]);
  
    const handleSave = async () => {
      console.log("Selected tire to save:", selectedTireName);
  
      if (!selectedTireName) {
        alert("Please select a tire first.");
        return;
      }
  
      // NOTE: axios treats the 3rd argument as the config object -> it recognizes the 'params' argument
      // params: { ... } and converts it to its respected query string format PUT /tires/update?name=xxx&new=10&used=5
      updateTires({
        params: { 
          name: selectedTireName,
          new: newTireQty,
          used: usedTireQty
        }
      })
      .then(res => {
        console.log("Updated data: ", res.data);
        // NOTE: passes the updated tire back to the parent (TireBarChart)
        onSave({name: selectedTireName, updatedData: res.data});
      })
      .catch(err => console.error(err));
    };
  
    return (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
        <div className="modal-content" style={{
            background: "#222", padding: "20px", borderRadius: "10px", width: "150px"
        }}>
          <h3>Edit Tire</h3>
          {/* TIRE NAME DROPDOWN */}
          <label>Tire Name:</label>
          <select
            value={selectedTireName}
            onChange={(e) => {
              setSelectedTireName(e.target.value);
              console.log("Selected tire:", e.target.value); //
            }}
            style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
          > 
            <option value="">-- Select a Tire --</option> {/* Default empty option */}
            {tireList.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <label>New Quantity:</label>
          <input type="number" value={newTireQty} onChange={(e) => setNewTireQty(Number(e.target.value))} />
          <label>Used Quantity:</label>
          <input type="number" value={usedTireQty} onChange={(e) => setUsedTireQty(Number(e.target.value))} />
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
  
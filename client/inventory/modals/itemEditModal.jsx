// import { updateItem } from ItemsApi;

import React, {useState, useEffect} from "react";
import { updateItem } from "../api/itemsApi";

// Modal Component (for updating, i.e. add/remove tires)
export default function EditItemModal({itemList, category, onClose, onSave}) {
    const [selectedItemName, setSelectedItemName] = useState("");
    const [usedItemQty, setUsedItemQty] = useState(0);
    const [newItemQty, setNewItemQty] = useState(0);
    
    console.log("itemList within EditItemModal: ", itemList)

    // Whenever the selection changes, update the quantities from the itemList
    useEffect(() => {
  
      console.log("itemList triggered!: ", itemList)
      if (!selectedItemName){
        // Reset to empty if no tire selected
        setNewItemQty("");
        setUsedItemQty("");
        return;
      }
  
      const found = itemList.find(t => t.name === selectedItemName);
      if(found){
        // populate with the tire's curent values
        setNewItemQty(found.new ?? 0);
        setUsedItemQty(found.used ?? 0);
      } else{
        //fallback if not found
        setNewItemQty("");
        setUsedItemQty("");
      }
  
    }, [selectedItemName, itemList]);
  
    const handleSave = async () => {
      console.log("Selected tire to save:", selectedItemName);
  
      if (!selectedItemName) {
        alert("Please select a tire first.");
        return;
      }
      console.log("category within modal: ", category)
  
      // NOTE: axios treats the 3rd argument as the config object -> it recognizes the 'params' argument
      // params: { ... } and converts it to its respected query string format PUT /tires/update?name=xxx&new=10&used=5
      updateItem({
         
          category,
          name: selectedItemName,
          mode: "dual", // TODO: CHANGE THIS to dynamic
          new: newItemQty,
          used: usedItemQty
        
      })
      .then(res => {
        console.log("Updated data: ", res.data);
        // NOTE: passes the updated tire back to the parent (TireBarChart)
        onSave({name: selectedItemName, updatedData: res.data});
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
            value={selectedItemName}
            onChange={(e) => {
              setSelectedItemName(e.target.value);
              console.log("Selected tire:", e.target.value); //
            }}
            style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
          > 
            <option value="">-- Select an Item --</option> {/* Default empty option */}
            {itemList.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <label>New Quantity:</label>
          <input type="number" value={newItemQty} onChange={(e) => setNewItemQty(Number(e.target.value))} />
          <label>Used Quantity:</label>
          <input type="number" value={usedItemQty} onChange={(e) => setUsedItemQty(Number(e.target.value))} />
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
  

// {isDual ? (
//     <>
//       <label>New Quantity:</label>
//       <input
//         type="number"
//         value={newQty}
//         onChange={(e) => setNewQty(Number(e.target.value))}
//       />
  
//       <label>Used Quantity:</label>
//       <input
//         type="number"
//         value={usedQty}
//         onChange={(e) => setUsedQty(Number(e.target.value))}
//       />
//     </>
//   ) : (
//     <>
//       <label>Quantity:</label>
//       <input
//         type="number"
//         value={newQty}
//         onChange={(e) => setNewQty(Number(e.target.value))}
//       />
//     </>
//   )}
  
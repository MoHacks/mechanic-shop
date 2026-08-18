import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";
import axios from "axios";

import { getItems, changeItemThreshold, createItem, deleteItem, getItemThreshold } from "../api/itemsApi";

// NOTE: CHANGE THIS TO A GENERIC FILE!
import TireEditModal from "../modals/tiresEditModal";
import EditItemModal from "../modals/itemEditModal";
// import {jsPDF} from "jspdf";
// import autoTable from "jspdf-autotable";


// NOTE: The category that is being passed into ItemChart will determine what bar chart to manipulate!
export default function ItemChart({ category, colorStart = "rgb(255,0,0)", colorEnd = "rgb(0,255,0)", onDelete }) {

  // Threshold of Tires
  const [threshold, setThreshold] = useState(0);
  
  // Tire Data coming from database
  const [itemsData, setItemsData] = useState([]);

  // TODO: Likely get rid of this since the `data` variable contains the same information!
  const[editingNumTires, setEditingNumTires] = useState(false);
  
   // Delete popup status
   const [showPopup, setShowPopup] = useState(false);
   const [showConfirmPopup, setShowConfirmPopup] = useState(false);
   const [selectedItem, setSelectedItem] = useState(null);
   const [spacesInTireName, setSpaceInTireName] = useState(false)
 
   // Add popup states
   const [showAddPopup, setShowAddPopup] = useState(false);
   const [showDeleteChartConfirm, setShowDeleteChartConfirm] = useState(false);
   const [newTireName, setNewTireName] = useState("");
   const [newAmount, setNewAmount] = useState("");
   const [usedAmount, setUsedAmount] = useState("");
 
   const maxValue = Math.max(...itemsData.flatMap((d) => [d.new, d.used]));


  const fetchItems = async () => {
    const itemsData = await getItems(category);
    setItemsData(itemsData);
    console.log("itemsData within fetchItems(): ", itemsData)
  };

  const fetchThreshold = async () => {
     const thresholdData = await getItemThreshold(category);
     try {
       setThreshold(thresholdData.value);
     } catch (err) {
       console.log("Check out this error: ", err);
     }
  }

  
  useEffect(() => {

    // Fetch tires on load!
    fetchItems();

    // Fetch Threshold on load!
    fetchThreshold();

    // Setup WebSocket connection
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => console.log("✅ WebSocket connected");

    ws.onmessage = (event) => {

      const message = event.data;
      
      console.log("📩 WebSocket message:", message);

      // Refresh data when a tire is added or deleted
      if (message === "tire_created" || message === "tire_deleted" 
          || message === "tire_added" || message === "tire_removed" ||
             message === "tire_updated") {
        fetchItems();
      }

      if (message === "threshold_changed"){
        // console.log("HEY!")
        fetchThreshold();
        
      }
    };

    ws.onclose = () => console.log("❌ WebSocket disconnected");
    ws.onerror = (err) => console.error("⚠️ WebSocket error:", err);

    // Cleanup when component unmounts
    return () => ws.close();    

  }, [category]); //runs once per category! TODO: See what happens if category is removed!


  // Update backend when threshold changes
  const handleThresholdChange = (e) => {
    const value = Number(e.target.value);
    changeItemThreshold(category, value);
    setThreshold(value);
  };

  // Step 1: Opens popup for seleting tire
  const openPopup = () => {
    setShowPopup(true);
  };

  // Step 2: Opens confirmation popup
  const handleDeleteClick = () => {
    if (selectedItem) {
      setShowConfirmPopup(true);
      setShowPopup(false);
    }

  };

  // Step 3: Actually delete item after confirmation
  const confirmDelete = async () => {
    
    console.log(`selectedItem to confirmDelete: ${selectedItem}`)

    if (!selectedItem) return;

    // axios treats 'params' as special, it appends each key : value pair in the query path parameter
    deleteItem({
      params: {
        name : selectedItem,
        category: category
      }
    });
      
    setItemsData((prev) => prev.filter(item => item.name !== selectedItem));
    setShowPopup(false);
    setShowConfirmPopup(false);
    setSelectedItem(null);
  } 
      
   // Add item
   const handleCreateItem = async () => {
    
    if (!newTireName || !newAmount || !usedAmount) return;

    const res = await createItem(
      {
        category: category,
        name: newTireName.trim().toUpperCase(),
        mode: "dual", //TODO: Change this eventually to be dynamic
        new: Number(newAmount),
        used: Number(usedAmount)
      }
    )
    
    setItemsData((prev) => [...prev, res.data]);
    setShowAddPopup(false);
    setNewTireName(""); setNewAmount(""); setUsedAmount("");
      
  };

  const downloadLogs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/logs/");
      const logs = res.data;
  
      if (!logs.length) {
        alert("No logs to download.");
        return;
      }
  
      // CSV headers
      const headers = ["ID", "Action", "Created At"];
      const csvRows = [
        headers.join(","), // header row
        ...logs.map(log =>
          [
            log.id,
            `"${log.action.replace(/"/g, '""')}"`, // wrap in quotes & escape quotes
            `"${new Date(log.created_at).toLocaleString()}"`
          ].join(",")
        )
      ];

      // Create CSV string
      const csvString = csvRows.join("\n");

      // Create a blob and trigger download
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "logs.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading logs as CSV:", error);
    }
  }
  
  const handleSave = (updatedTire) => {
    // Replace the old tire data with the updated one
    setItemsData(prev =>
      prev.map(t => t.id === updatedTire.id ? updatedTire : t)
    );
    setEditingNumTires(null);  // close modal
  };
  
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
            
      {/* ---------------------START OF TABLE FOR TIRE INVENTORY */}

      {console.log("selectedItem: ", selectedItem)}
      {console.log("itemsData: ", itemsData)}
      {editingNumTires && (
        <EditItemModal
          itemList={itemsData}
          category={category}
          onClose={() => setEditingNumTires(null)}
          onSave={handleSave}
        />
      )}
      
      <div>
       {/* Download Logs Button */}
       {category === "tires" && (
        <button
          onClick={() => downloadLogs()}
            style={{
              background: "black",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              margin: "0 0 1rem 0"
            }}
          >
            Download Previous 1000 Logs
        </button>)}


        <label style={{ display: "flex", justifySelf: "center", alignSelf: "center" }}>
          Set Threshold:
          <input
            type="number"
            value={threshold}
            onChange={handleThresholdChange}
            style={{ marginLeft: "10px" }}
          />
        </label>

      </div>
      
      {/* ---------------------END OF TABLE FOR TIRE INVENTORY */}

        
      <ResponsiveContainer width="100%" height={300}>
        
        <BarChart data={itemsData} margin={{ top: 5, right: 30, left: 20, bottom: 10 }}>
        {console.log("category within BarChart rendering: ", category)}
          <defs>
            {itemsData.map((_, index) => (
              <React.Fragment key={index}>
                <linearGradient id={`grad-new-${index}-${category}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor={colorStart} />
                  <stop offset="100%" stopColor={colorEnd} />
                </linearGradient>
                <linearGradient id={`grad-used-${index}-${category}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor={colorStart} />
                  <stop offset="100%" stopColor={colorEnd} />
                </linearGradient>
              </React.Fragment>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="0" vertical={false}/>
          <XAxis 
          dataKey="name"
          label={{ value: category, position: "middle", fill: 'orange', dy: 15, dx: -33 }} 
          />
          <YAxis 
            stroke="white" 
            label={{ value: 'Amount in Stock', angle: -90, position: "middle", fill: 'orange', dx: -10 }} 
            tick={{ fill: '#e5e7eb', fontSize: 12 }}
          />
          <Tooltip />
          <Legend  wrapperStyle={{ color: '#e5e7eb'}} align="right" verticalAlign="top" />
          <Bar 
            dataKey="new"
            fill="blueviolet"
            activeBar={<Rectangle fill="blueviolet" stroke="blue" />}
            >
            {itemsData.map((entry, index) => (
              <Cell key={`new-${index}`} fill={`url(#grad-new-${index}-${category})`} />
            ))}
          </Bar>

          <Bar dataKey="used"
            fill="chartreuse"
            activeBar={<Rectangle fill="chartreuse" stroke="blue" />}
          >
            {itemsData.map((entry, index) => (
              <Cell key={`used-${index}`} fill={`url(#grad-used-${index}-${category})`} />
            ))}
          </Bar>
          {/* Add a horizontal dotted red line at y = 250 */}
          <ReferenceLine 
            y={threshold} 
            stroke="red" 
            strokeDasharray="3 3" 
            label={{
              value: `${threshold}`, 
              fill: "white"
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Main Delete Button */}
      <div style={{ display: "flex", flexDirection: "row", gap: "1rem", padding: "0.5rem", textAlign: "center", justifyContent: "center"}}>
        {/* <h4 style={{ marginBottom: "10px", alignSelf: "flex-start" }}>Delete Tire</h4> */}
        {/* Delete Item Button */}
        <button
          onClick={() => openPopup()}
          style={{
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            padding: "6px 12px",
          }}
        >
          Delete Item
        </button>

        {/* Add Item Button */}
        <button
          onClick={() => setShowAddPopup(true)}
          style={{
            background: "green",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Create Item
        </button>


        {/* Update Data Entries */}
        <button
        onClick={() => setEditingNumTires(true)}
          style={{
            background: "blue",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Update Entries
        </button>

        {/* Delete Chart */}
        <button
          onClick={() => setShowDeleteChartConfirm(true)}
          style={{
            background: "#444",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Delete Chart
        </button>
        
         


        
      </div>

      {/* ----------ADD TIRE POPUP---------- */}
      {showAddPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#333",
              padding: "20px",
              borderRadius: "8px",
              width: "320px",
            }}
          >
            <h3>Add New Item</h3>
            <input
              placeholder="Tire name"
              value={newTireName}
              onChange={(e) => {
                setNewTireName(e.target.value);
                setSpaceInTireName(e.target.value.includes(" "));
              }}
              style={{ width: "100%", margin: "5px 0", padding: "6px" }}
            />
            <input
              placeholder="New amount of Tires"
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              style={{ width: "100%", margin: "5px 0", padding: "6px" }}
            />
            <input
              placeholder="Used amount of Tires"
              type="number"
              value={usedAmount}
              onChange={(e) => setUsedAmount(e.target.value)}
              style={{ width: "100%", margin: "5px 0", padding: "6px" }}
            />
            <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={handleCreateItem}
                disabled={spacesInTireName}
                style={{ 
                  background: "green",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
              {newTireName.includes(" ") && (
                <strong style={{ color: "red" }}>Tire name cannot contain spaces!</strong>
              )}
              <button
                onClick={() => setShowAddPopup(false)}
                style={{
                  background: "#555",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------DELETE TIRE POPUP---------- */}
      {showPopup && (
        
           
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#333",
              padding: "20px",
              borderRadius: "8px",
              width: "320px",
            }}
          >

          <h4>Select an Item to Delete</h4>
          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {itemsData.map((item) => (
              <label key={item.name} style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="tire"
                  value={item.name}
                  checked={selectedItem === item.name}
                  onChange={() => setSelectedItem(item.name)}
                  style={{ marginRight: "8px" }}
                />
                {item.name}
              </label>
            ))}
            {selectedItem && (
              <h4> 
                Selected: <span style={{ color: "red"}}><strong>{selectedItem}</strong> </span>
              </h4>
            )}
          </div>

          <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                background: "gray",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleDeleteClick}
              style={{
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
              disabled={!selectedItem}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      )}
      
      {/* ----------CONFIRM DELETE CHART POPUP---------- */}
      {showDeleteChartConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              padding: "30px",
              borderRadius: "10px",
              width: "380px",
              textAlign: "center",
              border: "1px solid #555",
            }}
          >
            <h3 style={{ color: "white", marginTop: 0 }}>Delete <span style={{ color: "orange", textTransform: "capitalize" }}>{category}</span> Chart?</h3>
            <p style={{ color: "#ccc" }}>
              This will remove the <strong style={{ color: "white" }}>{category}</strong> chart from the page.
            </p>
            <p style={{ color: "red", fontWeight: "bold" }}>
              ⚠ This operation cannot be undone.
            </p>
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "12px" }}>
              <button
                onClick={() => setShowDeleteChartConfirm(false)}
                style={{
                  background: "#555",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                style={{
                  background: "#c0392b",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Yes, Delete Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------CONFIRM DELETE TIRE POPUP---------- */}
      {showConfirmPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#222",
              padding: "25px",
              borderRadius: "8px",
              width: "350px",
              textAlign: "center",
            }}
          >
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedItem}</strong>? <br />
              You can't undo this operation.
            </p>
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={confirmDelete}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                style={{
                  background: "#555",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

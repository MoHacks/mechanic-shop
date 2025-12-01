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
// import {jsPDF} from "jspdf";
// import autoTable from "jspdf-autotable";
import ThresholdControl from "./threshold"; // use this import for seperation of concerns!


// Modal Component (for updating, i.e. add/remove tires)
function EditTireModal({tireList, onClose, onSave}) {
  const [selectedTireName, setSelectedTireName] = useState("");
  const [usedTireQty, setUsedTireQty] = useState(0);
  const [newTireQty, setNewTireQty] = useState(0);
  // const [loading, setLoading] = useState(false);

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

  // const handleSave = () => {
  //   onSave({...tire, name: selectedTireName, used: usedTireQty, new: newTireQty})
  // }
  // TODO: call this when ready
  const handleSave = async () => {
    console.log("Selected tire to save:", selectedTireName);

    if (!selectedTireName) {
      alert("Please select a tire first.");
      return;
    }

    // setLoading(true);

    await axios.put(`http://localhost:8000/tires/update`, null, {
        params: { 
          name: selectedTireName,
          new: newTireQty,
          used: usedTireQty
        }
    })
    .then(res => {
      // setNumTires(prev => prev.map(t => t.id === updatedTire.id ? res.data : t));
      console.log("Updated data: ", res.data);
      // NOTE: passes the updated tire back to the parent (TireBarChart)
      onSave({name: selectedTireName, updatedData: res.data});
      // setEditingNumTires(null);
    })
    // .then(
    //   setLoading(false)
    // )
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
        {/* <input value={selectedTireName} onChange={(e) => setSelectedTireName(e.target.value)} /> */}
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


export default function TireBarChart() {

  // Interpolates between red and green
  // multiplying by 0.5 makes the gradient better distributed
  const getGreenRatio = (value, maxValue) => value / (maxValue * 0.5);

  // Threshold of Tires
  const [threshold, setThreshold] = useState(0);
  
  // Tire Data coming from database
  const [data, setData] = useState([]);

  // TODO: Likely get rid of this since the `data` variable contains the same information!
  const[numTiresList, setNumTiresList] = useState([]); 
  const[editingNumTires, setEditingNumTires] = useState(false);
  
   // Delete popup status
   const [showPopup, setShowPopup] = useState(false);
   const [showConfirmPopup, setShowConfirmPopup] = useState(false);
   const [selectedItem, setSelectedItem] = useState(null);
   const [spacesInTireName, setSpaceInTireName] = useState(false)
 
   // Add popup states
   const [showAddPopup, setShowAddPopup] = useState(false);
   const [newTireName, setNewTireName] = useState("");
   const [newAmount, setNewAmount] = useState("");
   const [usedAmount, setUsedAmount] = useState("");
 
   const maxValue = Math.max(...data.flatMap((d) => [d.new, d.used]));

  // Fetch tires on load
  const fetchTires = async () => {
    try {
      const res = await axios.get("http://localhost:8000/tires/");
      setData(res.data);
      setNumTiresList(res.data);
      // res.data.forEach(entry => {
      //   console.log(entry.name)
      // })
      
    } catch (err) {
      console.error("Error fetching tires:", err);
    }
  };

  const fetchThreshold = async () => {

      // Fetch the current threshold on component mount
      await axios.get("http://localhost:8000/threshold/")
        .then(res => setThreshold(res.data.value))
        .catch(err => console.log("Check out this error: ", err))
  }

  
  useEffect(() => {

    // Fetch tires on load!
    fetchTires();

    // Fetch Threshold on load!
    fetchThreshold();

    // getLogs();

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
        fetchTires();
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

    

  }, []); //runs once



  /*

  // TODO: NO LONGER NECESSARY SINCE WE ARE FETCHING FROM THE DATABASE USING http://localhost:8000/tires/
  const [data, setData] = useState([
    { name: "Tire A", new: 400, used: 240 },
    { name: "Tire B", new: 300, used: 456 },
    { name: "Tire C", new: 200, used: 139 },
    { name: "Tire D", new: 278, used: 390 },
    { name: "Tire E", new: 678, used: 610 },
    { name: "Tire F", new: 178, used: 440 },
    { name: "Tire G", new: 810, used: 200},
  ]);
  */

 

  // Update backend when threshold changes
  const handleThresholdChange = (e) => {
    // if (threshold == 0) return;
    const value = Number(e.target.value);
    setThreshold(value);
    axios.put(`http://localhost:8000/threshold/`, {value: value })
    .then(res => console.log("res: ", res.data))
    .catch(err => console.log("error :", err));

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

  // Step 3: Actually delete item after confirmation (TODO: We inserted 'async' to the function signature!)
  const confirmDelete = async () => {
    
    console.log(`selectedItem: ${selectedItem}`)

    if (!selectedItem) return;

    try {
      await axios.delete(`http://localhost:8000/tires/`, {
        params: { name: selectedItem }
    });
      
      setData((prev) => prev.filter(item => item.name !== selectedItem));
      setShowPopup(false);
      setShowConfirmPopup(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Error deleting tire:", err);
    }
      
  }

   // Add item  (TODO: We inserted 'async' to the function signature!)
   const handleCreateTire = async () => {
    /*
    if (!newTireName || !newAmount || !usedAmount) return;

    const newItem = {
      name: newTireName.trim(),
      new: Number(newAmount),
      used: Number(usedAmount),
    };

    setData((prev) => [...prev, newItem]);
    // Reset add popup inputs
    setNewTireName("");
    setNewAmount("");
    setUsedAmount("");
    setShowAddPopup(false);
    */  
    if (!newTireName || !newAmount || !usedAmount) return;
    
    // let ifSpaceInTireName = newTireName.split(/\s+/).length > 1;


    try {
      const res = await axios.post("http://localhost:8000/tires/create", {
        name: newTireName.trim().toUpperCase(),
        new: Number(newAmount),
        used: Number(usedAmount),
      });
      setData((prev) => [...prev, res.data]);
      setShowAddPopup(false);
      setNewTireName(""); setNewAmount(""); setUsedAmount("");
    } catch (err) {
      console.error("Error adding tire:", err);
    }  
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
    setNumTiresList(prev =>
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
        height: "300px",
      }}
    >
      
      
      {/* ---------------------START OF TABLE FOR TIRE INVENTORY */}
      
      {/* <h2>Tire Inventory</h2>
      <div 
        style={{
          display: "flex",
          justifyContent: "center",
          // alignItems: "center"
        }}
        >
        
        
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>Tire Name</th>
              <th>New</th>
              <th>Used</th>
            </tr>
          </thead>
          <tbody>
            {numTiresList.map(tire => (
              <tr key={tire.id}>
                <td>{tire.name}</td>
                <td>{tire.new}</td>
                <td>{tire.used}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
      {console.log("TireList: ", numTiresList)}
      {console.log("selectedItem: ", selectedItem)}
      
      {editingNumTires && (
        <EditTireModal
          tireList={numTiresList}
          onClose={() => setEditingNumTires(null)}
          onSave={handleSave}
        />
      )}
      

        

          



      <div>
       {/* Download Logs Button */}
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
          </button>

      <label style={{
              display: "flex",
              justifySelf: "center",
              alignSelf: "center"
              }}>
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

        
      <ResponsiveContainer width="100%" height="100%">
        
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {data.map((entry, index) => {
              const ratioNew = getGreenRatio(entry.new, maxValue);
              const ratioUsed = getGreenRatio(entry.used, maxValue);
              const greenNew = Math.round(255 * ratioNew);
              const greenUsed = Math.round(255 * ratioUsed);
              const redNew = Math.round(255 * (1 - ratioNew));
              const redUsed = Math.round(255 * (1 - ratioUsed));

              return (
                <React.Fragment key={index}>
                  {/* gradient for 'new' */}
                  <linearGradient id={`grad-new-${index}`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={`rgb(255,0,0)`} /> {/* bottom = red */}
                    <stop offset="100%" stopColor={`rgb(${redNew},${greenNew},0)`} /> {/* top = mixed red/green */}
                  </linearGradient>

                  {/* gradient for 'used' */}
                  <linearGradient id={`grad-used-${index}`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={`rgb(255,0,0)`} />
                    <stop offset="100%" stopColor={`rgb(${redUsed},${greenUsed},0)`} />
                  </linearGradient>
                </React.Fragment>
              );
            })}
          </defs>

          <CartesianGrid strokeDasharray="0" vertical={false}/>
          <XAxis 
          dataKey="name"
          label={{ value: 'Tire Names', position: "middle", fill: 'orange', dy: 15, dx: -33 }} 
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
            {data.map((entry, index) => (
              <Cell key={`new-${index}`} fill={`url(#grad-new-${index})`} />
            ))}
          </Bar>

          <Bar dataKey="used"
            fill="chartreuse"
            activeBar={<Rectangle fill="chartreuse" stroke="blue" />}
          >
            {data.map((entry, index) => (
              <Cell key={`used-${index}`} fill={`url(#grad-used-${index})`} />
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
      <div style={{ display: "flex", flexDirection: "row", gap: "1rem", padding: "1rem", textAlign: "center", justifyContent: "center"}}>
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
            <h3>Add New Tire</h3>
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
                onClick={handleCreateTire}
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
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
            {data.map((item) => (
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

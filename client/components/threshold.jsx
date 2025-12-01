import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ThresholdControl() {
  const [threshold, setThreshold] = useState(0);

  // Fetch the current threshold on component mount
  useEffect(() => {
    axios.get("http://localhost:8000/threshold/")
      .then(res => setThreshold(res.data.value))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setThreshold(e.target.value);
  };

  const handleUpdate = () => {
    axios.put("http://localhost:8000/threshold", { value: parseFloat(threshold) })
      .then(res => {
        alert(`Threshold updated to ${res.data.value}`);
      })
      .catch(err => console.error(err));
  };

//   return (
//     <div>
//       <label>
//         Threshold: 
//         <input type="number" value={threshold} onChange={handleChange} />
//       </label>
//       <button onClick={handleUpdate}>Update Threshold</button>
//     </div>
//   );
}

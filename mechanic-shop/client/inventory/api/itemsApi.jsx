import axios from "axios";

// leetcodetutor.com -> <VPS-IP>:8000
const BASE_URL = "https://api.leetcodetutor.com/items/";

// Calls the backend fastAPI service
//const BASE_URL = "https://api.leetcodetutor.com/items";

export const getItems = async (category) => {
    console.log("category: ", category)
    const response = await axios.get(`${BASE_URL}`, { params: { category } });
    console.log(response.data)
    return response.data;
}

export const getItemThreshold = async () => {
try {
    const response = await axios.get(`${BASE_URL}threshold`);
    return response.data;
  } catch (err) {
    console.error("GET item error:", err);
    return null; // or throw err
  }
}

export const changeItemThreshold = async (value) => {

    const response = await axios.put(`${BASE_URL}threshold`, {value: value })
    .then(res => console.log("CHANGE item threshold: ", res.data))
    .catch(err => console.log("CHANGE itemerror :", err));
    return response.data;
}

export const createItem = async (payload) => {

    try{
        const response = await axios.post(`${BASE_URL}/create`, payload)
        return response;
    }
    catch(err){
        console.log("Error adding Item: ", err)
    }
}

export const deleteItem = async (payload) => {
    
    try {
        //its the same as doing `${BASE_URL}?name=${name}&category={category}`
        console.log("payload:", payload)
        const response = await axios.delete(`${BASE_URL}`, payload);   
        return response;
    }  
    catch (err) {
        console.error("Error deleting tire:", err);
    }    
}

export const updateItem = async (payload) => {
    console.log("within updateItem")
    try{
       
        console.log("UPDATED ITEM PAYLOAD: ", payload)
        // its the same as doing `${BASE_URL}/update?name=${name}&new=${newQty}&used=${usedQty}`
        const response = axios.put(`${BASE_URL}/update`, payload);
        return response;
    }
    catch(err){
        console.error("Error adding Item: ", err)
    }
}

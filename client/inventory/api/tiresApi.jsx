import axios from "axios";

const BASE_URL = "http://localhost:8000/tires";

export const getTires = async () => {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
}

export const getTireThreshold = async () => {

    const response = await axios.get(`${BASE_URL}/threshold`);
    return response.data;
}

export const changeTireThreshold = async (value) => {

    const response = await axios.put(`${BASE_URL}/threshold`, {value: value })
    // .then(res => console.log("res: ", res.data))
    // .catch(err => console.log("error :", err));
    return response.data;
}

export const createTire = async (payload) => {

    try{
        const response = await axios.post(`${BASE_URL}/create`, payload)
        return response;
    }
    catch(err){
        console.log("Error adding Tire: ", err)
    }
}


export const deleteTire = async (payload) => {
    
    try {
        //its the same as doing `${BASE_URL}?name=${name}`
        const response = await axios.delete(`${BASE_URL}`, payload);   
        return response;
    }  
    catch (err) {
        console.error("Error deleting tire:", err);
    }    
}

export const updateTires = async (payload) => {

    try{
        // its the same as doing `${BASE_URL}/update?name=${name}&new=${newQty}&used=${usedQty}`
        const response = axios.put(`${BASE_URL}/update`, null, payload);
        return response;
    }
    catch(err){
        console.error("Error adding tire: ", err)
    }
}
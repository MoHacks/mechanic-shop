import axios from "axios";

const BASE_URL = "http://localhost:8000/categories";

export const getCategories = async () => {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
};

export const createCategory = async (payload) => {
    const response = await axios.post(`${BASE_URL}/`, payload);
    return response.data;
};

export const deleteCategory = async (name) => {
    const response = await axios.delete(`${BASE_URL}/${name}`);
    return response.data;
};

import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const findAll = async () => {
    try {
        const token = localStorage.getItem("medical_token");
        const result = await axios.get(`${url}/prescription`, {headers:{ Authorization: "Bearer "+token}})
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error finding prescriptions: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||   err.response?.data.message ||  err.message };
    }
}

const findById = async (id) => {
    try {
        const result = await axios.get(`${url}/prescriptions/${id}`, {headers:{ Authorization: "Bearer "+token}})
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding prescription: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||   err.message };
    }
}

const findByPatient = async () => {
    try {
        const token = localStorage.getItem("medical_token");
        const result = await axios.get(`${url}/prescription/patient`, {headers:{ Authorization: "Bearer "+token}});
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error finding patient prescriptions: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||   err.message };
    }
}

const findByDoctor = async () => {
    try {
        const token = localStorage.getItem("medical_token");
        const result = await axios.get(`${url}/prescription/doctor`, {headers:{ Authorization: "Bearer "+token}});
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error finding doctor prescriptions: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||   err.message };
    }
}

const save = async (data) => {
    try {
        const token = localStorage.getItem("medical_token");
        const result = await axios.post(`${url}/prescription`, data, {headers:{ Authorization: "Bearer "+token}});
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error saving prescriptions: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||   err.message };
    }
}

const update = async (id, data) => {
    try {
        const result = await axios.get(`${url}/prescriptions/${id}`, data)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding doctor prescriptions: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||   err.message };
    }
}

export default { findAll, findById, findByPatient, findByDoctor, save, update }
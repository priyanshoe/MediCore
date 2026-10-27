import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const findAll = async () => {
    try {
        const result = await axios.get(`${url}/appointment`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding appointments: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||  err.message };
    }
}

const findById = async (id) => {
    try {
        const result = await axios.get(`${url}/appointment/${id}`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding appointment: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||  err.message };
    }
}

const findByPatient = async () => {
    try {
        const token = localStorage.getItem("medical_token");
        const result = await axios.get(`${url}/appointment/patient`, {headers:{ Authorization: "Bearer "+token}})
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error finding appointments: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||  err.message };
    }
}

const findByDoctor = async () => {
    try {
        const token = localStorage.getItem("medical_token");
        const result = await axios.get(`${url}/appointment/doctor`, {headers:{ Authorization: "Bearer "+token}})
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error finding appointments: ", err)
        throw { success: false, status: err.status || 500, error: err.response?.data.message ||  err.message };
    }
}

const updateStatus = async (id, status) => {
    try {
        const result = await axios.patch(`${url}/appointments/${id}`, { status: status })
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error updating appointment: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const save = async (data) => {
    try {
        const result = await axios.post(`${url}/appointments`, data)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error creating appointment: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}


export default { findAll, findById, findByPatient, findByDoctor, updateStatus, save }
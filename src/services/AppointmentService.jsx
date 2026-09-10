import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const findAll = async () => {
    try {
        const result = await axios.get(`${url}/appointments`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding appointments: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const findById = async (id) => {
    try {
        const result = await axios.get(`${url}/appointments/${id}`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding appointment: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const findByPatientId = async (id) => {
    try {
        const result = await axios.get(`${url}/appointments?patientId=${id}`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding appointments: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
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


export default { findAll, findById, findByPatientId, updateStatus, save }
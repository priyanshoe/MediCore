import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const findAll = async () => {
    try {
        const result = await axios.get(`${url}/prescriptions`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding prescriptions: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const findById = async (id) => {
    try {
        const result = await axios.get(`${url}/prescriptions/${id}`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding prescription: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const findByPatientId = async (id) => {
    try {
        const result = await axios.get(`${url}/prescriptions?patientId=${id}`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding prescriptions: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

export default { findAll, findById, findByPatientId }
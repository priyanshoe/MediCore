import axios from "axios";
import { useAuth } from "../context/AuthContext";

const url = import.meta.env.VITE_API_URL;

const findAll = async () => {
    try {
        const result = await axios.get(`${url}/patient-profile`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding doctors: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const findById = async (id) => {
    try {
        const result = await axios.get(`${url}/patient-profile/${id}`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding doctor: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const findByUserId = async (id) => {
    try {
        const result = await axios.get(`${url}/patient-profile?patientId=${id}`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding doctor: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const updateById = async (id, data) => {
    try {
        const result = await axios.patch(`${url}/patient-profile/${id}`, data)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error updating doctor: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

export default { findAll, findById, findByUserId, updateById }
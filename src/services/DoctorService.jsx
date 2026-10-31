import axios from "axios";
import { useAuth } from "../context/AuthContext";
import AuthService from "./AuthService";

const url = import.meta.env.VITE_API_URL;

const findAll = async () => {
    try {
        const token = localStorage.getItem("medical_token");
        const result = await axios.get(`${url}/profile/doctor`, {headers:{ Authorization: "Bearer "+token}})
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error finding doctors: ", err)
        throw { success: false, status: err.status || 500,error: err.response?.data.message ||  err.message };
    }
}

const findById = async (id) => {
    try {
        const token = localStorage.getItem("medical_token");
        const result = await axios.get(`${url}/profile/doctor/${id}`, {headers:{ Authorization: "Bearer "+token}})
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error finding doctor: ", err)
        throw { success: false, status: err.status || 500,error: err.response?.data.message || err.message };
    }
}

const findByUserId = async (id) => {
    try {
        const result = await axios.get(`${url}/doctor-profile?doctorId=${id}`, {headers:{ Authorization: "Bearer "+token}})
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error finding doctor: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const updateById = async (id, data) => {
    try {
        const token = localStorage.getItem("medical_token");
        const result = await axios.put(`${url}/profile/doctor/${id}`, data, {headers:{ Authorization: "Bearer "+token}})
        return { success: true, status: 200, data: result.data.data };
    } catch (err) {
        console.log("Error updating doctor: ", err)
        throw { success: false, status: err.status || 500,error: err.response?.data.message || err.message };
    }
}

const deleteDoctor = async (id) => {
    try {
        const user = await findById(id);
        await axios.delete(`${url}/doctor-profile/${id}`)
        const deletedUser = await AuthService.deleteSoft(user.data.doctorId)
        return { success: true, status: 200, data: deletedUser.data };
    } catch (err) {
        console.log("Error deleting doctor: ", err)
        throw { success: false, status: err.status || 500,error: err.response?.data.message || err.message };
    }
}



export default { findAll, findById, updateById, findByUserId, deleteDoctor }
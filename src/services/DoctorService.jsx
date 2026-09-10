import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const findAll = async () => {
    try {
        const result = await axios.get(`${url}/doctor-profile`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding doctors: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const findById = async (id) => {
    try {
        const result = await axios.get(`${url}/doctor-profile/${id}`)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error finding doctor: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

export default { findAll, findById }
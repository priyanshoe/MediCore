import axios from "axios";
import PatientService from "./PatientService";

const url = import.meta.env.VITE_API_URL;


async function findAll() {
    try {
        const result = await axios.get(url + "/users")
        const users = result.data.map(({ password, ...user }) => user);
        return { success: true, status: 200, data: users };
    } catch (err) {
        console.log("Error in fetching Doctors", err);
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const findByEmail = async (email) => {
    try {
        const result = await axios.get(`${url}/users?email=${encodeURIComponent(email)}`)
        return result.data[0] || null
    } catch (err) {
        console.log("Error finding user by email:", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const findById = async (id) => {
    try {
        const result = await axios.get(`${url}/users/${id}`)
        const { password, ...user } = result.data;
        return { success: true, status: 200, data: user };
    } catch (err) {
        console.log("Error finding user by email:", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const updateStatus = async (id, status) => {
    try {
        const result = await axios.patch(`${url}/users/${id}`, { status: status })
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error updating status: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const update = async (id, data) => {
    try {
        delete data?.password;
        delete data?.id;
        const result = await axios.patch(`${url}/users/${id}`, data)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error updating status: ", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

const register = async (data) => {
    try {
        const user = await findByEmail(data?.email);
        if (user) {
            throw { status: 402, message: "user already exist" };
        }
        const userData = {
            name: data?.name,
            email: data?.email,
            password: data?.password,
            role: data?.role,
            status: "ACTIVE"
        }
        const result = await axios.post(url + "/users", userData)
        delete result.data.password;

        const profileData = data?.role === 'PATIENT' ? {
            patientId: result?.data?.id,
            name: data?.name,
            phone: data?.phone,
            dateOfBirth: data?.dateOfBirth,
            gender: data?.gender,
            address: data?.address
        } : data?.role === 'DOCTOR' ? {
            doctorId: result?.data?.id,
            name: data?.name,
            specialization: data?.specialization,
            qualification: data?.qualification,
            experience: data?.experience,
            consultationFee: data?.consultationFee,
            profileImage: data?.profileImage || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
            availability: data?.availability
        } : {}
        await axios.post(url + `/${data.role.toLowerCase()}-profile`, profileData)
        return { success: true, status: 200, data: result.data };
    } catch (err) {
        console.log("Error in resigtration", err)
        throw { success: false, status: err.status || 500, error: err.message };
    }
}

async function login(email, password) {
    try {
        const user = await findByEmail(email);
        if (!user) {
            throw { status: 404, message: "user not fount" }
        }
        if (password !== user?.password) {
            throw { status: 409, message: "bad credentials" }
        }
        delete user.password;
        delete user.email;
        return { success: true, status: 200, data: user };
    } catch (err) {
        console.log("Error in login", err)
        throw { success: false, status: err.status || 500, error: err.message };

    }
}

async function deleteSoft(id) {
    try {
        const deletedUser = await updateStatus(id, 'DELETED')
        return { success: true, status: 200, data: { user: deletedUser.data.email, status: deletedUser.data.status } };
    } catch (err) {
        console.log("Error in deleting", err)
        throw { success: false, status: err.status || 500, error: err.message };

    }
}




export default { register, login, findAll, findById, findByEmail, update, deleteSoft }
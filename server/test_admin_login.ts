import axios from 'axios';

async function run() {
    try {
        console.log("Attempting to log in as admin@fintrivox.com to live API...");
        const res = await axios.post("https://fintrivox-api.onrender.com/api/auth/login", {
            email: "admin@fintrivox.com",
            password: "Admin@123"
        });
        console.log("Response Data:", res.data);
    } catch (err: any) {
        console.error("FAILED TO LOG IN:", err.response?.data || err.message);
    }
}

run();

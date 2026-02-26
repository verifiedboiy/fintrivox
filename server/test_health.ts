import axios from "axios";

async function run() {
    try {
        const res = await axios.get("https://fintrivox-api.onrender.com/api/health");
        console.log("Success:", res.data);
    } catch (err: any) {
        console.error("Error:", err.response?.data || err.message);
    }
}

run();

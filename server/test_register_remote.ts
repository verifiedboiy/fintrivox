import axios from "axios";

const apiUrl = "https://fintrivox-api.onrender.com/api/auth/register";

async function run() {
    try {
        const res = await axios.post(apiUrl, {
            email: "test" + Date.now() + "@test.com",
            password: "password123",
            firstName: "John",
            lastName: "Doe",
            phone: "",
            country: "",
            referralCode: ""
        });
        console.log("Success:", res.data);
    } catch (err: any) {
        console.error("Error:", err.response?.data || err.message);
    }
}

run();

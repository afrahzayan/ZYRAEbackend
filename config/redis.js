

const { createClient } = require("redis");
require("dotenv").config();

const client = createClient({
    url: process.env.REDIS_URL,
});

// Redis Error Handling
client.on("error", (err) => {
    console.error("Redis Error:", err);
});

// Connect Redis
async function connectRedis() {
    try {
        await client.connect();

        console.log("Redis connected successfully");

    } catch (e) {
        console.log("Redis connection failed:", e.message);
        process.exit(1);
    }
}

module.exports = {
    client,
    connectRedis,
};


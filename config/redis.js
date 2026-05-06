const {createClient} = require("redis")
require("dotenv").config()

const client = createClient({
    url: process.env.REDIS_URL,

});

client.on("error",(err) => {
    console.error("Redis Error:", err)
})

async function connectRedis(){
    try{
 await client.connect();
 console.log("Redis connected successfully")
    }catch(e){
        console.log("redis connection fail",e.message)
    }
}

module.exports={client,connectRedis};
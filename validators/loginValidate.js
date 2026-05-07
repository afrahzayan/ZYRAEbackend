const z=require("zod");

const loginValidate=z.object({
    email:z.string().email(),
    password:z.string().min(6)
})

module.exports=loginValidate;
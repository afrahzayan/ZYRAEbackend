const z=require("zod");

const registerValidate=z.object({
    fname:z.string().min(4),
    lname:z.string().min(3),
    email:z.string().email(),
    password:z.string().min(6)
});

module.exports=registerValidate;
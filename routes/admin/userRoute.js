const express = require("express")

const router = express.Router()

const {
    getAllUsers,
    updateUserStatus,
    softDeleteUser
} = require("../../controller/admin/userController")


router.get("/", getAllUsers)
router.put("/:id", updateUserStatus)
router.delete("/delete/:id",softDeleteUser)

module.exports = router
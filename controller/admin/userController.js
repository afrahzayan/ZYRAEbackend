const User = require("../../model/userModel")

const getAllUsers = async (req, res) => {

    try {

  const users = await User.find()
  
        .select("-password")
        .lean()

        const formattedUsers = users.map((user) => ({

            id: user._id.toString(),
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            role: user.role,
            blocked: user.blocked,
            createdAt: user.createdAt

        }))

        res.status(200).json({
            success: true,
            users: formattedUsers
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching users"
        })
    }
}

const updateUserStatus = async (req, res) => {

    try {

        const { id } = req.params
        const { blocked } = req.body

        // FIND USER
        const existingUser = await User.findById(id)

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // PREVENT BLOCKING ADMINS
        if (existingUser.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin cannot be blocked"
            })
        }

        // UPDATE USER
        const user = await User.findByIdAndUpdate(
            id,
            { blocked },
            { new: true }
        ).select("-password")

        res.status(200).json({
            success: true,
            message: "User status updated",
            user
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Error updating user"
        })

    }
}


const softDeleteUser = async (req, res) => {

    try {

        const { id } = req.params;

        // FIND USER
        const existingUser = await User.findById(id);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // PREVENT DELETING ADMIN
        if (existingUser.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin cannot be deleted"
            });
        }

        // SOFT DELETE
        await User.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                deletedAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Error deleting user"
        });

    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    softDeleteUser
}
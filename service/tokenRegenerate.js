const jwt = require("jsonwebtoken");

const tokenRegenerator = (req, res) => {
    try {

        const token = req.cookies?.Refresh_Token;

        if (!token) {
            return res.status(401).json({
                message: "No Refresh Token Found"
            });
        }

        const decode = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_KEY
        );

        const role = decode.role || "user";

        const AccessToken = jwt.sign(
            {
                Email: decode.Email,
                Id: decode.Id,
                role
            },
            process.env.ACCESS_TOKEN_KEY,
            {
                expiresIn: "45m"
            }
        );

        const RefreshToken = jwt.sign(
            {
                Email: decode.Email,
                Id: decode.Id,
                role
            },
            process.env.REFRESH_TOKEN_KEY,
            {
                expiresIn: "7d"
            }
        );

        return res
            .cookie("Access_Token", AccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                maxAge: 15 * 60 * 1000
            })

            .cookie("Refresh_Token", RefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            .status(200)
            .json({
                success: true,
                message: "Access token regenerated successfully"
            });

    } catch (e) {

        console.error(
            "Token regeneration error:",
            e.message
        );

        return res

            .clearCookie("Access_Token", {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            })

            .clearCookie("Refresh_Token", {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            })

            .status(401)

            .json({
                success: false,
                message: "Refresh token expired. Please login again."
            });
    }
};

module.exports = tokenRegenerator;
const jwt = require("jsonwebtoken");
const { success } = require("zod/mini");

const tokenRegenerator = (req, res) => {
    try {
        let token = req.cookies?.Refresh_Token;

        if (!token) {
            return res.status(401).json({ message: "no Refresh_Token Founded" });
        }

        const decode = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
        
        const role = decode.role || decode.user || "user";


        const AccessToken = jwt.sign(
            { Email: decode.Email, Id: decode.Id, role: role },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "1m" },
        );

        const RefreshToken = jwt.sign(
            { Email: decode.Email, Id: decode.Id, role : role },
            process.env.REFRESH_TOKEN_KEY,
            { expiresIn: "7d" },
        );

           res .cookie("Access_Token", AccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000
            })
            .cookie("Refresh_Token", RefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            .json({success: true,
                 Message: "SuccessFuly Regenrator Access_Token" });
    } catch (e) {
         console.error("Token regeneration error:", e.message);
        
        
        res.clearCookie("Access_Token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        .clearCookie("Refresh_Token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        .status(401)
        .json({ 
            success: false,
            message: "Refresh Token expired. Please login again." 
        });
    }
};

module.exports = tokenRegenerator;
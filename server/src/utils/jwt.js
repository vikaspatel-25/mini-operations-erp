import jwt from "jsonwebtoken";

export function generateToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
            locationId: user.locationId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
}

export default generateToken;
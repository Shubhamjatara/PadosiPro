import jwt from "jsonwebtoken";
import Environment from "../config/Enviroment";
import { authClaimsSchema, type AuthClaims } from "../validators/auth.schema";

class JwtService {
  sign(payload: AuthClaims): string {
    return jwt.sign(payload, Environment.JWT_SECRET, { expiresIn: "24h" });
  }

  verify(token: string): AuthClaims {
    const decoded = jwt.verify(token, Environment.JWT_SECRET);
    return authClaimsSchema.parse(decoded);
  }
}

export default new JwtService();

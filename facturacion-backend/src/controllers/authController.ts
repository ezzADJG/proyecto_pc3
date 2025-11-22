import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { v4 as uuidv4 } from "uuid"; 
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Por favor, proporciona email y contraseña." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const result = await pool.query(
      "INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING id, email",
      [id, email, hashedPassword]
    );

    res.status(201).json({
      message: "Usuario registrado con éxito.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message:
          "Error al registrar el usuario. El email podría ya estar en uso.",
      });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d", 
    });

    res.json({
      message: "Login exitoso.",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

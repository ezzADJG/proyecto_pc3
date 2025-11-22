import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";
import { v4 as uuidv4 } from "uuid";

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { code, name, price, stock } = req.body;
  const userId = req.user?.id;
  const id = uuidv4();

  try {
    const result = await pool.query(
      "INSERT INTO products (id, code, name, price, stock, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [id, code, name, price, stock, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al crear el producto. El código ya podría existir.",
    });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE user_id = $1 ORDER BY name ASC",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los productos." });
  }
};

export const getProductByCode = async (req: AuthRequest, res: Response) => {
  const { code } = req.params;
  const userId = req.user?.id;
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE code = $1 AND user_id = $2",
      [code, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al buscar el producto." });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; 
  const userId = req.user?.id;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({
          message: "Producto no encontrado o no autorizado para eliminar.",
        });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error en el servidor al intentar eliminar el producto.",
      });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { code, name, price, stock } = req.body;
  const userId = req.user?.id;

  try {
    const result = await pool.query(
      "UPDATE products SET code = $1, name = $2, price = $3, stock = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
      [code, name, price, stock, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Producto no encontrado o no autorizado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el producto." });
  }
};
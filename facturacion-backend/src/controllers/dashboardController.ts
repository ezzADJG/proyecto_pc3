import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const invoicesCountPromise = pool.query(
      "SELECT COUNT(*) FROM invoices WHERE user_id = $1",
      [userId]
    );
    const totalSalesPromise = pool.query(
      "SELECT SUM(total) FROM invoices WHERE user_id = $1",
      [userId]
    );
    const productsCountPromise = pool.query(
      "SELECT COUNT(*) FROM products WHERE user_id = $1",
      [userId]
    );

    const [invoicesCountResult, totalSalesResult, productsCountResult] =
      await Promise.all([
        invoicesCountPromise,
        totalSalesPromise,
        productsCountPromise,
      ]);

    res.json({
      totalSales: parseFloat(totalSalesResult.rows[0].sum) || 0,
      invoicesCount: parseInt(invoicesCountResult.rows[0].count, 10),
      productsCount: parseInt(productsCountResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error("Error detallado del backend:", error);
    res.status(500).json({ message: "Error al obtener las estadísticas." });
  }
};

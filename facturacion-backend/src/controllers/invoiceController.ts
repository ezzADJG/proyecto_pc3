import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";
import { v4 as uuidv4 } from "uuid";

export const createInvoice = async (req: AuthRequest, res: Response) => {
  const { invoice_type, customer_name, customer_document, total, items, currency, exchange_rate, series } = req.body;
  const userId = req.user?.id;
  
  // Validar que tengamos serie (si no, asignar default)
  const currentSeries = series || (invoice_type === 'FACTURA' ? 'F001' : 'B001');

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const lastInvoiceQuery = await client.query(
      `SELECT MAX(number) as last_number 
       FROM invoices 
       WHERE user_id = $1 AND series = $2`,
      [userId, currentSeries]
    );

    let nextNumber = 1;
    if (lastInvoiceQuery.rows[0].last_number) {
      nextNumber = parseInt(lastInvoiceQuery.rows[0].last_number) + 1;
    }

    const invoiceId = uuidv4();
    
    // Insertamos el número calculado manualmente (nextNumber)
    const invoiceResult = await client.query(
      `INSERT INTO invoices 
      (id, invoice_type, customer_name, customer_document, total, user_id, currency, exchange_rate, series, number) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id`,
      [
        invoiceId, 
        invoice_type, 
        customer_name, 
        customer_document, 
        total, 
        userId, 
        currency || 'PEN', 
        exchange_rate,
        currentSeries,
        nextNumber // <--- Aquí va el número calculado
      ]
    );
    
    const newInvoiceId = invoiceResult.rows[0].id;

    // ... (El bloque del bucle "for" para los items sigue IGUAL que antes) ...
    for (const item of items) {
      const itemId = uuidv4();
      await client.query(
        "INSERT INTO invoice_items (id, invoice_id, product_name, quantity, unit_price, subtotal, product_code) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [itemId, newInvoiceId, item.name, item.quantity, item.price, item.quantity * item.price, item.code]
      );
      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE code = $2 AND user_id = $3",
        [item.quantity, item.code, userId]
      );
    }

    await client.query("COMMIT"); 
    
    res.status(201).json({ 
      message: "Factura creada con éxito.", 
      invoiceId: newInvoiceId,
      number: nextNumber // Devolvemos el número real generado
    });

  } catch (error) {
    await client.query("ROLLBACK"); 
    console.error(error);
    res.status(500).json({ message: "Error al crear la factura." });
  } finally {
    client.release(); 
  }
};

export const getMyInvoices = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    // AGREGAMOS 'series' y 'number' al SELECT
    const result = await pool.query(
      `SELECT 
        id, 
        invoice_type, 
        customer_name, 
        customer_document, 
        total, 
        created_at, 
        currency, 
        series, 
        number 
      FROM invoices 
      WHERE user_id = $1 
      ORDER BY number DESC`, // Ordenar por número suele ser mejor
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las facturas." });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; 
  const userId = req.user?.id;

  try {
    const invoiceResult = await pool.query(
      "SELECT * FROM invoices WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: "Factura no encontrada." });
    }

    const itemsResult = await pool.query(
      "SELECT * FROM invoice_items WHERE invoice_id = $1",
      [id]
    );

    const invoice = invoiceResult.rows[0];
    invoice.items = itemsResult.rows;

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener el detalle de la factura." });
  }
};

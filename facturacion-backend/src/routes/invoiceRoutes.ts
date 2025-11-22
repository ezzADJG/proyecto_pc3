import { Router } from "express";
import { createInvoice, getMyInvoices, getInvoiceById } from "../controllers/invoiceController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.route("/").post(protect, createInvoice).get(protect, getMyInvoices);

router.route("/:id").get(protect, getInvoiceById);

export default router;

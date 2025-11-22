import { Router } from "express";
import {
  createProduct,
  getMyProducts,
  getProductByCode,
  deleteProduct,
  updateProduct
} from "../controllers/productController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.route("/").post(protect, createProduct).get(protect, getMyProducts);

router.get("/:code", protect, getProductByCode);

router.route('/:id').put(protect, updateProduct).delete(protect, deleteProduct);

export default router;

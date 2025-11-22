import { Router } from "express";
import { getDni, getExchangeRate, getRuc } from "../controllers/externalApiController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.get("/dni/:numero", protect, getDni);
router.get("/tipo-cambio", protect, getExchangeRate);
router.get("/ruc/:numero", protect, getRuc);

export default router;

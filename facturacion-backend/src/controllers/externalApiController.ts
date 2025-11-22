import { Request, Response } from "express";
import axios from "axios";

const API_BASE_URL = "https://api.decolecta.com/v1";
const API_TOKEN = process.env.DECOLECTA_API_TOKEN;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export const getRuc = async (req: Request, res: Response) => {
  const { numero } = req.params;
  try {
    const response = await api.get(`/sunat/ruc?numero=${numero}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error getRuc:', (error as any).response?.data || (error as any).message || error);
    const status = (error as any).response?.status || 500;
    const data = (error as any).response?.data || { message: 'Error al consultar RUC.' };
    res.status(status).json(data);
  }
};

export const getDni = async (req: Request, res: Response) => {
  const { numero } = req.params;
  try {
    const response = await api.get(`/reniec/dni?numero=${numero}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error getDni:', (error as any).response?.data || (error as any).message || error);
    const status = (error as any).response?.status || 500;
    const data = (error as any).response?.data || { message: 'Error al consultar DNI.' };
    res.status(status).json(data);
  }
};

export const getExchangeRate = async (req: Request, res: Response) => {
  try {
    const response = await api.get("/tipo-cambio/sbs/average?currency=USD");
    res.json(response.data);
  } catch (error) {
    console.error('Error getExchangeRate:', (error as any).response?.data || (error as any).message || error);
    const status = (error as any).response?.status || 500;
    const data = (error as any).response?.data || { message: 'Error al obtener tipo de cambio.' };
    res.status(status).json(data);
  }
};

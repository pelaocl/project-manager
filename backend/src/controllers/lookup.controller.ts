import { Request, Response } from 'express';
import * as lookupService from '../services/lookup.service';

export const getFormOptionsController = async (req: Request, res: Response): Promise<Response> => {
    console.log('[Controller.getFormOptions] Solicitud recibida.');
    try {
        const options = await lookupService.getFormOptions();
        return res.status(200).json(options);
    } catch (error: any) {
        console.error("[Controller.getFormOptions] Error:", error.message);
        return res.status(500).json({ message: error.message || 'Error interno al obtener opciones del formulario.' });
    }
};
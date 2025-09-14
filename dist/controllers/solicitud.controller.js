"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSolicitud = exports.updateSolicitud = exports.createSolicitud = exports.getSolicitudById = exports.getSolicitudes = void 0;
const solicitud_service_1 = require("../services/solicitud.service");
const solicitudService = new solicitud_service_1.SolicitudService();
const getSolicitudes = async (req, res, next) => {
    try {
        const solicitudes = await solicitudService.getAllSolicitudes();
        res.status(200).json(solicitudes);
    }
    catch (error) {
        next(error);
    }
};
exports.getSolicitudes = getSolicitudes;
const getSolicitudById = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const solicitud = await solicitudService.getSolicitudById(id);
        res.status(200).json(solicitud);
    }
    catch (error) {
        next(error);
    }
};
exports.getSolicitudById = getSolicitudById;
// export const getTecnicasBySolicitud = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const id = Number(req.params.id);
//   try {
//     const tecnicas = await solicitudService.getTecnicasBySolicitud(id);
//     res.status(200).json(tecnicas);
//   } catch (error) {
//     next(error);
//   }
// }
const createSolicitud = async (req, res, next) => {
    try {
        const nuevaSolicitud = await solicitudService.createSolicitud(req.body);
        res.status(201).json(nuevaSolicitud);
    }
    catch (error) {
        next(error);
    }
};
exports.createSolicitud = createSolicitud;
const updateSolicitud = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const solicitudActualizada = await solicitudService.updateSolicitud(id, req.body);
        res.status(200).json(solicitudActualizada);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSolicitud = updateSolicitud;
const deleteSolicitud = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        const result = await solicitudService.deleteSolicitud(id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSolicitud = deleteSolicitud;

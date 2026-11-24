export function errorMiddleware(error, req, res, next) {
    const isOperational = error.isOperational === true;

    if (!isOperational) {
        console.error(error);
    }

    const statusCode = isOperational
        ? error.statusCode
        : 500;

    const message = isOperational
        ? error.message
        : "Ocurrió un error interno en el servidor.";

    return res.status(statusCode).json({
        success: false,
        message
    });
}
from flask import jsonify


def _error_payload(message: str, code: str):
    return {'ok': False, 'error': {'code': code, 'message': message}}


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(_):
        return jsonify(_error_payload('Solicitud inválida.', 'bad_request')), 400

    @app.errorhandler(404)
    def not_found(_):
        return jsonify(_error_payload('Recurso no encontrado.', 'not_found')), 404

    @app.errorhandler(422)
    def unprocessable(_):
        return jsonify(_error_payload('No se pudo procesar la solicitud.', 'unprocessable_entity')), 422

    @app.errorhandler(500)
    def server_error(_):
        return jsonify(_error_payload('Ocurrió un error interno.', 'internal_error')), 500

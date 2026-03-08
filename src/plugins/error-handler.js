const fp = require('fastify-plugin');
const { ZodError } = require('zod');

async function errorHandler(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    // Zod validation errors → 400
    if (error instanceof ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    }

    // Fastify/sensible errors (notFound, etc.)
    if (error.statusCode) {
      return reply.code(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      });
    }

    // Unknown errors → 500
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  });
}

module.exports = fp(errorHandler, { name: 'error-handler' });

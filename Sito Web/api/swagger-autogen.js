const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
      title: 'My API',
      description: 'Description',
    },
    host: 'localhost:3100',
    schemes: ['http'],
  };

  const outputFile = './api/swagger-output.json'
  const endpointsFiles = ['server.js']

  swaggerAutogen(outputFile, endpointsFiles, doc);
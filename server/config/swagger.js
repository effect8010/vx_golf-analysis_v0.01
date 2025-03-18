module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '골프 시뮬레이터 분석 API',
      version: '0.4.0',
      description: '골프 시뮬레이터 사용자의 라운드 데이터를 분석하는 API',
      contact: {
        name: '골프 시뮬레이터 분석 서비스 개발팀',
        url: 'https://github.com/effect8010/vx_golf-analysis_v0.01'
      }
    },
    servers: [
      {
        url: 'https://api.golfsimulator.example.com',
        description: '프로덕션 서버'
      },
      {
        url: 'http://localhost:5000',
        description: '개발 서버'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./server/routes/*.js']
}; 
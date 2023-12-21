module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 53339),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '60bc2938BE7C056423C3E5924efe991EA03DFFD8fe0e285907791'),
    }
  },
  cron: {
    enabled: true,
  },
  surgery: {
    client: 'mssql',
    connection: {
      host : '127.0.0.1',
      user : 'sa',
      password : '123456',
      database : 'surgery',
      options: {
        encrypt: false
      }
    }
  }
});

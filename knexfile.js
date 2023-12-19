// Update with your config settings.

require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_USER
    },
    migrations: {
      directory: './src/db/data/migrations',
    },
    seeds: { directory: './src/db/data/seeds' },
    searchPath: ['shopping']
  },

  testing: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_USER
    },
    migrations: {
      directory: './src/db/data/migrations',
    },
    seeds: { directory: './src/db/data/seeds' },
    searchPath: ['shopping']
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_USER
    },
    migrations: {
      directory: './src/db/data/migrations',
    },
    seeds: { directory: './src/db/data/seeds' },
    searchPath: ['shopping']
  },
};

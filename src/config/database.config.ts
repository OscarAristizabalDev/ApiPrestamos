import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
  uri: process.env.MONGODB_URI,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority',
  // ssl: true,
  // sslValidate: process.env.NODE_ENV === 'production',
  // poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
  maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
  connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
  socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),
}));
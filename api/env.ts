import { parseEnv, z, port } from 'znv';

const proxySchema = z
  .string()
  .regex(/^(https?|socks5?):\/\//, {
    message: 'Proxy must start with http:// or https:// or socks:// or socks5://',
  })
  .optional();

const envSchema = {
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: port().default(3000),
  SSL_CERT: z.string().optional(),
  SSL_KEY: z.string().optional(),
  HTTP_PROXY: proxySchema,
  HTTPS_PROXY: proxySchema,
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  JAVBUS_AUTH_TOKEN: z.string().optional(),
  JAVBUS_SESSION_SECRET: z.string().optional(),
};

const ENV = parseEnv(process.env, envSchema);

export default ENV;

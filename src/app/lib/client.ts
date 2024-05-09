import { Agent as HttpsAgent } from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import got, { type ExtendOptions } from 'got';
import { JAVBUS_TIMEOUT, USER_AGENT } from './constants';

const { HTTP_PROXY, HTTPS_PROXY } = process.env;
const PROXY_URL = HTTP_PROXY || HTTPS_PROXY;

export let agent: HttpsAgent | undefined = undefined;

if (PROXY_URL) {
  if (/^https?:\/\//.test(PROXY_URL)) {
    agent = new HttpsProxyAgent(PROXY_URL);
  } else if (/^socks/.test(PROXY_URL)) {
    agent = new SocksProxyAgent(PROXY_URL);
  }
}

const extendOptions: ExtendOptions = {
  headers: {
    'User-Agent': USER_AGENT,
    'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
  },
  timeout: {
    request: JAVBUS_TIMEOUT,
  },
};

if (agent) {
  extendOptions.agent = { http: agent, https: agent };
}

const client = got.extend(extendOptions);

export default client;

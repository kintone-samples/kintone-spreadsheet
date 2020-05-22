import { KintoneRestAPIClient } from '@kintone/rest-api-client';
export const client = new KintoneRestAPIClient({
  // TODO: windowから直接とらないようにする
  baseUrl: window.location.origin,
});

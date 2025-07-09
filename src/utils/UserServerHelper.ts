import { fetchUserServerApi } from "./ApiHelper";

export async function LoginMezonInUserServer(authData: string) {
  const path = `/api/v1/users/login-mezon`;
  const data = {
    authData
  };
  const result = await fetchUserServerApi(path, "POST", data);
  console.log(result);
  return result;
}
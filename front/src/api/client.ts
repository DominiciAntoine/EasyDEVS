






// Enregistrement du middleware

import createClient, { Middleware } from "openapi-fetch";
import {
  createQueryHook,
  createImmutableHook,
  createInfiniteHook,
  createMutateHook,
} from "swr-openapi";
import { isMatch } from "lodash-es";
import { paths} from "@/api/v1";

// Création du client avec l'URL de base
export const client = createClient<paths>({ baseUrl: import.meta.env.VITE_API_BASE_URL });
const prefix = "my-api";

const getAuthToken = (): string | null => localStorage.getItem("authToken");

const myMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getAuthToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (!response.ok) {
      console.error(`❌ API Error: ${response.statusText}`);
    }
    return response;
  },
  async onError({ error }) {
    console.error("❌ Fetch Error:", error);
    const fetchError = new Error(String(error));
    return fetchError;
  },
};

client.use(myMiddleware);

export const useQuery = createQueryHook(client, prefix);
export const useImmutable = createImmutableHook(client, prefix);
export const useInfinite = createInfiniteHook(client, prefix);
export const useMutate = createMutateHook(
  client,
  prefix,
  isMatch, // Or any comparision function
);
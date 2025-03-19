import { useQuery } from "@/api/client";
import { paths } from "@/api/v1";
import { TypesForRequest } from "swr-openapi";

const path: keyof paths = "/user/{id}"

type GetRequestType = TypesForRequest<paths, 'get', typeof path>

export const useGetUserById= (
    params: GetRequestType['Init'],
    config: GetRequestType['SWRConfig'] = {}
  ) => useQuery(path, params, config);
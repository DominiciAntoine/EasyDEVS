import { useQuery } from "@/api/client";
import { paths } from "@/api/v1";
import { TypesForRequest } from "swr-openapi";

const path: keyof paths = "/model/{id}"

type GetRequestType = TypesForRequest<paths, 'get', typeof path>

export const GetModelById= (
    params: GetRequestType['Init'],
    config: GetRequestType['SWRConfig'] = {}
  ) => useQuery(path, params, config);
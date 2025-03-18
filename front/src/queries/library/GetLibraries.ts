import { useQuery } from "@/api/client";
import { paths } from "@/api/v1";
import { TypesForRequest } from "swr-openapi";

const path: keyof paths = "/workspace"

type GetRequestType = TypesForRequest<paths, 'get', typeof path>

export const GetWorkspace = (
    params: GetRequestType['Init'] = undefined,
    config: GetRequestType['SWRConfig'] = {}
) => useQuery(path, params, config);
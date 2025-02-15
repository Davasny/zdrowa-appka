import { useQuery, UseQueryResult } from "@tanstack/react-query";
import wretch from "wretch";

export const backendFetcher = <T>(path: string) =>
  wretch("http://localhost:3000/api").get(path).json<T>();

type HasId = { id: string | number };

type UseGetApiResult<T extends HasId> = UseQueryResult<T[], Error> & {
  map: Map<T["id"], T>;
};

export const useApiClient = <T extends { id: string | number }>(
  url: string,
): UseGetApiResult<T> => {
  let map = new Map<T["id"], T>();

  const response = useQuery<T[]>({
    queryKey: [url],
    queryFn: () => backendFetcher<T[]>(url),
  });

  if (response.data) {
    map = new Map(response.data.map((i) => [i.id, i]));
  }

  return { ...response, map: map };
};

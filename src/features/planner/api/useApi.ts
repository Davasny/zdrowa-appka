import {
  backendFetcher,
  useApiClient,
} from "@/features/planner/api/useApiClient";
import { Instructor } from "@/zdrofit/types/instructors";
import { ClassType } from "@/zdrofit/types/classTypes";
import { Category } from "@/zdrofit/types/categories";
import { useQuery } from "@tanstack/react-query";
import { ExerciseClassSimple } from "@/zdrofit/types/exerciseClasses";
import { Club } from "@/zdrofit/types/clubs";

export const useGetInstructors = () => useApiClient<Instructor>("/instructors");
export const useGetClassTypes = () => useApiClient<ClassType>("/class-types");
export const useGetCategories = () => useApiClient<Category>("/categories");
export const useGetClubs = () => useApiClient<Club>("/clubs");
export const useGetUserClasses = () =>
  useApiClient<Instructor>("/user-classes");

export const useFindClasses = (date: string) => {
  return useQuery<ExerciseClassSimple[]>({
    queryKey: ["/find-classes", date],
    queryFn: () =>
      backendFetcher<ExerciseClassSimple[]>(`/find-classes?date=${date}`),
  });
};

import {
  backendFetcher,
  useApiClient,
} from "@/features/planner/api/useApiClient";
import { Instructor } from "@/zdrofit/types/instructors";
import { ClassType } from "@/zdrofit/types/classTypes";
import { Category } from "@/zdrofit/types/categories";
import { useQuery } from "@tanstack/react-query";
import {
  ExerciseClassDetailsResponse,
  ExerciseClassSimple,
} from "@/zdrofit/types/exerciseClasses";
import { Club } from "@/zdrofit/types/clubs";
import { Job } from "@/storage/JobsStorage";

export const useGetInstructors = () => useApiClient<Instructor>("/instructors");
export const useGetClassTypes = () => useApiClient<ClassType>("/class-types");
export const useGetCategories = () => useApiClient<Category>("/categories");
export const useGetClubs = () => useApiClient<Club>("/clubs");
export const useGetUserClasses = () =>
  useApiClient<ExerciseClassSimple>("/user-classes");

export const useFindClasses = (date: string) => {
  return useQuery<ExerciseClassSimple[]>({
    queryKey: ["/find-classes", date],
    queryFn: () =>
      backendFetcher<ExerciseClassSimple[]>(`/find-classes?date=${date}`),
  });
};

export const useGetClassDetails = (classId: number) => {
  return useQuery<ExerciseClassDetailsResponse>({
    queryKey: ["/class-details", classId],
    queryFn: () =>
      backendFetcher<ExerciseClassDetailsResponse>(
        `/class-details?classId=${classId}`,
      ),
  });
};

export const useGetPlannedJobs = () =>
  useQuery({
    queryKey: ["/planned-jobs"],
    queryFn: () => backendFetcher<Job[]>("/planned-jobs"),
  });

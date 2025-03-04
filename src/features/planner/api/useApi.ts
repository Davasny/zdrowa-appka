import { toaster } from "@/components/ui/toaster";
import {
  apiClient,
  backendFetcher,
  useApiClient,
} from "@/features/planner/api/useApiClient";
import { queryClient } from "@/pages/_app";
import { Job } from "@/storage/JobsStorage";
import { Category } from "@/zdrofit/types/categories";
import { ClassType } from "@/zdrofit/types/classTypes";
import { Club } from "@/zdrofit/types/clubs";
import {
  ExerciseClassDetailsResponse,
  ExerciseClassSimple,
} from "@/zdrofit/types/exerciseClasses";
import { Instructor } from "@/zdrofit/types/instructors";
import { UserHistoryResponse } from "@/zdrofit/types/userHistory";
import { useQuery } from "@tanstack/react-query";

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

export const useGetAllJobs = () =>
  useQuery({
    queryKey: ["/jobs"],
    queryFn: () => backendFetcher<Job[]>("/jobs"),
  });

export const useGetUserHistory = () =>
  useQuery({
    queryKey: ["/user-history"],
    queryFn: () => backendFetcher<UserHistoryResponse>("/user-history"),
  });

export const bookOrCancelClass = (
  classId: ExerciseClassSimple["id"],
  stringDate: string,
  action: "book" | "cancel",
) =>
  apiClient
    .url(action === "book" ? "/book-class" : "/cancel-class")
    .post({
      classId: classId,
      date: stringDate,
    })
    .json()
    .then(async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["/find-classes", stringDate],
        }),
        queryClient.invalidateQueries({
          queryKey: ["/user-classes"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["/planned-jobs"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["/jobs"],
        }),
      ]);

      toaster.create({
        title: `${action}ed`,
        type: "success",
      });
    })
    .catch((e) => {
      toaster.create({
        title: `Failed to ${action}`,
        type: "error",
        description: e.message,
      });
    });

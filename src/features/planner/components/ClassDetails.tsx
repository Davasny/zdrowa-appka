import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import {
  useGetClassDetails,
  useGetClassTypes,
  useGetInstructors,
  useGetPlannedJobs,
} from "@/features/planner/api/useApi";
import { apiClient } from "@/features/planner/api/useApiClient";
import { ClassIntensityStatus } from "@/features/planner/components/ClassIntensityStatus";
import { queryClient } from "@/pages/_app";
import {
  ExerciseClassSimple,
  ExerciseClassStateEnum,
} from "@/zdrofit/types/exerciseClasses";
import { Button, DataList } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useState } from "react";

export const ClassDetails = ({
  simpleClass,
}: {
  simpleClass: ExerciseClassSimple;
}) => {
  const [cancelInProgress, setCancelInProgress] = useState(false);
  const [bookInProgress, setBookInProgress] = useState(false);

  const { map: classTypes } = useGetClassTypes();

  const { map: instructors, isLoading: isLoadingInstructors } =
    useGetInstructors();

  const { data: classDetails, isLoading: isLoadingClassDetails } =
    useGetClassDetails(simpleClass.id);

  const { data: plannedJobs } = useGetPlannedJobs();

  const isPlannedToBook = plannedJobs?.some(
    (job) => job.class.classId === simpleClass.id,
  );

  const classType = classTypes.get(simpleClass.classType);

  const coachName = instructors.get(simpleClass.coach)?.name || "-";

  const canSignOut =
    simpleClass.state === "booked" ||
    simpleClass.state === "standby" ||
    isPlannedToBook;

  const stringDate = dayjs(simpleClass.dateObject).format("YYYY-MM-DD");

  const handleBookOrCacl = (action: "book" | "cancel") => {
    const url = action === "book" ? "/book-class" : "/cancel-class";

    if (action === "cancel") setCancelInProgress(true);
    if (action === "book") setBookInProgress(true);

    void apiClient
      .url(url)
      .post({
        classId: simpleClass.id,
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
      })
      .finally(() => {
        setBookInProgress(false);
        setCancelInProgress(false);
      });
  };

  let state = ExerciseClassStateEnum[simpleClass.state] as string;
  if (isPlannedToBook) {
    state = state + " (zaplanowany)";
  }

  const summaries = [
    { label: "Status", value: state },
    {
      label: "Zapisani",
      value: classDetails
        ? `${classDetails?.def.attendeesCount}/${classDetails?.def.attendeesLimit}`
        : "-/-",
    },
    { label: "Prowadzący", value: coachName },
    { label: "Opis", value: classType?.description },
    { label: "Dla kogo", value: classType?.audienceText },
    {
      label: "Intensywność",
      value: (
        <ClassIntensityStatus classIntensity={classType?.intensity || null} />
      ),
    },
  ];

  return (
    <DialogContent>
      <DialogCloseTrigger />
      <DialogHeader>
        <DialogTitle>{classType?.name || "-"}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <DataList.Root>
          {summaries.map((item) => (
            <DataList.Item key={item.label}>
              <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
              <DataList.ItemValue>{item.value}</DataList.ItemValue>
            </DataList.Item>
          ))}
        </DataList.Root>
      </DialogBody>

      <DialogFooter justifyContent="space-between">
        <Button
          colorPalette="red"
          disabled={!canSignOut}
          loading={cancelInProgress}
          onClick={() => handleBookOrCacl("cancel")}
        >
          Wypisz
        </Button>

        <Button
          colorPalette="orange"
          disabled={canSignOut}
          loading={bookInProgress}
          onClick={() => handleBookOrCacl("book")}
        >
          Zabookuj
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

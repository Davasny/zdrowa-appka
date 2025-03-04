import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  bookOrCancelClass,
  useGetClassDetails,
  useGetClassTypes,
  useGetInstructors,
  useGetPlannedJobs,
} from "@/features/planner/api/useApi";
import { ClassIntensityStatus } from "@/features/planner/components/ClassIntensityStatus";
import {
  ExerciseClassSimple,
  ExerciseClassStateEnum,
} from "@/zdrofit/types/exerciseClasses";
import { Badge, Button, DataList, Flex } from "@chakra-ui/react";
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

  const handleBookOrCancel = (action: "book" | "cancel") => {
    if (action === "cancel") setCancelInProgress(true);
    if (action === "book") setBookInProgress(true);

    void bookOrCancelClass(simpleClass.id, stringDate, action).finally(() => {
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
    { label: "Kiedy", value: `${simpleClass.date} ${simpleClass.start_time}` },
    { label: "Czas trwania", value: simpleClass.duration },
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
        <DialogTitle as={Flex} gap={4}>
          {classType?.name || "-"}
          <Badge>{simpleClass.id}</Badge>
        </DialogTitle>
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
          onClick={() => handleBookOrCancel("cancel")}
        >
          Wypisz
        </Button>

        <Button
          colorPalette="orange"
          disabled={canSignOut}
          loading={bookInProgress}
          onClick={() => handleBookOrCancel("book")}
        >
          Zabookuj
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

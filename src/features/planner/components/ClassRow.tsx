import { ExerciseClassSimple } from "@/zdrofit/types/exerciseClasses";
import {
  useGetClassDetails,
  useGetClassTypes,
  useGetClubs,
  useGetInstructors,
  useGetPlannedJobs,
  useGetUserClasses,
} from "@/features/planner/api/useApi";
import { Button, DialogBackdrop, Flex, Stat, Text } from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useAtomValue } from "jotai/index";
import { filterByNameAtom } from "@/features/planner/atoms/filterAtom";
import { apiClient } from "@/features/planner/api/useApiClient";
import dayjs from "dayjs";
import { queryClient } from "@/pages/_app";
import { toaster } from "@/components/ui/toaster";

const ClassRowDialogContent = ({
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

  const classType = classTypes.get(simpleClass.classType)?.name || "-";

  const coach = instructors.get(simpleClass.coach)?.name || "-";

  const canSignOut =
    simpleClass.state === "booked" ||
    simpleClass.state === "standby" ||
    isPlannedToBook;

  const stringDate = dayjs(simpleClass.dateObject).format("YYYY-MM-DD");

  const handleBookOrCacl = (action: "book" | "cancel") => {
    const url = action === "book" ? "/book-class" : "/cancel-class";
    setBookInProgress(true);

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

        setBookInProgress(false);
      })
      .catch((e) => {
        toaster.create({
          title: `Failed to ${action}`,
          type: "error",
          description: e.message,
        });

        setBookInProgress(false);
      });
  };

  return (
    <DialogContent>
      <DialogCloseTrigger />
      <DialogHeader>
        <DialogTitle>{classType}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <Stat.Root>
          <Stat.Label>Status</Stat.Label>
          <Stat.ValueText>
            {simpleClass.state}
            {isPlannedToBook ? <> (planned)</> : null}
          </Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label>Zapisani</Stat.Label>
          <Stat.ValueText>
            <Skeleton loading={isLoadingClassDetails} minW={10}>
              {classDetails?.def.attendeesCount}/
              {classDetails?.def.attendeesLimit}
            </Skeleton>
          </Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label>Prowadzący</Stat.Label>
          <Stat.ValueText>
            <Skeleton loading={isLoadingInstructors} minW={10}>
              {coach}
            </Skeleton>
          </Stat.ValueText>
        </Stat.Root>
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

export const ClassRow = ({
  simpleClass,
}: {
  simpleClass: ExerciseClassSimple;
}) => {
  const [open, setOpen] = useState(false);
  const filterByName = useAtomValue(filterByNameAtom);

  const { map: classTypes } = useGetClassTypes();
  const { map: clubs } = useGetClubs();
  const { map: userClasses } = useGetUserClasses();
  const { data: plannedJobs } = useGetPlannedJobs();

  const className = classTypes.get(simpleClass.classType)?.name || "-";
  const location = clubs.get(simpleClass.location)?.name || "-";

  const isBooked = userClasses.has(simpleClass.id);
  const isPlannedToBook = plannedJobs?.some(
    (job) => job.class.classId === simpleClass.id,
  );

  const isVisible =
    filterByName.length === 0 ||
    className.toLowerCase().includes(filterByName.toLowerCase());

  if (!isVisible) {
    return null;
  }

  return (
    <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogBackdrop />
      <DialogTrigger asChild>
        <Flex
          p={1}
          flexDirection="column"
          borderStyle={isPlannedToBook ? "dashed" : "solid"}
          borderWidth={isBooked || isPlannedToBook ? 2 : 1}
          borderColor={isBooked || isPlannedToBook ? "orange.400" : "gray.200"}
          rounded="md"
          _hover={{ shadow: "md" }}
          color={simpleClass.state === "to_be_standby" ? "gray.500" : undefined}
        >
          <Text fontSize="xs" fontWeight="bold" whiteSpace="break-spaces">
            {className}
          </Text>
          <Text fontSize="xs">{location}</Text>
        </Flex>
      </DialogTrigger>

      {open && <ClassRowDialogContent simpleClass={simpleClass} />}
    </DialogRoot>
  );
};

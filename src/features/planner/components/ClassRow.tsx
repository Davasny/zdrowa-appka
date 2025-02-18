import { DialogRoot, DialogTrigger } from "@/components/ui/dialog";
import {
  useGetClassTypes,
  useGetClubs,
  useGetPlannedJobs,
  useGetUserClasses,
} from "@/features/planner/api/useApi";
import {
  filterByBookedAtom,
  filterByNameAtom,
} from "@/features/planner/atoms/filterAtom";
import { ClassDetails } from "@/features/planner/components/ClassDetails";
import { ExerciseClassSimple } from "@/zdrofit/types/exerciseClasses";
import { DialogBackdrop, Flex, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai/index";
import { useState } from "react";

export const ClassRow = ({
  simpleClass,
}: {
  simpleClass: ExerciseClassSimple;
}) => {
  const [open, setOpen] = useState(false);
  const filterByNameValue = useAtomValue(filterByNameAtom);
  const filterByBookedValue = useAtomValue(filterByBookedAtom);

  const { map: classTypes } = useGetClassTypes();
  const { map: clubs } = useGetClubs();
  const { map: userClasses } = useGetUserClasses();
  const { data: plannedJobs } = useGetPlannedJobs();

  const classType = classTypes.get(simpleClass.classType);
  const location = clubs.get(simpleClass.location)?.name || "-";

  const isBooked = userClasses.has(simpleClass.id);
  const isPlannedToBook = plannedJobs?.some(
    (job) => job.class.classId === simpleClass.id,
  );

  let isVisible = true;

  if (filterByNameValue.length > 0) {
    isVisible = Boolean(
      classType?.name.toLowerCase().includes(filterByNameValue.toLowerCase()),
    );
  }

  if (filterByBookedValue) {
    isVisible = Boolean(isBooked || isPlannedToBook);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <DialogRoot
      lazyMount
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      size={{ mdDown: "full", md: "md" }}
    >
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
            {classType?.name}
          </Text>
          <Text fontSize="xs">{location}</Text>
        </Flex>
      </DialogTrigger>

      {open && <ClassDetails simpleClass={simpleClass} />}
    </DialogRoot>
  );
};

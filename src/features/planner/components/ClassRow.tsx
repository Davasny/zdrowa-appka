import { ExerciseClassSimple } from "@/zdrofit/types/exerciseClasses";
import {
  useGetClassTypes,
  useGetClubs,
  useGetPlannedJobs,
  useGetUserClasses,
} from "@/features/planner/api/useApi";
import { DialogBackdrop, Flex, Text } from "@chakra-ui/react";
import { DialogRoot, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useAtomValue } from "jotai/index";
import { filterByNameAtom } from "@/features/planner/atoms/filterAtom";
import { ClassDetails } from "@/features/planner/components/ClassDetails";

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

  const classType = classTypes.get(simpleClass.classType);
  const location = clubs.get(simpleClass.location)?.name || "-";

  const isBooked = userClasses.has(simpleClass.id);
  const isPlannedToBook = plannedJobs?.some(
    (job) => job.class.classId === simpleClass.id,
  );

  const isVisible =
    filterByName.length === 0 ||
    classType?.name.toLowerCase().includes(filterByName.toLowerCase());

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

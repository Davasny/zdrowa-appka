import { ExerciseClassSimple } from "@/zdrofit/types/exerciseClasses";
import {
  useGetClassDetails,
  useGetClassTypes,
  useGetClubs,
  useGetInstructors,
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

const ClassRowDialogContent = ({
  simpleClass,
}: {
  simpleClass: ExerciseClassSimple;
}) => {
  const { map: classTypes } = useGetClassTypes();
  const { map: clubs } = useGetClubs();
  const { map: userClasses } = useGetUserClasses();
  const { map: instructors, isLoading: isLoadingInstructors } =
    useGetInstructors();
  const { data: classDetails, isLoading: isLoadingClassDetails } =
    useGetClassDetails(simpleClass.id);

  const classType = classTypes.get(simpleClass.classType)?.name || "-";
  const location = clubs.get(simpleClass.location)?.name || "-";
  const isBooked = userClasses.has(simpleClass.id);

  const coach = instructors.get(simpleClass.coach)?.name || "-";

  const canSignOut =
    simpleClass.state === "booked" || simpleClass.state === "standby";

  return (
    <DialogContent>
      <DialogCloseTrigger />
      <DialogHeader>
        <DialogTitle>{classType}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <Stat.Root>
          <Stat.Label>Status</Stat.Label>
          <Stat.ValueText>{simpleClass.state}</Stat.ValueText>
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
        <Button colorPalette="red" disabled={!canSignOut}>
          Wypisz
        </Button>

        <Button colorPalette="orange" disabled={canSignOut}>
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

  const className = classTypes.get(simpleClass.classType)?.name || "-";
  const location = clubs.get(simpleClass.location)?.name || "-";

  const isBooked = userClasses.has(simpleClass.id);

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
          border="solid"
          borderWidth={isBooked ? 2 : 1}
          borderColor={isBooked ? "orange.400" : "gray.200"}
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

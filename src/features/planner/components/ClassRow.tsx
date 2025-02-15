import { ExerciseClassSimple } from "@/zdrofit/types/exerciseClasses";
import {
  useGetClassTypes,
  useGetClubs,
  useGetUserClasses,
} from "@/features/planner/api/useApi";
import { Flex, Text } from "@chakra-ui/react";

export const ClassRow = ({
  simpleClass,
}: {
  simpleClass: ExerciseClassSimple;
}) => {
  const { map: classTypes } = useGetClassTypes();
  const { map: clubs } = useGetClubs();
  const { map: userClasses } = useGetUserClasses();

  const classType = classTypes.get(simpleClass.classType)?.name || "-";
  const location = clubs.get(simpleClass.location)?.name || "-";

  const isBooked = userClasses.has(simpleClass.id);

  return (
    <Flex
      p={1}
      flexDirection="column"
      border="solid"
      borderWidth={isBooked ? 2 : 1}
      borderColor={isBooked ? "orange.400" : "gray.200"}
      rounded="md"
    >
      <Text fontSize="xs" fontWeight="bold">
        {classType}
      </Text>
      <Text fontSize="xs">{location}</Text>
    </Flex>
  );
};

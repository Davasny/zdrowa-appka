import { ExerciseClassSimple } from "@/zdrofit/types/exerciseClasses";
import { useGetClassTypes, useGetClubs } from "@/features/planner/api/useApi";
import { Flex, Text } from "@chakra-ui/react";

export const ClassRow = ({
  simpleClass,
}: {
  simpleClass: ExerciseClassSimple;
}) => {
  const { map: classTypes } = useGetClassTypes();
  const { map: clubs } = useGetClubs();

  let classType = classTypes.get(simpleClass.classType)?.name || "-";
  let location = clubs.get(simpleClass.location)?.name || "-";

  return (
    <Flex
      p={1}
      flexDirection="column"
      border="1px solid"
      borderColor="gray.200"
      rounded="md"
    >
      <Text fontSize="xs" fontWeight="bold">
        {classType}
      </Text>
      <Text fontSize="xs">{location}</Text>
    </Flex>
  );
};

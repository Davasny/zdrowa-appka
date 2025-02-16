import { useFindClasses } from "@/features/planner/api/useApi";
import { filterByLocationAtom } from "@/features/planner/atoms/filterAtom";
import { Flex, Table } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useAtomValue } from "jotai/index";

import { ClassRow } from "@/features/planner/components/ClassRow";

export const PlannerCell = ({ day, hour }: { day: Date; hour: string }) => {
  const dateString = dayjs(day).format("YYYY-MM-DD");

  const { data: classes } = useFindClasses(dateString);
  const filterLocations = useAtomValue(filterByLocationAtom);

  const classesAtHour = classes
    ?.filter((c) => c.start_time === hour)
    .filter(
      (c) =>
        filterLocations.length === 0 || filterLocations.includes(c.location),
    );

  if (classesAtHour?.length === 0) {
    return <Table.Cell />;
  }

  return (
    <Table.Cell key={day.toLocaleDateString()} verticalAlign="top">
      <Flex flexDirection="column" gap={2}>
        {classesAtHour?.map((c) => <ClassRow key={c.id} simpleClass={c} />)}
      </Flex>
    </Table.Cell>
  );
};

import { useFindClasses } from "@/features/planner/api/useApi";
import { DAYS } from "@/features/planner/consts/i18n";
import { Flex, Progress, Table, Text } from "@chakra-ui/react";
import dayjs from "dayjs";

export const PlannerHeaderCell = ({ day }: { day: Date }) => {
  const dateString = dayjs(day).format("YYYY-MM-DD");

  const { isLoading } = useFindClasses(dateString);

  const isToday = dayjs(day).isSame(new Date(), "day");

  return (
    <Table.ColumnHeader key={day.toLocaleDateString()}>
      <Flex textAlign="center" flexDirection="column">
        <Text>{dayjs(day).format("DD.MM")}</Text>
        <Text>{DAYS.PL[dayjs(day).day()]}</Text>

        <Progress.Root
          colorPalette="orange"
          value={isLoading ? null : 100}
          unstyled={!isLoading && !isToday}
        >
          <Progress.Track h="3px">
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Flex>
    </Table.ColumnHeader>
  );
};

import { Button, Flex, Table, Text } from "@chakra-ui/react";
import { useState } from "react";
import dayjs from "dayjs";
import { ClubFilter } from "@/features/planner/components/ClubFilter";
import { PlannerCell } from "@/features/planner/components/PlannerCell";
import { getStartOfWeek } from "@/features/planner/utils/getStartOfWeek";
import { addDays } from "@/features/planner/utils/addDays";
import { generateFullHours } from "@/features/planner/utils/generateFullHours";

export const Planner = () => {
  const [weekStart, setWeekStart] = useState<Date>(getStartOfWeek(new Date()));

  const handlePreviousWeek = () => {
    setWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => addDays(prev, 7));
  };

  const handleToday = () => {
    setWeekStart(getStartOfWeek(new Date()));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const hours = generateFullHours();

  return (
    <Flex flexDirection="column" w="100%" gap={2}>
      <Flex>
        <ClubFilter />
      </Flex>

      <Flex justifyContent="space-between">
        <Button onClick={handlePreviousWeek} size="sm" variant="subtle">
          Previous Week
        </Button>

        <Button onClick={handleToday} variant="subtle">
          Today
        </Button>

        <Button onClick={handleNextWeek} variant="subtle">
          Next Week
        </Button>
      </Flex>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader></Table.ColumnHeader>
            {weekDays.map((date) => (
              <Table.ColumnHeader key={date.toLocaleDateString()}>
                <Flex textAlign="center" flexDirection="column">
                  <Text>{date.toLocaleDateString()}</Text>
                  <Text
                    borderBottom={
                      dayjs().isSame(date, "day") ? "3px solid" : undefined
                    }
                    borderColor="orange.500"
                  >
                    {dayNames[date.getDay()]}
                  </Text>
                </Flex>
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {hours.map((hour) => (
            <Table.Row key={hour}>
              <Table.Cell>{hour}</Table.Cell>

              {weekDays.map((date) => (
                <PlannerCell
                  key={date.toLocaleDateString()}
                  day={date}
                  hour={hour}
                />
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
};

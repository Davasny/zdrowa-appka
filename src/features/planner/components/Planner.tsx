import { Button, Flex, Table, Text } from "@chakra-ui/react";
import { useState } from "react";
import dayjs from "dayjs";
import { FilterByLocation } from "@/features/planner/components/FilterByLocation";
import { PlannerCell } from "@/features/planner/components/PlannerCell";
import { getStartOfWeek } from "@/features/planner/utils/getStartOfWeek";
import { addDays } from "@/features/planner/utils/addDays";
import { generateFullHours } from "@/features/planner/utils/generateFullHours";
import { DAYS } from "@/features/planner/consts/i18n";
import { FilterByName } from "@/features/planner/components/FilterByName";

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

  const hours = generateFullHours();

  return (
    <Flex flexDirection="column" w="100%" gap={2}>
      <Flex gap={2}>
        <FilterByLocation />
        <FilterByName/>
      </Flex>

      <Flex justifyContent="space-between">
        <Button onClick={handlePreviousWeek} size="sm" variant="subtle">
          Poprzedni tydzień
        </Button>

        <Button onClick={handleToday} variant="subtle">
          Dzisiaj
        </Button>

        <Button onClick={handleNextWeek} variant="subtle">
          Następny tydzień
        </Button>
      </Flex>

      <Table.ScrollArea>
        <Table.Root>
          <Table.ColumnGroup>
            <Table.Column />
            {weekDays.map((_, index) => (
              <Table.Column
                key={index}
                htmlWidth={`${100 / weekDays.length}%`}
              />
            ))}
          </Table.ColumnGroup>

          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader></Table.ColumnHeader>

              {weekDays.map((date) => (
                <Table.ColumnHeader key={date.toLocaleDateString()}>
                  <Flex textAlign="center" flexDirection="column">
                    <Text>{dayjs(date).format("DD.MM")}</Text>
                    <Text
                      borderBottom={
                        dayjs().isSame(date, "day") ? "3px solid" : undefined
                      }
                      borderColor="orange.500"
                    >
                      {DAYS.PL[dayjs(date).day()]}
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
      </Table.ScrollArea>
    </Flex>
  );
};

import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetAllJobs } from "@/features/planner/api/useApi";
import { Button, Flex, IconButton, Table } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useState } from "react";
import { RiArchiveStackFill } from "react-icons/ri";

export const AllJobsDialogContent = () => {
  const { data } = useGetAllJobs();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Archiwalne taski</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>id</Table.ColumnHeader>
              <Table.ColumnHeader>data zajęć</Table.ColumnHeader>
              <Table.ColumnHeader>data taska</Table.ColumnHeader>
              <Table.ColumnHeader>status</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {data
              ?.sort((a, b) => a.id.localeCompare(b.id))
              .map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.class.classId}</Table.Cell>
                  <Table.Cell>{item.class.date}</Table.Cell>
                  <Table.Cell>
                    {dayjs
                      .unix(item.executionTimestamp / 1000)
                      .format("YYYY-MM-DD")}
                  </Table.Cell>
                  <Table.Cell>{item.state}</Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table.Root>
      </DialogBody>

      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button variant="outline">Zamknij</Button>
        </DialogActionTrigger>
      </DialogFooter>
      <DialogCloseTrigger />
    </DialogContent>
  );
};

export const AllJobsDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <DialogRoot lazyMount onOpenChange={(e) => setOpen(e.open)} open={open}>
      <DialogTrigger asChild>
        <Flex alignItems="end">
          <IconButton
            aria-label="Otwórz archiwalne taski"
            size="sm"
            variant="outline"
          >
            <RiArchiveStackFill />
          </IconButton>
        </Flex>

      </DialogTrigger>

      {open ? <AllJobsDialogContent /> : null}
    </DialogRoot>
  );
};

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
import { useGetUserHistory } from "@/features/planner/api/useApi";
import { Button, Flex, IconButton, Table } from "@chakra-ui/react";
import { useState } from "react";
import { FaClockRotateLeft } from "react-icons/fa6";

export const UserHistoryDialogContent = () => {
  const { data } = useGetUserHistory();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Wszystkie wizyty (page {data?.page}/{data?.pages})
        </DialogTitle>
      </DialogHeader>

      <DialogBody>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>data</Table.ColumnHeader>
              <Table.ColumnHeader>zajęcia</Table.ColumnHeader>
              <Table.ColumnHeader>lokalizacja</Table.ColumnHeader>
              <Table.ColumnHeader>obecność</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {data?.activities?.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.date}</Table.Cell>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.club.name}</Table.Cell>
                <Table.Cell>{item.has_attended ? "tak" : "nie"}</Table.Cell>
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

export const UserHistoryDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <DialogRoot
      lazyMount
      onOpenChange={(e) => setOpen(e.open)}
      open={open}
      size={{ mdDown: "full", md: "xl" }}
    >
      <DialogTrigger asChild>
        <Flex alignItems="end">
          <IconButton
            aria-label="Otwórz historię użytkownika"
            size="sm"
            variant="outline"
          >
            <FaClockRotateLeft />
          </IconButton>
        </Flex>
      </DialogTrigger>

      {open ? <UserHistoryDialogContent /> : null}
    </DialogRoot>
  );
};

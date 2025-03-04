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
import {
  bookOrCancelClass,
  useGetAllJobs,
} from "@/features/planner/api/useApi";
import { Job } from "@/storage/JobsStorage";
import { Button, Flex, IconButton, Table } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useState } from "react";
import { MdDelete } from "react-icons/md";
import { RiArchiveStackFill } from "react-icons/ri";

const AllJobsDialogTableRow = ({ job }: { job: Job }) => {
  const [cancelInProgress, setCancelInProgress] = useState(false);

  const handleCancel = () => {
    setCancelInProgress(true);

    void bookOrCancelClass(job.class.classId, job.class.date, "cancel").finally(
      () => {
        setCancelInProgress(false);
      },
    );
  };

  return (
    <Table.Row key={job.id}>
      <Table.Cell>{job.class.classId}</Table.Cell>

      <Table.Cell>{job.class.date}</Table.Cell>

      <Table.Cell>
        {dayjs.unix(job.executionTimestamp / 1000).format("YYYY-MM-DD HH:mm")}
      </Table.Cell>

      <Table.Cell>{job.state}</Table.Cell>

      <Table.Cell>
        {job.state === "scheduled" || job.state === "inProgress" ? (
          <IconButton
            size="xs"
            colorPalette="red"
            loading={cancelInProgress}
            onClick={handleCancel}
          >
            <MdDelete />
          </IconButton>
        ) : null}
      </Table.Cell>
    </Table.Row>
  );
};

const AllJobsDialogContent = () => {
  const { data } = useGetAllJobs();

  const sortedJobs = data?.sort(
    (a, b) => b.executionTimestamp - a.executionTimestamp,
  );

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
              <Table.ColumnHeader></Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {sortedJobs?.map((job) => <AllJobsDialogTableRow job={job} />)}
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
    <DialogRoot
      lazyMount
      onOpenChange={(e) => setOpen(e.open)}
      open={open}
      size={{ mdDown: "full", md: "xl" }}
    >
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

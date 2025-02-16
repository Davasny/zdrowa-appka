import { apiClient } from "@/features/planner/api/useApiClient";
import { queryClient } from "@/pages/_app";
import { Flex, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { MdOutlineRefresh } from "react-icons/md";

export const RefreshButton = () => {
  const [refreshInProgress, setRefreshInProgress] = useState(false);

  const handleRefresh = () => {
    setRefreshInProgress(true);

    apiClient
      .url("/reset-cache")
      .post()
      .res()
      .then(() => {
        queryClient
          .invalidateQueries({ queryKey: ["/find-classes"] })
          .then(() => {
            setRefreshInProgress(false);
          });
      });
  };

  return (
    <Flex alignItems="end">
      <IconButton
        aria-label="Refresh data"
        onClick={handleRefresh}
        size="sm"
        variant="outline"
        loading={refreshInProgress}
      >
        <MdOutlineRefresh />
      </IconButton>
    </Flex>
  );
};

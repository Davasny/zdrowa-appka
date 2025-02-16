import { Planner } from "@/features/planner/components/Planner";
import { Flex } from "@chakra-ui/react";

export default function Home() {
  return (
    <Flex maxW="1440px" w="100%" mx="auto" p={2}>
      <Planner />
    </Flex>
  );
}

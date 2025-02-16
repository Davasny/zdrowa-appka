import { Field } from "@/components/ui/field";
import { filterByNameAtom } from "@/features/planner/atoms/filterAtom";
import { Input } from "@chakra-ui/react";
import { useAtom } from "jotai/index";

export const FilterByName = () => {
  const [searchText, setSearchText] = useAtom(filterByNameAtom);

  return (
    <Field label="Szukaj">
      <Input
        placeholder="nazwa zajęć"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        size="sm"
      />
    </Field>
  );
};

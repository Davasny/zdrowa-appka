import { useAtom } from "jotai/index";
import { filterByNameAtom } from "@/features/planner/atoms/filterAtom";
import { Field } from "@/components/ui/field";
import { Input } from "@chakra-ui/react";

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

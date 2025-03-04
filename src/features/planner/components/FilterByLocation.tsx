import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { useGetClubs } from "@/features/planner/api/useApi";
import { filterByLocationAtom } from "@/features/planner/atoms/filterAtom";
import { createListCollection } from "@chakra-ui/react";
import { useAtom } from "jotai/index";

export const FilterByLocation = () => {
  const { data: clubs } = useGetClubs();

  const collection = createListCollection({
    items: (clubs || [])
      .map((c) => ({
        label: c.name,
        value: c.id.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  });

  const [filters, setFilters] = useAtom(filterByLocationAtom);

  return (
    <SelectRoot
      multiple
      collection={collection}
      size="sm"
      width="320px"
      value={filters.map(String)}
      onValueChange={(e) => setFilters(e.value.map(Number))}
    >
      <SelectTrigger>
        <SelectValueText placeholder="Club" />
      </SelectTrigger>

      <SelectContent>
        {collection.items.map((club) => (
          <SelectItem item={club} key={club.value}>
            {club.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

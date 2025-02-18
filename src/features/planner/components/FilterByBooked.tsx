import { Switch } from "@/components/ui/switch";
import { filterByBookedAtom } from "@/features/planner/atoms/filterAtom";
import { useAtom } from "jotai";

export const FilterByBooked = () => {
  const [filterByBooked, setFilterByBooked] = useAtom(filterByBookedAtom);

  return (
    <Switch
      checked={filterByBooked}
      onCheckedChange={(e) => setFilterByBooked(e.checked)}
      colorPalette="orange"
    >
      tylko zabookowane
    </Switch>
  );
};

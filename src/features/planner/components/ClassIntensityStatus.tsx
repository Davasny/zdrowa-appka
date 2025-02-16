import { ClassIntensity } from "@/zdrofit/types/classTypes";
import { Status } from "@chakra-ui/react";

export const ClassIntensityStatus = ({
  classIntensity,
}: {
  classIntensity: ClassIntensity | null;
}) => {
  let colorPalette = "";

  if (classIntensity) {
    switch (classIntensity.slug) {
      case "low":
        colorPalette = "green";
        break;
      case "medium":
        colorPalette = "yellow";
        break;
      case "high":
        colorPalette = "orange";
        break;
      case "extreme":
        colorPalette = "red";
        break;
    }
  }

  return (
    <Status.Root colorPalette={colorPalette}>
      <Status.Indicator />
      {classIntensity?.name || "-"}
    </Status.Root>
  );
};

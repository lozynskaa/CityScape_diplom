import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { format } from "date-fns";

type Props = {
  onSelect: (date: Date) => void;
  selectedDate?: Date | null;
  placeholder?: string;
  defaultYear?: number;
};

export default function DatePicker({
  onSelect,
  selectedDate,
  placeholder,
  defaultYear,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="h-9 w-full items-center justify-start"
          variant="outline"
        >
          <CalendarIcon />
          {selectedDate ? (
            format(selectedDate, "PPP")
          ) : (
            <span>{placeholder ?? "Pick a start date"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          toYear={defaultYear}
          mode="single"
          selected={selectedDate ?? undefined}
          onSelect={(date) => date && onSelect(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

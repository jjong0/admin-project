import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ListFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  statusValue: string;
  onStatusChange: (value: string) => void;
  statusLabels: Record<string, string>;
  statusWidth?: string;
  countLabel: string;
  children?: ReactNode;
};

export function ListFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  statusValue,
  onStatusChange,
  statusLabels,
  statusWidth = "w-32",
  countLabel,
  children,
}: ListFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:max-w-xs"
      />
      {children}
      <Select value={statusValue} onValueChange={(value) => onStatusChange(value ?? "all")}>
        <SelectTrigger className={statusWidth}>
          <SelectValue placeholder="상태">
            {(value: string) => (value === "all" ? "전체 상태" : statusLabels[value])}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          {Object.entries(statusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground sm:ml-auto">{countLabel}</span>
    </div>
  );
}

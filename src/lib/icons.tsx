import {
  AirVent,
  Building2,
  CircuitBoard,
  Cog,
  Droplets,
  FileCheck,
  Gauge,
  Grid3x3,
  Hammer,
  Network,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  Store,
  ThermometerSun,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const registry: Record<string, LucideIcon> = {
  AirVent,
  Building2,
  CircuitBoard,
  Cog,
  Droplets,
  FileCheck,
  Gauge,
  Grid3x3,
  Hammer,
  Network,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  Store,
  ThermometerSun,
  Wind,
  Wrench,
};

/** Render a service icon by registry name, falling back to a wrench. */
export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = registry[name] ?? Wrench;
  return <Icon className={className} aria-hidden />;
}

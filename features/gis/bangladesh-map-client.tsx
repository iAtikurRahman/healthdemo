"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const BangladeshMapClient = dynamic(
  () => import("./bangladesh-map").then((mod) => mod.BangladeshMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  }
);

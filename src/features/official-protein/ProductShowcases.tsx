"use client";

import goldStandardIsolateData from "@/data/gold-standard-isolate.json";
import platinumHydrowheyData from "@/data/platinum-hydrowhey.json";
import { hydrowheyPageContent, isolatePageContent } from "@/features/official-protein/content";
import { OfficialProteinShowcase, type OfficialProteinVariant } from "@/features/official-protein/OfficialProteinShowcase";

export function GoldStandardIsolateShowcase() {
  return <OfficialProteinShowcase
    variants={goldStandardIsolateData.variants as OfficialProteinVariant[]}
    content={isolatePageContent}
  />;
}

export function PlatinumHydrowheyShowcase() {
  return <OfficialProteinShowcase
    variants={platinumHydrowheyData.variants as OfficialProteinVariant[]}
    content={hydrowheyPageContent}
  />;
}

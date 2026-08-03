"use client";

import { domesticGoldStandardData } from "@/data/domestic-gold-standard-whey";
import goldStandardIsolateData from "@/data/gold-standard-isolate.json";
import { goldStandardPreWorkoutData, micronizedCreatineData } from "@/data/official-supplements";
import platinumHydrowheyData from "@/data/platinum-hydrowhey.json";
import {
  domesticGoldStandardPageContent,
  goldStandardPreWorkoutPageContent,
  hydrowheyPageContent,
  isolatePageContent,
  micronizedCreatinePageContent,
} from "@/features/official-protein/content";
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

export function DomesticGoldStandardShowcase() {
  return <OfficialProteinShowcase
    variants={domesticGoldStandardData.variants as OfficialProteinVariant[]}
    content={domesticGoldStandardPageContent}
  />;
}

export function MicronizedCreatineShowcase() {
  return <OfficialProteinShowcase
    variants={micronizedCreatineData.variants}
    content={micronizedCreatinePageContent}
  />;
}

export function GoldStandardPreWorkoutShowcase() {
  return <OfficialProteinShowcase
    variants={goldStandardPreWorkoutData.variants}
    content={goldStandardPreWorkoutPageContent}
  />;
}

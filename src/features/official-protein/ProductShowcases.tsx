import { chinaMadeGoldStandardVariants, generalTradeGoldStandardVariants } from "@/data/domestic-gold-standard-whey";
import goldStandardIsolateData from "@/data/gold-standard-isolate.json";
import { goldStandardPreWorkoutData, micronizedCreatineData } from "@/data/official-supplements";
import platinumHydrowheyData from "@/data/platinum-hydrowhey.json";
import {
  domesticGoldStandardPageContent,
  generalTradeGoldStandardPageContent,
  goldStandardPreWorkoutPageContent,
  hydrowheyPageContent,
  isolatePageContent,
  micronizedCreatinePageContent,
} from "@/features/official-protein/content";
import {
  OfficialProteinShowcase,
  type NutritionReference,
  type OfficialProteinVariant,
} from "@/features/official-protein/OfficialProteinShowcase";

type InternalVariant = Omit<OfficialProteinVariant, "nutritionReference"> & {
  variantId?: string;
  sku?: string;
  sourceStatus?: string;
  nutritionReference: (NutritionReference & { referenceNoteZh?: string | null }) | null;
};

const buyerVariants = (variants: InternalVariant[]): OfficialProteinVariant[] => variants.map((variant) => {
  const { variantId, sku, sourceStatus, nutritionReference, ...buyerVariant } = variant;
  void variantId;
  void sku;
  void sourceStatus;
  if (!nutritionReference) return { ...buyerVariant, nutritionReference: null };

  const { referenceNoteZh, ...buyerNutritionReference } = nutritionReference;
  void referenceNoteZh;
  return { ...buyerVariant, nutritionReference: buyerNutritionReference };
});

export function GoldStandardIsolateShowcase() {
  return <OfficialProteinShowcase
    variants={buyerVariants(goldStandardIsolateData.variants as InternalVariant[])}
    content={isolatePageContent}
  />;
}

export function PlatinumHydrowheyShowcase() {
  return <OfficialProteinShowcase
    variants={buyerVariants(platinumHydrowheyData.variants as InternalVariant[])}
    content={hydrowheyPageContent}
  />;
}

export function DomesticGoldStandardShowcase() {
  return <OfficialProteinShowcase
    variants={buyerVariants(chinaMadeGoldStandardVariants)}
    content={domesticGoldStandardPageContent}
  />;
}

export function GeneralTradeGoldStandardShowcase() {
  return <OfficialProteinShowcase
    variants={buyerVariants(generalTradeGoldStandardVariants)}
    content={generalTradeGoldStandardPageContent}
  />;
}

export function MicronizedCreatineShowcase() {
  return <OfficialProteinShowcase
    variants={buyerVariants(micronizedCreatineData.variants)}
    content={micronizedCreatinePageContent}
  />;
}

export function GoldStandardPreWorkoutShowcase() {
  return <OfficialProteinShowcase
    variants={buyerVariants(goldStandardPreWorkoutData.variants)}
    content={goldStandardPreWorkoutPageContent}
  />;
}

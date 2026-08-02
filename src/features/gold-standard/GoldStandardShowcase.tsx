"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import goldStandardData from "@/data/gold-standard-whey.json";
import { goldStandardTaobaoUrl } from "@/features/gold-standard/constants";
import { goldProductBenefits, goldProductFaqs, goldProductOverview, goldSuggestedUseNotes } from "@/features/gold-standard/content";

type ImageAsset = { src: string; width: number; height: number };
type NutritionReference = {
  flavoringEn: string;
  flavoringZh: string;
  servingsPerContainerZh: string;
  servingSizeZh: string | null;
  nutrientRows: Array<{
    key: string;
    labelEn: string;
    labelZh: string;
    amount: string;
    amountZh: string;
    dailyValue: string | null;
  }>;
  ingredientsZh: string | null;
  allergensEn: string | null;
  allergensZh: string | null;
  directionsZh: string | null;
  insignificantSourceZh: string | null;
  dailyValueNoteZh: string;
  claims: Array<{ labelEn: string; labelZh: string }>;
};
type GoldStandardVariant = {
  id: string;
  variantId: string;
  sku: string;
  size: "2 lb" | "5 lb";
  sizeLabel: string;
  flavor: string;
  flavorZh: string;
  availableOnOfficialSite: boolean;
  servingSize: string | null;
  servingsPerContainer: string;
  proteinPerServing: string;
  bcaaInformation: string;
  calories: number | null;
  ingredients: string | null;
  nutritionReference: NutritionReference | null;
  frontImage: ImageAsset;
  nutritionImage: ImageAsset | null;
};

const variants = goldStandardData.variants as GoldStandardVariant[];
const sizeOptions: GoldStandardVariant["size"][] = ["5 lb", "2 lb"];
const defaultVariant = variants.find((item) => item.size === "5 lb" && item.flavor === "Double Rich Chocolate") ?? variants[0];

export function GoldStandardShowcase() {
  const [selectedSize, setSelectedSize] = useState<GoldStandardVariant["size"]>(defaultVariant.size);
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant.id);

  const sizeVariants = useMemo(
    () => variants.filter((item) => item.size === selectedSize),
    [selectedSize],
  );
  const selectedVariant = variants.find((item) => item.id === selectedVariantId) ?? sizeVariants[0];

  const handleSizeChange = (size: GoldStandardVariant["size"]) => {
    const candidates = variants.filter((item) => item.size === size);
    const preferred = candidates.find((item) => item.flavor === "Double Rich Chocolate") ?? candidates[0];
    setSelectedSize(size);
    setSelectedVariantId(preferred.id);
  };

  return <>
    <section className="gold-selector-hero" id="gold-selector">
      <div className="container gold-selector-layout">
        <div className="gold-product-stage" aria-live="polite">
          <div className="gold-product-image">
            <Image
              key={selectedVariant.frontImage.src}
              src={selectedVariant.frontImage.src}
              alt={`ON 金标乳清 ${selectedVariant.sizeLabel} ${selectedVariant.flavorZh}（${selectedVariant.flavor}）官方产品图`}
              fill
              priority
              sizes="(max-width: 860px) 92vw, 48vw"
            />
          </div>
          <p className="gold-image-caption">{selectedVariant.sizeLabel} · {selectedVariant.flavorZh}</p>
        </div>

        <div className="gold-product-copy">
          <div className="eyebrow">OPTIMUM NUTRITION · GOLD STANDARD 100% WHEY</div>
          <h1>金标乳清蛋白粉</h1>
          <p className="gold-intro">选择规格和口味，页面会同步切换对应的官网产品图、营养标签与每份信息。</p>

          <div className="gold-selector-panel" aria-label="选择金标乳清规格与口味">
            <label>
              <span>规格</span>
              <select
                aria-label="金标规格"
                data-testid="gold-size-select"
                value={selectedSize}
                onChange={(event) => handleSizeChange(event.target.value as GoldStandardVariant["size"])}
              >
                {sizeOptions.map((size) => <option value={size} key={size}>
                  {size === "5 lb" ? "5 磅（2.27 千克）" : "2 磅（907 克）"} · {variants.filter((item) => item.size === size).length} 种口味
                </option>)}
              </select>
            </label>
            <label>
              <span>口味</span>
              <select aria-label="金标口味" data-testid="gold-flavor-select" value={selectedVariant.id} onChange={(event) => setSelectedVariantId(event.target.value)}>
                {sizeVariants.map((variant) => <option value={variant.id} key={variant.id}>
                  {variant.flavorZh} · {variant.flavor}{variant.availableOnOfficialSite ? "" : "（ON 官网暂不可售）"}
                </option>)}
              </select>
            </label>
          </div>

          <div className="gold-selection-summary" aria-live="polite">
            <div>
              <span>当前选择</span>
              <strong>{selectedVariant.sizeLabel} · {selectedVariant.flavorZh}</strong>
              <small>{selectedVariant.flavor}</small>
            </div>
            <span className={`gold-source-status${selectedVariant.availableOnOfficialSite ? "" : " is-unavailable"}`}>
              {selectedVariant.availableOnOfficialSite ? "ON 官网当前可选" : "ON 官网当前暂不可售"}
            </span>
          </div>

          <dl className="gold-facts">
            <div><dt>每份蛋白质</dt><dd>{selectedVariant.proteinPerServing}</dd></div>
            <div><dt>每份 BCAA</dt><dd>{selectedVariant.bcaaInformation.replace(" naturally occurring BCAAs per serving", "")}</dd></div>
            <div><dt>每份热量</dt><dd>{selectedVariant.calories === null ? "以标签为准" : `${selectedVariant.calories} kcal`}</dd></div>
            <div><dt>每桶份数</dt><dd>{selectedVariant.servingsPerContainer.replace(" Servings", " 份")}</dd></div>
          </dl>

          <p className="gold-serving">每份用量：{selectedVariant.servingSize || "ON 官网当前未提供，请以实际包装标签为准"}</p>
          <div className="actions actions-left gold-actions">
            <a className="btn" href={goldStandardTaobaoUrl} target="_blank" rel="noopener noreferrer">前往淘宝查看在售商品</a>
          </div>
          <p className="gold-role-note">ON 官网状态不等同于理想营养店铺库存；购买时请在淘宝商品页再次核对销售版本、规格和口味。</p>
        </div>
      </div>
    </section>

    <section className="gold-info-section" aria-labelledby="gold-information-title">
      <div className="container gold-info-layout">
        <header className="gold-info-heading">
          <div className="eyebrow">产品信息 · Product Information</div>
          <h2 id="gold-information-title">了解金标乳清</h2>
          <p>以下内容依据 ON 金标乳清官网产品说明及对应英文标签整理；具体配料、营养和使用方式以当前所选口味及实际到货包装为准。</p>
        </header>

        <div className="gold-info-accordions">
          <details open>
            <summary><span>产品概览<small>Product Overview</small></span></summary>
            <div className="gold-info-content">
              <h3>经典配方，便于纳入日常蛋白质补充</h3>
              {goldProductOverview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </details>

          <details open>
            <summary><span>产品特点<small>Benefits</small></span></summary>
            <div className="gold-info-content">
              <ul className="gold-benefit-list">
                {goldProductBenefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
              </ul>
            </div>
          </details>

          <details open>
            <summary><span>建议食用方式<small>Suggested Use</small></span></summary>
            <div className="gold-info-content gold-use-content">
              <div className="gold-use-current">
                <span>当前选择</span>
                <strong>{selectedVariant.sizeLabel} · {selectedVariant.flavorZh}</strong>
                <p>{selectedVariant.nutritionReference?.directionsZh || "ON 官网当前未提供这项组合的可核对冲调说明，请以实际包装标签为准。"}</p>
              </div>
              <ul>
                {goldSuggestedUseNotes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </div>
          </details>
        </div>
      </div>
    </section>

    <section className="gold-nutrition-section" id="nutritional-information">
      <div className="container gold-nutrition-layout">
        <div className="gold-nutrition-copy">
          <div className="eyebrow">营养信息 · Nutritional Information</div>
          <h2>对应营养成分标签</h2>
          <p>当前展示：<strong>{selectedVariant.sizeLabel} · {selectedVariant.flavorZh}</strong></p>
          <p className="muted">营养标签来自 ON 官网所选规格与口味的对应图片。切换上方选项后，这里会同步更新。</p>
          <details className="gold-ingredients" open>
            <summary>英文配料原文</summary>
            <p>{selectedVariant.ingredients || "官网当前没有提供可核对的配料文本，请以实际到货包装标签为准。"}</p>
          </details>
          <div className="notice">标签内容可能因销售地区和包装版本不同而变化。理想营养页面用于选购核对，最终以淘宝订单页面和实际到货标签为准。</div>
        </div>

        <div className="gold-label-stack" aria-live="polite">
          <div className="gold-nutrition-stage">
            {selectedVariant.nutritionImage ? <Image
              key={selectedVariant.nutritionImage.src}
              className="gold-nutrition-image"
              src={selectedVariant.nutritionImage.src}
              alt={`ON 金标乳清 ${selectedVariant.sizeLabel} ${selectedVariant.flavorZh} 官方营养成分标签`}
              width={selectedVariant.nutritionImage.width}
              height={selectedVariant.nutritionImage.height}
              sizes="(max-width: 860px) 92vw, 56vw"
            /> : <div className="gold-nutrition-missing">
              <strong>ON 官网当前未提供这项组合的营养标签图片</strong>
              <p>我们没有套用其他口味的标签，也没有自行生成数据。请以实际包装标签为准。</p>
            </div>}
          </div>

          {selectedVariant.nutritionReference ? <article className="gold-translation-card">
            <header className="gold-translation-header">
              <div>
                <span className="gold-reference-badge">仅供参考</span>
                <h3>中文标签对照</h3>
              </div>
              <p>根据上方英文官网标签整理翻译；营养、配料及过敏原信息请以英文原标签和实际到货包装为准。</p>
            </header>

            <dl className="gold-label-summary">
              <div><dt>口味 <small>Flavor</small></dt><dd>{selectedVariant.flavorZh}<small>{selectedVariant.flavor}</small></dd></div>
              <div><dt>调味方式 <small>Flavoring</small></dt><dd>{selectedVariant.nutritionReference.flavoringZh}<small>{selectedVariant.nutritionReference.flavoringEn}</small></dd></div>
              <div><dt>每桶份数 <small>Servings per container</small></dt><dd>{selectedVariant.nutritionReference.servingsPerContainerZh}</dd></div>
              <div><dt>每份用量 <small>Serving size</small></dt><dd>{selectedVariant.nutritionReference.servingSizeZh || "请以包装为准"}<small>{selectedVariant.servingSize}</small></dd></div>
            </dl>

            <div className="gold-table-scroll">
              <table className="gold-nutrient-table">
                <thead><tr><th>营养项目 <small>Nutrition Facts</small></th><th>每份含量 <small>Amount per serving</small></th><th>每日参考值 <small>% Daily Value</small></th></tr></thead>
                <tbody>
                  <tr><th>热量 <small>Calories</small></th><td>{selectedVariant.calories === null ? "—" : `${selectedVariant.calories} 千卡`}</td><td>—</td></tr>
                  {selectedVariant.nutritionReference.nutrientRows.map((row) => <tr key={row.key}>
                    <th>{row.labelZh}<small>{row.labelEn}</small></th>
                    <td>{row.amountZh}</td>
                    <td>{row.dailyValue || "—"}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>

            <div className="gold-label-sections">
              <section>
                <h4>配料 <small>Ingredients</small></h4>
                <p>{selectedVariant.nutritionReference.ingredientsZh || "暂无可核对的中文配料对照。"}</p>
                <details><summary>查看英文配料原文</summary><p lang="en">{selectedVariant.ingredients}</p></details>
              </section>
              <section>
                <h4>过敏原 <small>Contains</small></h4>
                <p>{selectedVariant.nutritionReference.allergensZh || "请查看英文原标签。"}</p>
                {selectedVariant.nutritionReference.allergensEn ? <p className="gold-label-original" lang="en">{selectedVariant.nutritionReference.allergensEn}</p> : null}
              </section>
              <section>
                <h4>冲调方式 <small>Directions</small></h4>
                <p>{selectedVariant.nutritionReference.directionsZh || "请以实际包装说明为准。"}</p>
              </section>
              <section>
                <h4>标签声明 <small>Label claims</small></h4>
                <ul>{selectedVariant.nutritionReference.claims.map((claim) => <li key={claim.labelEn}>{claim.labelZh}<small>{claim.labelEn}</small></li>)}</ul>
              </section>
            </div>

            <footer className="gold-translation-notes">
              {selectedVariant.nutritionReference.insignificantSourceZh ? <p>{selectedVariant.nutritionReference.insignificantSourceZh}</p> : null}
              <p>{selectedVariant.nutritionReference.dailyValueNoteZh}</p>
              <strong>中文内容仅供阅读参考，不作为商品标签或购买承诺。</strong>
            </footer>
          </article> : <div className="gold-translation-missing">
            <span className="gold-reference-badge">仅供参考</span>
            <strong>暂无可核对的中文标签对照</strong>
            <p>ON 官网没有提供这项组合的英文营养标签，因此未制作翻译，也未套用其他口味资料。</p>
          </div>}
        </div>
      </div>
    </section>

    <section className="gold-faq-section" aria-labelledby="gold-faq-title">
      <div className="container gold-faq-layout">
        <header className="gold-faq-heading">
          <div className="eyebrow">常见问题 · FAQ</div>
          <h2 id="gold-faq-title">购买与收货常见问题</h2>
          <p>从量勺、桶身和粉末状态，到防伪、版本与保存方式，先在这里快速核对。</p>
        </header>

        <div className="gold-faq-list">
          {goldProductFaqs.map((faq, index) => <details key={faq.question} open={index === 0}>
            <summary>
              <span className="gold-faq-number">{String(index + 1).padStart(2, "0")}</span>
              <span>{faq.question}</span>
            </summary>
            <div className="gold-faq-answer">
              <p>{faq.answer}</p>
              {faq.href && faq.linkLabel ? <a href={faq.href}>{faq.linkLabel}<span aria-hidden="true"> →</span></a> : null}
            </div>
          </details>)}
        </div>

        <div className="gold-faq-note">如包装存在开裂、漏粉、封签异常、明显受潮或异味，请勿继续食用；保留商品、外箱、订单和照片后提交售后登记。</div>
      </div>
    </section>
  </>;
}

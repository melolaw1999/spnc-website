"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { TaobaoButton } from "@/components/TaobaoButton";
import type { ProteinPageContent } from "@/features/official-protein/content";

type ImageAsset = { src: string; width: number; height: number };

type NutritionReference = {
  flavoringEn: string;
  flavoringZh: string;
  servingsPerContainerZh: string;
  servingSizeZh: string | null;
  referenceNoteZh: string | null;
  nutrientRows: Array<{
    key: string;
    labelEn: string;
    labelZh: string;
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

export type OfficialProteinVariant = {
  id: string;
  variantId: string;
  sku: string;
  sizeGroup: string;
  sizeGroupLabel: string;
  size: string;
  sizeLabel: string;
  flavor: string;
  flavorZh: string;
  availableOnOfficialSite: boolean;
  sourceStatus: string;
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

const metricAmount = (value: string) => value.match(/[\d.]+\s*g/i)?.[0] ?? value;

export function OfficialProteinShowcase({
  variants,
  content,
}: {
  variants: OfficialProteinVariant[];
  content: ProteinPageContent;
}) {
  const defaultVariant = variants.find((item) => item.id === content.defaultVariantId) ?? variants[0];
  const [selectedSize, setSelectedSize] = useState<OfficialProteinVariant["sizeGroup"]>(defaultVariant.sizeGroup);
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant.id);
  const sizeOptions = useMemo(
    () => Array.from(new Map(variants.map((item) => [item.sizeGroup, item.sizeGroupLabel])).entries()),
    [variants],
  );

  const sizeVariants = useMemo(
    () => variants.filter((item) => item.sizeGroup === selectedSize),
    [selectedSize, variants],
  );
  const selectedVariant = variants.find((item) => item.id === selectedVariantId) ?? sizeVariants[0];

  const handleSizeChange = (size: OfficialProteinVariant["sizeGroup"]) => {
    const candidates = variants.filter((item) => item.sizeGroup === size);
    const sameFlavor = candidates.find((item) => item.flavor === selectedVariant.flavor);
    const nextVariant = sameFlavor ?? candidates[0];
    setSelectedSize(size);
    setSelectedVariantId(nextVariant.id);
  };

  return <>
    <section className="gold-selector-hero" id={`${content.slug}-selector`}>
      <div className="container gold-selector-layout">
        <div className="gold-product-stage" aria-live="polite">
          <div className="gold-product-image">
            <Image
              key={selectedVariant.frontImage.src}
              src={selectedVariant.frontImage.src}
              alt={`${content.productAltNameZh} ${selectedVariant.sizeLabel} ${selectedVariant.flavorZh}（${selectedVariant.flavor}）产品图`}
              fill
              priority
              sizes="(max-width: 860px) 92vw, 48vw"
            />
            <span
              className="gold-product-lighting"
              style={{
                WebkitMaskImage: `url("${selectedVariant.frontImage.src}")`,
                maskImage: `url("${selectedVariant.frontImage.src}")`,
              }}
              aria-hidden="true"
            />
          </div>
          <p className="gold-image-caption">{selectedVariant.sizeLabel} · {selectedVariant.flavorZh}</p>
        </div>

        <div className="gold-product-copy">
          <div className="eyebrow">{content.eyebrow}</div>
          <h1 aria-label={content.productNameZh}>
            {content.productNameLines
              ? content.productNameLines.map((line) => <span key={line}>{line}</span>)
              : content.productNameZh}
          </h1>
          <p className="gold-intro">{content.intro}</p>

          <div className="gold-selector-panel" aria-label={content.selectorAria}>
            <label>
              <span>规格</span>
              <select
                aria-label={`${content.productNameZh}规格`}
                data-testid={`${content.slug}-size-select`}
                value={selectedSize}
                onChange={(event) => handleSizeChange(event.target.value as OfficialProteinVariant["sizeGroup"])}
              >
                {sizeOptions.map(([size, label]) => {
                  const group = variants.filter((item) => item.sizeGroup === size);
                  return <option value={size} key={size}>{label} · {group.length} 种口味</option>;
                })}
              </select>
            </label>
            <label>
              <span>口味</span>
              <select
                aria-label={`${content.productNameZh}口味`}
                data-testid={`${content.slug}-flavor-select`}
                value={selectedVariant.id}
                onChange={(event) => setSelectedVariantId(event.target.value)}
              >
                {sizeVariants.map((variant) => <option value={variant.id} key={variant.id}>
                  {variant.flavorZh} · {variant.flavor} · {variant.size}
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
          </div>
          <p className="gold-source-status"><strong>资料状态：</strong>{selectedVariant.sourceStatus}</p>

          <dl className="gold-facts">
            <div><dt>每份蛋白质</dt><dd>{metricAmount(selectedVariant.proteinPerServing)}</dd></div>
            <div><dt>每份 BCAA</dt><dd>{metricAmount(selectedVariant.bcaaInformation)}</dd></div>
            <div><dt>每份热量</dt><dd>{selectedVariant.calories === null ? "以标签为准" : `${selectedVariant.calories} kcal`}</dd></div>
            <div><dt>每桶份数</dt><dd>{selectedVariant.servingsPerContainer.replace(" Servings", " 份")}</dd></div>
          </dl>
          {content.factsNote ? <p className="gold-facts-note">{content.factsNote}</p> : null}

          <p className="gold-serving">每份用量：{selectedVariant.servingSize || "请以实际包装标签为准"}</p>
          <div className="actions actions-left gold-actions">
            <TaobaoButton label="前往淘宝店查看在售商品" />
          </div>
          <p className="gold-role-note">区域资料状态不等同于理想营养店铺库存；购买时请在淘宝商品页再次核对销售版本、规格和口味。</p>
        </div>
      </div>
    </section>

    <section className="gold-info-section" aria-labelledby={`${content.slug}-information-title`}>
      <div className="container gold-info-layout">
        <header className="gold-info-heading">
          <div className="eyebrow">产品信息 · Product Information</div>
          <h2 id={`${content.slug}-information-title`}>{content.infoTitle}</h2>
          <p>{content.infoIntro}</p>
        </header>

        <div className="gold-info-accordions">
          <details open>
            <summary><span>产品概览<small>Product Overview</small></span></summary>
            <div className="gold-info-content">
              <h3>{content.overviewTitle}</h3>
              {content.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </details>

          <details open>
            <summary><span>产品特点<small>Benefits</small></span></summary>
            <div className="gold-info-content">
              <ul className="gold-benefit-list">
                {content.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
              </ul>
            </div>
          </details>

          <details open>
            <summary><span>建议食用方式<small>Suggested Use</small></span></summary>
            <div className="gold-info-content gold-use-content">
              <div className="gold-use-current">
                <span>当前选择</span>
                <strong>{selectedVariant.sizeLabel} · {selectedVariant.flavorZh}</strong>
                <p>{selectedVariant.nutritionReference?.directionsZh || "当前没有可核对的冲调说明，请以实际包装标签为准。"}</p>
              </div>
              <ul>{content.suggestedUseNotes.map((note) => <li key={note}>{note}</li>)}</ul>
            </div>
          </details>
        </div>
      </div>
    </section>

    <section className="gold-nutrition-section" id={`${content.slug}-nutritional-information`}>
      <div className="container gold-nutrition-layout">
        <div className="gold-nutrition-copy">
          <div className="eyebrow">营养信息 · Nutritional Information</div>
          <h2>{content.nutritionTitle || "对应营养成分标签"}</h2>
          <p>当前展示：<strong>{selectedVariant.sizeLabel} · {selectedVariant.flavorZh}</strong></p>
          <p className="muted">{content.nutritionIntro || "切换上方选项后，这里会同步更新。标签原图与中文对照均注明资料状态，不同地区规格不会混用其他规格的标签。"}</p>
          <details className="gold-ingredients" open>
            <summary>英文配料原文</summary>
            <p>{selectedVariant.ingredients || "当前没有可核对的配料文本，请以实际到货包装标签为准。"}</p>
          </details>
          <div className="notice">标签内容可能因销售地区和包装版本不同而变化。理想营养页面用于选购核对，最终以淘宝订单页面和实际到货标签为准。</div>
        </div>

        <div className="gold-label-stack" aria-live="polite">
          <div className={`gold-nutrition-stage${selectedVariant.nutritionImage ? "" : " is-missing"}`}>
            {selectedVariant.nutritionImage ? <Image
              key={selectedVariant.nutritionImage.src}
              className="gold-nutrition-image"
              src={selectedVariant.nutritionImage.src}
              alt={`${content.productAltNameZh} ${selectedVariant.sizeLabel} ${selectedVariant.flavorZh} 英文营养标签资料`}
              width={selectedVariant.nutritionImage.width}
              height={selectedVariant.nutritionImage.height}
              sizes="(max-width: 860px) 92vw, 56vw"
            /> : <div className="gold-nutrition-missing">
              <strong>当前资料来源未公开这项组合的独立营养标签图</strong>
              <p>没有套用其他规格的标签图片。下方中文每份数据会说明核对来源，购买时仍请以实际包装为准。</p>
            </div>}
          </div>

          {selectedVariant.nutritionReference ? <article className="gold-translation-card">
            <header className="gold-translation-header">
              <div>
                <span className="gold-reference-badge">仅供参考</span>
                <h3>{content.translationTitle || "中文标签对照"}</h3>
              </div>
              <p>根据上方英文标签或已注明的同口味资料整理翻译；营养、配料及过敏原信息请以英文原标签和实际到货包装为准。</p>
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
              {selectedVariant.nutritionReference.referenceNoteZh ? <p><strong>资料状态：</strong>{selectedVariant.nutritionReference.referenceNoteZh}</p> : null}
              {selectedVariant.nutritionReference.insignificantSourceZh ? <p>{selectedVariant.nutritionReference.insignificantSourceZh}</p> : null}
              <p>{selectedVariant.nutritionReference.dailyValueNoteZh}</p>
              <strong>中文内容仅供阅读参考，不作为商品标签或购买承诺。</strong>
            </footer>
          </article> : null}
        </div>
      </div>
    </section>

    <section className="gold-faq-section" aria-labelledby={`${content.slug}-faq-title`}>
      <div className="container gold-faq-layout">
        <header className="gold-faq-heading">
          <div className="eyebrow">常见问题 · FAQ</div>
          <h2 id={`${content.slug}-faq-title`}>购买与收货常见问题</h2>
          <p>从量勺、桶身和粉末状态，到防伪、版本与保存方式，先在这里快速核对。</p>
        </header>

        <div className="gold-faq-list">
          {content.faqs.map((faq, index) => <details key={faq.question} open={index === 0}>
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

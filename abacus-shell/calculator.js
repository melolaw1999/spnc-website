// Business reference data is loaded from the private API.
    const sfRates = window.AbacusData.sfRates;
    function sfParcelFee(weight, region) {
      if (!Number.isFinite(weight) || weight <= 0) return null;
      const r = (sfRates[region] || sfRates[1]).rates;
      return weight <= 1 ? r[0] : weight <= 2 ? r[1] : weight <= 3 ? r[2] : r[3] + (Math.ceil(weight) - 1) * r[4];
    }
    function sfQuote(p, v, split) {
      const parcels = split ? p.cases : 1;
      const perParcel = sfParcelFee(Number(v.sfWeight) / parcels, Number(v.sfRegion));
      return perParcel === null ? null : Math.round(perParcel * parcels * (1 + Number(v.sfTax) / 100) * 100) / 100;
    }
    const freightProvinces = sfRates.flatMap(function(r) { return r.name.split("/"); });
    // Carrier prices belong to the private snapshot, never the application bundle.
    function validFreightNumbers(value, fields) {
      return value && fields.every(function(field) { return typeof value[field] === "number" && Number.isFinite(value[field]) && value[field] >= 0; });
    }
    function ordinaryParcelFee(carrier, weight, province) {
      if (!Number.isFinite(weight) || weight <= 0) return null;
      const region = sfRates.findIndex(function(r) { return r.name.split("/").includes(province); });
      const rates = region < 0 ? null : sfRates[region].ordinaryRates;
      const quote = rates && Object.prototype.hasOwnProperty.call(rates, province) ? rates[province] : null;
      if (carrier === "yunda") {
        const r = quote && quote.yunda;
        if (!validFreightNumbers(r, ["minWeightExclusive", "baseFee", "perKgFee"]) || weight <= r.minWeightExclusive) return null;
        return r.baseFee + Math.ceil(weight) * r.perKgFee;
      }
      if (carrier === "yto") {
        const r = quote && quote.yto;
        if (!r || !validFreightNumbers(r.small, ["maxWeight", "firstWeight", "stepsPerKg", "firstFee", "stepFee"]) ||
            !validFreightNumbers(r.large, ["firstKg", "firstFee", "perKgFee"]) ||
            r.small.maxWeight <= 0 || r.small.stepsPerKg <= 0 || r.small.firstWeight > r.small.maxWeight || r.large.firstKg > Math.ceil(r.small.maxWeight)) return null;
        if (weight <= r.small.maxWeight) return Math.round((r.small.firstFee + Math.max(0, Math.ceil((weight - r.small.firstWeight) * r.small.stepsPerKg - 1e-9)) * r.small.stepFee) * 100) / 100;
        return r.large.firstFee + (Math.ceil(weight) - r.large.firstKg) * r.large.perKgFee;
      }
      return sfParcelFee(weight, region);
    }
    function freightQuote(p, v, carrier) {
      const parcels = Number(v.sfSplit) ? p.cases : 1;
      const fee = ordinaryParcelFee(carrier, Number(v.sfWeight) / parcels, v.freightProvince);
      if (fee === null || v.freightHandling === null || v.freightHandling === undefined || String(v.freightHandling).trim() === "" || !Number.isFinite(Number(v.freightHandling)) || Number(v.freightHandling) < 0) return null;
      const courier = Math.round(fee * parcels * 100) / 100;
      return {carrier, courier, handling:Number(v.freightHandling), total:Math.round((courier + Number(v.freightHandling)) * (1 + Number(v.sfTax) / 100) * 100) / 100};
    }
    function chosenFreight(p, v) {
      if (v.freightCarrier !== "auto") return freightQuote(p, v, v.freightCarrier);
      if (p.cases === 1) return freightQuote(p, v, "sf");
      return [freightQuote(p, v, "yto"), freightQuote(p, v, "yunda")].filter(Boolean).sort(function(a,b) { return a.total - b.total; })[0] || null;
    }
    const freightNames = {sf:"顺丰",yto:"圆通",yunda:"韵达"};
    function escapeHtml(x) {return String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const products = window.AbacusData.products;

    const state = {
      selectedId: "cb-5lb-double",
      filter: "all",
      adMode: "direct",
      values: {}
    };

    const ids = ["price","cost","fx","shipping","taxRate","platformRate","couponRate","coinRate","platformCoin","platformCoinHit","adSpend","roi","paymentFee","otherFee","targetProfit"];
    const planFields = ["planAction","planQty","planPrice","planPriority","planDate","planNote"];
    const planStoreKey = "black-abacus-sku-plans-v1";
    const archiveStoreKey = "black-abacus-sku-archives-v1";
    const defaultPlans = window.AbacusData.defaultPlans;
    let skuPlans = loadPlans();
    let skuArchives = loadArchives();
    const els = {};
    ids.forEach(function(id) {
      els[id] = document.getElementById(id);
      els[id + "Num"] = document.getElementById(id + "Num");
    });

    function yuan(n) {
      if (!isFinite(n)) return "-";
      return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function pct(n) {
      if (!isFinite(n)) return "-";
      return n.toFixed(1) + "%";
    }

    function clamp(n, min, max) {
      return Math.min(max, Math.max(min, n));
    }

    function product() {
      return products.find(function(p) { return p.id === state.selectedId; }) || products[0];
    }

    function loadPlans() {
      try {
        const raw = window.AbacusStore.getItem(planStoreKey);
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.warn("读取 SKU 便签失败", err);
      }
      return Object.assign({}, defaultPlans);
    }

    function savePlans() {
      try {
        window.AbacusStore.setItem(planStoreKey, JSON.stringify(skuPlans));
      } catch (err) {
        console.warn("保存 SKU 便签失败", err);
      }
    }

    function loadArchives() {
      try {
        const raw = window.AbacusStore.getItem(archiveStoreKey);
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.warn("读取测算存档失败", err);
      }
      return {};
    }

    function saveArchives() {
      try {
        window.AbacusStore.setItem(archiveStoreKey, JSON.stringify(skuArchives));
      } catch (err) {
        console.warn("保存测算存档失败", err);
      }
    }

    function currentArchives() {
      const p = product();
      if (!Array.isArray(skuArchives[p.id])) skuArchives[p.id] = [];
      return skuArchives[p.id];
    }

    function cloneData(value) {
      return JSON.parse(JSON.stringify(value || {}));
    }

    function currentPlan() {
      const p = product();
      if (!skuPlans[p.id]) skuPlans[p.id] = {};
      return skuPlans[p.id];
    }

    function hasPlan(plan) {
      return planFields.some(function(key) {
        return String((plan || {})[key] || "").trim() !== "";
      });
    }

    function setPlanValue(key, val) {
      if (!window.AbacusSync.canWrite()) return;
      const plan = currentPlan();
      plan[key] = val;
      savePlans();
    }

    function defaultsFor(p) {
      const handling = sfRates[0] && sfRates[0].handlingRate;
      const handlingKnown = validFreightNumbers(handling, ["base", "includedCases", "additional"]) && Number.isInteger(handling.includedCases);
      return {
        price: p.price,
        cost: p.cost,
        fx: 6.8,
        shipping: p.shipping,
        shippingConfirmed: !p.cases,
        sfRegion: 1,
        sfWeight: p.cases ? p.cases * 1.8 : 0,
        sfSplit: 0,
        sfTax: 0,
        sfAuto: Boolean(p.cases),
        freightProvince: "浙江",
        freightCarrier: "auto",
        freightHandling: p.cases ? (handlingKnown ? handling.base + Math.max(0, p.cases - handling.includedCases) * handling.additional : null) : 0,
        taxRate: p.tax,
        platformRate: p.platform,
        couponRate: 0,
        coinRate: 0,
        platformCoin: 0,
        platformCoinHit: 0,
        adSpend: 0,
        roi: 20,
        paymentFee: 0,
        otherFee: 0,
        targetProfit: 20
      };
    }

    function getValues() {
      const p = product();
      const base = defaultsFor(p);
      const custom = state.values[p.id] || {};
      const values = Object.assign({}, base, custom);
      if (custom.freightProvince === undefined && custom.sfRegion !== undefined) values.freightProvince = (sfRates[custom.sfRegion] || sfRates[1]).name.split("/")[0];
      if (custom.freightCarrier === undefined && custom.sfAuto !== undefined) { values.freightCarrier = "sf"; values.freightHandling = 0; } // 恢复旧顺丰存档时保留当时口径。
      // 兼容此前手填运费的存档，不自动覆盖历史手动测算。
      if (p.cases && Object.prototype.hasOwnProperty.call(custom, "shipping") && custom.sfAuto === undefined) values.sfAuto = false;
      if (p.cases && values.sfAuto) {
        const quote = chosenFreight(p, values);
        values.shipping = quote === null ? 0 : quote.total;
        values.shippingConfirmed = quote !== null;
      }
      return values;
    }

    function setValue(key, val) {
      const p = product();
      const previousFreight = p.cases && key === "shipping" ? getValues() : null;
      if (!state.values[p.id]) state.values[p.id] = {};
      state.values[p.id][key] = ["freightProvince","freightCarrier"].includes(key) ? val : key === "freightHandling" && (val === null || val === undefined || String(val).trim() === "") ? null : Number(val);
      if (p.cases && key === "shipping") {
        state.values[p.id].freightProvince = previousFreight.freightProvince;
        state.values[p.id].freightCarrier = previousFreight.freightCarrier;
        state.values[p.id].freightHandling = previousFreight.freightHandling;
        state.values[p.id].sfAuto = false;
        state.values[p.id].shippingConfirmed = String(val).trim() !== "" && Number.isFinite(Number(val)) && Number(val) >= 0;
      }
    }

    function costRmb(p, v) {
      return p.costType === "usd" ? v.cost * v.fx : v.cost;
    }

    function calcWith(overrides) {
      const p = product();
      const v = Object.assign({}, getValues(), overrides || {});
      const price = v.price;
      const merchantDiscount = price * ((v.couponRate + v.coinRate) / 100);
      const revenue = price - merchantDiscount;
      const buyerDiscount = price * ((v.couponRate + v.coinRate + (v.platformCoin * v.platformCoinHit / 100)) / 100);
      const buyerPrice = Math.max(0, price - buyerDiscount);
      const purchase = costRmb(p, v);
      const tax = price * v.taxRate / 100;
      const platform = revenue * v.platformRate / 100;
      const ad = state.adMode === "roi" ? (v.roi > 0 ? buyerPrice / v.roi : 0) : v.adSpend;
      const totalCost = purchase + tax + platform + v.shipping + ad + v.paymentFee + v.otherFee;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? profit / revenue * 100 : 0;
      const noAdProfit = revenue - (purchase + tax + platform + v.shipping + v.paymentFee + v.otherFee);
      const maxAdForTarget = noAdProfit - v.targetProfit;
      const risk = p.cases && !v.shippingConfirmed ? "待填运费" : profit < 0 ? "亏损" : profit < 15 ? "危险" : profit < 40 ? "偏紧" : "健康";
      return { p, v, price, revenue, buyerPrice, purchase, tax, platform, ad, totalCost, profit, margin, noAdProfit, maxAdForTarget, risk };
    }

    function breakEvenPrice() {
      let lo = 1;
      let hi = 2000;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        const c = calcWith({ price: mid });
        if (c.profit >= 0) hi = mid;
        else lo = mid;
      }
      return hi;
    }

    function renderList() {
      const q = document.getElementById("searchInput").value.trim().toLowerCase();
      const wrap = document.getElementById("skuList");
      const filtered = products.filter(function(p) {
        if (p.legacy && !hasPlan(skuPlans[p.id]) && !(skuArchives[p.id] || []).length) return false;
        const passFilter = state.filter === "all" || p.group === state.filter || p.family === state.filter;
        const text = (p.name + " " + p.barcode + " " + (p.goodsId || "") + " " + (p.goodsCode || "") + " " + p.flavor + " " + p.spec).toLowerCase();
        return passFilter && (!q || text.indexOf(q) >= 0);
      });
      wrap.innerHTML = "";
      filtered.forEach(function(p) {
        const plan = skuPlans[p.id] || {};
        const planText = hasPlan(plan) ? " · 有计划" : "";
        const archiveCount = Array.isArray(skuArchives[p.id]) ? skuArchives[p.id].length : 0;
        const archiveText = archiveCount ? " · " + archiveCount + "条存档" : "";
        const btn = document.createElement("button");
        btn.className = "sku-btn" + (p.id === state.selectedId ? " active" : "");
        const goodsMeta = p.goodsCode ? ' · ' + p.goodsCode : '';
        const costTag = p.cost > 0 ? (p.costType === "usd" ? "$" : "¥") + p.cost : "待填成本";
        btn.innerHTML = '<div><div class="sku-title">' + escapeHtml(p.name) + '</div><div class="sku-meta">' + escapeHtml(p.barcode) + escapeHtml(goodsMeta) + ' · ' + escapeHtml(p.spec) + ' · ' + escapeHtml(p.note) + planText + archiveText + '</div></div><span class="tag">' + escapeHtml(costTag) + '</span>';
        btn.addEventListener("click", function() {
          state.selectedId = p.id;
          document.getElementById("archiveName").value = "";
          syncInputs();
          syncPlanInputs();
          render();
        });
        wrap.appendChild(btn);
      });
      if (!filtered.length) {
        wrap.innerHTML = '<div class="small" style="padding:14px;">没有匹配的 SKU。</div>';
      }
    }

    function setRangeMaxes(v) {
      els.price.min = product().cases ? 0 : 99;
      els.price.max = Math.max(999, Math.ceil(v.price * 1.6));
      els.cost.max = Math.max(900, Math.ceil(v.cost * 1.5));
      els.shipping.max = Math.max(35, Math.ceil(v.shipping));
    }

    function syncPair(key) {
      const values = getValues();
      const v = values[key];
      if (els[key]) els[key].value = v;
      if (els[key + "Num"]) els[key + "Num"].value = key === "shipping" && product().cases && !values.shippingConfirmed ? "" : v;
      if (key === "shipping") els.shippingNum.placeholder = product().cases ? "待填（元/订单）" : "";
    }

    function syncInputs() {
      const v = getValues();
      setRangeMaxes(v);
      ids.forEach(syncPair);
      ["freightProvince", "freightCarrier", "freightHandling", "sfWeight", "sfSplit", "sfTax"].forEach(function(key) { document.getElementById(key).value = v[key]; });
      document.getElementById("sfSplit").disabled = product().cases === 1;
      document.getElementById("roiControl").style.display = state.adMode === "roi" ? "block" : "none";
      document.getElementById("adSpendControl").style.display = state.adMode === "direct" ? "block" : "none";
      document.getElementById("directMode").classList.toggle("active", state.adMode === "direct");
      document.getElementById("roiMode").classList.toggle("active", state.adMode === "roi");
    }

    function syncPlanInputs() {
      const plan = currentPlan();
      planFields.forEach(function(key) {
        const el = document.getElementById(key);
        if (el) el.value = plan[key] || "";
      });
      renderPlanSummary();
    }

    function renderPlanSummary() {
      const plan = currentPlan();
      const summary = document.getElementById("planSummary");
      if (!hasPlan(plan)) {
        summary.textContent = "本品还没有便签。";
        return;
      }
      const parts = [];
      if (plan.planAction) parts.push("动作：" + plan.planAction);
      if (plan.planQty) parts.push("计划：" + plan.planQty + " 件");
      if (plan.planPrice) {
        const targetPrice = Number(plan.planPrice);
        if (targetPrice > 0) {
          const c = calcWith({ price: targetPrice });
          parts.push("目标售价 ¥" + yuan(targetPrice));
          parts.push("目标价净利 ¥" + yuan(c.profit));
        }
      }
      if (plan.planPriority) parts.push("优先级：" + plan.planPriority);
      if (plan.planDate) parts.push("节点：" + plan.planDate);
      if (plan.planNote) parts.push("提醒：" + plan.planNote);
      summary.textContent = parts.join(" · ");
    }

    function renderArchiveList() {
      const wrap = document.getElementById("archiveList");
      const archives = currentArchives();
      wrap.innerHTML = "";
      if (!archives.length) {
        const empty = document.createElement("div");
        empty.className = "archive-empty";
        empty.textContent = "本品还没有保存过测算。调好参数后，给它起个名字再保存。";
        wrap.appendChild(empty);
        return;
      }
      archives.slice().reverse().forEach(function(record) {
        const item = document.createElement("div");
        item.className = "archive-item";

        const title = document.createElement("div");
        const name = document.createElement("div");
        name.className = "archive-item-name";
        name.textContent = record.name;
        const time = document.createElement("div");
        time.className = "archive-item-time";
        time.textContent = record.createdAt;
        title.appendChild(name);
        title.appendChild(time);

        const details = document.createElement("div");
        details.className = "archive-metrics";
        const v = record.values || {};
        const result = record.result || {};
        const costPrefix = product().costType === "usd" ? "$" : "¥";
        details.innerHTML = "售价 <strong>¥" + yuan(Number(v.price || 0)) + "</strong> · 成本 <strong>" + costPrefix + yuan(Number(v.cost || 0)) + "</strong> · 推广 <strong>¥" + yuan(Number(result.ad || 0)) + "</strong> · 净利 <strong>¥" + yuan(Number(result.profit || 0)) + "</strong> · 利润率 <strong>" + pct(Number(result.margin || 0)) + "</strong>";
        if (record.plan && record.plan.planNote) {
          const noteLine = document.createElement("div");
          noteLine.className = "archive-item-note";
          noteLine.textContent = "备注：" + record.plan.planNote;
          details.appendChild(noteLine);
        }

        const actions = document.createElement("div");
        actions.className = "archive-item-actions";
        const restore = document.createElement("button");
        restore.className = "mini-btn";
        restore.type = "button";
        restore.textContent = "恢复";
        restore.addEventListener("click", function() { restoreArchive(record.id); });
        const remove = document.createElement("button");
        remove.className = "mini-btn danger";
        remove.type = "button";
        remove.textContent = "删除";
        remove.addEventListener("click", function() { deleteArchive(record.id); });
        actions.appendChild(restore);
        actions.appendChild(remove);

        item.appendChild(title);
        item.appendChild(details);
        item.appendChild(actions);
        wrap.appendChild(item);
      });
    }

    function saveCurrentArchive() {
      if (!window.AbacusSync.canWrite()) return;
      const c = calcWith();
      const input = document.getElementById("archiveName");
      const now = new Date();
      const fallbackName = product().flavor + "测算 " + now.toLocaleDateString("zh-CN");
      const record = {
        id: String(now.getTime()),
        name: input.value.trim() || fallbackName,
        createdAt: now.toLocaleString("zh-CN", { hour12: false }),
        skuId: product().id,
        adMode: state.adMode,
        values: cloneData(getValues()),
        plan: cloneData(currentPlan()),
        result: {
          profit: c.profit,
          margin: c.margin,
          buyerPrice: c.buyerPrice,
          breakEven: breakEvenPrice(),
          maxAdForTarget: c.maxAdForTarget,
          ad: c.ad
        }
      };
      currentArchives().push(record);
      saveArchives();
      input.value = "";
      renderArchiveList();
      renderList();
    }

    function restoreArchive(id) {
      if (!window.AbacusSync.canWrite()) return;
      const record = currentArchives().find(function(entry) { return entry.id === id; });
      if (!record) return;
      state.values[product().id] = cloneData(record.values);
      state.adMode = record.adMode || "direct";
      skuPlans[product().id] = cloneData(record.plan);
      savePlans();
      syncInputs();
      syncPlanInputs();
      render();
    }

    function deleteArchive(id) {
      if (!window.AbacusSync.canWrite()) return;
      const p = product();
      skuArchives[p.id] = currentArchives().filter(function(entry) { return entry.id !== id; });
      saveArchives();
      renderArchiveList();
      renderList();
    }

    function clsForProfit(n) {
      if (n < 0) return "bad-text";
      if (n < 15) return "bad-text";
      if (n < 40) return "warn-text";
      return "good";
    }

    function renderCostTable(c) {
      const p = c.p;
      const v = c.v;
      const rows = [
        ["采购成本", p.cases ? escapeHtml(p.cases) + "箱到仓成本（含供应商运费）" : p.costType === "usd" ? "USD × 汇率" : "人民币成本", c.purchase],
        ["跨境税", p.group === "domestic" ? "国产/大贸不含跨境税" : "售价 × 税率", c.tax],
        ["平台扣点", "商家成交额 × 扣点", c.platform],
        [p.cases ? "快递及操作费" : "快递费", p.cases ? (v.shippingConfirmed ? (v.sfAuto ? "报价运费+订单操作费；" + (Number(v.sfTax) === 6 ? "含6%税" : "未税") : "整单手填发货费用") : "发货费用未知，暂未计入") : "预填，可改", v.shipping],
        ["推广费", state.adMode === "roi" ? "买家到手价 ÷ ROI" : "直接填入", c.ad],
        ["支付/分期费", "单件估算", v.paymentFee],
        ["其他杂费", "单件估算", v.otherFee],
        ["商家承担优惠", "售价 × 消费券/商家金币", c.price - c.revenue],
        ["总成本", "采购 + 税费 + 扣点 + 履约 + 营销", c.totalCost],
        ["商家成交额", "售价 - 商家承担优惠", c.revenue],
        ["净利润", "商家成交额 - 总成本", c.profit]
      ];
      document.getElementById("costTable").innerHTML = rows.map(function(row) {
        const isProfit = row[0] === "净利润";
        const isTotal = row[0] === "总成本" || row[0] === "商家成交额";
        const cls = isProfit ? clsForProfit(row[2]) : "";
        return "<tr><td>" + row[0] + "</td><td>" + row[1] + "</td><td class='" + cls + "'><strong>" + yuan(row[2]) + "</strong></td></tr>";
      }).join("");
    }

    function renderScenarios() {
      const discounts = [
        ["当前价", 1],
        ["95 折", 0.95],
        ["90 折", 0.90],
        ["88 折", 0.88]
      ];
      const rois = [10, 15, 20, 30];
      const rows = [];
      discounts.forEach(function(d) {
        rois.forEach(function(r) {
          const base = getValues();
          const buyerPrice = base.price * d[1];
          const ad = buyerPrice / r;
          const currentMode = state.adMode;
          state.adMode = "direct";
          const c = calcWith({ price: base.price, couponRate: (1 - d[1]) * 100, adSpend: ad });
          state.adMode = currentMode;
          rows.push({ name: d[0], sale: base.price, roi: r, ad, profit: c.profit, margin: c.margin, risk: c.risk });
        });
      });
      document.getElementById("scenarioTable").innerHTML = rows.map(function(r) {
        return "<tr><td>" + r.name + "</td><td>" + yuan(r.sale) + "</td><td>" + r.roi + "</td><td>" + yuan(r.ad) + "</td><td class='" + clsForProfit(r.profit) + "'><strong>" + yuan(r.profit) + "</strong></td><td>" + pct(r.margin) + "</td><td>" + r.risk + "</td></tr>";
      }).join("");
    }

    function render() {
      if (window.FifoModel) window.FifoModel.syncIfChanged();
      const c = calcWith();
      const p = c.p;
      const v = c.v;
      const boxed = Boolean(p.cases);
      const freightPending = boxed && !v.shippingConfirmed;
      document.getElementById("sfControls").hidden = !boxed;
      document.getElementById("priceLabel").textContent = boxed ? p.cases + "箱合计售价" : "售价 / 挂牌价";
      document.getElementById("purchaseLabel").textContent = boxed ? p.cases + "箱到仓成本" : "采购成本";
      document.getElementById("shippingLabel").textContent = boxed ? "发货费用（快递＋操作费）" : "快递费";
      document.getElementById("unitLabel").textContent = boxed ? "按" + p.cases + "箱订单" : "按单件";
      document.getElementById("profitLabel").textContent = freightPending ? "暂算利润（未扣发货运费）" : boxed ? p.cases + "箱订单预估净利润" : "单件净利润";
      const info = document.getElementById("ovodanInfo");
      info.hidden = !boxed && !p.legacy;
      if (boxed) {
        const selected = chosenFreight(p, v);
        info.textContent = "箱装成本和参考价以当前同步的商品记录为准；2箱是两箱6支装，不是礼盒。默认1箱顺丰、2箱合包普快择低，仅作测价，不下发仓库。包装计费重暂估1.8/3.6kg，非实称；顺丰体积重=长×宽×高(cm)÷6000，普快抛重规则未提供。未含包材、仓储及旺季附加费。" + (freightPending ? " 当前报价不适用或重量无效，请调整参数或手填费用。" : " 当前" + (v.sfAuto && selected ? freightNames[selected.carrier] : "手填") + "发货费用¥" + yuan(v.shipping) + "（" + (Number(v.sfTax) === 6 ? "含6%税" : "未税") + "），非全国均价。");
        const alternatives = ["sf","yto","yunda"].map(function(key) { const q = freightQuote(p,v,key);return freightNames[key] + "：" + (q ? "快递¥" + yuan(q.courier) + "＋操作¥" + yuan(q.handling) + "＝¥" + yuan(q.total) + (Number(v.sfTax) === 6 ? "（合计含税）" : "（未税）") : "无适用报价"); });
        document.getElementById("sfEstimate").textContent = alternatives.join("\n") + "\n" + (v.sfAuto && selected ? "当前按" + freightNames[selected.carrier] + "计入。" : "当前手填或无适用报价。") + "\n每箱液体约1.35kg（按1g/mL），瓶子、纸箱及缓冲暂留0.45kg。请用实测计费重替换。\n普快按当前同步的分段报价计算，未提供的报价保持待填。\n操作费读取当前同步费率，暂按箱计件并沿用至其他快递，待仓库确认；不要再在其他费用重复录入。包材未知未计；拆票另确认额外操作费。";
      } else if (p.legacy) {
        info.textContent = "旧单瓶测算，仅供历史查看。旧便签及存档完整保留，不会自动覆盖新的1箱/2箱SKU。";
      }
      document.getElementById("productName").textContent = p.name;
      const identity = [p.barcode, p.goodsCode, p.goodsId, p.spec, p.note].filter(Boolean).join(" · ");
      document.getElementById("productSub").textContent = identity;
      document.getElementById("costTypeLabel").textContent = p.costType === "usd" ? "USD成本" : "人民币成本";
      document.getElementById("fxControl").style.display = p.costType === "usd" ? "block" : "none";
      document.getElementById("adModeText").textContent = state.adMode === "roi" ? "ROI反推" : "直接金额";
      renderPlanSummary();
      renderArchiveList();

      document.getElementById("vPrice").textContent = "¥" + yuan(v.price);
      document.getElementById("vCost").textContent = (p.costType === "usd" ? "$" : "¥") + yuan(v.cost);
      document.getElementById("vFx").textContent = v.fx.toFixed(2);
      document.getElementById("vShipping").textContent = freightPending ? "待填" : "¥" + yuan(v.shipping);
      document.getElementById("vTaxRate").textContent = pct(v.taxRate);
      document.getElementById("vPlatformRate").textContent = pct(v.platformRate);
      document.getElementById("vCouponRate").textContent = pct(v.couponRate);
      document.getElementById("vCoinRate").textContent = pct(v.coinRate);
      document.getElementById("vPlatformCoin").textContent = pct(v.platformCoin);
      document.getElementById("vPlatformCoinHit").textContent = pct(v.platformCoinHit);
      document.getElementById("vAdSpend").textContent = "¥" + yuan(v.adSpend);
      document.getElementById("vRoi").textContent = v.roi.toFixed(1);
      document.getElementById("vPaymentFee").textContent = "¥" + yuan(v.paymentFee);
      document.getElementById("vOtherFee").textContent = "¥" + yuan(v.otherFee);
      document.getElementById("vTargetProfit").textContent = "¥" + yuan(v.targetProfit);

      const profitKpi = document.getElementById("profitKpi");
      profitKpi.textContent = yuan(c.profit);
      profitKpi.className = "kpi-value " + clsForProfit(c.profit);
      document.getElementById("marginKpi").textContent = "利润率 " + pct(c.margin) + " · 商家成交额 ¥" + yuan(c.revenue);
      document.getElementById("buyerKpi").textContent = yuan(c.buyerPrice);
      document.getElementById("breakEvenKpi").textContent = yuan(breakEvenPrice());
      const room = document.getElementById("roomKpi");
      room.textContent = yuan(c.maxAdForTarget);
      room.className = "kpi-value " + clsForProfit(c.maxAdForTarget);
      document.getElementById("roomSub").textContent = c.maxAdForTarget >= 0 ? "还能打推广或降价" : "已低于目标净利";
      document.getElementById("noAdProfit").textContent = yuan(c.noAdProfit);
      document.getElementById("noAdProfit").className = "kpi-value " + clsForProfit(c.noAdProfit);

      const c88 = calcWith({ couponRate: 12 });
      document.getElementById("discount88").textContent = yuan(c88.profit);
      document.getElementById("discount88").className = "kpi-value " + clsForProfit(c88.profit);
      document.getElementById("discount88Sub").textContent = "88折利润，买家到手 ¥" + yuan(c88.buyerPrice);

      const status = document.getElementById("statusChip");
      status.textContent = c.risk;
      status.className = "status-chip" + (c.risk === "健康" ? "" : c.risk === "偏紧" ? " warn" : " bad");

      const costShare = clamp(c.totalCost / Math.max(c.price, 1) * 100, 0, 140);
      const roomShare = clamp(c.maxAdForTarget / Math.max(c.price, 1) * 100, 0, 100);
      document.getElementById("costShareText").textContent = pct(costShare);
      document.getElementById("costShareBar").style.width = clamp(costShare, 0, 100) + "%";
      document.getElementById("costShareBar").style.background = costShare > 95 ? "var(--bad)" : costShare > 88 ? "var(--warn)" : "var(--black)";
      document.getElementById("roomShareText").textContent = pct(roomShare);
      document.getElementById("roomShareBar").style.width = roomShare + "%";
      document.getElementById("roomShareBar").style.background = roomShare < 3 ? "var(--bad)" : roomShare < 8 ? "var(--warn)" : "var(--good)";

      renderCostTable(c);
      renderScenarios();
      document.getElementById("formulaText").innerHTML = "当前公式：<code>净利润 = 商家成交额 " + yuan(c.revenue) + " - 采购 " + yuan(c.purchase) + " - 税费 " + yuan(c.tax) + " - 扣点 " + yuan(c.platform) + " - 快递 " + yuan(v.shipping) + " - 推广 " + yuan(c.ad) + " - 其他 " + yuan(v.paymentFee + v.otherFee) + " = " + yuan(c.profit) + "</code>";
      renderList();
      if (window.renderFifo) window.renderFifo();
    }

    function bindInput(key) {
      function handle(value) {
        setValue(key, value);
        syncPair(key);
        render();
      }
      if (els[key]) els[key].addEventListener("input", function(e) { handle(e.target.value); });
      if (els[key + "Num"]) els[key + "Num"].addEventListener("input", function(e) { handle(e.target.value); });
    }

    ids.forEach(bindInput);
    document.getElementById("freightProvince").innerHTML = freightProvinces.map(function(province) { return '<option value="' + escapeHtml(province) + '">' + escapeHtml(province) + '</option>'; }).join("");
    ["freightProvince", "freightCarrier", "freightHandling", "sfWeight", "sfSplit", "sfTax"].forEach(function(key) {
      document.getElementById(key).addEventListener(["sfWeight","freightHandling"].includes(key) ? "input" : "change", function(e) {
        const previous = getValues();
        setValue("freightProvince", previous.freightProvince); setValue("freightCarrier", previous.freightCarrier); setValue("freightHandling", previous.freightHandling);
        setValue(key, e.target.value);
        setValue("sfAuto", 1);
        const v = getValues(); setRangeMaxes(v); syncPair("shipping"); render();
      });
    });
    document.getElementById("sfRecalculate").addEventListener("click", function() {
      const previous = getValues();
      setValue("freightProvince", previous.freightProvince); setValue("freightCarrier", previous.freightCarrier); setValue("freightHandling", previous.freightHandling);
      setValue("sfAuto", 1); syncInputs(); render();
    });
    document.getElementById("searchInput").addEventListener("input", renderList);
    Array.prototype.forEach.call(document.querySelectorAll(".filter-btn"), function(btn) {
      btn.addEventListener("click", function() {
        state.filter = btn.dataset.filter;
        Array.prototype.forEach.call(document.querySelectorAll(".filter-btn"), function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderList();
      });
    });
    document.getElementById("directMode").addEventListener("click", function() {
      state.adMode = "direct";
      syncInputs();
      render();
    });
    document.getElementById("roiMode").addEventListener("click", function() {
      state.adMode = "roi";
      syncInputs();
      render();
    });
    planFields.forEach(function(key) {
      const el = document.getElementById(key);
      if (!el) return;
      el.addEventListener("input", function(e) {
        setPlanValue(key, e.target.value);
        renderPlanSummary();
        renderList();
      });
      el.addEventListener("change", function(e) {
        setPlanValue(key, e.target.value);
        renderPlanSummary();
        renderList();
      });
    });
    document.getElementById("applyPlanPrice").addEventListener("click", function() {
      const targetPrice = Number(currentPlan().planPrice);
      if (!targetPrice || targetPrice <= 0) return;
      setValue("price", targetPrice);
      syncInputs();
      render();
    });
    document.getElementById("clearPlan").addEventListener("click", function() {
      if (!window.AbacusSync.canWrite()) return;
      delete skuPlans[product().id];
      savePlans();
      syncPlanInputs();
      render();
    });
    document.getElementById("saveSnapshot").addEventListener("click", saveCurrentArchive);
    document.getElementById("archiveName").addEventListener("keydown", function(e) {
      if (e.key === "Enter") saveCurrentArchive();
    });

    const requestedSku = new URLSearchParams(window.location.search).get("sku");
    if (products.some(function(p) { return p.id === requestedSku && !p.legacy; })) {
      state.selectedId = requestedSku;
      if (product().family === "ovodan") {
        state.filter = "ovodan";
        document.querySelectorAll(".filter-btn").forEach(function(btn) { btn.classList.toggle("active", btn.dataset.filter === "ovodan"); });
      }
    }
    syncInputs();
    syncPlanInputs();
    render();

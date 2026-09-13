/* Marketing calculators. Everything runs locally; no data leaves the page.
   Each calculator recomputes on every keystroke and ships with worked
   default values so the page is useful before you type anything. */
(function () {
  'use strict';

  var CURRENCY_KEY = 'mr-currency';
  var currency = 'USD';
  try { currency = localStorage.getItem(CURRENCY_KEY) || 'USD'; } catch (e) { /* ignore */ }

  /* ---- Formatting --------------------------------------------------------- */

  function money(n, decimals) {
    if (!isFinite(n)) return '—';
    var opts = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals === undefined ? 2 : decimals,
      maximumFractionDigits: decimals === undefined ? 2 : decimals
    };
    try { return new Intl.NumberFormat(undefined, opts).format(n); }
    catch (e) { return n.toFixed(decimals === undefined ? 2 : decimals); }
  }

  function count(n) {
    if (!isFinite(n)) return '—';
    try { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n); }
    catch (e) { return String(Math.round(n)); }
  }

  function pct(n, decimals) {
    if (!isFinite(n)) return '—';
    return n.toFixed(decimals === undefined ? 1 : decimals) + '%';
  }

  function ratio(n) {
    if (!isFinite(n) || n < 0) return '—';
    return n.toFixed(2) + ':1';
  }

  /* ---- DOM helpers -------------------------------------------------------- */

  function val(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var n = parseFloat(el.value);
    return isFinite(n) ? n : 0;
  }

  function set(id, text, state) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    var box = el.closest('.result');
    if (box) box.className = 'result' + (state ? ' is-' + state : '');
  }

  function note(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text || '';
  }

  function verdict(id, text, state) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'verdict' + (state ? ' is-' + state : '');
  }

  /* ---- Statistics --------------------------------------------------------- */

  // Abramowitz & Stegun 7.1.26 — max absolute error ~1.5e-7.
  function erf(x) {
    var sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t
      - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
  }

  function normalCdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

  // Two-sided critical values, indexed by confidence level.
  var Z_ALPHA = { 90: 1.644854, 95: 1.959964, 99: 2.575829 };
  var Z_POWER = { 80: 0.841621, 90: 1.281552, 95: 1.644854 };

  /* ---- 1. Unit economics --------------------------------------------------- */

  function unitEconomics() {
    var spend    = val('ue-spend');
    var customers= val('ue-customers');
    var revenue  = val('ue-revenue');
    var margin   = val('ue-margin') / 100;
    var lifespan = val('ue-lifespan');

    var cac           = customers > 0 ? spend / customers : NaN;
    var monthlyProfit = revenue * margin;
    var ltv           = monthlyProfit * lifespan;
    var lcRatio       = cac > 0 ? ltv / cac : NaN;
    var payback       = monthlyProfit > 0 ? cac / monthlyProfit : NaN;

    set('ue-out-cac', money(cac));
    set('ue-out-profit', money(monthlyProfit));
    set('ue-out-ltv', money(ltv));
    set('ue-out-ratio', ratio(lcRatio),
      !isFinite(lcRatio) ? '' : lcRatio >= 3 ? 'ok' : lcRatio >= 1 ? 'warn' : 'bad');
    set('ue-out-payback', isFinite(payback) ? payback.toFixed(1) + ' mo' : '—',
      !isFinite(payback) ? '' : payback <= 12 ? 'ok' : payback <= 18 ? 'warn' : 'bad');

    if (!isFinite(lcRatio) || !isFinite(payback)) {
      verdict('ue-verdict', 'Fill in every field to see a verdict.', '');
      return;
    }

    var msg, state;
    if (lcRatio < 1) {
      state = 'bad';
      msg = 'You lose ' + money(cac - ltv) + ' on every customer you acquire. Growth makes the hole deeper, not shallower. Fix margin, price, retention or CAC before spending more.';
    } else if (lcRatio < 3) {
      state = 'warn';
      msg = 'Each customer returns ' + ratio(lcRatio) + ' on what it costs to win them. That is survivable while you are still learning, but thin for scaling — a small rise in CAC or churn puts you underwater.';
    } else if (lcRatio > 5 && payback < 6) {
      state = 'ok';
      msg = 'Unusually strong: ' + ratio(lcRatio) + ' with a ' + payback.toFixed(1) + '-month payback. A ratio this high often means you are under-spending — you could likely buy more growth before efficiency degrades.';
    } else {
      state = 'ok';
      msg = 'Healthy. ' + ratio(lcRatio) + ' with payback in ' + payback.toFixed(1) + ' months. ';
      msg += payback > 12
        ? 'The ratio is fine but your cash is tied up for over a year — make sure you can fund that gap.'
        : 'Cash comes back fast enough to reinvest.';
    }
    verdict('ue-verdict', msg, state);
  }

  /* ---- 2. Break-even ROAS -------------------------------------------------- */

  function breakEvenRoas() {
    var aov      = val('be-aov');
    var cogs     = val('be-cogs');
    var variable = val('be-variable');
    var spend    = val('be-spend');
    var adRevenue= val('be-revenue');

    var contribution = aov - cogs - variable;
    var marginPct    = aov > 0 ? (contribution / aov) * 100 : NaN;
    var breakEven    = contribution > 0 ? aov / contribution : NaN;
    var actualRoas   = spend > 0 ? adRevenue / spend : NaN;
    var orders       = aov > 0 ? adRevenue / aov : NaN;
    var grossProfit  = orders * contribution;
    var netProfit    = grossProfit - spend;
    var maxCpa       = contribution;

    set('be-out-contribution', money(contribution));
    set('be-out-margin', pct(marginPct));
    set('be-out-breakeven', isFinite(breakEven) ? breakEven.toFixed(2) + '×' : '—');
    set('be-out-actual', isFinite(actualRoas) ? actualRoas.toFixed(2) + '×' : '—',
      !isFinite(actualRoas) || !isFinite(breakEven) ? '' : actualRoas >= breakEven ? 'ok' : 'bad');
    set('be-out-maxcpa', money(maxCpa));
    set('be-out-profit', money(netProfit),
      !isFinite(netProfit) ? '' : netProfit > 0 ? 'ok' : 'bad');

    if (contribution <= 0) {
      verdict('be-verdict', 'Your costs per order meet or exceed the order value, so no amount of advertising can be profitable. This is a pricing or cost problem, not a media problem.', 'bad');
      return;
    }
    if (!isFinite(actualRoas)) {
      verdict('be-verdict', 'Enter your ad spend and the revenue attributed to it to compare against break-even.', '');
      return;
    }

    if (actualRoas >= breakEven) {
      verdict('be-verdict',
        'Profitable. You break even at ' + breakEven.toFixed(2) + '× and you are running at ' + actualRoas.toFixed(2) + '×, so this spend contributes ' + money(netProfit) + ' after ad costs. Your ceiling for cost per order is ' + money(maxCpa) + '.',
        'ok');
    } else {
      verdict('be-verdict',
        'Losing money. You need ' + breakEven.toFixed(2) + '× just to break even and you are at ' + actualRoas.toFixed(2) + '×, costing ' + money(Math.abs(netProfit)) + ' on this spend. Note that break-even ROAS ignores repeat purchases — if customers reliably buy again, a first-order loss can still be the right call. Only make it deliberately.',
        'bad');
    }
  }

  /* ---- 3. Funnel model ----------------------------------------------------- */

  function funnelModel() {
    var visitors = val('fn-visitors');
    var s1 = val('fn-step1') / 100;
    var s2 = val('fn-step2') / 100;
    var s3 = val('fn-step3') / 100;
    var aov = val('fn-aov');

    var leads     = visitors * s1;
    var qualified = leads * s2;
    var customers = qualified * s3;
    var revenue   = customers * aov;
    var overall   = visitors > 0 ? (customers / visitors) * 100 : NaN;
    var rpv       = visitors > 0 ? revenue / visitors : NaN;

    set('fn-out-leads', count(leads));
    set('fn-out-qualified', count(qualified));
    set('fn-out-customers', count(customers));
    set('fn-out-revenue', money(revenue, 0));
    set('fn-out-overall', isFinite(overall) ? overall.toFixed(2) + '%' : '—');
    set('fn-out-rpv', money(rpv));

    // A 10% relative lift at any single step multiplies revenue by the same
    // 1.10 — the point of the panel below is that the steps are equivalent,
    // so you should attack whichever is cheapest to move.
    var uplift = revenue * 0.10;
    if (revenue > 0) {
      verdict('fn-verdict',
        'A 10% relative improvement at any one of these three steps produces the same result: about ' + money(uplift, 0) + ' more revenue per month. Because the funnel multiplies, the steps are mathematically interchangeable — so work on whichever one is cheapest and fastest for you to move, not the one with the scariest-looking drop-off.',
        'ok');
    } else {
      verdict('fn-verdict', 'Enter your traffic, rates and order value to model the funnel.', '');
    }
  }

  /* ---- 4. A/B test significance -------------------------------------------- */

  function abTest() {
    var nA = val('ab-visitors-a');
    var cA = val('ab-conv-a');
    var nB = val('ab-visitors-b');
    var cB = val('ab-conv-b');
    var confidence = val('ab-confidence') || 95;

    var rateA = nA > 0 ? cA / nA : NaN;
    var rateB = nB > 0 ? cB / nB : NaN;
    var lift  = rateA > 0 ? ((rateB - rateA) / rateA) * 100 : NaN;

    set('ab-out-rate-a', isFinite(rateA) ? pct(rateA * 100, 2) : '—');
    set('ab-out-rate-b', isFinite(rateB) ? pct(rateB * 100, 2) : '—');
    set('ab-out-lift', isFinite(lift) ? (lift >= 0 ? '+' : '') + lift.toFixed(1) + '%' : '—',
      !isFinite(lift) ? '' : lift > 0 ? 'ok' : lift < 0 ? 'bad' : '');

    if (cA > nA || cB > nB) {
      set('ab-out-pvalue', '—');
      set('ab-out-confidence', '—');
      verdict('ab-verdict', 'Conversions cannot exceed visitors. Check the numbers.', 'bad');
      return;
    }
    if (!(nA > 0 && nB > 0)) {
      set('ab-out-pvalue', '—');
      set('ab-out-confidence', '—');
      verdict('ab-verdict', 'Enter visitors and conversions for both variants.', '');
      return;
    }

    var pooled = (cA + cB) / (nA + nB);
    var se = Math.sqrt(pooled * (1 - pooled) * (1 / nA + 1 / nB));

    if (se === 0) {
      set('ab-out-pvalue', '—');
      set('ab-out-confidence', '—');
      verdict('ab-verdict', 'Both variants converted identically (or not at all). There is nothing to test yet.', '');
      return;
    }

    var z = (rateB - rateA) / se;
    var p = 2 * (1 - normalCdf(Math.abs(z)));
    var observed = (1 - p) * 100;
    var threshold = 1 - confidence / 100;

    set('ab-out-pvalue', p < 0.0001 ? '<0.0001' : p.toFixed(4));
    set('ab-out-confidence', observed.toFixed(1) + '%',
      p <= threshold ? 'ok' : 'warn');

    var small = (cA + cB) < 30;
    var smallNote = small
      ? ' Be careful either way: with fewer than about 30 combined conversions this test is very sensitive to a handful of events.'
      : '';

    if (p <= threshold) {
      verdict('ab-verdict',
        (rateB > rateA ? 'Variant B wins' : 'Variant A wins') +
        ' at your ' + confidence + '% threshold (p = ' + (p < 0.0001 ? '<0.0001' : p.toFixed(4)) + '). ' +
        'That means a difference this large would show up by chance about ' + (p * 100).toFixed(2) + '% of the time if the variants were truly identical.' + smallNote,
        'ok');
    } else {
      verdict('ab-verdict',
        'Not significant at ' + confidence + '% (p = ' + p.toFixed(4) + '). This is not evidence that the variants are the same — it is an absence of evidence that they differ. Either keep running, or accept that any real difference is probably too small to matter.' + smallNote,
        'warn');
    }
  }

  /* ---- 5. Sample size planner ---------------------------------------------- */

  function sampleSize() {
    var baseline = val('ss-baseline') / 100;
    var mde      = val('ss-mde') / 100;
    var confidence = val('ss-confidence') || 95;
    var power      = val('ss-power') || 80;
    var weekly     = val('ss-traffic');

    var p1 = baseline;
    var p2 = baseline * (1 + mde);
    var delta = p2 - p1;

    if (!(p1 > 0 && p1 < 1) || !(p2 > 0 && p2 < 1) || delta === 0) {
      set('ss-out-per-variant', '—');
      set('ss-out-total', '—');
      set('ss-out-days', '—');
      verdict('ss-verdict', 'Enter a baseline conversion rate between 0 and 100%, and a non-zero effect to detect.', '');
      return;
    }

    var za = Z_ALPHA[confidence] || Z_ALPHA[95];
    var zb = Z_POWER[power] || Z_POWER[80];
    var n  = Math.ceil(Math.pow(za + zb, 2) * (p1 * (1 - p1) + p2 * (1 - p2)) / (delta * delta));
    var total = n * 2;
    var days = weekly > 0 ? Math.ceil(total / (weekly / 7)) : NaN;

    set('ss-out-per-variant', count(n));
    set('ss-out-total', count(total));
    set('ss-out-days', isFinite(days) ? count(days) + ' days' : '—',
      !isFinite(days) ? '' : days <= 28 ? 'ok' : days <= 60 ? 'warn' : 'bad');

    var msg = 'To detect a ' + (mde * 100).toFixed(0) + '% relative change from a ' +
      (baseline * 100).toFixed(2) + '% baseline, you need about ' + count(n) +
      ' visitors in each variant.';

    if (isFinite(days)) {
      if (days > 60) {
        msg += ' At your traffic that takes roughly ' + count(days) + ' days — too long to be practical. Either test somewhere higher up the funnel where the baseline rate is larger, test a bigger change, or accept a lower confidence level and treat the result as a hint rather than proof.';
      } else if (days < 7) {
        msg += ' You would hit that in under a week, but still run for at least one full week (ideally two) so weekday and weekend behaviour are both represented.';
      } else {
        msg += ' At your traffic that is roughly ' + count(days) + ' days. Run whole weeks, and decide the stopping point now rather than watching until it looks significant.';
      }
    }
    verdict('ss-verdict', msg, isFinite(days) && days > 60 ? 'warn' : 'ok');
  }

  /* ---- 6. Email campaign value --------------------------------------------- */

  function emailValue() {
    var list      = val('em-list');
    var delivery  = val('em-delivery') / 100;
    var clickRate = val('em-click') / 100;
    var landingCvr= val('em-cvr') / 100;
    var aov       = val('em-aov');
    var margin    = val('em-margin') / 100;
    var cost      = val('em-cost');

    var delivered = list * delivery;
    var clicks    = delivered * clickRate;
    var orders    = clicks * landingCvr;
    var revenue   = orders * aov;
    var profit    = revenue * margin - cost;
    var rpr       = delivered > 0 ? revenue / delivered : NaN;

    set('em-out-delivered', count(delivered));
    set('em-out-clicks', count(clicks));
    set('em-out-orders', count(orders));
    set('em-out-revenue', money(revenue, 0));
    set('em-out-rpr', money(rpr));
    set('em-out-profit', money(profit, 0), profit > 0 ? 'ok' : 'bad');

    var steps = document.getElementById('em-steps');
    if (steps) {
      steps.innerHTML =
        '<li><span>Sent</span><span class="s-val">' + count(list) + '</span></li>' +
        '<li><span>Delivered</span><span class="s-val">' + count(delivered) + '</span></li>' +
        '<li><span>Clicked through</span><span class="s-val">' + count(clicks) + '</span></li>' +
        '<li><span>Bought</span><span class="s-val">' + count(orders) + '</span></li>' +
        '<li><span>Revenue</span><span class="s-val">' + money(revenue, 0) + '</span></li>';
    }

    if (!(delivered > 0)) {
      verdict('em-verdict', 'Enter a list size and delivery rate to model the campaign.', '');
      return;
    }

    verdict('em-verdict',
      'This campaign is worth ' + money(rpr) + ' per delivered email. That is the number to watch when someone proposes sending more often: total revenue can rise while revenue per recipient falls, which means you are harvesting the list faster rather than growing its value. Track it per send and watch the trend, not the single figure.',
      profit > 0 ? 'ok' : 'warn');
  }

  /* ---- Wiring -------------------------------------------------------------- */

  var CALCULATORS = {
    'unit-economics': unitEconomics,
    'break-even-roas': breakEvenRoas,
    'funnel-model': funnelModel,
    'ab-test': abTest,
    'sample-size': sampleSize,
    'email-value': emailValue
  };

  function runAll() {
    Object.keys(CALCULATORS).forEach(function (id) {
      if (document.getElementById(id)) CALCULATORS[id]();
    });
  }

  Object.keys(CALCULATORS).forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var fn = CALCULATORS[id];
    el.addEventListener('input', fn);
    el.addEventListener('change', fn);
  });

  var currencySelect = document.getElementById('currency');
  if (currencySelect) {
    currencySelect.value = currency;
    currencySelect.addEventListener('change', function () {
      currency = currencySelect.value;
      try { localStorage.setItem(CURRENCY_KEY, currency); } catch (e) { /* ignore */ }
      runAll();
    });
  }

  runAll();
}());

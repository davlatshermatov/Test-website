/* Glossary data + live filtering.
   Terms are stored as data rather than markup so the search, the category
   filter and the count stay in sync from a single source. Entries are
   rendered with DOM APIs (never innerHTML) so no definition can inject markup. */
(function () {
  'use strict';

  var TERMS = [
    /* ---- Strategy ---- */
    { t: '4 Ps', c: 'Strategy', d: 'The marketing mix: Product, Price, Place and Promotion. A checklist of the four things you can actually change about how something is sold.' },
    { t: '7 Ps', c: 'Strategy', d: 'The 4 Ps extended for services with People, Process and Physical evidence — the parts of a service experience that shape how it is judged.' },
    { t: '4 Cs', c: 'Strategy', d: 'The customer-side mirror of the 4 Ps: Customer value, Cost, Convenience and Communication. Same decisions, phrased from outside the company.' },
    { t: 'STP', c: 'Strategy', d: 'Segmentation, Targeting, Positioning. Split the market, choose who to serve, then decide what you want to mean to them.' },
    { t: 'Segmentation', c: 'Strategy', d: 'Dividing a market into groups that behave differently. Behavioural and needs-based segments predict buying far better than demographic ones.' },
    { t: 'Positioning', c: 'Strategy', d: 'The place you deliberately occupy in a buyer’s mind relative to their alternatives. If it would also be true of a competitor, it is a category description, not a position.' },
    { t: 'Value proposition', c: 'Strategy', d: 'The customer-facing expression of your positioning: what outcome they get, why it is credible, and why it beats the alternative.' },
    { t: 'USP', c: 'Strategy', d: 'Unique selling proposition. The one claim only you can credibly make. Most stated USPs fail the test that a competitor could say the same thing.' },
    { t: 'Jobs to be done (JTBD)', c: 'Strategy', d: 'The idea that people "hire" products to make progress in a specific situation. The unit of analysis is the circumstance, not the customer profile.' },
    { t: 'Product–market fit', c: 'Strategy', d: 'The point where a market pulls the product out of you. The clearest signal is a retention curve that flattens instead of decaying toward zero.' },
    { t: 'TAM / SAM / SOM', c: 'Strategy', d: 'Total addressable market, serviceable addressable market, serviceable obtainable market. Successively narrower estimates of how big the opportunity is.' },
    { t: 'Go-to-market (GTM)', c: 'Strategy', d: 'The plan for how a product reaches buyers: who it is for, the message, the channels, the pricing and who sells it.' },
    { t: 'Market penetration', c: 'Strategy', d: 'The share of potential buyers who bought from you in a period. Evidence suggests brands grow mainly by increasing penetration rather than loyalty.', f: 'Penetration = Your buyers ÷ All category buyers' },
    { t: 'Mental availability', c: 'Brand', d: 'How readily a brand comes to mind in a buying situation. Built by consistent, distinctive advertising reaching all category buyers over time.' },
    { t: 'Physical availability', c: 'Brand', d: 'How easy a brand is to find and buy. Often the cheaper growth lever, and routinely ignored in favour of messaging.' },
    { t: 'Distinctive brand assets', c: 'Brand', d: 'Colours, logos, characters, sounds and phrases that trigger recognition without naming the brand. Their value comes entirely from consistency over time.' },
    { t: 'Category entry points', c: 'Brand', d: 'The situations and cues that make someone think of a category. Being linked to more of them is what mental availability actually consists of.' },
    { t: 'Differentiation', c: 'Strategy', d: 'Being meaningfully different from competitors. Distinct from distinctiveness, which is about being recognisable rather than better.' },
    { t: 'Brand equity', c: 'Brand', d: 'The commercial value of a brand beyond its product: pricing power, preference at equal price, and resilience when something goes wrong.' },
    { t: 'Excess share of voice (ESOV)', c: 'Brand', d: 'Share of voice minus share of market. Sustained positive ESOV is associated with share growth; sustained negative ESOV with decline.', f: 'ESOV = Share of voice % − Share of market %' },

    /* ---- Metrics & unit economics ---- */
    { t: 'CAC', c: 'Metrics', d: 'Customer acquisition cost. Always ask which version: paid-only, blended, or fully loaded with salaries and tools.', f: 'CAC = Sales & marketing cost ÷ New customers' },
    { t: 'Blended CAC', c: 'Metrics', d: 'All marketing spend divided by all new customers, attributed or not. Harder to game than channel CAC, which is why boards ask for it.' },
    { t: 'LTV / CLV', c: 'Metrics', d: 'Customer lifetime value: the profit a customer generates over their relationship with you. A forecast, not a fact — treat long projections with suspicion.', f: 'LTV = ARPA × Gross margin % ÷ Churn rate' },
    { t: 'LTV:CAC', c: 'Metrics', d: 'The ratio of customer value to acquisition cost. Around 3:1 is a common health marker; much higher often means you are under-investing in growth.' },
    { t: 'CAC payback period', c: 'Metrics', d: 'Months of gross profit needed to recover acquisition cost. Often more important than LTV:CAC, because it governs how much cash growth consumes.', f: 'Payback = CAC ÷ (Monthly revenue × Gross margin %)' },
    { t: 'ROAS', c: 'Metrics', d: 'Return on ad spend, measured in revenue. Says nothing about profit until you compare it to break-even ROAS.', f: 'ROAS = Ad revenue ÷ Ad spend' },
    { t: 'Break-even ROAS', c: 'Metrics', d: 'The ROAS at which advertising exactly covers its cost, given your margin. The bar every ROAS figure should be judged against.', f: 'Break-even ROAS = 1 ÷ Gross margin %' },
    { t: 'POAS', c: 'Metrics', d: 'Profit on ad spend. The version of ROAS that uses gross profit, essential when margins differ a lot between products.', f: 'POAS = Gross profit from ads ÷ Ad spend' },
    { t: 'MER', c: 'Metrics', d: 'Marketing efficiency ratio, or blended ROAS. Total revenue over total marketing spend — immune to attribution disputes.', f: 'MER = Total revenue ÷ Total marketing spend' },
    { t: 'CPA', c: 'Metrics', d: 'Cost per acquisition or action. Only comparable across channels if the action is defined identically in each.', f: 'CPA = Spend ÷ Conversions' },
    { t: 'CPL', c: 'Metrics', d: 'Cost per lead. Watch it alongside lead-to-customer rate, or you will optimise toward cheap leads that never buy.', f: 'CPL = Spend ÷ Leads' },
    { t: 'CPC', c: 'Metrics', d: 'Cost per click. An input, not an outcome — chasing cheap clicks usually raises cost per acquisition.', f: 'CPC = Spend ÷ Clicks' },
    { t: 'CPM', c: 'Metrics', d: 'Cost per mille: the cost of a thousand impressions. Low CPMs often signal low-quality placements.', f: 'CPM = (Spend ÷ Impressions) × 1,000' },
    { t: 'CPV', c: 'Metrics', d: 'Cost per view, used for video. Check what counts as a "view" — definitions vary widely between platforms.' },
    { t: 'CTR', c: 'Metrics', d: 'Click-through rate. Easy to inflate with a misleading hook, so always read it next to conversion rate.', f: 'CTR = (Clicks ÷ Impressions) × 100' },
    { t: 'CVR', c: 'Metrics', d: 'Conversion rate. Specify the denominator — sessions and users produce different numbers for the same reality.', f: 'CVR = (Conversions ÷ Visitors) × 100' },
    { t: 'AOV', c: 'Ecommerce', d: 'Average order value. Check the median too; a few large orders can drag the mean somewhere unrepresentative.', f: 'AOV = Revenue ÷ Orders' },
    { t: 'RPV', c: 'Ecommerce', d: 'Revenue per visitor. The best single ecommerce headline metric because it cannot be gamed by trading conversion rate against order value.', f: 'RPV = Revenue ÷ Visitors' },
    { t: 'ARPU / ARPA', c: 'Metrics', d: 'Average revenue per user or per account. ARPA is the B2B version, where one account holds many users.' },
    { t: 'MRR / ARR', c: 'Metrics', d: 'Monthly and annual recurring revenue. Exclude one-off fees; they make the trend look better than the business is.' },
    { t: 'Churn rate', c: 'Metrics', d: 'The share of customers or revenue lost in a period. Report both — they diverge when your small and large accounts behave differently.', f: 'Churn % = (Lost ÷ Starting total) × 100' },
    { t: 'Retention rate', c: 'Metrics', d: 'The mirror of churn: the share who stayed. Most meaningful read as a cohort curve rather than a single number.' },
    { t: 'NRR / NDR', c: 'Metrics', d: 'Net revenue retention. Includes expansion, so above 100% means you would grow without acquiring anyone new.', f: 'NRR = (Start + expansion − contraction − churn) ÷ Start × 100' },
    { t: 'GRR', c: 'Metrics', d: 'Gross revenue retention. Strips out expansion, exposing whether a strong NRR is really a few big upgrades hiding a leaky base.' },
    { t: 'Gross margin', c: 'Metrics', d: 'Revenue minus cost of goods sold, as a percentage. The number that converts a ROAS target into a profit question.', f: 'Gross margin % = (Revenue − COGS) ÷ Revenue × 100' },
    { t: 'Contribution margin', c: 'Metrics', d: 'What is left per order after every variable cost — goods, shipping, payment fees, returns. Your true ceiling for cost per order.' },
    { t: 'Quick ratio', c: 'Metrics', d: 'Growth efficiency: new plus expansion revenue divided by churned plus contracted revenue. Near 1 means running to stand still.', f: 'Quick ratio = (New + Expansion) ÷ (Churned + Contraction)' },
    { t: 'Rule of 40', c: 'Metrics', d: 'A SaaS heuristic: growth rate plus profit margin should exceed 40. Only meaningful at scale; early companies routinely ignore it.' },
    { t: 'Cohort analysis', c: 'Analytics', d: 'Grouping customers by when they joined and tracking each group over time. The only reliable way to see whether retention is genuinely improving.' },
    { t: 'Reach', c: 'Paid media', d: 'The number of unique people who saw something, as opposed to the number of times it was shown.' },
    { t: 'Frequency', c: 'Paid media', d: 'Average impressions per person reached. Rising frequency with flat reach means you have saturated the audience.', f: 'Frequency = Impressions ÷ Reach' },
    { t: 'Impression', c: 'Paid media', d: 'One instance of an ad being served. Note that served is not the same as seen — see viewability.' },

    /* ---- Paid media ---- */
    { t: 'Quality Score', c: 'Paid media', d: 'A search platform’s estimate of ad, keyword and landing-page relevance. Higher scores lower your cost for the same position.' },
    { t: 'Ad rank', c: 'Paid media', d: 'What determines ad position: roughly bid multiplied by quality and expected impact. You can win a position by being more relevant, not just by paying more.' },
    { t: 'Match type', c: 'Paid media', d: 'How loosely a keyword can match a query — broad, phrase or exact. Broader match needs more conversion data and stricter negative keywords.' },
    { t: 'Negative keyword', c: 'Paid media', d: 'A term you explicitly refuse to show for. The most reliable way to stop wasting budget in search.' },
    { t: 'Lookalike audience', c: 'Paid media', d: 'An audience the platform builds to resemble a source list. Output quality depends almost entirely on the quality of the seed.' },
    { t: 'Retargeting', c: 'Paid media', d: 'Advertising to people who already visited. The most over-credited spend in marketing — many of them would have returned anyway.' },
    { t: 'Programmatic', c: 'Paid media', d: 'Automated buying of ad inventory through real-time auctions rather than direct negotiation.' },
    { t: 'DSP', c: 'Paid media', d: 'Demand-side platform. The tool advertisers use to buy programmatic inventory across many publishers at once.' },
    { t: 'SSP', c: 'Paid media', d: 'Supply-side platform. The publisher’s counterpart to a DSP, used to sell inventory.' },
    { t: 'Viewability', c: 'Paid media', d: 'Whether an impression was actually visible on screen long enough to be seen. Comparing CPMs without it compares different things.' },
    { t: 'Ad fatigue', c: 'Paid media', d: 'Performance decay as the same audience sees the same creative repeatedly. "The ad stopped working" usually means the audience has seen it too often.' },
    { t: 'Frequency capping', c: 'Paid media', d: 'Limiting how often one person sees an ad. Protects budget and reduces the irritation that damages brand perception.' },
    { t: 'Dayparting', c: 'Paid media', d: 'Scheduling ads for particular times or days based on when your buyers convert.' },
    { t: 'Incrementality', c: 'Paid media', d: 'The conversions that happened *because* of the spend, rather than conversions that would have happened anyway. The question attribution models cannot answer.' },
    { t: 'Holdout test', c: 'Analytics', d: 'Deliberately withholding advertising from a comparable group or region to measure the real lift. The most trustworthy measurement method available.' },
    { t: 'Attribution window', c: 'Analytics', d: 'How long after an ad interaction a conversion still gets credited. Longer windows flatter the channel; in B2B, short windows miss the sale entirely.' },
    { t: 'View-through conversion', c: 'Analytics', d: 'A conversion credited to an ad that was shown but never clicked. Generous by design — treat these figures with real scepticism.' },
    { t: 'Brand safety', c: 'Paid media', d: 'Controls that prevent ads appearing next to content that would damage the brand.' },
    { t: 'Retail media', c: 'Paid media', d: 'Advertising inside a retailer’s own channels, reaching shoppers at the point of purchase. High intent, but it rents you a customer you never own.' },

    /* ---- SEO & content ---- */
    { t: 'SERP', c: 'SEO', d: 'Search engine results page. Increasingly filled with ads, answer panels and AI summaries that push organic results down.' },
    { t: 'Search intent', c: 'SEO', d: 'What the searcher actually wants — informational, navigational, commercial or transactional. Mismatched intent is the top cause of good content that will not rank.' },
    { t: 'Long-tail keyword', c: 'SEO', d: 'A longer, more specific query. Lower volume individually, but usually higher intent and far easier to rank for.' },
    { t: 'Backlink', c: 'SEO', d: 'A link from another site to yours. Relevance and variety of source matter more than raw count.' },
    { t: 'Referring domain', c: 'SEO', d: 'A unique linking site. A thousand links from one domain is still one relationship — count domains, not links.' },
    { t: 'Anchor text', c: 'SEO', d: 'The visible clickable text of a link. Describes the destination to both readers and search engines.' },
    { t: 'Canonical tag', c: 'SEO', d: 'Markup declaring the preferred version of a duplicated page, so near-identical URLs do not compete with each other.' },
    { t: 'Title tag', c: 'SEO', d: 'The page title shown in search results and browser tabs. One of the few things that moves click-through at an unchanged rank.' },
    { t: 'Meta description', c: 'SEO', d: 'The summary beneath a search result. Not a direct ranking factor, but it sells the click — and engines often rewrite it anyway.' },
    { t: 'Core Web Vitals', c: 'SEO', d: 'Google’s page experience measures for loading, interactivity and visual stability. Judge them on real-world field data, not lab scores.' },
    { t: 'Crawl budget', c: 'SEO', d: 'How much of your site a search engine will crawl in a given period. Only a practical concern for very large sites.' },
    { t: 'Featured snippet', c: 'SEO', d: 'An answer extracted to the top of the results page. Wins visibility, and often removes the need to click through at all.' },
    { t: 'E-E-A-T', c: 'SEO', d: 'Experience, Expertise, Authoritativeness, Trustworthiness — the quality concepts in Google’s rater guidelines. Not a score, a set of signals.' },
    { t: 'Topic cluster', c: 'SEO', d: 'A pillar page on a broad topic, supported by interlinked pages on its subtopics. Structures a site around subjects rather than isolated keywords.' },
    { t: 'Keyword cannibalisation', c: 'SEO', d: 'Two or more of your pages competing for one query, splitting their own signals. Consolidating them usually beats both.' },
    { t: 'Content decay', c: 'SEO', d: 'The gradual traffic decline of a page as competitors update theirs. Refreshing an existing ranking page usually returns more than writing a new one.' },
    { t: 'Alt text', c: 'SEO', d: 'A text description of an image. Required for screen-reader accessibility; also gives search engines something to read.' },
    { t: 'Share of search', c: 'Brand', d: 'Your brand’s share of category-related search volume. A free, weekly brand indicator that tends to move ahead of market share.' },

    /* ---- Email & lifecycle ---- */
    { t: 'Open rate', c: 'Email', d: 'Share of delivered emails recorded as opened. Unreliable since Apple’s Mail Privacy Protection pre-loads tracking pixels — use it only as a relative signal.', f: 'Open rate = Unique opens ÷ Delivered × 100' },
    { t: 'CTOR', c: 'Email', d: 'Click-to-open rate. Of the people who opened, how many clicked — which isolates the body copy and offer from the subject line.', f: 'CTOR = Unique clicks ÷ Unique opens × 100' },
    { t: 'Revenue per recipient', c: 'Email', d: 'Campaign revenue divided by emails delivered. The metric that exposes whether sending more often is growing list value or burning it.', f: 'RPR = Campaign revenue ÷ Delivered' },
    { t: 'Deliverability', c: 'Email', d: 'Whether your email reaches the inbox rather than spam or nowhere. Invisible until it collapses, then slow and painful to repair.' },
    { t: 'SPF', c: 'Email', d: 'Sender Policy Framework. A DNS record listing which servers may send email for your domain.' },
    { t: 'DKIM', c: 'Email', d: 'A cryptographic signature proving an email genuinely came from your domain and was not altered in transit.' },
    { t: 'DMARC', c: 'Email', d: 'A policy telling inbox providers what to do when SPF or DKIM fails. Now effectively required for bulk senders at the major providers.' },
    { t: 'Hard bounce', c: 'Email', d: 'A permanent delivery failure — the address does not exist. Remove these immediately; repeat attempts damage your sending reputation.' },
    { t: 'Soft bounce', c: 'Email', d: 'A temporary failure such as a full mailbox. Safe to retry, but persistent soft bounces should eventually be suppressed.' },
    { t: 'Double opt-in', c: 'Email', d: 'Requiring a confirmation click before adding someone to a list. Smaller list, markedly better deliverability and engagement.' },
    { t: 'Suppression list', c: 'Email', d: 'Addresses you must never send to: unsubscribes, complaints, hard bounces. Sending to them is both a legal and a reputational problem.' },
    { t: 'Sunset policy', c: 'Email', d: 'A rule for retiring contacts who have not engaged in a set period. Engagement is a deliverability signal, so pruning helps the people who do want your email.' },
    { t: 'Spam complaint rate', c: 'Email', d: 'Share of recipients marking a message as spam. Major providers expect bulk senders to stay well under 0.3%.' },
    { t: 'Drip campaign', c: 'Email', d: 'An automated sequence triggered by a behaviour or date. Automated flows typically outperform broadcast campaigns by a wide margin.' },
    { t: 'Abandoned cart flow', c: 'Ecommerce', d: 'Automated reminders to people who added to cart but did not buy. Usually the highest-revenue automation in ecommerce.' },
    { t: 'Lifecycle marketing', c: 'Email', d: 'Coordinating messages to the customer’s stage — onboarding, activation, expansion, winback — rather than to a campaign calendar.' },

    /* ---- Analytics & testing ---- */
    { t: 'A/B test', c: 'Analytics', d: 'A controlled comparison of two variants with traffic split randomly. Valid only if you fix the sample size before you start.' },
    { t: 'Multivariate test', c: 'Analytics', d: 'Testing combinations of several elements at once. Needs far more traffic than an A/B test, which is why it is rarely the right choice.' },
    { t: 'Statistical significance', c: 'Analytics', d: 'The judgement that a difference is unlikely to be chance. It says nothing about whether the difference is large enough to be worth having.' },
    { t: 'p-value', c: 'Analytics', d: 'The probability of seeing a difference at least this large if the variants were truly identical. Not the probability that your variant is better.' },
    { t: 'Confidence level', c: 'Analytics', d: 'The threshold for declaring a result, commonly 95%. It sets how often you are willing to be fooled by chance.' },
    { t: 'Statistical power', c: 'Analytics', d: 'The chance of detecting a real effect if one exists. Typically set at 80%; underpowered tests mostly produce expensive shrugs.' },
    { t: 'Minimum detectable effect', c: 'Analytics', d: 'The smallest change a test can reliably find. Halving it roughly quadruples the traffic required.' },
    { t: 'Peeking problem', c: 'Analytics', d: 'Checking a running test repeatedly and stopping when it looks significant. Dramatically inflates false positives; decide the sample size first.' },
    { t: 'Novelty effect', c: 'Analytics', d: 'A temporary lift caused purely by something being new to returning visitors. Fades, which is why very short tests mislead.' },
    { t: 'Simpson’s paradox', c: 'Analytics', d: 'A trend that appears in every subgroup but reverses when the groups are combined. The reason "always segment before concluding" is such valuable advice.' },
    { t: 'Attribution model', c: 'Analytics', d: 'The rule deciding which touchpoints get credit for a conversion — last click, first click, linear, time decay or data-driven.' },
    { t: 'Multi-touch attribution', c: 'Analytics', d: 'Spreading credit across several touchpoints. Better than last click, still blind to everything untracked: word of mouth, offline, dark social.' },
    { t: 'Media mix modelling', c: 'Analytics', d: 'Statistical modelling of spend against total sales. Privacy-proof and directional; needs years of data and real expertise.' },
    { t: 'UTM parameters', c: 'Analytics', d: 'Tags appended to URLs to record source, medium and campaign. Worthless without a naming convention everyone actually follows.' },
    { t: 'Bounce rate', c: 'Analytics', d: 'Historically, the share of single-page visits. Definitions have changed between analytics tools, so check what yours measures before comparing anything.' },
    { t: 'Session', c: 'Analytics', d: 'A group of interactions within a time window. Sessions and users are different denominators and give different conversion rates.' },
    { t: 'First-party data', c: 'Privacy', d: 'Data you collected directly from your own customers with their consent. Increasingly the only durable basis for targeting and measurement.' },
    { t: 'Third-party cookie', c: 'Privacy', d: 'A cookie set by a domain other than the one being visited. Blocked by default in most browsers, which is what broke classic cross-site tracking.' },
    { t: 'CDP', c: 'Privacy', d: 'Customer data platform. Unifies customer data from many sources into one profile for segmentation and activation.' },
    { t: 'Server-side tracking', c: 'Privacy', d: 'Sending analytics events from your server rather than the browser. More reliable, and it moves the consent and compliance burden squarely onto you.' },
    { t: 'Consent management', c: 'Privacy', d: 'Capturing, storing and honouring what each person agreed to. A legal requirement in many markets, not a cookie banner you can decorate away.' },
    { t: 'GDPR', c: 'Privacy', d: 'The EU data protection regulation. Requires a lawful basis for processing personal data and grants individuals rights over it. Applies by where the person is, not where you are.' },
    { t: 'CAN-SPAM', c: 'Privacy', d: 'US law governing commercial email: honest headers, a valid postal address, and a working unsubscribe honoured promptly.' },

    /* ---- B2B & sales ---- */
    { t: 'MQL', c: 'B2B', d: 'Marketing qualified lead. Meets marketing’s bar for handover — a definition worth revisiting whenever volume rises and quality falls.' },
    { t: 'SQL', c: 'B2B', d: 'Sales qualified lead. Sales has accepted it as worth pursuing. The MQL-to-SQL gap is where marketing and sales arguments live.' },
    { t: 'Lead scoring', c: 'B2B', d: 'Ranking leads by fit and engagement signals. Useful when calibrated against closed-won data; astrology when it is not.' },
    { t: 'ABM', c: 'B2B', d: 'Account-based marketing: treating individual accounts as markets of one, with coordinated marketing and sales effort. Expensive, so reserve it for genuinely large deals.' },
    { t: 'Pipeline coverage', c: 'B2B', d: 'Open pipeline divided by the revenue target. Teams often aim for 3–4×, though coverage built from unqualified deals is just a big number.' },
    { t: 'Sales cycle length', c: 'B2B', d: 'Time from first touch to closed deal. Use the median — one long enterprise deal distorts an average badly.' },
    { t: 'Win rate', c: 'B2B', d: 'Share of closed deals that were won. Measure on closed deals only, or open opportunities suppress it artificially.', f: 'Win rate = Deals won ÷ Deals closed × 100' },
    { t: 'SDR / BDR', c: 'B2B', d: 'Sales or business development representative. Handles early outreach and qualification before an account executive takes over.' },
    { t: 'Demand generation', c: 'B2B', d: 'Creating awareness and interest before anyone is searching. Distinct from demand capture, which converts intent that already exists.' },
    { t: 'Product-led growth', c: 'B2B', d: 'Using the product itself as the main acquisition and expansion channel, through free tiers, trials and in-product sharing.' },
    { t: 'Intent data', c: 'B2B', d: 'Third-party signals suggesting an account is researching a category. Noisy and easy to over-trust; useful as a prioritisation hint, not a trigger.' },

    /* ---- Research & satisfaction ---- */
    { t: 'NPS', c: 'Research', d: 'Net promoter score: percentage of promoters minus detractors on a 0–10 recommendation question. Fine as an internal trend, weak as a cross-company comparison.', f: 'NPS = % Promoters − % Detractors' },
    { t: 'CSAT', c: 'Research', d: 'Customer satisfaction score for a specific interaction, usually a short rating scale immediately afterwards.' },
    { t: 'CES', c: 'Research', d: 'Customer effort score. Asks how easy something was — and effort predicts churn better than satisfaction does.' },
    { t: 'Brand lift study', c: 'Research', d: 'A survey comparing exposed and unexposed groups to measure awareness or preference change. One of the few ways to evidence brand advertising.' },
    { t: 'Conjoint analysis', c: 'Research', d: 'A survey technique inferring how people trade off features and price by making them choose between bundles rather than rate attributes.' },
    { t: 'Van Westendorp', c: 'Research', d: 'A price sensitivity survey using four questions about what feels too cheap, cheap, expensive and too expensive. A safer way to explore pricing than testing live.' },
    { t: 'Focus group', c: 'Research', d: 'A moderated group discussion. Prone to groupthink and to people describing an idealised version of themselves — useful for language, unreliable for predicting behaviour.' },
    { t: 'Aided vs unaided awareness', c: 'Research', d: 'Aided prompts with a list of brands; unaided asks people to name them unprompted. Unaided is much harder to earn and much more predictive.' },

    /* ---- Ecommerce ---- */
    { t: 'Cart abandonment', c: 'Ecommerce', d: 'Share of created carts that never become orders. Consistently around two-thirds to three-quarters, mostly due to unexpected costs and checkout friction.' },
    { t: 'Repeat purchase rate', c: 'Ecommerce', d: 'Share of customers who bought more than once. The jump from first to second order is the hardest and most valuable one to improve.' },
    { t: 'Purchase frequency', c: 'Ecommerce', d: 'Orders divided by unique customers in a period. Combined with AOV and lifespan, it drives lifetime value.' },
    { t: 'Upsell vs cross-sell', c: 'Ecommerce', d: 'Upsell moves a buyer to a higher-value version; cross-sell adds a complementary item. Both raise order value more cheaply than new traffic.' },
    { t: 'Subscription fatigue', c: 'Ecommerce', d: 'Declining willingness to add recurring commitments. Shows up as rising cancellation at renewal rather than at signup.' },
    { t: 'Merchandising', c: 'Ecommerce', d: 'Deciding what gets shown, where and in what order. Often a larger conversion lever than site design, and far less glamorous.' }
  ];

  /* ---- Rendering ---------------------------------------------------------- */

  var listEl  = document.getElementById('term-list');
  var countEl = document.getElementById('result-count');
  var searchEl= document.getElementById('term-search');
  var chipsEl = document.getElementById('category-chips');
  if (!listEl) return;

  var activeCategory = 'All';

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render(items) {
    listEl.textContent = '';

    if (!items.length) {
      listEl.appendChild(el('p', 'muted', 'No terms match that search. Try a shorter word, or clear the category filter.'));
      countEl.textContent = 'Showing 0 of ' + TERMS.length + ' terms';
      return;
    }

    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      var card = el('article', 'term');
      var heading = el('h3');
      heading.appendChild(document.createTextNode(item.t));
      heading.appendChild(el('span', 'pill pill-brand', item.c));
      card.appendChild(heading);
      card.appendChild(el('p', null, item.d));
      if (item.f) card.appendChild(el('span', 'term-formula', item.f));
      frag.appendChild(card);
    });
    listEl.appendChild(frag);

    countEl.textContent = 'Showing ' + items.length + ' of ' + TERMS.length + ' terms' +
      (activeCategory === 'All' ? '' : ' in ' + activeCategory);
  }

  function apply() {
    var q = (searchEl ? searchEl.value : '').trim().toLowerCase();
    var filtered = TERMS.filter(function (item) {
      if (activeCategory !== 'All' && item.c !== activeCategory) return false;
      if (!q) return true;
      return item.t.toLowerCase().indexOf(q) !== -1 ||
             item.d.toLowerCase().indexOf(q) !== -1 ||
             item.c.toLowerCase().indexOf(q) !== -1;
    });
    render(filtered);
  }

  /* ---- Category chips ------------------------------------------------------ */

  if (chipsEl) {
    var categories = ['All'].concat(TERMS.map(function (t) { return t.c; })
      .filter(function (c, i, arr) { return arr.indexOf(c) === i; })
      .sort());

    categories.forEach(function (cat) {
      var btn = el('button', 'chip', cat);
      btn.type = 'button';
      btn.setAttribute('aria-pressed', String(cat === 'All'));
      btn.addEventListener('click', function () {
        activeCategory = cat;
        Array.prototype.forEach.call(chipsEl.children, function (c) {
          c.setAttribute('aria-pressed', String(c === btn));
        });
        apply();
      });
      chipsEl.appendChild(btn);
    });
  }

  // Deep link: glossary.html#cac pre-fills the search box. Handle hashchange
  // too, so a link followed from this same page still filters — a plain
  // fragment navigation does not reload the document.
  function applyHash() {
    if (!searchEl) return;
    var hash = decodeURIComponent(window.location.hash.replace('#', '')).trim();
    if (!hash) return;
    searchEl.value = hash;
    activeCategory = 'All';
    if (chipsEl) {
      Array.prototype.forEach.call(chipsEl.children, function (c) {
        c.setAttribute('aria-pressed', String(c.textContent === 'All'));
      });
    }
    apply();
  }

  if (searchEl) {
    searchEl.addEventListener('input', apply);
    applyHash();
  }
  window.addEventListener('hashchange', applyHash);

  // Sort alphabetically, ignoring case and typographic apostrophes.
  TERMS.sort(function (a, b) {
    return a.t.toLowerCase().localeCompare(b.t.toLowerCase());
  });

  apply();
}());

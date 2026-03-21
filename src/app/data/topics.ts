export interface TopicPerspective {
  lean: "left" | "center" | "right";
  label: string;
  summary: string;
  keyPoints: string[];
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  scope: "national" | "global";
  trending: boolean;
  description: string;
  perspectives: TopicPerspective[];
  keyFacts: string[];
  historicalContext: string;
}

export const topics: Topic[] = [
  // ── NATIONAL / TRENDING ──────────────────────────────────
  {
    id: "policing-in-america",
    title: "Policing in America",
    category: "Criminal Justice",
    scope: "national",
    trending: true,
    description:
      "How should policing be reformed to balance public safety with accountability?",
    keyFacts: [
      "There are roughly 18,000 law enforcement agencies in the US employing about 800,000 sworn officers.",
      "Police kill approximately 1,000 people per year in the US, according to multiple tracking databases.",
      "Black Americans are killed by police at more than twice the rate of white Americans per capita.",
      "Violent crime rose sharply in 2020 and has since declined in many major cities.",
    ],
    historicalContext:
      "Modern American policing traces to the 19th century, with roots in slave patrols in the South and night-watch systems in the North. The Civil Rights era brought national attention to police brutality. The 1994 Crime Bill expanded funding for police. The killing of George Floyd in 2020 sparked the largest protest movement in US history, reigniting debate over police reform, defunding, and abolition.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Systemic racism is embedded in policing. Funding should shift from police to community services like mental health, housing, and violence prevention.",
        keyPoints: [
          "Defund or reallocate police budgets to social services",
          "End qualified immunity so officers face accountability",
          "Invest in community-based public safety alternatives",
          "Address root causes of crime: poverty, lack of opportunity",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Police reform is needed — better training, accountability, and oversight — but communities still need well-funded law enforcement.",
        keyPoints: [
          "Mandate de-escalation training and body cameras",
          "Create independent oversight boards for misconduct",
          "Reform qualified immunity without eliminating it entirely",
          "Fund both police and community programs",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Police protect communities. Anti-police rhetoric has led to rising crime. Officers need more support, not less funding.",
        keyPoints: [
          "Back the blue — police need funding and respect",
          "Rising crime proves defunding was a mistake",
          "Bad actors should be punished but the institution works",
          "Focus on enforcing existing laws and prosecuting criminals",
        ],
      },
    ],
  },
  {
    id: "prison-reform",
    title: "Prison Reform & Mass Incarceration",
    category: "Criminal Justice",
    scope: "national",
    trending: true,
    description:
      "The US incarcerates more people than any country on earth. What should change?",
    keyFacts: [
      "The US has about 1.9 million people in prisons and jails — the highest incarceration rate in the world.",
      "Black Americans are incarcerated at nearly 5 times the rate of white Americans.",
      "The US prison population grew 500% over 40 years, driven largely by the War on Drugs.",
      "Recidivism rates are high — about 44% of released prisoners are rearrested within a year.",
    ],
    historicalContext:
      "Mass incarceration accelerated in the 1970s-90s with the War on Drugs, mandatory minimums, and three-strikes laws. The 1994 Crime Bill expanded federal prisons. Private prisons emerged as a growing industry. The First Step Act (2018) was a rare bipartisan reform. Today, movements for abolition and reform coexist with tough-on-crime pushback.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Mass incarceration is a moral crisis rooted in racism. The system should focus on rehabilitation, not punishment, and end the war on drugs.",
        keyPoints: [
          "End cash bail and mandatory minimums",
          "Decriminalize drug possession and invest in treatment",
          "Abolish private prisons that profit from incarceration",
          "Invest in reentry programs to reduce recidivism",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Sentencing reform and rehabilitation are needed, but public safety must remain a priority. Smart-on-crime, not just tough or soft.",
        keyPoints: [
          "Reform sentencing for nonviolent offenses",
          "Expand rehabilitation and job training in prisons",
          "Keep violent offenders incarcerated for public safety",
          "Reduce recidivism through better reentry support",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Prison exists to protect the public and deter crime. Reducing sentences sends the wrong message and puts communities at risk.",
        keyPoints: [
          "Victims deserve justice — sentences should reflect the crime",
          "Deterrence works — weakening penalties increases crime",
          "Focus reforms on faith-based and work programs inside prisons",
          "Be cautious about releasing offenders early",
        ],
      },
    ],
  },
  {
    id: "ai-regulation",
    title: "AI Regulation",
    category: "Technology",
    scope: "national",
    trending: true,
    description:
      "How should the government regulate artificial intelligence as it reshapes the economy and society?",
    keyFacts: [
      "AI is projected to contribute $15.7 trillion to the global economy by 2030.",
      "There is currently no comprehensive federal AI regulation in the US.",
      "AI systems have shown documented bias in hiring, lending, and criminal justice applications.",
      "Generative AI like ChatGPT reached 100 million users faster than any technology in history.",
    ],
    historicalContext:
      "AI research dates to the 1950s but recent breakthroughs in deep learning and large language models have created urgency around regulation. The EU passed the AI Act in 2024, the world's first comprehensive AI law. The US has taken a lighter approach with executive orders. Debates center on balancing innovation with safety, bias, job displacement, and existential risk.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "AI amplifies existing inequalities and threatens jobs. Strong regulation is needed to protect workers, prevent bias, and ensure accountability.",
        keyPoints: [
          "Mandate algorithmic audits for bias and discrimination",
          "Protect workers displaced by automation with a safety net",
          "Require transparency in how AI systems make decisions",
          "Prevent concentration of AI power in a few corporations",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "AI needs guardrails but not heavy-handed regulation that kills innovation. A risk-based approach targeting high-stakes uses makes sense.",
        keyPoints: [
          "Regulate high-risk AI (healthcare, criminal justice) more strictly",
          "Industry self-regulation with government oversight",
          "Invest in AI safety research and standards",
          "Balance innovation with consumer protection",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Government regulation will stifle American innovation and hand AI leadership to China. Let the market drive progress.",
        keyPoints: [
          "Overregulation will make the US lose the AI race",
          "Free markets self-correct — bad products lose customers",
          "Existing laws already cover fraud, discrimination, etc.",
          "Focus on national security applications, not restricting business",
        ],
      },
    ],
  },
  {
    id: "immigration-policy",
    title: "Immigration Policy",
    category: "Immigration",
    scope: "national",
    trending: true,
    description:
      "How should the US approach immigration, border security, and pathways to citizenship?",
    keyFacts: [
      "The US admits roughly 1 million legal immigrants per year.",
      "An estimated 11 million undocumented immigrants live in the US.",
      "Immigrants make up about 14% of the US population, near historic highs.",
      "The US immigration court backlog exceeds 3 million cases.",
    ],
    historicalContext:
      "US immigration policy has shifted dramatically over time — from nearly open borders in the 1800s, to restrictive quotas in the 1920s, to the Immigration and Nationality Act of 1965 which ended national origin quotas. The 1986 Immigration Reform and Control Act granted amnesty to ~3 million undocumented immigrants. Comprehensive reform has failed multiple times since.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Immigrants strengthen the economy and culture. The US should create more legal pathways, protect DACA recipients, and treat asylum seekers humanely.",
        keyPoints: [
          "Immigrants are net contributors to the economy",
          "Family separation and detention policies are inhumane",
          "A path to citizenship for undocumented immigrants who've built lives here",
          "Address root causes of migration in Central America",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "The US needs both secure borders and a functional legal immigration system. Compromise should address enforcement and provide solutions for those already here.",
        keyPoints: [
          "Secure borders while maintaining legal immigration pathways",
          "Merit-based and family-based immigration both have value",
          "Address the court backlog with more judges and resources",
          "Bipartisan reform is needed but politically difficult",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Border security is national security. Legal immigration should be merit-based, and laws must be enforced consistently to maintain sovereignty.",
        keyPoints: [
          "Secure borders first before other reforms",
          "Prioritize merit-based immigration for economic benefit",
          "Enforce existing immigration laws consistently",
          "Illegal immigration strains public services and wages",
        ],
      },
    ],
  },
  // ── NATIONAL / NOT TRENDING ──────────────────────────────
  {
    id: "universal-healthcare",
    title: "Universal Healthcare",
    category: "Healthcare",
    scope: "national",
    trending: false,
    description:
      "Should the government provide healthcare coverage to all citizens?",
    keyFacts: [
      "The US spends roughly 17% of GDP on healthcare, more than any other developed nation.",
      "Approximately 27 million Americans remain uninsured as of 2023.",
      "Countries with universal systems include Canada, the UK, Germany, and Australia — each with different models.",
      "Emergency rooms are required to treat patients regardless of ability to pay under EMTALA (1986).",
    ],
    historicalContext:
      "The debate over government-provided healthcare in the US dates back to Theodore Roosevelt's 1912 campaign. Major milestones include the creation of Medicare and Medicaid in 1965, failed reform efforts in the 1990s under the Clinton administration, and the passage of the Affordable Care Act in 2010.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Healthcare is a human right. A single-payer system would cover everyone, reduce administrative costs, and allow the government to negotiate lower drug prices.",
        keyPoints: [
          "Healthcare should not depend on employment or income",
          "Single-payer would reduce overhead from insurance companies",
          "Preventive care access reduces long-term costs",
          "Other developed nations provide universal coverage at lower cost",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "The current system needs reform to expand coverage and reduce costs, but a complete government takeover may not be necessary. A hybrid public-private model could work.",
        keyPoints: [
          "Expand ACA subsidies and Medicaid to close coverage gaps",
          "Public option alongside private insurance preserves choice",
          "Address prescription drug costs through negotiation",
          "Incremental reform is more politically feasible",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Free-market competition drives innovation and quality. Government-run healthcare leads to longer wait times, less innovation, and higher taxes.",
        keyPoints: [
          "Competition between insurers lowers costs and improves quality",
          "Government programs are often inefficient and bureaucratic",
          "Individual choice and personal responsibility matter",
          "US leads the world in medical innovation partly due to market incentives",
        ],
      },
    ],
  },
  {
    id: "gun-policy",
    title: "Gun Policy",
    category: "Public Safety",
    scope: "national",
    trending: false,
    description:
      "How should the US balance Second Amendment rights with public safety?",
    keyFacts: [
      "The US has roughly 400 million civilian-owned firearms.",
      "Gun deaths in the US total roughly 45,000 per year (~54% suicides, ~43% homicides).",
      "The Second Amendment was ratified in 1791.",
      "Background checks are required for licensed dealer sales but not all private sales.",
    ],
    historicalContext:
      "The Second Amendment was adopted in 1791. Key Supreme Court rulings include District of Columbia v. Heller (2008), which affirmed an individual right to bear arms. Major legislation includes the National Firearms Act (1934), Brady Handgun Violence Prevention Act (1993), and the Federal Assault Weapons Ban (1994-2004). Mass shootings have intensified the debate in recent decades.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Gun violence is a public health crisis. Common-sense regulations like universal background checks, red flag laws, and assault weapon bans save lives.",
        keyPoints: [
          "Universal background checks for all gun sales",
          "Ban assault-style weapons and high-capacity magazines",
          "Red flag laws let courts temporarily remove guns from at-risk individuals",
          "Other developed nations have far fewer gun deaths with stricter laws",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Both gun rights and public safety matter. Focus on enforceable, targeted measures that reduce violence without broadly restricting lawful owners.",
        keyPoints: [
          "Strengthen background check system and close loopholes",
          "Invest in mental health services",
          "Red flag laws with due process protections",
          "Enforce existing laws more effectively",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "The Second Amendment protects an individual right. Gun restrictions punish law-abiding citizens without stopping criminals, and erode constitutional freedoms.",
        keyPoints: [
          "The Second Amendment is a fundamental individual right",
          "Criminals don't follow gun laws — enforcement is the answer",
          "Armed citizens deter crime and enable self-defense",
          "Focus on mental health and cultural factors, not banning weapons",
        ],
      },
    ],
  },
  {
    id: "abortion-rights",
    title: "Abortion Rights",
    category: "Social Issues",
    scope: "national",
    trending: false,
    description:
      "What should abortion access look like after the fall of Roe v. Wade?",
    keyFacts: [
      "The Supreme Court overturned Roe v. Wade in June 2022 (Dobbs v. Jackson).",
      "As of 2024, 14 states have near-total abortion bans in effect.",
      "About 1 in 4 American women will have an abortion by age 45.",
      "Public opinion polls consistently show a majority of Americans support legal abortion in at least some circumstances.",
    ],
    historicalContext:
      "Roe v. Wade (1973) established a constitutional right to abortion. For nearly 50 years it was the law of the land, though states imposed varying restrictions. Planned Parenthood v. Casey (1992) upheld Roe but allowed more state regulation. The Dobbs decision in 2022 returned abortion policy to the states, triggering a patchwork of laws across the country.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Abortion is healthcare and a fundamental right. Bans disproportionately harm low-income women and women of color.",
        keyPoints: [
          "Bodily autonomy is a fundamental right",
          "Bans don't stop abortions — they make them unsafe",
          "Disproportionate impact on marginalized communities",
          "Congress should codify abortion rights nationally",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Most Americans support access with some limits. A middle ground might allow abortion up to a certain gestational age with exceptions.",
        keyPoints: [
          "Legal in the first trimester, with restrictions later",
          "Exceptions for rape, incest, and life of the mother",
          "Reduce the need for abortion through contraception access",
          "Respect that reasonable people disagree on this issue",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Life begins at conception. The government has an obligation to protect unborn life, and Dobbs correctly returned this issue to the states.",
        keyPoints: [
          "Every life has value from conception",
          "States should decide their own abortion laws",
          "Support alternatives: adoption, crisis pregnancy centers",
          "Taxpayer money should not fund abortions",
        ],
      },
    ],
  },
  {
    id: "education-policy",
    title: "Education & School Choice",
    category: "Education",
    scope: "national",
    trending: false,
    description:
      "How should K-12 education be funded, governed, and reformed?",
    keyFacts: [
      "The US spends about $15,000 per pupil per year on K-12 education.",
      "About 10% of US students attend private schools; charter school enrollment has grown to ~3.7 million.",
      "US students rank roughly 30th globally in math and reading (PISA scores).",
      "Teacher shortages affect nearly every state, with an estimated shortage of 55,000+ teachers.",
    ],
    historicalContext:
      "Public education became universal in the US by the early 20th century. Brown v. Board of Education (1954) mandated desegregation. The school choice movement gained momentum in the 1990s with charter schools and voucher programs. Recent debates have centered on curriculum content, parental rights, book bans, and whether public money should fund private education.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Public schools are the backbone of democracy and need more funding, not competition from vouchers that drain resources.",
        keyPoints: [
          "Increase funding for public schools, especially in low-income areas",
          "Vouchers divert money from public schools that serve everyone",
          "Pay teachers more to address shortages",
          "Inclusive curriculum that reflects diverse perspectives",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Both public schools and choice options can coexist. Focus on what works: accountability, teacher quality, and evidence-based programs.",
        keyPoints: [
          "Fund public schools well while allowing charter options",
          "Accountability measures for all schools receiving public money",
          "Invest in teacher development and retention",
          "Focus on outcomes, not ideology",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Parents should decide where their children are educated. School choice and competition improve quality for everyone.",
        keyPoints: [
          "Parents know best — funding should follow the child",
          "Competition from charters and vouchers improves all schools",
          "Reduce federal involvement in education",
          "Parents should have a say in curriculum and materials",
        ],
      },
    ],
  },
  // ── GLOBAL / TRENDING ──────────────────────────────────
  {
    id: "russia-ukraine-war",
    title: "Russia-Ukraine War",
    category: "Conflict",
    scope: "global",
    trending: true,
    description:
      "What should the international response be to Russia's invasion of Ukraine?",
    keyFacts: [
      "Russia launched a full-scale invasion of Ukraine in February 2022.",
      "The US has provided over $75 billion in aid to Ukraine since the invasion.",
      "The conflict has displaced millions and caused a global energy and food crisis.",
      "Ukraine is not a NATO member but has applied for membership.",
    ],
    historicalContext:
      "Russia annexed Crimea from Ukraine in 2014 and backed separatists in eastern Ukraine. NATO expansion eastward has been a point of contention since the 1990s. The 2022 full-scale invasion was the largest military conflict in Europe since World War II, reshaping global alliances and energy markets.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Support Ukraine's sovereignty but push for diplomacy. War spending should not come at the expense of domestic needs.",
        keyPoints: [
          "Defend international law and Ukraine's sovereignty",
          "Push for diplomatic solutions to end the killing",
          "Ensure aid is accountable and doesn't fuel corruption",
          "Don't let military spending crowd out domestic priorities",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Continued support for Ukraine is in US and global interests, but with clear strategy and an eventual path to negotiation.",
        keyPoints: [
          "Supporting Ukraine deters future aggression globally",
          "Maintain sanctions and military aid with oversight",
          "Work toward negotiations when conditions are right",
          "Strengthen NATO and European defense capacity",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "America's priority should be its own borders and interests. European allies should bear more of the burden.",
        keyPoints: [
          "US taxpayers shouldn't fund an endless foreign war",
          "Europe should take the lead on its own security",
          "Focus on deterring China, the bigger strategic threat",
          "Push for a negotiated settlement",
        ],
      },
    ],
  },
  {
    id: "israel-palestine",
    title: "Israel-Palestine Conflict",
    category: "Conflict",
    scope: "global",
    trending: true,
    description:
      "What should be done about the ongoing Israeli-Palestinian conflict?",
    keyFacts: [
      "The conflict dates back to the late 19th century and the competing nationalist movements.",
      "Israel has occupied the West Bank since 1967; Gaza was under blockade since 2007.",
      "Hamas attacked Israel on October 7, 2023, killing approximately 1,200 people.",
      "Israel's military response in Gaza has killed tens of thousands of Palestinians, the majority civilians.",
    ],
    historicalContext:
      "The conflict's roots lie in competing claims to the same land. The 1948 creation of Israel led to the displacement of 700,000+ Palestinians (the Nakba). Multiple wars followed. The Oslo Accords (1990s) aimed for a two-state solution but collapsed. The October 7, 2023 Hamas attack and Israel's subsequent military campaign in Gaza have created an unprecedented humanitarian crisis.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "The humanitarian catastrophe in Gaza must end. Palestinian rights and statehood deserve equal recognition alongside Israeli security.",
        keyPoints: [
          "Immediate ceasefire and humanitarian access to Gaza",
          "End the occupation and blockade",
          "Condition US military aid on human rights compliance",
          "Support Palestinian self-determination and statehood",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Both sides have legitimate grievances. A two-state solution remains the best path, but requires compromise from all parties.",
        keyPoints: [
          "Israel has a right to defend itself; Palestinians have a right to a state",
          "Minimize civilian casualties while pursuing security",
          "Revive a credible two-state peace process",
          "International community must pressure both sides",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Israel is a key ally defending itself against terrorism. Hamas must be defeated for any peace to be possible.",
        keyPoints: [
          "Israel has the right and duty to eliminate Hamas",
          "Hamas uses civilians as human shields — they bear responsibility",
          "The US-Israel alliance is vital for regional stability",
          "No ceasefire that leaves Hamas in power",
        ],
      },
    ],
  },
  {
    id: "global-climate-action",
    title: "Global Climate Action",
    category: "Environment",
    scope: "global",
    trending: true,
    description:
      "Are international climate agreements working, and what should change?",
    keyFacts: [
      "Global average temperature has risen ~1.1°C since pre-industrial times.",
      "The Paris Agreement aims to limit warming to 1.5°C — current pledges fall short.",
      "China, the US, India, and the EU are the top four emitters.",
      "Climate-related disasters caused $380 billion in damages globally in 2023.",
    ],
    historicalContext:
      "International climate diplomacy began with the 1992 Rio Earth Summit. The Kyoto Protocol (1997) set binding targets for developed nations only. The Paris Agreement (2015) got nearly every nation to pledge emissions reductions. Annual COP conferences continue, but emissions keep rising. Developing nations argue wealthy countries owe climate reparations.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Rich countries caused this crisis and must lead with aggressive action and climate reparations to developing nations.",
        keyPoints: [
          "Wealthy nations owe a climate debt to the Global South",
          "Phase out fossil fuels entirely, not just reduce them",
          "Climate justice: the poorest are hit hardest",
          "Binding targets with enforcement, not voluntary pledges",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "International cooperation is essential but imperfect. Practical steps like carbon pricing and clean energy investment matter more than perfect agreements.",
        keyPoints: [
          "Paris Agreement is a floor, not a ceiling",
          "Carbon pricing and green technology investment are key",
          "Include China and India in meaningful commitments",
          "Adapt to unavoidable warming while mitigating future emissions",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Climate agreements disadvantage Western economies while letting major polluters like China off the hook.",
        keyPoints: [
          "Don't cripple Western economies with unilateral restrictions",
          "China and India must face equal obligations",
          "Nuclear energy and innovation, not government mandates",
          "Energy security comes first",
        ],
      },
    ],
  },
  {
    id: "china-global-power",
    title: "China's Rise as a Global Power",
    category: "Geopolitics",
    scope: "global",
    trending: true,
    description:
      "How should the world respond to China's growing economic and military influence?",
    keyFacts: [
      "China has the world's second-largest economy and largest military by personnel.",
      "China is the world's largest trading partner for over 120 countries.",
      "The Belt and Road Initiative spans 150+ countries across infrastructure and finance.",
      "Tensions over Taiwan, the South China Sea, and trade have escalated in recent years.",
    ],
    historicalContext:
      "China's economic reforms under Deng Xiaoping (1978) transformed it from an isolated state to a global economic power. WTO membership in 2001 accelerated growth. Under Xi Jinping, China has become more assertive — militarizing South China Sea islands, threatening Taiwan, and expanding global influence through the Belt and Road Initiative. The US-China relationship has shifted from engagement to strategic competition.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Engage China on shared challenges like climate change while standing firm on human rights. Avoid a new Cold War.",
        keyPoints: [
          "Cooperation on climate and pandemics is essential",
          "Speak out on Uyghur persecution and Hong Kong crackdowns",
          "Militarization increases risk of conflict — diplomacy first",
          "Reduce economic dependency without isolationism",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Compete where we must, cooperate where we can. Strengthen alliances in Asia and reduce strategic dependencies.",
        keyPoints: [
          "De-risk supply chains without full decoupling",
          "Strengthen alliances with Japan, South Korea, Australia, India",
          "Protect intellectual property and critical technology",
          "Keep communication channels open to avoid miscalculation",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "China is America's greatest strategic threat. The US must decouple economically and deter Chinese aggression, especially regarding Taiwan.",
        keyPoints: [
          "Decouple critical supply chains from China",
          "Arm Taiwan and make deterrence credible",
          "Counter Chinese influence in global institutions",
          "Hold China accountable on trade practices and IP theft",
        ],
      },
    ],
  },
  // ── GLOBAL / NOT TRENDING ────────────────────────────────
  {
    id: "global-migration-crisis",
    title: "Global Migration Crisis",
    category: "Migration",
    scope: "global",
    trending: false,
    description:
      "How should the world respond to record levels of displacement and migration?",
    keyFacts: [
      "Over 110 million people are forcibly displaced worldwide — the highest ever recorded.",
      "Climate change is becoming a major driver of migration.",
      "The Mediterranean migration route has claimed over 28,000 lives since 2014.",
      "Most refugees are hosted by developing countries, not wealthy nations.",
    ],
    historicalContext:
      "Mass displacement has surged due to conflicts in Syria, Ukraine, Venezuela, and Sub-Saharan Africa, combined with climate-driven migration. The 2015 European migrant crisis reshaped politics across the continent. The Global Compact on Migration (2018) was the first international framework but is non-binding and controversial.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Migration is a human right when fleeing persecution or disaster. Wealthy nations must share responsibility and create legal pathways.",
        keyPoints: [
          "Expand refugee resettlement in wealthy nations",
          "Create legal migration pathways to reduce dangerous crossings",
          "Address root causes: conflict, climate change, poverty",
          "Protect migrant rights and end detention of asylum seekers",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Managed migration benefits everyone, but requires cooperation, fair burden-sharing, and addressing root causes.",
        keyPoints: [
          "Fair burden-sharing between nations",
          "Invest in development to reduce migration push factors",
          "Orderly processing with humanitarian standards",
          "Balance welcoming refugees with integration capacity",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Nations have the right to control their borders. Mass migration strains resources and threatens cultural cohesion.",
        keyPoints: [
          "Sovereignty means controlling who enters your country",
          "Prioritize citizens' needs over open-door policies",
          "Secure borders to prevent exploitation by smugglers",
          "Help refugees closer to home, not through mass resettlement",
        ],
      },
    ],
  },
  {
    id: "global-wealth-inequality",
    title: "Global Wealth Inequality",
    category: "Economy",
    scope: "global",
    trending: false,
    description:
      "The richest 1% own nearly half the world's wealth. What, if anything, should be done?",
    keyFacts: [
      "The richest 1% own 46% of global wealth; the bottom 50% own less than 1%.",
      "Billionaire wealth has grown more in the last decade than the previous 20 years combined.",
      "About 700 million people still live in extreme poverty (under $2.15/day).",
      "Tax havens hold an estimated $7.5 trillion in hidden wealth.",
    ],
    historicalContext:
      "Global inequality narrowed in the mid-20th century due to progressive taxation, labor unions, and social programs. Since the 1980s, deregulation, globalization, and tax cuts have reversed this trend. The 2008 financial crisis and COVID-19 both widened the gap. International efforts like the OECD global minimum tax (2021) aim to address tax avoidance.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Extreme inequality is a policy choice, not inevitable. Tax the ultra-wealthy, close loopholes, and redistribute through public services.",
        keyPoints: [
          "Wealth taxes and higher top marginal rates",
          "Close tax havens and corporate loopholes",
          "Universal basic services: healthcare, education, housing",
          "Strengthen labor unions and worker power",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Some inequality is natural in a market economy, but extreme concentration of wealth is destabilizing. Targeted reforms can help.",
        keyPoints: [
          "Close egregious tax loopholes without punishing success",
          "Invest in education and opportunity as equalizers",
          "Global minimum tax to prevent a race to the bottom",
          "Strengthen social safety nets in developing nations",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Free markets create wealth for everyone. Redistribution punishes success and reduces the incentive to innovate and invest.",
        keyPoints: [
          "Economic growth lifts all boats — focus on growth, not redistribution",
          "Wealth creators deserve their earnings",
          "High taxes drive capital and talent to other countries",
          "Charity and private enterprise are better than government programs",
        ],
      },
    ],
  },
  {
    id: "climate-change",
    title: "US Climate & Energy Policy",
    category: "Environment",
    scope: "national",
    trending: false,
    description:
      "What should US climate and energy policy look like?",
    keyFacts: [
      "The US is the second-largest emitter of CO2, behind China.",
      "Renewable energy costs have dropped dramatically — solar by 89% since 2010.",
      "The Inflation Reduction Act (2022) allocated $369B for clean energy.",
      "The US is now the world's largest producer of oil and natural gas.",
    ],
    historicalContext:
      "The issue became politically prominent in the late 1980s. The US has oscillated on climate policy — joining the Paris Agreement under Obama, withdrawing under Trump, and rejoining under Biden. The Inflation Reduction Act represented the largest US climate investment ever, but debates continue over fossil fuels, EVs, and the pace of transition.",
    perspectives: [
      {
        lean: "left",
        label: "Progressive View",
        summary:
          "Climate change is an existential crisis requiring immediate, large-scale government action to transition away from fossil fuels.",
        keyPoints: [
          "Science demands urgent action to limit warming to 1.5°C",
          "Invest heavily in renewable energy and green jobs",
          "Environmental justice — pollution disproportionately affects marginalized communities",
          "Hold fossil fuel companies accountable",
        ],
      },
      {
        lean: "center",
        label: "Moderate View",
        summary:
          "Climate change is real and requires action, but policy should balance environmental goals with economic reality.",
        keyPoints: [
          "Carbon pricing can efficiently reduce emissions",
          "Support an all-of-the-above energy strategy including nuclear",
          "Invest in adaptation alongside mitigation",
          "Pragmatic transition that doesn't spike energy costs",
        ],
      },
      {
        lean: "right",
        label: "Conservative View",
        summary:
          "Energy policy should prioritize affordability and energy independence. Innovation, not mandates, is the answer.",
        keyPoints: [
          "Energy independence strengthens national security",
          "Regulations kill jobs and raise energy costs",
          "Technology and innovation will solve climate challenges",
          "Don't sacrifice the economy for unproven mandates",
        ],
      },
    ],
  },
];

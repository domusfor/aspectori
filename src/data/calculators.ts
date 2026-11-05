export type CalculatorMode = "moon" | "rising" | "big-three" | "houses" | "synastry" | "venus" | "mars" | "moon-phase" | "chart-ruler" | "profections" | "birth-time";
export interface Calculator {
  slug: string; mode: CalculatorMode; title: string; description: string; intro: string;
  sections: { title: string; text: string }[];
  faq: [string, string][];
  guide: string;
  sources?: [string, string][];
  /** Extra next steps, shown beside the guide link. */
  related?: [string, string][];
}
export const CALCULATORS: Calculator[] = [
  {
    slug: "venus-sign", mode: "venus", title: "Free Venus Sign Calculator",
    description: "Find your Venus sign, degree and birth-time uncertainty. Explore symbolic themes of appreciation and relationships, with houses when your birth time is known.",
    intro: "Explore the Venus placement in your birth chart: its sign, degree and house, alongside a question about what you value and how you show care.",
    sections: [
      { title: "One placement, in context", text: "Venus is traditionally associated with appreciation, attraction and values. Its sign adds a symbolic style to those themes; it does not identify an ideal partner or determine how you behave. Read it alongside your Moon and the contacts in a two-person comparison." },
      { title: "Date, time and sign changes", text: "The calculation uses your local birth date and historical time zone. An unknown time produces a degree range. If Venus crosses a sign boundary during that day, you see both possible signs and the local transition time rather than a single invented answer." },
      { title: "Take the next useful step", text: "With a known birth time, the result includes whole sign and Placidus house assignments. Open your full chart to compare the rest of your placements, or use the synastry tool to compare two people. Your birth details can travel between tools in the private URL fragment." },
    ],
    faq: [["What is my Venus sign?", "It is the tropical zodiac sign occupied by Venus at your birth. Enter your date, birthplace and recorded time, or mark the time unknown."], ["Can I find my Venus sign without a birth time?", "Usually. We check Venus at the start and end of your birth day. If the sign is the same at both, that sign is shown. If it differs, both possibilities are shown."], ["Does a Venus sign prove romantic compatibility?", "No. A Venus sign is one symbolic placement. It is not a relationship test or a prediction of attraction."]],
    guide: "how-to-read-a-birth-chart",
    sources: [["Cafe Astrology: Venus sign and unknown-time limitations", "https://cafeastrology.com/whats-my-venus-sign.html"]],
  },
  {
    slug: "mars-sign", mode: "mars", title: "Free Mars Sign Calculator",
    description: "Calculate your Mars sign, degree and houses. See unknown-time ranges and explore astrological themes of initiative, effort and boundaries for free.",
    intro: "Find the Mars placement in your chart and explore the symbolism of initiative and effort, with the actual position visible beside the reading.",
    sections: [
      { title: "From a sign to a useful question", text: "Mars is associated in astrology with action, assertion and effort. Treat the reading as a prompt to notice your own choices. A placement cannot diagnose your temperament, explain away harmful behavior or tell you how another person will act." },
      { title: "What retrograde means here", text: "For a timed birth, the result shows whether Mars was moving forward or backward in geocentric longitude at that moment. Retrograde is apparent motion from Earth, not a reversal of the planet’s physical orbit. Unknown-time results avoid assigning one motion state to the entire day." },
      { title: "Keep the whole chart in view", text: "An exact time adds houses; missing times leave those fields out. If different house systems disagree, the full chart comparison makes the difference visible. For a relationship question, move on to cross-chart aspects instead of comparing Mars signs alone." },
    ],
    faq: [["How do I calculate my Mars sign?", "Use your birth date, birthplace and time if known. This tool calculates Mars independently of your Sun sign."], ["Can Mars change signs on my birthday?", "Yes. If the local birth day crosses a sign boundary and your time is missing, both possible Mars signs are shown."], ["Is a Mars sign the same as a Venus sign?", "No. They are separate planetary positions. This calculator focuses on Mars; the Venus calculator covers appreciation and relationship symbolism."]],
    guide: "aspects-and-orbs",
    sources: [["Cafe Astrology: planetary sign tools", "https://cafeastrology.com/astrologytoolstables.html"]],
  },
  {
    slug: "moon-phase", mode: "moon-phase", title: "Birth Moon Phase Calculator",
    description: "See the Moon phase and illuminated fraction at your birth. Includes a lunar illustration, Sun–Moon angle and hourly samples when your birth time is unknown.",
    intro: "What did the Moon look like when you were born? See its phase and illuminated fraction, with a visual comparison across the day if your time is unknown.",
    sections: [
      { title: "Phase and sign answer different questions", text: "A Moon sign locates the Moon in the zodiac. A Moon phase describes the changing Sun–Moon geometry and how much of the lunar disc appears illuminated from Earth. People with the same Moon sign can have different birth phases." },
      { title: "A picture with a defined meaning", text: "The illustration uses the calculated illuminated fraction, with the lit side on the right while waxing and on the left while waning. It is a schematic view, not a photograph or a simulation of the Moon’s orientation above your local horizon." },
      { title: "Do not turn a date into false precision", text: "With a known time, the result describes that moment. Without it, the tool samples the local day hourly and includes both endpoints. A range of sampled illumination values and any phase-label changes are shown. Primary phase labels say ‘near’ because the exact astronomical phase occurs at an instant." },
    ],
    faq: [["Can I find my birth Moon phase without a time?", "Yes, as a sampled day range. The exact illuminated fraction and a phase boundary may depend on the missing time."], ["Why does the result say near full Moon?", "This tool labels a 10-degree window on either side of the primary Sun–Moon longitude angles. The full-Moon event itself occurs at a specific instant, not throughout that window."], ["Can Moon phases tell me whether someone is my soulmate?", "No. Matching or complementary Moon pictures do not establish relationship compatibility. This calculator makes no soulmate claim."]],
    guide: "birth-chart-without-birth-time",
    sources: [["NASA: Moon phases", "https://science.nasa.gov/moon/moon-phases/"], ["Swiss Ephemeris: planetary phenomena", "https://www.astro.com/swisseph/swephprg.htm"]],
  },
  {
    slug: "chart-ruler", mode: "chart-ruler", title: "Chart Ruler Calculator: Traditional & Modern",
    description: "Find the planet ruling your Rising sign, its natal sign, degree and houses. Compare traditional and modern chart rulers with clear birth-time requirements.",
    intro: "Follow your Rising sign to its ruling planet. See traditional and modern conventions side by side, then find that planet in your actual birth chart.",
    sections: [
      { title: "Follow the Rising sign", text: "The chart ruler here means the planet assigned to the Ascendant’s zodiac sign. First calculate the Ascendant from a recorded birth time and place, then look up its ruler. A missing time means the first step is unavailable; the Sun sign cannot stand in for it." },
      { title: "Why two answers can be valid conventions", text: "Traditional rulers use the seven classical bodies. Modern conventions add Pluto for Scorpio, Uranus for Aquarius and Neptune for Pisces. The tool names both schemes explicitly and displays a second planet only where their assignments differ." },
      { title: "Look at where the ruler is placed", text: "The result follows each ruler to its natal sign and degree and compares whole sign with Placidus houses. A house difference comes from the house convention, not a changed planet. This lookup does not calculate dominant-planet scores, almutens or final dispositors." },
    ],
    faq: [["Is my chart ruler my Sun-sign ruler?", "Not necessarily. This tool uses the ruler of your Rising sign, which can be different from your Sun sign."], ["Why do Scorpio, Aquarius and Pisces show two planets?", "Their traditional and modern rulership assignments differ. Both are identified so you can see which convention produces each result."], ["Can I find my chart ruler without a birth time?", "This birth-data calculator needs the time to establish your Ascendant. It will not guess a Rising sign or its ruler."]],
    guide: "how-to-read-a-birth-chart",
    sources: [["Astrodienst: rulers and chart rulership", "https://www.astro.com/astrology/in_ruler_e.htm"], ["Astrotheme: the chart ruler", "https://www.astrotheme.com/chart-ruler-astrology.php"]],
  },
  {
    slug: "annual-profections", mode: "profections", title: "Annual Profection Calculator: House & Time Lord",
    description: "Find your annual profection house, sign and traditional time lord. Explore a 12-year cycle by age, with birthday dates and honest unknown-time limits.",
    intro: "Explore the traditional twelve-year profection cycle. Choose an age to see its house theme, birthday interval and, when your time is known, the sign and ruling planet.",
    sections: [
      { title: "A count you can check yourself", text: "At age zero, the first house is selected. Each birthday advances the count by one, and after twelve years it repeats. The formula is age modulo twelve, plus one. Ages 0, 12, 24 and 36 therefore share a first-house year." },
      { title: "House number versus sign and time lord", text: "Age alone gives the house number. Naming its zodiac sign requires the Ascendant; the traditional ruler of that sign is called the time lord. This tool uses whole-sign counting and traditional rulers even when a modern chart-ruler convention would give a different planet." },
      { title: "Birthday years, not January-to-December years", text: "The interval starts on the birthday for the chosen age and ends at the next birthday. February 29 is represented by February 28 in non-leap years here, an explicit calendar convention. A profection is not a solar-return chart and does not predict an event or its date." },
    ],
    faq: [["What is my annual profection year?", "Choose your age at your last birthday. The calculator returns the corresponding house in the repeating twelve-year cycle."], ["Can I use profections without a birth time?", "You can calculate the house number from age. The sign and traditional time lord need a Rising sign, so those are omitted when the birth time is unknown."], ["Does it use Placidus or modern rulers?", "No. This version uses whole-sign counting from the Ascendant and traditional domicile rulers. It shows the rule alongside your result."]],
    guide: "whole-sign-vs-placidus",
    sources: [["Astrodienst / The Mountain Astrologer: annual profections", "https://www.astro.com/astrology/tma_article190314_s.htm"]],
  },
  {
    slug: "birth-time-explorer", mode: "birth-time", title: "Birth Time Explorer: Possible Rising Signs",
    description: "Only know roughly when you were born? Enter a time range to see every possible Rising sign, the exact clock times it changes and what else moves.",
    intro: "Know you were born “in the morning” or “around 8”? Enter the earliest and latest possible times. See every Rising sign in that window and exactly when each one begins.",
    sections: [
      { title: "Why not assume two hours per sign?", text: "A sign takes about two hours to rise only on average. Depending on your latitude and the sign, it can take well under an hour or more than three. This tool calculates your actual changes from the date and birthplace instead of using a fixed rule." },
      { title: "How to choose your window", text: "Use the widest range you can honestly support. “Before school started” might mean 06:00 to 09:00. Enter times as they would have been read on a clock at the birthplace; the historical time zone is applied for you, including summer time." },
      { title: "What this cannot do", text: "It shows what is possible, not which option is true. Reading the options and choosing the one that sounds most like you is not evidence of your birth time. A birth record is, and many registries or hospitals can help you look for one." },
    ],
    faq: [["Can this tell me my real birth time?", "No. It shows which results depend on the time. Only a record of the time itself can settle which one applies."], ["What if my window crosses midnight?", "This version covers one calendar date. Run the date before and the date after as separate windows, each ending or starting at midnight."], ["Why does the Moon sometimes appear too?", "The Moon changes sign about every two and a half days, so it can change within your window. When it does, the change time is shown because your Moon sign depends on the time too."]],
    guide: "birth-chart-without-birth-time",
    related: [["Calculate a Rising sign from a known time", "/calculators/rising-sign"]],
  },
  {
    slug: "moon-sign", mode: "moon", title: "Free Moon Sign Calculator",
    description: "Find your Moon sign and degree from your birth date, time and place. Unknown birth time? See both possible signs and the local time of a sign change.",
    intro: "Find the Moon’s zodiac sign at your birth. If you do not know the time, we check the local day and show the uncertainty instead of choosing a sign for you.",
    sections: [
      { title: "What your Moon result means", text: "The result shows a tropical zodiac sign and a position within that sign. In astrology, the Moon is associated with emotional responses, familiar habits and comfort. Those interpretations are symbolic; the position itself is an astronomical calculation." },
      { title: "When the birth time is missing", text: "The Moon can move into a new sign during a birth day. Choose ‘I don’t know my birth time’ to see the day’s range. If it crosses a sign boundary, both signs appear with the local change time. A single sign means the Moon is in that sign at both the start and end of the day. The exact degree still needs a birth time." },
      { title: "Why the birthplace matters", text: "A calendar date at the birthplace must be converted to UTC before calculating positions. Enter the place where you were born, rather than where you live now. The historical time zone is selected automatically, including daylight-saving rules." },
    ],
    faq: [["Can I find my Moon sign without a birth time?", "Often, yes. If the Moon stays in one sign all day, that sign is shown. If it changes signs, both possibilities are shown; an exact answer needs a birth time."], ["Is this a Vedic Moon sign or Rashi calculator?", "No. This calculator uses the tropical zodiac. Sidereal and Vedic calculators use a different zodiac reference, so their result may differ."], ["Is the Moon sign the same as my Sun sign?", "No. The Sun and Moon are calculated separately. They can occupy the same sign, but one cannot be inferred from the other."]],
    guide: "birth-chart-without-birth-time",
  },
  {
    slug: "rising-sign", mode: "rising", title: "Free Rising Sign & Ascendant Calculator",
    description: "Calculate your Rising sign, also called the Ascendant, with its exact degree. Enter your birth time and birthplace; learn why a missing time cannot be guessed.",
    intro: "Your Rising sign is the zodiac sign on the eastern horizon at birth. Find its sign and degree using the recorded local birth time and birthplace.",
    sections: [
      { title: "Rising sign and Ascendant are the same point", text: "The Ascendant is where the eastern horizon meets the zodiac at a particular moment and place. Astrologers call its zodiac sign the Rising sign. It also anchors the house layout, so a time change can affect both your Rising degree and your houses." },
      { title: "Use the recorded local clock time", text: "Enter the time as recorded at the birthplace. Do not convert it to your current time zone or manually subtract daylight saving. Aspectori resolves the historical offset and shows the offset used on your full chart." },
      { title: "What if my time is approximate?", text: "A result from an approximate time is provisional, especially near a sign boundary. Try the earliest and latest plausible times and compare the outputs. Without any birth time, this tool deliberately leaves the Rising sign unknown; a date or personality description cannot supply the missing clock time." },
    ],
    faq: [["Can I calculate my Rising sign without a birth time?", "Not reliably. The Ascendant changes during the day and depends on location. This calculator will explain the missing information rather than invent a Rising sign."], ["Why does another calculator give a different Ascendant?", "First compare the recorded time, AM/PM, birthplace, historical UTC offset and zodiac reference. A tropical and a sidereal calculator can label the same sky position differently."], ["Does changing houses change my Rising sign?", "Switching between Placidus and whole sign does not change the Ascendant’s astronomical position. It changes how houses are assigned around the chart."]],
    guide: "how-to-read-a-birth-chart",
    related: [["Explore an uncertain birth time", "/calculators/birth-time-explorer"]],
  },
  {
    slug: "sun-moon-rising", mode: "big-three", title: "Sun, Moon & Rising Sign Calculator",
    description: "Find your Big Three: Sun, Moon and Rising signs, with degrees and clear birth-time uncertainty. Free tropical astrology calculator with a downloadable report.",
    intro: "See your Big Three together: the Sun, Moon and Rising. Each comes from a different point in the sky, so your birthday alone does not tell the whole story.",
    sections: [
      { title: "Three points, three roles", text: "Astrological tradition associates the Sun with identity and direction, the Moon with emotional habits, and the Rising sign with how you meet the world. These are interpretive lenses, not personality diagnoses. The calculator keeps their actual positions visible beside the interpretation." },
      { title: "Read the degrees as well as the signs", text: "Each zodiac sign spans 30 degrees. Two people with the same three signs can have different degrees, aspects and house placements. Use the full chart link after calculating to explore the connections and compare house systems." },
      { title: "An honest result with incomplete data", text: "Without a birth time, your result shows the range for your Sun and Moon and leaves out the Rising sign. If the Sun or Moon changes sign that day, you see both options. Your free report shows the same uncertainty." },
    ],
    faq: [["What are the Big Three in astrology?", "The Big Three are your Sun sign, Moon sign and Rising sign, also called the Ascendant."], ["Can all three signs be the same?", "Yes. Each point is calculated independently, and they can fall in the same zodiac sign."], ["What do I need to calculate all three?", "Your birth date, recorded local birth time and birthplace. Without a time, the Rising sign remains unknown and the Moon may have two possibilities."]],
    guide: "how-to-read-a-birth-chart",
  },
  {
    slug: "house-systems", mode: "houses", title: "Placidus vs Whole Sign House Calculator",
    description: "Compare Placidus and whole sign houses for the same birth chart. See which planets change houses, with a Porphyry comparison and polar-latitude handling.",
    intro: "Put two house systems beside each other. Your planets stay at the same zodiac degrees; this comparison shows which house assignments change.",
    sections: [
      { title: "What the comparison changes", text: "Whole sign assigns the entire Rising sign to the first house, then one sign to each following house. Placidus uses time-based divisions and can produce unequal house sizes. Your planetary longitudes stay the same while their house numbers may differ." },
      { title: "Keep the birth data constant", text: "A fair comparison uses one date, time, birthplace and zodiac reference. The table marks differences and includes Porphyry as another reference. Changing the time at the same time as the house system would make the source of a difference harder to identify." },
      { title: "Unknown times and polar locations", text: "Houses require a birth time. When it is missing, the tool explains why houses are omitted. At locations where Placidus cannot be computed, whole sign remains available and the missing Placidus result is explicitly marked." },
    ],
    faq: [["Which house system is more accurate?", "They are different astrological conventions rather than competing measurements of planetary positions. This tool makes their differences visible without declaring one interpretation objectively correct."], ["Will switching to whole sign change my zodiac signs?", "No. The planetary signs and degrees remain the same; house assignments can change."], ["Why is Placidus unavailable for my birthplace?", "Placidus has mathematical limitations at high latitudes. When the calculation is unavailable, Aspectori uses whole sign and explains the limitation."]],
    guide: "whole-sign-vs-placidus",
  },
  {
    slug: "synastry", mode: "synastry", title: "Free Synastry & Chart Compatibility Calculator",
    description: "Compare two birth charts with free synastry, planetary aspects and house overlays in both directions. Explore whole sign, Placidus and a free comparison PDF.",
    intro: "Compare two people’s planetary positions. Explore major aspects and house overlays in both directions, with the evidence behind each result and a free comparison PDF.",
    sections: [
      { title: "What this comparison includes", text: "The calculator compares major aspects between the two charts and ranks contacts involving personal planets first. The three highlighted contacts offer a starting point; the expanded list shows all contacts retained by this method. Slow-planet pairs, the Midheaven, node and Chiron contacts are outside this comparison." },
      { title: "Birth times change the confidence", text: "When either time is unknown, the calculator keeps only contacts within the orb at both the start and end of the birth day. It does not invent an Ascendant. Fewer contacts can be an honest consequence of incomplete information, not a sign that two people are incompatible." },
      { title: "Your planets in their houses, and theirs in yours", text: "The house-overlay tables place each person’s ten planets in the other person’s whole sign and Placidus houses. Each direction needs the house owner’s birth time. If only the other person’s time is missing, their planets are shown at the start and end of the day, so you can see the uncertainty. Polar charts keep Placidus unavailable rather than silently substituting another system." },
      { title: "A conversation starter, not a relationship verdict", text: "Synastry is an astrological comparison of two charts. A composite chart is a different technique, and this calculator does not create one. We do not reduce the comparison to a percentage or claim that chart patterns determine whether a relationship succeeds." },
    ],
    faq: [["Can I compare charts without birth times?", "Yes, with limits. Without a time, the Rising sign is left out and we keep only contacts present at both the start and end of the birth day. House overlays need the time of the person whose houses are being used."], ["Does this predict whether a relationship will work?", "No. It describes symbolic astrological contacts, not a scientifically validated relationship prediction."], ["Does this include house overlays?", "Yes. Both directions show whole sign and Placidus houses, birth-time limitations and planetary degrees. They are also included in the free comparison PDF. This tool does not create a composite chart."]],
    guide: "aspects-and-orbs",
  },
];
export const calculatorBySlug = (slug: string) => CALCULATORS.find((tool) => tool.slug === slug);

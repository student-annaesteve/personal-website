/*
  Your content lives here. Each project becomes a summit in the range.
  The route climbs in this order: the first project is the lowest peak and
  the last one is the main summit. "About me" opens from the round button
  in the top-right corner.

  images: [{ src: "images/my-poster.jpg", alt: "Short description" }, ...]
          Leave the list empty to show placeholder frames.
  link:   a URL for the full project (Behance, PDF, website…) or "".
  color:  the tint of the placeholder frames (keep to the site's moss / tan / bone palette).

  Optional case-study fields (see "Mar i Muntanya"): headline, subtitle, goal, hero, levels.
  A project with `layout` (see "Smart irrigation") is drawn by its own renderer in layouts/.
  Each level can set its own title, labels, stats, rules and media ({ src } image, { video, poster },
  or { placeholder: "…" } to reserve a photo slot).
  When `levels` is present the panel opens wider and leads with the product mockups.
*/
window.PROJECTS = [
  {
    // Research project (batxillerat "treball de recerca"). It has its own look, drawn by
    // layouts/irrigation.js and layouts/irrigation.css: the report's white paper, sketch and diamond tiles.
    title: "Smart irrigation", // short name for the map and the route list
    layout: "irrigation",
    headline: "Cada gota compta!",
    year: "2021",
    tags: ["Research", "IoT", "Arduino prototype"],
    color: "#3e917e",
    sketch: { src: "images/smart-irrigation/sketch.png", alt: "Pencil sketch of a sprinkler with arrows to a soil humidity sensor, a temperature sensor and a light sensor" },
    goal: "Find the factors that make irrigation more efficient. Starting from the curiosity of how the irrigation systems of the Cerdanya work, the project explains why plants need water, studies how the region waters today, and builds a smart irrigation prototype that decides from sensor data when to water.",
    // Component photos set inside some of the cover's diamonds (transparent PNGs).
    tiles: ["images/smart-irrigation/tile-nodemcu.png", "images/smart-irrigation/tile-temperature.png", "images/smart-irrigation/tile-water-sensor.png", "images/smart-irrigation/tile-temperature-diagram.png"],
    theory: {
      text: "Plants need water because of evapotranspiration: water evaporates from the soil and transpires from the leaves. Sun, temperature, humidity and wind change how much. Localised irrigation wastes the least, and IoT sensors make precision agriculture possible.",
      main: { src: "images/smart-irrigation/evapotranspiracio.png", alt: "Diagram of evapotranspiration: evaporation from the soil and transpiration from the leaves", caption: "Evapotranspiration: soil evaporation + leaf transpiration" },
      factors: [
        { src: "images/smart-irrigation/et-radiacio.png", alt: "Solar radiation raises evapotranspiration" },
        { src: "images/smart-irrigation/et-temperatura.png", alt: "Air temperature raises evapotranspiration" },
        { src: "images/smart-irrigation/et-humitat.png", alt: "Air humidity lowers evapotranspiration" },
        { src: "images/smart-irrigation/et-vent.png", alt: "Wind raises evapotranspiration" },
      ],
      factorsCaption: "Factors that affect evapotranspiration: sun, temperature, humidity and wind",
    },
    study: {
      text: "I surveyed 100 people in the Cerdanya and interviewed 5 professionals. Most water on a timer and very few use sensors, but almost everyone thinks irrigation will change.",
      numbers: [["49%", "water on a timer"], ["2%", "use sensors"], ["95%", "expect irrigation to change"]],
    },
    prototype: {
      text: "A NodeMCU (ESP8266) reads soil humidity and temperature, shows them on an LCD and sends them to ThingSpeak. A servomotor opens the water, in automatic or manual mode, controlled from Telegram.",
      working: { src: "images/smart-irrigation/working.png", alt: "The prototype working: phone with the Telegram bot in automatic mode, sensors, NodeMCU, servomotor and LCD reading No cal regar", caption: "Automatic mode: «No cal regar»" },
      diagram: { src: "images/smart-irrigation/logica.png", alt: "System diagram: sensors to NodeMCU, servomotor to the plant, data to ThingSpeak, control from Telegram", caption: "How the system works" },
      row: [
        { src: "images/smart-irrigation/components.png", alt: "Labelled components: temperature sensor, humidity sensor, NodeMCU, LCD I2C screen, servomotor", caption: "Components" },
        { src: "images/smart-irrigation/final.png", alt: "Final assembly in its 3D-printed case, LCD reading Sistema iniciat", caption: "Final build in a 3D-printed case" },
      ],
    },
    conclusion: "Irrigation in the Cerdanya can be much more efficient: water at the right moment, use localised systems and let sensors decide. The prototype shows that a cheap, reliable device can already do it.",
    // Photos toned to warm black and white; cropped square on the page.
    awards: [
      { src: "images/smart-irrigation/award-1.jpg", alt: "Receiving the V Premi BDP Software trophy", name: "V Premi BDP Software · 2022" },
      { src: "images/smart-irrigation/award-2.jpg", alt: "Group photo at the UPC award ceremony", name: "23è Premi UPC · Batxillerat 2022" },
      { src: "images/smart-irrigation/award-3.jpg", alt: "Award ceremony in Puigcerdà", name: "Premi Sebastià Bosom · Vila de Puigcerdà 2022" },
      { src: "images/smart-irrigation/award-4.jpg", alt: "Holding the award diploma", name: "Stockholm Junior Water Prize · Spain" },
    ],
    link: "https://docs.google.com/document/d/1NoI76e8yccoWwmlpAoMLF0dlqhZdLjtPvQypX51v77Q/edit",
    linkLabel: "Read the full report (PDF)",
    linkNote: "Memòria del treball de recerca · 2021",
    images: [],
  },
  {
    // Python project (UPC). Its own look (layouts/cinebus.js + .css): a cinema ticket and a bus map.
    title: "CineBus", // short name for the map and the route list
    layout: "cinebus",
    headline: "From the billboard to your seat",
    subtitle: "CineBus · find a film in Barcelona and the fastest way to get there by bus and on foot",
    year: "2023",
    credit: "with Cristina Teixidó",
    tags: ["Python", "Graphs", "Web scraping"],
    color: "#c8102e",
    problem: "Barcelona has dozens of cinemas and hundreds of screenings a day. Choosing a film is one search; working out which cinema you can reach first, and how, is another.",
    goal: "So the goal was one tool that does both: pick a film you like and get the quickest route to the next screening, walking and taking buses.",
    steps: [
      ["Billboard", "Scrapes today's Barcelona billboard: films, cinemas, times and languages.", "BeautifulSoup"],
      ["Bus graph", "Turns every TMB line and stop into a graph of stops joined by bus routes.", "NetworkX"],
      ["City graph", "Merges the bus graph with Barcelona's street map, so a trip can mix walking and buses.", "OSMnx"],
      ["Shortest path", "Finds the fastest route from where you are to the cinema, with as many changes as needed.", "staticmap"],
    ],
    facts: [["5 km/h", "walking"], ["20 km/h", "on the bus"], ["4", "Python modules"]],
    result: "A menu-driven demo that builds the billboard, searches it by title, draws the bus and city graphs over Barcelona, and plots the fastest path to the cinema.",
    images: [],
    link: "https://github.com/annaesteve/CineBus",
    linkLabel: "View the code on GitHub →",
  },
  {
    // Team app project. Its own look (layouts/mysonar.js + .css): black, Sónar yellow and hazard stripes, like the deck.
    title: "MySónar", // short name for the map and the route list
    layout: "mysonar",
    headline: "Your Sónar, planned for you",
    subtitle: "MySónar · a mobile app that builds a personal Sónar Festival schedule from your taste",
    year: "",
    tags: ["Mobile app", "Recommender", "UX / UI"],
    color: "#f2b40c",
    problems: [
      ["Overwhelming", "Hundreds of concerts, talks and activities over three days and nights.", "day"],
      ["Unknown artists", "Most names in the line-up mean nothing to you yet.", "night"],
      ["FOMO", "The fear of missing the show you would have loved.", "day"],
    ],
    goal: "So the main goal of this project is to help each visitor find their own Sónar: discover artists they don't know yet and leave with a schedule that fits them.",
    flow: [
      { src: "images/mysonar/days.jpg", label: "Days", alt: "When will you attend? Choose the days and nights" },
      { src: "images/mysonar/styles.jpg", label: "Styles", alt: "What defines you best? Pick music styles" },
      { src: "images/mysonar/activities.jpg", label: "Must-sees", alt: "Search and select the essential activities" },
      { src: "images/mysonar/swipe.jpg", label: "Swipes", alt: "Swipe through artist videos" },
      { src: "images/mysonar/profile.jpg", label: "Profile", alt: "Your profile: 74% drone, 86% merengue, 98% sonic fiction" },
      { src: "images/mysonar/results.jpg", label: "Schedule", alt: "Your personal schedule of results" },
    ],
    solution: "Answer a few questions, swipe through 8 short artist videos and get a schedule made for you.",
    steps: [
      ["Tags", "An LLM (Gemini) reads each artist's text, images and music and gives them tags."],
      ["Embedding space", "Every artist becomes a point in the space of tags, so similar artists sit close together."],
      ["8 swipes", "The swipe artists are chosen to cover the whole space with as few swipes as possible."],
      ["Schedule", "The closer an activity is to your taste, the higher its priority in your timetable."],
    ],
    results: {
      stats: [["70", "people tested it"], ["8", "swipes to know you"], ["65%", "would follow most of the route"]],
      models: [["LLaMA mini", 85], ["OpenAI", 62]],
    },
    images: [],
    link: "",
  },
  {
    // A case study: when `levels` is present the panel opens wide and shows the product first.
    title: "Mar i Muntanya", // short name for the map and the route list
    theme: "cupra", // copper orange accents, as in the presentation (styles.css)
    headline: "Designing trust in a car that drives itself", // the project's goal, shown as the panel title
    subtitle: "Mar i Muntanya · SEAT–UPC Design Thinking challenge for CUPRA · with Aleix Albaiges",
    year: "",
    tags: ["UX / UI", "Automotive HMI", "Prototype"],
    color: "#354024",
    // Hero: the simulator's start screen on a laptop.
    hero: [
      { src: "images/mar-i-muntanya/selector-hero.jpg", alt: "Simulator start screen: Mar i Muntanya, choose the level L3, L4 or L5", device: "laptop" },
    ],
    goal: "The SEAT–UPC Design Thinking challenge asked us to reimagine the inside of a car for autonomous mobility, without losing what makes it a CUPRA. We focused on how the car talks to the people inside, so that every change between the car and the driver feels clear, calm and still under their control.",
    description: "A web simulator to live autonomous driving, levels L3 to L5, from the driver's seat.",
    // Each level shows its video in a device. Until the video file exists, the poster image is shown.
    levels: [
      {
        code: "L3",
        challenge: "The car drives itself until a roadworks zone, then hands control back. How do you make that handover without the driver feeling unsafe?",
        solution: "A fast, intuitive handover: a clear visual hierarchy, alerts that build up step by step, and only the essentials on screen.",
        media: { video: "videos/mar-i-muntanya/l3.mp4", poster: "images/mar-i-muntanya/l3-poster.jpg", device: "laptop", alt: "L3 simulation: the car hands control back before a roadworks zone" },
        frames: [
          { src: "images/mar-i-muntanya/l3-manual.jpg", caption: "Manual driving" },
          { src: "images/mar-i-muntanya/l3-available.jpg", caption: "System available" },
          { src: "images/mar-i-muntanya/l3-active.jpg", caption: "System active" },
          { src: "images/mar-i-muntanya/l3-handback.jpg", caption: "Handing back control" },
          { src: "images/mar-i-muntanya/l3-urgent.jpg", caption: "Urgent takeover" },
          { src: "images/mar-i-muntanya/l3-safety.jpg", caption: "Safety protocol" },
        ],
      },
      {
        code: "L4",
        challenge: "In the city the car handles everything, even giving way to an ambulance. How do you build trust without flooding the driver with information?",
        solution: "Show less, at the right moment: only the information that matters in each situation, plus extra comfort, like offering the wheel on a winding road.",
        media: { video: "videos/mar-i-muntanya/l4.mp4", poster: "images/mar-i-muntanya/l4-poster.jpg", device: "monitor", alt: "L4 simulation from the driver's seat: giving way to an ambulance" },
        frames: [
          { src: "images/mar-i-muntanya/l4-start.jpg", caption: "Trip start" },
          { src: "images/mar-i-muntanya/l4-sport.jpg", caption: "Sport driving" },
          { src: "images/mar-i-muntanya/l4-ambulance.jpg", caption: "Handling the unexpected" },
          { src: "images/mar-i-muntanya/l4-autonomous.jpg", caption: "Autonomous driving" },
        ],
      },
      {
        code: "L5",
        challenge: "Nobody drives any more. How do you keep the sense of control, and the CUPRA feeling, without driving?",
        solution: "A multifunctional, immersive space: you plan the whole trip on one screen and change it on the way, adding a stop for lunch or a detour.",
        media: { video: "videos/mar-i-muntanya/l5.mp4", poster: "images/mar-i-muntanya/l5-poster.jpg", device: "tablet", alt: "L5 simulation: defining the journey and changing the route on the way" },
        screen: {
          title: "The central screen",
          text: "The wheel and the cluster disappear: one central screen becomes the link between you, the car and the road. You set the destination and stops, tune how the car drives, see why it decides what it does, and shape the cabin.",
          frames: [
            { src: "images/mar-i-muntanya/l5-screen-trip.jpg", caption: "Define the trip" },
            { src: "images/mar-i-muntanya/l5-screen-route.jpg", caption: "Route and driving preferences" },
            { src: "images/mar-i-muntanya/l5-screen-cabin.jpg", caption: "Cabin configuration" },
          ],
          link: "https://pantallal5.vercel.app/",
          linkLabel: "Try the L5 screen →",
        },
        frames: [
          { src: "images/mar-i-muntanya/l5-standard.jpg", caption: "Standard" },
          { src: "images/mar-i-muntanya/l5-social.jpg", caption: "Social" },
          { src: "images/mar-i-muntanya/l5-cinema.jpg", caption: "Cinema" },
          { src: "images/mar-i-muntanya/l5-work.jpg", caption: "Work" },
          { src: "images/mar-i-muntanya/l5-explore.jpg", caption: "Explore" },
          { src: "images/mar-i-muntanya/l5-night.jpg", caption: "Night" },
        ],
      },
    ],
    images: [],
    link: "https://seat-catedra.vercel.app/",
    linkLabel: "Open the simulator →",
    extraLinks: [{ label: "Read the report (PDF) →", url: "docs/mar-i-muntanya-memoria.pdf" }],
    awards: [
      { src: "images/mar-i-muntanya/award-second-prize.jpg", caption: "Second prize · SEAT–UPC Chair challenge 2025–2026", alt: "The team and the jury in front of the projected challenge slide in the Aula de Graus, Telecos BCN" },
    ],
  },
  {
    title: "Project Five",
    year: "2026",
    tags: ["Design"],
    description:
      "Placeholder. Describe the brief, what you designed and what came out of it. Two or three sentences are enough.",
    images: [],
    link: "",
    color: "#4c3d19",
  },
];

window.ABOUT = {
  name: "Anna Esteve",
  tagline: "Design portfolio · a range of projects",
  bio: [
    "Placeholder. Write a few sentences about who you are, what you study and what kind of design you love making.",
    "Out of the studio I'm usually on a trail somewhere, heading for a summit.",
  ],
  photo: "images/me.jpg",
  email: "annaesteve193@gmail.com",
  links: [
    { label: "GitHub", url: "https://github.com/student-annaesteve" },
    { label: "LinkedIn", url: "https://www.linkedin.com/" },
  ],
};

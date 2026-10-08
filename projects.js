/*
  Your content lives here. Each project becomes a summit in the range.
  The route climbs in this order: the first project is the lowest peak and
  the last one is the main summit. "About me" opens from the round button
  in the top-right corner.

  images: [{ src: "images/my-poster.jpg", alt: "Short description" }, ...]
          Leave the list empty to show placeholder frames.
  link:   a URL for the full project (Behance, PDF, website…) or "".
  color:  the tint of the placeholder frames (keep to the site's moss / tan / bone palette).

  Optional case-study fields (see "Mar i Muntanya" and "Smart irrigation"): headline, subtitle, goal, hero, levels.
  Each level can set its own title, labels, stats, rules and media ({ src } image, { video, poster },
  or { placeholder: "…" } to reserve a photo slot).
  When `levels` is present the panel opens wider and leads with the product mockups.
*/
window.PROJECTS = [
  {
    // Research project (batxillerat "treball de recerca"), shown as a visual case study.
    // Every { placeholder } is an empty slot: replace it with src: "images/smart-irrigation/….jpg"
    // (keep `device` to show the image inside a laptop / phone, or leave it out for a plain photo).
    title: "Smart irrigation", // short name for the map and the route list
    headline: "Watering only when the plant needs it",
    subtitle: "Research project · Irrigation in the Cerdanya and an IoT prototype",
    year: "",
    tags: ["Research", "IoT", "Arduino prototype"],
    color: "#889063",
    goal: "Sprinklers running in the rain made me ask: are we using irrigation water well, and could a smarter system stop wasting it?",
    description: "A low-cost device that reads the soil and the air and decides by itself when to water.",
    hero: [
      { placeholder: "Final prototype", ratio: "4 / 3", span: 2.2 },
      { placeholder: "Telegram bot", device: "phone" },
    ],
    levels: [
      {
        title: "The theory",
        labels: ["Question", "What I found"],
        challenge: "What decides how much water a plant needs?",
        solution: "Evapotranspiration. Sun, heat, humidity and wind change it, so water when it is cool and only at the roots.",
        gallery: [
          { placeholder: "Evapotranspiration diagram", ratio: "16 / 9" },
        ],
      },
      {
        title: "The Cerdanya today",
        labels: ["Question", "What I found"],
        challenge: "How does my region water? A survey of 100 people and interviews with farmers, gardeners and golf clubs.",
        solution: "Everyone knows water is scarce, but smart irrigation is almost absent.",
        stats: [["100", "people surveyed"], ["49", "use a timer"], ["2", "use sensors"], ["95%", "expect a change"]],
        gallery: [
          { placeholder: "Survey results chart", device: "laptop", span: 2 },
          { placeholder: "Field / interview photo", ratio: "3 / 4" },
        ],
      },
      {
        title: "The prototype",
        labels: ["Question", "What I built"],
        challenge: "Can a cheap sensor system decide on its own?",
        solution: "A NodeMCU reads the soil and the temperature, opens the water with a servo and reports to ThingSpeak and Telegram.",
        gallery: [
          { placeholder: "Circuit · NodeMCU + sensors", ratio: "1 / 1", caption: "Electronics" },
          { placeholder: "3D-printed case", ratio: "1 / 1", caption: "3D-printed case" },
          { placeholder: "Telegram chat", device: "phone", caption: "Manual control" },
        ],
        rules: {
          title: "Automatic mode",
          items: [
            ["Soil humidity under 20%", "Water now", true],
            ["20–60% and below 10 °C", "Water now, little is lost to evaporation", true],
            ["20–60% and 10 °C or warmer", "Wait for a cooler hour", false],
            ["Over 60%", "No watering needed", false],
          ],
        },
        media: { placeholder: "ThingSpeak dashboard", device: "laptop", caption: "Live data from the sensors" },
      },
    ],
    images: [],
    link: "",
  },
  {
    title: "Project Two",
    year: "2025",
    tags: ["Poster", "Typography"],
    description:
      "Placeholder. Describe the brief, what you designed and what came out of it. Two or three sentences are enough.",
    images: [],
    link: "",
    color: "#cfbb99",
  },
  {
    title: "Project Three",
    year: "2025",
    tags: ["Illustration"],
    description:
      "Placeholder. Describe the brief, what you designed and what came out of it. Two or three sentences are enough.",
    images: [],
    link: "",
    color: "#a3a67d",
  },
  {
    // A case study: when `levels` is present the panel opens wide and shows the product first.
    title: "Mar i Muntanya", // short name for the map and the route list
    headline: "Designing trust in a car that drives itself", // the project's goal, shown as the panel title
    subtitle: "Mar i Muntanya · SEAT–UPC Design Thinking challenge for CUPRA",
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
        media: { video: "videos/mar-i-muntanya/l3.mp4", poster: "images/mar-i-muntanya/selector.jpg", device: "laptop", alt: "L3 simulation: the car hands control back before a roadworks zone" },
      },
      {
        code: "L4",
        challenge: "In the city the car handles everything, even giving way to an ambulance. How do you build trust without flooding the driver with information?",
        solution: "Show less, at the right moment: only the information that matters in each situation, plus extra comfort, like offering the wheel on a winding road.",
        media: { video: "videos/mar-i-muntanya/l4.mp4", poster: "images/mar-i-muntanya/cockpit.jpg", device: "monitor", alt: "L4 simulation from the driver's seat: giving way to an ambulance" },
      },
      {
        code: "L5",
        challenge: "Nobody drives any more. How do you keep the sense of control, and the CUPRA feeling, without driving?",
        solution: "A multifunctional, immersive space: you plan the whole trip on one screen and change it on the way, adding a stop for lunch or a detour.",
        media: { video: "videos/mar-i-muntanya/l5.mp4", poster: "images/mar-i-muntanya/trip.jpg", device: "tablet", alt: "L5 simulation: defining the journey and changing the route on the way" },
      },
    ],
    images: [],
    link: "",
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

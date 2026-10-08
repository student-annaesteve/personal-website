/*
  Your content lives here. Each project becomes a summit in the range.
  The route climbs in this order: the first project is the lowest peak,
  the last one the highest, and the summit at the back is "About me".

  images: [{ src: "images/my-poster.jpg", alt: "Short description" }, ...]
          Leave the list empty to show placeholder frames.
  link:   a URL for the full project (Behance, PDF, website…) or "".
  color:  the tint of the placeholder frames (keep to the site's moss / tan / bone palette).

  Optional case-study fields (see "Mar i Muntanya"): subtitle, cover, facts, persona, levels.
  When `levels` is present the panel opens wider and tells the project step by step.
*/
window.PROJECTS = [
  {
    title: "Project One",
    year: "2026",
    tags: ["Branding"],
    description:
      "Placeholder. Describe the brief, what you designed and what came out of it. Two or three sentences are enough.",
    images: [],
    link: "",
    color: "#889063",
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
    // A case study: when `levels` is present the panel opens wide and shows the full story.
    title: "Mar i Muntanya",
    subtitle: "Designing trust in a CUPRA that drives itself",
    year: "",
    tags: ["UX / UI", "Automotive HMI", "Prototype"],
    color: "#354024",
    cover: { src: "images/mar-i-muntanya/selector.jpg", alt: "Simulator start screen: Mar i Muntanya, choose the level L3, L4 or L5", device: "laptop" },
    facts: [
      ["Brief", "Càtedra SEAT–UPC challenge"],
      ["Brand", "CUPRA"],
      ["Scope", "In-car interface for autonomy levels L3, L4 and L5"],
      ["Output", "Interactive web simulator"],
    ],
    description:
      "How should a car talk to you when it starts driving on its own? For each level of autonomy we found the moment where trust can break, and designed the interface around it. The result is a web simulator where you pick a level and live the scenario from the driver's seat.",
    persona: {
      label: "Who we designed for",
      traits: ["45–55 years old", "Family profile", "Follows technology", "Wants to stay in control"],
    },
    levels: [
      {
        code: "L3",
        name: "Conditional automation",
        scenario: "The car drives itself until it reaches a roadworks zone and has to hand control back to the driver.",
        problem: "How do you hand control back without making the driver feel unsafe?",
        answer: "A fast, intuitive handover",
        points: ["Clear visual hierarchy", "Progressive, personalised alerts", "Fewer elements on screen"],
        route: [["manual", 2, ""], ["auto", 4, "Autonomous"], ["alert", 2.4, "Roadworks · take over"], ["manual", 1.6, ""]],
      },
      {
        code: "L4",
        name: "High automation",
        scenario: "In the city the car drives on its own, gives way to an ambulance, and offers the driver the wheel on a winding road.",
        problem: "How do you build trust without flooding the driver with information?",
        answer: "Less information, at the right moment",
        points: ["Reduced information", "Contextual personalisation", "Extra comfort"],
        route: [["auto", 3, "Autonomous"], ["alert", 1.8, "Ambulance"], ["auto", 2.2, ""], ["manual", 3, "Winding road · offer"]],
        shot: { src: "images/mar-i-muntanya/cockpit.jpg", alt: "L4 simulation from the driver's seat, with the system states panel: vehicle stopped, autonomous mode on, giving way to an ambulance, offer to drive on a winding road", device: "screen" },
      },
      {
        code: "L5",
        name: "Full automation",
        scenario: "Nobody drives any more. The passenger sets the destination and changes the route on the way: a stop for lunch, a detour to the hospital.",
        problem: "How do you keep the sense of control, and the CUPRA feeling, without driving?",
        answer: "A multifunctional, immersive space",
        points: ["Set the whole trip on one screen", "Change the route on the way"],
        route: [["auto", 3.4, "Planned route"], ["alert", 2, "New stop"], ["auto", 4.6, "Autonomous"]],
        shot: { src: "images/mar-i-muntanya/trip.jpg", alt: "L5 trip screen: Define your journey, from Palau Reial to Tarragona, with recent destinations and a Start the journey button", device: "tablet" },
      },
    ],
    images: [],
    link: "",
  },
];

window.ABOUT = {
  name: "Anna Esteve",
  tagline: "Design portfolio · a range of projects",
  bio: [
    "Placeholder. Write a few sentences about who you are, what you study and what kind of design you love making.",
    "Out of the studio I'm usually on a trail somewhere, heading for a summit.",
  ],
  photo: "", // e.g. "images/me.jpg"
  email: "annaesteve193@gmail.com",
  links: [
    { label: "GitHub", url: "https://github.com/student-annaesteve" },
    { label: "LinkedIn", url: "https://www.linkedin.com/" },
  ],
};

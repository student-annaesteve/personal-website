/*
  Your content lives here. Each project becomes a summit in the range.
  The route climbs in this order: the first project is the lowest peak,
  the last one the highest, and the summit at the back is "About me".

  images: [{ src: "images/my-poster.jpg", alt: "Short description" }, ...]
          Leave the list empty to show placeholder frames.
  link:   a URL for the full project (Behance, PDF, website…) or "".
  color:  the tint of the placeholder frames (keep to the site's moss / tan / bone palette).

  Optional case-study fields (see "Mar i Muntanya"): subtitle, meta, hero, persona, levels.
  When `levels` is present the panel opens wider and leads with the product mockups.
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
    // A case study: when `levels` is present the panel opens wide and shows the product first.
    title: "Mar i Muntanya",
    subtitle: "Designing trust in a CUPRA that drives itself",
    year: "",
    tags: ["UX / UI", "Automotive HMI", "Prototype"],
    color: "#354024",
    meta: ["Càtedra SEAT–UPC", "CUPRA", "Web simulator"],
    // Hero composition: a laptop with a tablet in front of it.
    hero: [
      { src: "images/mar-i-muntanya/selector.jpg", alt: "Simulator start screen: Mar i Muntanya, choose the level L3, L4 or L5", device: "laptop" },
      { src: "images/mar-i-muntanya/trip.jpg", alt: "L5 trip screen: Define your journey, from Palau Reial to Tarragona", device: "tablet" },
    ],
    description: "A web simulator to live autonomous driving, levels L3 to L5, from the driver's seat.",
    persona: ["45–55", "Family", "Tech follower", "Wants control"],
    // Each level shows its video in a device. Until the video file exists, the poster image is shown.
    levels: [
      {
        code: "L3",
        answer: "Fast, intuitive handover",
        media: { video: "videos/mar-i-muntanya/l3.mp4", poster: "images/mar-i-muntanya/selector.jpg", device: "laptop", alt: "L3 simulation: the car hands control back before a roadworks zone" },
      },
      {
        code: "L4",
        answer: "Less information, at the right moment",
        media: { video: "videos/mar-i-muntanya/l4.mp4", poster: "images/mar-i-muntanya/cockpit.jpg", device: "monitor", alt: "L4 simulation from the driver's seat: giving way to an ambulance" },
      },
      {
        code: "L5",
        answer: "An immersive space you still control",
        media: { video: "videos/mar-i-muntanya/l5.mp4", poster: "images/mar-i-muntanya/trip.jpg", device: "tablet", alt: "L5 simulation: defining the journey and changing the route on the way" },
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

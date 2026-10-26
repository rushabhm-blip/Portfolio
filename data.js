/**
 * Portfolio Data: Closed-Sketchbook Landing Page
 * Holds all copy, chapter labels, sticker metadata, and links.
 */
export const sketchbookData = {
  brand: {
    wordmark: 'rushabh',
    dot: '.',
    url: '/'
  },
  navigation: [
    { id: 'Home', label: 'Home', active: true },
    { id: 'Works', label: 'Works', route: '/#works' },
    { id: 'About', label: 'About', route: '/#about' },
    { id: 'Playground', label: 'Playground', route: '/#playground' },
    { id: 'Architecture', label: 'Architecture', route: '/#architecture' }
  ],
  cover: {
    greeting: "Hi, I’m",
    name: "Rushabh.",
    tagline: "Things I notice. Things I make.",
    roleBadge: {
      eyebrow: "HELLO, I’M",
      title: "Interaction\nDesigner"
    },
    cursorSticker: {
      alt: "Make it useful sticker with blue cursor"
    },
    portraitSticker: {
      alt: "Illustrated smiling portrait of Rushabh"
    },
    idTag: {
      alt: "Design school ID tag hanging from sketchbook"
    },
    openButton: {
      label: "Open my sketchbook",
      ariaLabel: "Open my sketchbook"
    }
  },
  chapters: {
    Works: {
      eyebrow: "FEATURED WORK",
      title: "Works",
      description: "Case studies in citizen participation, health data storytelling, and decision-support systems.",
      projects: [
        { title: "Sajag", subtitle: "Civic concern reporting and community participation", url: "/projects/sajag/" },
        { title: "The Fear Between Us", subtitle: "Snakebite awareness & coexistence scroll story", url: "/projects/snakbite/" },
        { title: "Munshiji", subtitle: "Financial learning & decision companion", url: "/projects/munshiji/" }
      ]
    },
    About: {
      eyebrow: "BACKGROUND & ROOTS",
      title: "About",
      description: "Architect by training, explorer at heart. I observe daily human friction, urban patterns, and physical movements to design calm, intuitive digital experiences."
    },
    Playground: {
      eyebrow: "EXPERIMENTS & LAB",
      title: "Playground",
      description: "Interactive canvas shaders, generative fabric mesh physics, tactile button dynamics, and micro-interaction prototypes."
    },
    Architecture: {
      eyebrow: "SPATIAL SYSTEMS",
      title: "Architecture",
      description: "Building envelope investigations, facade details, environmental engineering, and spatial inquiries from architectural practice."
    },
    Sketchbook: {
      eyebrow: "INSIDE THE SKETCHBOOK",
      title: "Sketchbook Chapter 01",
      description: "Welcome to the inside of the sketchbook. The chapter pages, sketches, and process notes are currently in development as the next milestone.",
      projects: [
        { title: "Sajag Case Study", subtitle: "Read the full design journey", url: "/projects/sajag/" },
        { title: "The Fear Between Us", subtitle: "Explore the interactive story", url: "/projects/snakbite/" },
        { title: "Munshiji Companion", subtitle: "View the companion walkthrough", url: "/projects/munshiji/" }
      ]
    }
  }
};

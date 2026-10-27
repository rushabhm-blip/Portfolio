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
  },
  openBook: {
    leftPage: {
      heading: [
        { text: "Architect", isBold: true },
        { text: "by training.", isBold: false },
        { text: "Explorer", isBold: true, highlight: true },
        { text: "at heart.", isBold: false }
      ],
      paragraph: "I’m Rushabh. Architecture taught me to notice how people move through spaces. Interaction design has me noticing the smaller moments too—where someone pauses, what feels confusing, and what could feel easier.",
      timeline: [
        { institution: "VNIT Nagpur", type: "Education" },
        { institution: "AtkinsRéalis", type: "Practice" },
        { institution: "Dar Al-Handasah", type: "Practice" },
        { institution: "NID Bengaluru", type: "Education" }
      ],
      pageNumber: "01"
    },
    rightPage: {
      heading: "A little more me .",
      pageNumber: "02",
      walkingCutout: {
        alt: "Photographic cutout of Rushabh walking with yellow starburst"
      },
      portraitCaption: "Main chala pahaadon mein…",
      hobbies: [
        {
          id: "badminton",
          label: "Badminton",
          src: "assets/sketchbook/sticker-badminton.png",
          alt: "Orange blob playing badminton"
        },
        {
          id: "flute",
          label: "Flute",
          src: "assets/sketchbook/sticker-flute.png",
          alt: "Lime blob playing flute"
        },
        {
          id: "reading",
          label: "Reading",
          src: "assets/sketchbook/sticker-reading.png",
          alt: "Orange blob reading open book"
        },
        {
          id: "cruiser",
          label: "Cruiser rides",
          src: "assets/sketchbook/sticker-cruiser.png",
          alt: "Purple blob riding cruiser motorcycle"
        }
      ],
      stamps: [
        {
          id: "ooty",
          name: "Ooty",
          src: "assets/ooty.png",
          alt: "Ooty travel stamp with toy train and Nilgiri tea hills",
          cx: 760,
          cy: 260,
          width: 310,
          rotation: -7
        },
        {
          id: "chikkamagaluru",
          name: "Chikkamagaluru",
          src: "assets/chikkamagaluru.png",
          alt: "Chikkamagaluru travel stamp with coffee plantation and rolling hills",
          cx: 820,
          cy: 560,
          width: 310,
          rotation: 5
        },
        {
          id: "coorg",
          name: "Coorg",
          src: "assets/coorg.png",
          alt: "Coorg travel stamp with waterfalls and coffee berries",
          cx: 780,
          cy: 900,
          width: 310,
          rotation: -6
        },
        {
          id: "kodaikanal",
          name: "Kodaikanal",
          src: "assets/kodaikanal.png",
          alt: "Kodaikanal travel stamp with misty lake, boat, and pine trees",
          cx: 440,
          cy: 990,
          width: 310,
          rotation: 7
        }
      ]
    }
  }
};

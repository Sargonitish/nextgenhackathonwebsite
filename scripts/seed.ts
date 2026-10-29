import mongoose from 'mongoose';
import Event from '../models/Event';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value.replace(/^["'](.*)["']$/, '$1');
        }
      }
    });
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackathon';

async function seed() {
  console.log('🌱 Starting Hackathon seed script...');
  console.log(`Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`);

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  // Deactivate all existing events to enforce exactly one active event
  await Event.updateMany({}, { isActive: false });

  const existing = await Event.findOne({ slug: 'hackx-2026' });
  if (existing) {
    console.log('Found existing HackX 2026 edition. Updating and setting as active...');
    await Event.deleteOne({ slug: 'hackx-2026' });
  }

  const demoEvent = new Event({
    name: 'HackX 2026',
    slug: 'hackx-2026',
    isActive: true,
    isArchived: false,
    teamIdPrefix: 'HACKX',
    branding: {
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#00ff9d',
      accentColor: '#7c3aed',
      sections: {
        hero: true,
        about: true,
        tracks: true,
        schedule: true,
        prizes: true,
        rules: true,
        coordinators: true,
        organizers: true,
        sponsors: true,
        gallery: true,
        faq: true,
        venue: true,
        contact: true,
      },
    },
    content: {
      heroTitle: 'HACKX 2026',
      heroTagline: '24 Hours of Code, Innovation & Midnight Building',
      typingWords: [
        'Build Autonomous Agents',
        'Disrupt Real-World Systems',
        'Win ₹1,20,000+ Prizes',
        'Ship Production Code',
      ],
      aboutTitle: 'Ignite The Spark of Creation',
      aboutText:
        'HackX is our premier 24-hour inter-college hackathon bringing together over 300+ visionary coders, designers, and hardware tinkerers. For a full day and night, teams collaborate under neon-lit arenas, solve intense challenges, receive 1-on-1 industry mentorship, and battle for the grand prize.',
      rulesText:
        '### Hackathon Rules & Guidelines\n\n- **Team Formation:** Teams must have 2 to 4 members. Inter-college teams are welcome.\n- **Fresh Work:** All code, designs, and assets must be created during the 24-hour hackathon. Pre-built applications will be immediately disqualified.\n- **Open Source:** Public libraries, open-source models, and public APIs are allowed, but their use must be explicitly documented in submissions.\n- **Code of Conduct:** We maintain a respectful, harassment-free environment with zero tolerance for discrimination.\n- **QR Check-in:** The team leader must present their official registration QR code upon campus arrival.',
      venueName: 'Campus Grand Convention Center & Tech Hub',
      venueAddress: 'Technology Campus, Innovation Corridor, Anna Salai, Chennai, Tamil Nadu 600025',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.6669922096395!2d80.2446!3d13.0483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAyJzU0LjAiTiA4MMKwMTQnNDAuNiJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin',
      contactEmail: 'organizers@hackx.college.edu',
      contactPhone: '+91 9876543210',
      socials: {
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://x.com',
        website: 'https://hackx.college.edu',
        whatsapp: 'https://whatsapp.com',
      },
    },
    timer: {
      scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days in future
      durationMs: 86400000, // 24 hours
      status: 'not_started',
      startedAt: null,
      pausedAt: null,
      totalPausedMs: 0,
    },
    settings: {
      registrationOpen: true,
      registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days in future
      maxTeams: 100,
      minTeamSize: 2,
      maxTeamSize: 4,
      organizerSignupOpen: true,
      organizerSignupCode: 'HACKXORG2026',
    },
    tracks: [
      {
        title: 'Autonomous AI & Intelligent Agents',
        description: 'Build reasoning agents, autonomous workflows, and LLM-powered developer tools.',
        icon: 'Bot',
        order: 1,
      },
      {
        title: 'FinTech, Web3 & Cybersecurity',
        description: 'Innovate digital banking, zero-knowledge proofs, and secure transaction engines.',
        icon: 'Shield',
        order: 2,
      },
      {
        title: 'HealthTech & Bio-Informatics',
        description: 'Transform diagnosis, medical imaging, mental health support, and patient care.',
        icon: 'Activity',
        order: 3,
      },
      {
        title: 'Smart Cities & Clean Mobility',
        description: 'Architect IoT sensor networks, intelligent traffic systems, and clean energy grids.',
        icon: 'Cpu',
        order: 4,
      },
      {
        title: 'Open Innovation & Social Impact',
        description: 'Tackle pressing real-world problems in agriculture, education, and accessibility.',
        icon: 'Globe',
        order: 5,
      },
    ],
    schedule: [
      {
        day: 'Day 1',
        time: '08:00 AM - 09:30 AM',
        title: 'Check-in & Welcome Breakfast',
        description: 'Show your team QR code at the registration desk, collect your hacker badges and swag bag.',
        order: 1,
      },
      {
        day: 'Day 1',
        time: '10:00 AM',
        title: 'Opening Ceremony & Keynote',
        description: 'Problem statements unlocked, judging rubric briefing, and keynote address.',
        order: 2,
      },
      {
        day: 'Day 1',
        time: '11:00 AM',
        title: 'Hacking Begins! (Timer Starts)',
        description: '24-hour countdown starts across all live projectors and screens.',
        order: 3,
      },
      {
        day: 'Day 1',
        time: '04:00 PM',
        title: 'Mentorship Round 1: Architecture Check',
        description: 'Industry experts visit team tables to review tech stacks and wireframes.',
        order: 4,
      },
      {
        day: 'Day 1',
        time: '11:59 PM',
        title: 'Midnight Pizza & Retro Gaming',
        description: 'Hot pizza slices, energy drinks, and quick Smash Bros tournament in the lounge.',
        order: 5,
      },
      {
        day: 'Day 2',
        time: '08:00 AM',
        title: 'Mentorship Round 2: Pitch Polish',
        description: 'Dry run presentations and live demo readiness testing.',
        order: 6,
      },
      {
        day: 'Day 2',
        time: '11:00 AM',
        title: 'Hacking Concludes: Code Freeze',
        description: 'Final GitHub commits pushed and demo links locked.',
        order: 7,
      },
      {
        day: 'Day 2',
        time: '12:00 PM - 03:00 PM',
        title: 'Exhibition & Live Judging',
        description: 'Teams present to the jury panel at their assigned booths.',
        order: 8,
      },
      {
        day: 'Day 2',
        time: '04:00 PM',
        title: 'Valedictory & Prize Ceremony',
        description: 'Winner announcements, trophy distribution, and closing celebration.',
        order: 9,
      },
    ],
    prizes: [
      {
        position: '1st',
        title: 'Grand Champions',
        amount: '₹50,000',
        perks: 'Championship Trophy + Cloud Credits + Direct Fast-track Interviews',
        order: 1,
      },
      {
        position: '2nd',
        title: 'First Runners Up',
        amount: '₹30,000',
        perks: 'Silver Plaque + Cloud Credits + Premium Dev Swag Kits',
        order: 2,
      },
      {
        position: '3rd',
        title: 'Second Runners Up',
        amount: '₹20,000',
        perks: 'Bronze Plaque + Premium Tech Accessories',
        order: 3,
      },
      {
        position: 'Special',
        title: 'Best All-Women Team',
        amount: '₹10,000',
        perks: 'Special Recognition Trophy + Mentorship Cohort Access',
        order: 4,
      },
      {
        position: 'Special',
        title: 'Best AI / Autonomous Implementation',
        amount: '₹10,000',
        perks: 'AI Compute Credits + Hardware Kits',
        order: 5,
      },
    ],
    coordinators: [
      {
        name: 'Dr. S. Rajagopalan',
        role: 'Faculty Coordinator (Head of CSE)',
        type: 'faculty',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        phone: '+91 9840123456',
        email: 'rajagopalan@college.edu',
        linkedin: 'https://linkedin.com',
        order: 1,
      },
      {
        name: 'Dr. Priya Sundaram',
        role: 'Faculty Advisor (Innovation Cell)',
        type: 'faculty',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        phone: '+91 9840654321',
        email: 'priya.s@college.edu',
        linkedin: 'https://linkedin.com',
        order: 2,
      },
      {
        name: 'Aravind Raman',
        role: 'Lead Student Coordinator',
        type: 'student',
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
        phone: '+91 9876501234',
        email: 'aravind.r@student.college.edu',
        linkedin: 'https://linkedin.com',
        order: 3,
      },
      {
        name: 'Sneha Balakrishnan',
        role: 'Technical & Logistics Lead',
        type: 'student',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        phone: '+91 9876505678',
        email: 'sneha.b@student.college.edu',
        linkedin: 'https://linkedin.com',
        order: 4,
      },
    ],
    sponsors: [
      {
        name: 'Cloudflare',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=80&fit=crop',
        website: 'https://cloudflare.com',
        tier: 'Title Partner',
        order: 1,
      },
      {
        name: 'GitHub Education',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=80&fit=crop',
        website: 'https://education.github.com',
        tier: 'Platform Partner',
        order: 2,
      },
      {
        name: 'MongoDB Atlas',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=80&fit=crop',
        website: 'https://mongodb.com',
        tier: 'Database Sponsor',
        order: 3,
      },
    ],
    gallery: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
        caption: 'Hacking through the midnight hours at HackX',
        order: 1,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
        caption: 'Team brainstorming and architectural whiteboard session',
        order: 2,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
        caption: 'Live pitch presentations before the panel of industry judges',
        order: 3,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=600&fit=crop',
        caption: 'Celebration and prize distribution ceremony',
        order: 4,
      },
    ],
    faqs: [
      {
        question: 'Who is eligible to participate in HackX?',
        answer:
          'Any student currently enrolled in an undergraduate or postgraduate program at any recognized university or college is eligible. Bring your valid college ID card for registration desk check-in.',
        order: 1,
      },
      {
        question: 'What is the required team size?',
        answer:
          'Teams must consist of a minimum of 2 and a maximum of 4 members. You must declare a Team Leader during registration.',
        order: 2,
      },
      {
        question: 'Is there any registration fee?',
        answer:
          'No! Registration and participation in HackX are completely free of cost. Food, midnight snacks, coffee, and hacker swag are on us!',
        order: 3,
      },
      {
        question: 'Can teams have members from different colleges?',
        answer:
          'Yes, inter-college teams are fully permitted and actively encouraged. Simply specify the respective college names for each member.',
        order: 4,
      },
      {
        question: 'How does team check-in work on event day?',
        answer:
          'Upon completing online registration, your team leader receives a unique Team ID and secure QR code. Simply show this QR code at the campus check-in desk to have your team verified in seconds.',
        order: 5,
      },
      {
        question: 'What hardware/software should we bring?',
        answer:
          'Bring your laptops, chargers, extension cords, any required development boards (Arduino, Raspberry Pi, ESP32), and your enthusiasm. High-speed Wi-Fi and power strips will be available at every booth.',
        order: 6,
      },
    ],
  });

  await demoEvent.save();
  console.log(`✅ Demo Event "${demoEvent.name}" (${demoEvent.slug}) created successfully and set as ACTIVE!`);
  console.log(`Event ID: ${demoEvent._id}`);
  console.log(`Team Prefix: ${demoEvent.teamIdPrefix}`);

  await mongoose.disconnect();
  console.log('Database connection closed.');
}

seed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});

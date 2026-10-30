interface AboutProps {
  title?: string;
  text?: string;
  prizePool?: string;
}

export default function About({
  prizePool = '₹1,00,000',
}: AboutProps) {
  return (
    <section id="about" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column (60% on desktop) - Statement Headline */}
        <div className="lg:col-span-7">
          <div className="font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-4">
            MANIFESTO
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-offwhite leading-[1.05] tracking-tight">
            Not another hackathon. A 24-hour sprint to build agents that act on their own.
          </h2>
        </div>

        {/* Right Column (40% on desktop) - Student Voice Paragraphs + Stats Strip */}
        <div className="lg:col-span-5 flex flex-col justify-between font-mono text-xs sm:text-sm text-offwhite/80 space-y-5 leading-relaxed">
          <p>
            Most hackathons end with half-baked presentation decks and polished Figma prototypes that do nothing. HackX is different. We care about working software, runnable CLI binaries, and autonomous systems that execute tasks without human hand-holding.
          </p>
          <p>
            Whether you are building multi-agent workflows, autonomous smart contract auditors, or local LLM pipelines on consumer hardware, you have 24 hours to turn an ambitious architectural premise into reality.
          </p>
          <p>
            Free food, unlimited coffee, high-speed WiFi, and industry mentors circulating the floor all night. Bring your laptop and your sharpest ideas.
          </p>

          {/* Stats Strip with Hairline Dividers */}
          <div className="pt-6 border-t border-line flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs text-offwhite tracking-wider">
            <span>24 HRS</span>
            <span className="text-line">|</span>
            <span>4 TRACKS</span>
            <span className="text-line">|</span>
            <span className="text-yellow font-bold">{prizePool}</span>
            <span className="text-line">|</span>
            <span>150 SEATS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

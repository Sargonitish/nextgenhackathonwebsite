interface RulesProps {
  rulesText?: string;
}

export default function Rules({ rulesText }: RulesProps) {
  const defaultRules = [
    'Teams of 2–4 members. Solo entries are not allowed.',
    'All code must be written during the hackathon. Pre-built projects will be disqualified.',
    'You may use open-source libraries and public APIs. Credit them in your README.',
    'Each team submits one project. One repo, one demo video (under 3 minutes).',
    'Submissions must be pushed to GitHub/GitLab before the deadline. Late pushes are ignored.',
    'Judging criteria: originality (25%), technical depth (25%), working demo (25%), presentation (25%).',
    'Be respectful. Harassment, plagiarism, or sabotage means instant disqualification.',
    "Organisers' decisions on all disputes are final.",
    'Participants must stay on the venue premises for the full 24 hours.',
    'By registering, you agree to appear in event photos and videos shared on social media.',
  ];

  const rulesList = rulesText
    ? rulesText
        .split('\n')
        .map((r) => r.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter((r) => r.length > 0)
    : defaultRules;

  return (
    <section id="rules" className="py-16 sm:py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Sticky Column Heading */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-offwhite tracking-tight">
            House Rules
          </h2>
          <p className="mt-3 font-mono text-xs sm:text-sm text-offwhite/70 leading-relaxed max-w-xs">
            Strict expectations for original work, fair play, and runnable submissions.
          </p>
        </div>

        {/* Right Column: Ruled List */}
        <div className="lg:col-span-8 border-t border-b border-line divide-y divide-line">
          {rulesList.slice(0, 10).map((rule, idx) => (
            <div key={idx} className="py-5 flex items-start gap-4 sm:gap-6 font-mono text-xs sm:text-sm">
              <span className="text-yellow font-bold shrink-0 w-6">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <p className="text-offwhite/85 leading-relaxed">
                {rule}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

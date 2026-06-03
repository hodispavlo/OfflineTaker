from typing import Optional

UNIVERSAL_PROFILE = "Universal"

PROFESSION_PROMPTS: dict[str, str] = {
    UNIVERSAL_PROFILE: (
        "Use a universal meeting summary structure. Emphasize decisions, key takeaways, "
        "open questions, and action items."
    ),
    "Doctor": (
        "The transcript is an offline medical consultation. Maintain clinical terminology, "
        "medication names, dosages, symptoms, and uncertainty with extreme accuracy. Structure "
        "the output as a SOAP note: Subjective, Objective, Assessment, Plan."
    ),
    "Nurse": (
        "The transcript is a nursing handoff or patient care discussion. Preserve care tasks, "
        "vitals, symptoms, medication timing, risks, and follow-up needs. Structure output into "
        "Patient Status, Care Actions, Risks, and Follow-up."
    ),
    "Therapist": (
        "The transcript is a therapy or counseling session. Preserve emotional context, patient "
        "language, therapeutic themes, risk indicators, and agreed coping strategies. Structure "
        "output into Presenting Themes, Interventions, Client Response, and Next Session Focus."
    ),
    "Dentist": (
        "The transcript is a dental consultation. Preserve tooth references, symptoms, imaging "
        "findings, procedures, materials, and aftercare instructions. Structure output into "
        "Findings, Diagnosis, Treatment Plan, and Patient Instructions."
    ),
    "Software Engineer": (
        "The transcript is a highly technical engineering session. Maintain technical terms, "
        "architecture frameworks, code references, dependencies, and deployment concerns. "
        "Structure output into Technical Blockers, System Architecture Updates, and Next Code Deployments."
    ),
    "Product Manager": (
        "The transcript is a product strategy session. Preserve user needs, tradeoffs, success "
        "metrics, roadmap decisions, and open dependencies. Structure output into Product Decisions, "
        "User Impact, Metrics, and Next Steps."
    ),
    "Data Scientist": (
        "The transcript is a data science session. Preserve dataset names, metrics, assumptions, "
        "model choices, experiment results, and statistical caveats. Structure output into Findings, "
        "Model/Data Notes, Risks, and Next Experiments."
    ),
    "UX Designer": (
        "The transcript is a UX/design review. Preserve user pain points, interaction details, "
        "visual hierarchy feedback, accessibility concerns, and design decisions. Structure output "
        "into User Insights, Design Decisions, Accessibility Notes, and Iterations."
    ),
    "Teacher": (
        "The transcript is an education session. Preserve learning objectives, student concerns, "
        "assignments, misconceptions, and assessment plans. Structure output into Lesson Notes, "
        "Student Needs, Assignments, and Follow-up."
    ),
    "University Student": (
        "The transcript is academic study material. Preserve definitions, formulas, deadlines, "
        "examples, and professor emphasis. Structure output into Lecture Summary, Key Concepts, "
        "Exam Cues, and Study Tasks."
    ),
    "Researcher": (
        "The transcript is a research discussion. Preserve hypotheses, methods, citations mentioned, "
        "findings, limitations, and next experiments. Structure output into Research Question, "
        "Methodology, Evidence, Limitations, and Next Steps."
    ),
    "Academic Advisor": (
        "The transcript is an academic advising session. Preserve course names, degree requirements, "
        "deadlines, academic risks, and student decisions. Structure output into Requirements, "
        "Plan Options, Risks, and Advisor Actions."
    ),
    "Lawyer": (
        "The transcript is a legal discussion. Preserve exact legal terminology, dates, parties, "
        "obligations, risks, and unresolved questions. Structure output into Facts, Issues, Legal "
        "Risks, Evidence Needed, and Next Actions. Do not invent legal conclusions."
    ),
    "Accountant": (
        "The transcript is an accounting discussion. Preserve amounts, dates, entities, tax terms, "
        "compliance deadlines, and reconciliation issues. Structure output into Financial Facts, "
        "Compliance Items, Open Questions, and Required Documents."
    ),
    "Financial Advisor": (
        "The transcript is a financial planning conversation. Preserve goals, risk tolerance, "
        "time horizons, assets, liabilities, and recommendations with caveats. Structure output "
        "into Client Goals, Financial Snapshot, Recommendations, and Follow-up."
    ),
    "Insurance Agent": (
        "The transcript is an insurance conversation. Preserve policy names, coverage limits, "
        "deductibles, exclusions, claims facts, and required documents. Structure output into "
        "Coverage Summary, Client Needs, Claim/Policy Risks, and Next Steps."
    ),
    "Executive Manager": (
        "The transcript is an executive leadership meeting. Preserve strategic decisions, owners, "
        "risks, revenue/customer impact, and deadlines. Structure output into Executive Summary, "
        "Decisions, Risks, and Owner-Level Action Items."
    ),
    "Sales Manager": (
        "The transcript is a sales conversation. Preserve customer objections, buying signals, "
        "deal stage, competitors, pricing, and next commitments. Structure output into Deal Summary, "
        "Objections, Opportunities, and Follow-up Plan."
    ),
    "HR Manager": (
        "The transcript is an HR conversation. Preserve people-sensitive details, policies, dates, "
        "concerns, and action owners. Structure output into Employee Context, Policy Notes, Risks, "
        "and HR Follow-up."
    ),
    "Consultant": (
        "The transcript is a consulting engagement. Preserve client goals, constraints, assumptions, "
        "recommendations, and deliverables. Structure output into Client Context, Diagnosis, "
        "Recommendations, and Workplan."
    ),
    "Project Manager": (
        "The transcript is a project management session. Preserve scope, blockers, dependencies, "
        "owners, deadlines, and status changes. Structure output into Status Update, Risks, "
        "Dependencies, Decisions, and Action Items."
    ),
    "Journalist": (
        "The transcript is a live investigative interview. Isolate high-impact direct quotes, "
        "maintain the timeline of responses, and structure output into Key Revelations, Verified "
        "Facts, Direct Quotes, and Draft Article Outline."
    ),
    "Content Creator": (
        "The transcript is a content planning session. Preserve audience insights, hooks, content "
        "angles, platform notes, and production tasks. Structure output into Content Ideas, Hooks, "
        "Audience Takeaways, and Production Checklist."
    ),
    "Podcast Host": (
        "The transcript is a podcast conversation. Preserve standout quotes, story arcs, episode "
        "segments, guest insights, and promotional clips. Structure output into Episode Summary, "
        "Best Moments, Clip Ideas, and Follow-up Questions."
    ),
    "Screenwriter": (
        "The transcript is a creative story session. Preserve character beats, plot decisions, "
        "dialogue ideas, themes, and continuity issues. Structure output into Story Beats, Character "
        "Notes, Dialogue Gems, and Rewrite Tasks."
    ),
}


def resolve_profession_profile(profession_profile: Optional[str]) -> tuple[str, str]:
    if not profession_profile:
        return UNIVERSAL_PROFILE, PROFESSION_PROMPTS[UNIVERSAL_PROFILE]

    normalized = profession_profile.strip()
    return (
        (normalized, PROFESSION_PROMPTS[normalized])
        if normalized in PROFESSION_PROMPTS
        else (UNIVERSAL_PROFILE, PROFESSION_PROMPTS[UNIVERSAL_PROFILE])
    )

export interface BriefingSection {
  heading: string;
  bullets: string[];
}

export interface BriefingQuestion {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface SafetyBriefing {
  id: string;
  title: string;
  category: string;
  core_reminder?: string;
  intro: string;
  sections: BriefingSection[];
  question: BriefingQuestion;
}

export const SAFETY_BRIEFINGS: SafetyBriefing[] = [
  {
    id: "briefing-001",
    title: "Hand Power Tool Safety",
    category: "Tools & Equipment",
    core_reminder: "Our company policy requires TWO HANDS ON THE TOOL AT ALL TIMES. Never operate a hand power tool one-handed. Maintaining a two-handed grip ensures maximum control, reduces fatigue-related slips, and keeps your hands safely away from moving parts, cutting edges, and kickback zones.",
    intro: "Hand power tools make jobs faster and easier, but they also introduce high-energy hazards if not handled correctly. Whether you are using drills, grinders, saws, or sanders, safety starts with how you hold the tool.",
    sections: [
      {
        heading: "1. Required Personal Protective Equipment (PPE)",
        bullets: [
          "Eye Protection: ANSI-approved safety glasses are mandatory. Add a face shield when operating high-speed cutting tools like angle grinders.",
          "Hearing Protection: Earplugs or earmuffs for tools that generate high decibel levels.",
          "Hand Protection: Properly fitted work gloves are mandatory (avoid loose-fitting gloves that can get caught in rotating chucks, bits, or saw blades).",
          "Footwork & Clothing: Sturdy work boots with slip-resistant soles. No loose clothing, hanging drawstrings, or jewelry that can become entangled in moving parts."
        ]
      },
      {
        heading: "2. Pre-Use Inspection & Safe Setup",
        bullets: [
          "Inspect Cords and Casings: Check power cords for frayed insulation, exposed wires, or damaged prongs. Ensure cordless tool battery housings and latches are secure.",
          "Check the Guard: Never remove, pin back, or bypass safety guards. Ensure guards and or switches operate freely and return automatically.",
          "Right Tool for the Job: Do not force a lightweight tool to do heavy-duty work. Make sure accessories (bits, blades, wheels) are rated for the tool's maximum RPM and are securely tightened using the correct key or wrench.",
          "Clear the Work Area: Ensure your workspace is well-lit, free of trip hazards, and stable. Secure loose workpieces with clamps or a vise so you can keep both hands on the tool."
        ]
      },
      {
        heading: "3. Safe Operation Best Practices",
        bullets: [
          "Maintain Control: Keep a firm, two-handed grip at all times. Let the tool reach full operating speed before engaging the material, and never force or jam a blade or bit into a cut.",
          "Disconnect Power Adjustments: Always unplug cords or remove batteries before changing bits, blades, or accessories, or when performing maintenance and cleaning.",
          "Secure the Power Switch: Never carry a plugged-in or battery-loaded tool with your finger on the trigger. Disconnect power before leaving a tool unattended.",
          "Mind the Cord: Keep cords clear of heat, oil, sharp edges, and the path of the tool itself."
        ]
      }
    ],
    question: {
      prompt: "According to company policy, what is the mandatory rule regarding how you grip and operate hand power tools?",
      options: [
        "One hand is acceptable if you are holding the workpiece with your other hand",
        "Two hands on the tool at all times",
        "Two hands are only required when using angle grinders above 5,000 RPM",
        "One hand on the tool as long as you are wearing properly fitted gloves"
      ],
      correct_index: 1,
      explanation: "Company policy strictly mandates TWO HANDS ON THE TOOL AT ALL TIMES. Secure loose workpieces with clamps so both hands remain on the tool."
    }
  },
  {
    id: "briefing-002",
    title: "Shop Machinery Safety: Shears, Press Brakes, Saws, Drill Presses & Punches",
    category: "Shop Equipment",
    core_reminder: "Never Place Hands at the Point of Operation: Keep hands and fingers completely outside cutting, bending, and punching zones while machines are energized. Always use push sticks, tongs, or material supports. No Entanglement Hazards: Loose clothing, jewelry, gloves, or long hair near rotating equipment present severe entanglement hazards. Tie back long hair, tuck in loose clothing, and secure all workpieces.",
    intro: "Metal fabrication machinery—including power shears, press brakes, metal cutting saws, drill presses, and ironworker hole punches—generates immense crushing, cutting, and rotational force. Operating these machines requires absolute focus, proper setup, and strict adherence to point-of-operation safeguards.",
    sections: [
      {
        heading: "1. Primary Hazards by Equipment Type",
        bullets: [
          "Power Shears & Press Brakes: Severe crushing, pinch points at hold-downs/dies, amputations, unexpected material whip up/kickback during bends, and sharp metal sheet edges.",
          "Metal Cutting Saws (Band/Cold Saws): Blade contact, rotating pinch points, flying metal chips/coolant splash, and blade binding or kickback.",
          "Drill Presses: Rotational entanglement of clothing/hair/gloves, spinning workpieces ('helicoptering') if material is not clamped, and flying metal swarf.",
          "Hole Punches (Ironworkers): Extreme crushing forces, pinch points at the punch/die interface, and high-velocity metal slug ejecta."
        ]
      },
      {
        heading: "2. Pre-Use Inspection & Setup Rules",
        bullets: [
          "Guards & Interlocks: Verify all physical guards, light curtains, hold-down covers, e-stops, and foot-pedal guards are functional and never bypassed.",
          "Tooling & Material Check: Inspect dies, punches, drill bits, and saw blades for cracks or excessive wear. Ensure workpieces are flat, secured, and within rated capacity.",
          "Workpiece Clamping: Never hand-hold material on a drill press or saw. Material must be firmly clamped or secured in a vise to prevent spinning or binding."
        ]
      },
      {
        heading: "3. Safe Operation & Zero Energy (LOTO)",
        bullets: [
          "Focus & Clearance: Keep bystanders clear of swing/movement zones. Never reach behind or beneath blades, dies, or drill spindles while power is connected.",
          "Material Handling & PPE: Wear ANSI safety glasses, steel-toe boots, and hearing protection. Use cut-resistant gloves to transport raw sheet metal.",
          "Lockout/Tagout (LOTO): All tooling changes, die swaps, blade replacements, jam clearances, and maintenance require strict adherence to Lockout/Tagout procedures."
        ]
      }
    ],
    question: {
      prompt: "What is the mandatory rule when drilling holes or cutting material on drill presses and metal saws?",
      options: [
        "Hand-holding is allowed if using high-friction rubberized gloves",
        "Material must be firmly clamped or secured in a vise to prevent spinning or binding",
        "Clamping is only required for sheet metal under 1/8 inch thickness",
        "Workpieces may be braced manually against the machine fence"
      ],
      correct_index: 1,
      explanation: "Never hand-hold material on rotating machinery like drill presses or saws; workpieces must be firmly clamped or secured in a vise to prevent helicoptering."
    }
  },
  {
    id: "briefing-003",
    title: "Disciplinary Action & Termination Policy",
    category: "Company Policy",
    core_reminder: "ZERO TOLERANCE & DISCIPLINARY ENFORCEMENT: Every employee is held directly accountable to all established safety policies, permit procedures, PPE mandates, and site-specific client rules. Management reserves the right to immediately remove any employee from a jobsite or terminate employment on the spot for critical or willful safety violations, regardless of prior disciplinary history.",
    intro: "Maintaining a safe workplace requires strict compliance with all company, site, and OSHA safety standards. Safety rules are not optional. Violations compromise the safety of everyone on the jobsite and will result in direct disciplinary action up to and including immediate termination of employment.",
    sections: [
      {
        heading: "1. Progressive Disciplinary Steps",
        bullets: [
          "Step 1: First Offense — Verbal Warning & Retraining. The employee receives a formal verbal warning detailing the specific violation, documented in their permanent file.",
          "Step 2: Second Offense — Written Warning & Final Notice. A formal written report is issued. The employee must meet with the Safety Manager and Supervisor before returning to work.",
          "Step 3: Third Offense — Termination of Employment. Failure to correct unsafe behaviors or repeated non-compliance results in immediate termination."
        ]
      },
      {
        heading: "2. Immediate Termination (Zero Tolerance Violations)",
        bullets: [
          "Lockout/Tagout (LOTO): Bypassing LOTO procedures, failing to verify zero energy state, or removing another employee's lock/tag.",
          "Fall Protection: Working at heights over 4 feet on a ladder or on elevated surfaces/equipment/pipes without required fall protection.",
          "Two-Handed Power Tool Policy: Intentionally operating hand power tools one-handed after receiving instruction.",
          "Unpermitted High-Hazard Work: Performing Confined Space Entry, Hot Work, Line Breaking, Mode 4 Interventions, Critical Lifts, or Work at Height without an active, approved safety permit.",
          "Substance Abuse: Working under the influence of alcohol, illegal drugs, or unauthorized controlled substances on any shop floor or customer jobsite.",
          "Willful Misconduct: Intentionally bypassing or tampering with safety guards, falsifying daily inspection forms/permits, or refusing to obey a Stop Work Authority order."
        ]
      }
    ],
    question: {
      prompt: "Which of the following safety violations bypasses progressive discipline and results in immediate termination?",
      options: [
        "Arriving 5 minutes late to the morning safety briefing",
        "Forgetting a hard hat in your personal vehicle before entering the gate",
        "Bypassing LOTO procedures or removing another worker's lock/tag",
        "Failing to clean your personal workbench before lunch break"
      ],
      correct_index: 2,
      explanation: "Bypassing LOTO, working unpermitted high-hazard tasks, and tampering with safety guards are zero-tolerance violations resulting in immediate termination."
    }
  },
  {
    id: "briefing-004",
    title: "Compressed Gas Cylinders & Torch Safety Policy",
    category: "Fire & Gas Safety",
    core_reminder: "Upright & Secured: All cylinders must be stored and used upright, secured firmly with chains or straps at all times. Separation Rule: Stored oxygen and fuel gas cylinders must be separated by a minimum of 20 feet or by a 5-foot-high fire wall with at least a 1/2-hour fire-resistance rating. Mandatory Safety Devices: Approved flashback arrestors AND check valves are required at both the regulator and torch head ends of all oxy-fuel setups.",
    intro: "Compressed gas cylinders and oxy-fuel cutting/welding torches store immense pressure and volatile fuel sources. Improper handling, storage, or setup can result in catastrophic fires, explosions, high-velocity missile hazards, or flashbacks. Strict adherence to storage, separation, and torch setup rules is mandatory.",
    sections: [
      {
        heading: "1. Cylinder Handling & Storage Standards",
        bullets: [
          "Securing & Caps: Never leave a cylinder free-standing. Secure cylinders above their midpoint using heavy-duty chains or rigid straps. Keep protective caps screwed hand-tight when regulators are removed.",
          "Storage Location: Store cylinders in dedicated, well-ventilated areas away from heat sources, open flames, electrical circuits, and stairs/elevators. Segregate full and empty cylinders.",
          "Moving Cylinders: Use dedicated cylinder carts with safety chains. Never roll, drag, slide, or hoist cylinders by their valve protection caps or valves."
        ]
      },
      {
        heading: "2. Torch Setup, Inspection & Operation",
        bullets: [
          "Pre-Use Inspection: Inspect hoses, regulators, gauges, and torch bodies before every shift. Never use oil, grease, or flammable compounds on cylinder valves, regulators, or oxygen fittings.",
          "Flashback Arrestors & Check Valves: Verify dual-protection devices (check valves AND flashback arrestors) are installed at both the torch handle and the pressure regulators.",
          "Leak Testing: Perform a soapy water (non-petroleum) leak test on all fittings, hose connections, and valve stems after changing cylinders or connecting regulators."
        ]
      },
      {
        heading: "3. Safe Lighting, Shut-Down & Operating Limits",
        bullets: [
          "Lighting Protocol: Use a friction striker (flint lighter) only. Never use matches, butane lighters, or hot metal surfaces to light a torch. Purging lines before ignition is mandatory.",
          "Operating Pressures: Never exceed 15 psi working pressure for acetylene gas—acetylene becomes unstable and explosive above this threshold.",
          "Shut-Down Procedure: Close torch valves first, turn off cylinder valves, bleed both lines, back off regulator adjusting screws, and close torch valves. Never leave pressurized lines unattended."
        ]
      }
    ],
    question: {
      prompt: "What is the maximum allowable working pressure for acetylene gas, beyond which it becomes unstable and explosive?",
      options: [
        "10 psi",
        "15 psi",
        "30 psi",
        "50 psi"
      ],
      correct_index: 1,
      explanation: "Acetylene gas becomes chemically unstable and explosive at pressures exceeding 15 psi. Operating regulators must never be set above 15 psi."
    }
  },
  {
    id: "briefing-005",
    title: "Ergonomics, Back Safety & Safe Lifting Policy",
    category: "Ergonomics & Health",
    core_reminder: "MECHANICAL FIRST, TEAM LIFT & WEIGHT THRESHOLDS: Always use mechanical lifting equipment (forklifts, hoists, cranes, material carts) as your primary lifting method. 50 lb Maximum Limit: Any single item weighing over 50 lbs—or any item with awkward, oversized geometry—requires a mandatory team lift or mechanical aid. Never twist your torso while loaded; pivot with your feet.",
    intro: "Soft-tissue injuries, muscle strains, and back injuries account for a significant portion of trade and shop hazards. These injuries are cumulative, painful, and preventable. Applying proper lifting techniques, recognizing awkward loads, and using mechanical lifting aids are essential to protecting your physical health.",
    sections: [
      {
        heading: "1. Safe Manual Lifting Practices",
        bullets: [
          "Prepare & Inspect: Test the weight of the object before lifting. Inspect the travel path for slip, trip, and doorway clearance hazards.",
          "Get Close: Keep the load close to your body in your 'power zone' (mid-thigh to chest level) to minimize lever-arm force on your spine.",
          "Lift with Legs: Set a wide, balanced stance. Bend at the knees and hips—not at the waist—and lift smoothly by pushing up with your legs while keeping your back straight and core engaged.",
          "Move Feet, Don't Twist: When turning with a load, step and pivot your feet. Never twist your spine while holding weight."
        ]
      },
      {
        heading: "2. Team Lifts & Awkward Materials",
        bullets: [
          "Designated Lead: Designate one worker to direct movement, communicate commands ('1, 2, 3, lift'), and coordinate lowering the load.",
          "Match Height & Lift Together: Position team members of similar height on opposite sides. Lift, move, and set down in unison to prevent sudden weight shifts.",
          "Awkward Geometry: Long sheet metal, pipe, or bulky assemblies under 50 lbs still require a team lift if the shape prevents keeping weight inside your power zone."
        ]
      },
      {
        heading: "3. Ergonomics & Workplace Setup",
        bullets: [
          "Workplace Height: Position workpieces on sawhorses, tables, or lifts to maintain a neutral posture rather than bending over the floor for extended periods.",
          "Task Rotation: Avoid prolonged static postures or repetitive lifting. Rotate tasks or take short stretch breaks to relieve muscle strain.",
          "Push, Don't Pull: When moving material carts or toolboxes, pushing utilizes larger muscle groups and maintains better spine alignment than pulling."
        ]
      }
    ],
    question: {
      prompt: "What is the company's maximum weight limit for a single-person manual lift before requiring a team lift or mechanical equipment?",
      options: [
        "35 lbs",
        "50 lbs",
        "75 lbs",
        "100 lbs"
      ],
      correct_index: 1,
      explanation: "Any object exceeding 50 lbs (or any awkward/oversized item) mandates mechanical assistance or a coordinated team lift."
    }
  },
  {
    id: "briefing-006",
    title: "Hearing Conservation & Noise Exposure Policy",
    category: "Occupational Health",
    core_reminder: "85+ dB THRESHOLD, DUAL PROTECTION & PLANT-SPECIFIC RULES: Hearing protection (earplugs or earmuffs) is mandatory whenever noise levels reach or exceed 85 dB (or if you must raise your voice to speak to someone 3 feet away). Dual Hearing Protection (earplugs AND earmuffs worn together) is mandatory during extreme noise operations like inside-tank grinding or carbon-arc gouging. Obey all plant-specific PPE rules (e.g., earplug-only food-grade zones at Nestlé).",
    intro: "High noise levels in our shop facilities and client industrial plants can cause permanent, irreversible hearing loss or tinnitus over time. Loud noise doesn't just damage hearing slowly—extreme decibel levels can cause immediate physical harm. Wearing proper hearing protection and recognizing high-noise operations is mandatory.",
    sections: [
      {
        heading: "1. Understanding Noise Levels & Action Thresholds",
        bullets: [
          "Continuous Noise: Air compressors, dust collectors, planers, press brakes, and automated production lines generate continuous high-decibel noise.",
          "Impact Noise: Punch presses, jackhammers, air chisels, and drop hammers create sudden, high-intensity sound pressure spikes that can cause instant hearing damage.",
          "Occupational Exposure: Prolonged exposure above 85 dB without protection permanently destroys the inner ear's hair cells. Once lost, hearing cannot be surgically repaired or regenerated."
        ]
      },
      {
        heading: "2. Selection, Fit, and Maintenance of Hearing Protection",
        bullets: [
          "Noise Reduction Rating (NRR): Always select hearing protection with an adequate NRR for the specific work environment.",
          "Proper Insertion of Foam Plugs: Roll the foam plug tightly between clean fingers into a thin cylinder, reach over your head to pull the ear pinna up and back, insert deep into the ear canal, and hold for 20–30 seconds to expand.",
          "Inspection & Cleanliness: Keep reusable earplugs and earmuff cushions clean. Never insert dirty plugs into ear canals. Replace hardened or damaged seals immediately."
        ]
      },
      {
        heading: "3. Area Rules & Dual Protection Operations",
        bullets: [
          "Designated Hearing Protection Zones: Obey all posted 'Hearing Protection Required' signs throughout shop buildings and client plant processing floors.",
          "Extreme Noise Tasks: When operating high-speed angle grinders in confined or reverberant spaces, metal gouging, or large pneumatic tools, you must combine fitted earplugs with over-the-ear earmuffs."
        ]
      }
    ],
    question: {
      prompt: "What is the general rule of thumb indicating that noise levels have reached or exceeded the mandatory 85 dB hearing protection threshold?",
      options: [
        "If you can hear the hum of an air compressor 50 feet away",
        "If you must raise your voice to speak to someone 3 feet away",
        "Only when continuous metal cutting produces visible sparks",
        "If you have worked in the area for more than 4 consecutive hours"
      ],
      correct_index: 1,
      explanation: "If you need to raise your voice to speak with someone standing 3 feet away, the ambient sound pressure is at or above 85 dB, mandating hearing protection."
    }
  },
  {
    id: "briefing-007",
    title: "Housekeeping & Work Permits Policy",
    category: "Site Compliance",
    core_reminder: "CLEAN WORKSPACE, MANDATORY PERMITTING & DAILY FORMS: Housekeeping is an ongoing duty; work areas, walkways, and emergency exits must remain clear at all times. High-Hazard Permits: No Confined Space Entry, Hot Work, Line Breaking, Mode 4 Interventions, Critical Lifts, or Work at Height may begin without an active, approved safety permit. Fire Watch: Hot Work requires a dedicated Fire Watch during work and for at least 30 minutes up to 2 hours post-completion.",
    intro: "Maintaining a clean workspace and executing required safety permits before starting work are fundamental to preventing accidents. Poor housekeeping creates slip, trip, and fire hazards, while unpermitted hot work or confined space entry introduces critical life-safety risks.",
    sections: [
      {
        heading: "1. Worksite Housekeeping Standards",
        bullets: [
          "Walkways & Aisles: Keep walkways, stairs, and ladders clear. Maintain a minimum 36-inch clearance around electrical panels, eyewash stations, fire extinguishers, and emergency exits.",
          "Cord & Hose Management: Route power cords, air lines, and welding leads overhead or use cord bridges/covers across walkways to prevent trip hazards and equipment damage.",
          "Waste & Chemical Storage: Dispose of trash, metal scrap, and oily rags in designated covered metal containers. Return chemical containers to designated flammable cabinets at shift end."
        ]
      },
      {
        heading: "2. Mandatory Safety Permits (High-Hazard Tasks)",
        bullets: [
          "Confined Space Entry Permit: Required prior to entering any permit-required space. Verifies atmospheric testing, isolation/LOTO, ventilation, and attendant setup.",
          "Hot Work Permit: Required for any spark/heat-producing work. Verifies clearing combustibles within 35 feet, fire suppression, and a Fire Watch maintained 30 min to 2 hrs post-job.",
          "Hazardous Line Breaking Permit: Required prior to opening piping or vessels containing hazardous materials, steam, chemicals, or ammonia.",
          "Mode 4 Machine Intervention Permit: Required when performing machine setup, jam clearance, or maintenance where standard safeguards are altered or bypassed.",
          "Critical Lift & Work at Height Permits: Required for high-risk crane picks or elevated work outside standard protected platforms."
        ]
      },
      {
        heading: "3. Mandatory Daily Job & Equipment Forms",
        bullets: [
          "Risk Prediction Form (JHA / JSA): Pre-job hazard assessment completed daily by the crew before starting work.",
          "Daily Pre-Start Checklists: Fall harness & SRL inspection, ladder check, and daily equipment pre-start forms for forklifts, scissor lifts, and boom lifts must be executed before operation.",
          "On-Site Posting & Closure: Active permits and completed inspection sheets must be posted at the work location and closed out with safety leadership at shift end."
        ]
      }
    ],
    question: {
      prompt: "How long must a dedicated Fire Watch remain on site after hot work (cutting, welding, grinding) is completed?",
      options: [
        "5 minutes to quickly inspect the immediate weld area",
        "15 minutes while packing up equipment",
        "At least 30 minutes up to 2 hours depending on facility risk level",
        "Only until the permit is signed off by the machine operator"
      ],
      correct_index: 2,
      explanation: "Hot work permits mandate that a designated Fire Watch remain on scene for at least 30 minutes up to 2 hours post-completion to ensure no smoldering fires ignite."
    }
  },
  {
    id: "briefing-008",
    title: "Emergency Response & Action Plan Policy",
    category: "Emergency Action",
    core_reminder: "EMERGENCY PROTOCOL & HOST FACILITY SUPERSEDENCE: In our shop facilities, call 911 immediately for medical or fire emergencies and notify the Safety Manager. Client Facility Protocol: When working on-site at customer facilities (such as Nestlé, etc.), host facility Emergency Response Teams (ERT) and site-specific emergency numbers supersede internal company rules. Always follow site-specific alarm responses and instructions given during orientation.",
    intro: "When an emergency occurs—whether a medical event, fire, chemical release, or severe structural incident—knowing how to respond quickly and calmly saves lives. Emergency response procedures vary depending on whether you are working in our company shop or on-site at a customer plant facility.",
    sections: [
      {
        heading: "1. Site-Specific Emergency Response & On-Site ERT",
        bullets: [
          "Orientation & Site Alarms: Review site emergency exit maps, assembly stations, alarm tones (fire, ammonia, chemical, severe weather), and emergency phone numbers before starting work.",
          "Reporting Procedures: At facilities with on-site medical and ERT teams, use the facility's dedicated emergency reporting line/pull stations first so plant medical responders dispatch immediately.",
          "Defer to Site Command: Follow all directions given by host facility Emergency Response Teams, site safety commanders, or plant floor wardens without delay."
        ]
      },
      {
        heading: "2. General Evacuation & Accountability Procedures",
        bullets: [
          "Evacuation Signal: Immediately stop work, shut down equipment or secure hazardous operations if safe to do so, and proceed to the designated assembly area.",
          "Assembly Areas & Headcounts: Report directly to your crew lead or supervisor at the designated assembly station. Remain in place until a full headcount is verified.",
          "Do Not Re-Enter: Never re-enter a building or work area under any circumstances until emergency responders or site safety management explicitly give the 'All Clear'."
        ]
      },
      {
        heading: "3. Medical Emergencies, First Aid & Incident Reporting",
        bullets: [
          "First Aid & CPR: Render first aid or CPR only if trained and certified to do so. Ensure ERT or emergency dispatch is contacted immediately.",
          "Chemical Exposure Response: Locate the nearest eyewash station or safety shower immediately, flush for at least 15 minutes, and provide the chemical SDS to medical personnel.",
          "Immediate Reporting: Every workplace injury, illness, near-miss, or emergency event must be reported to your supervisor immediately after medical needs are secured."
        ]
      }
    ],
    question: {
      prompt: "When working on-site at a client industrial plant with a dedicated on-site Emergency Response Team (ERT), what takes precedence during an emergency?",
      options: [
        "Internal shop phone numbers must be called before taking action",
        "The client facility's specific emergency protocols, alarm procedures, and ERT dispatch take precedence",
        "Employees should immediately leave the property without reporting to an assembly point",
        "Standard 911 off-site dispatch without notifying plant security"
      ],
      correct_index: 1,
      explanation: "At host facilities with dedicated ERTs, their site-specific reporting numbers, alarm protocols, and emergency commands supersede standard internal procedures."
    }
  },
  {
    id: "briefing-009",
    title: "Personal Protective Equipment (PPE) & Hierarchy of Hazard Controls Policy",
    category: "PPE & Hazard Controls",
    core_reminder: "PPE AS LAST LINE OF DEFENSE & FACILITY RULES: Baseline PPE on all active shop floors and customer jobsites includes ANSI safety glasses, safety toe boots, a face shield for high-speed cutting/grinding, and task-appropriate gloves. Outdoor shop perimeters require safety vests. Inside host processing facilities during production (e.g., Nestlé), hairnets, lab coats, and safety vests are mandatory.",
    intro: "Protecting workers from jobsite hazards requires a systematic approach. While Personal Protective Equipment (PPE) is essential, it is our last line of defense. Understanding how hazards are controlled—and properly using your required gear—is critical to preventing injuries across all shop and plant operations.",
    sections: [
      {
        heading: "1. The Hierarchy of Hazard Controls",
        bullets: [
          "Elimination: Physically removing the hazard entirely (e.g., eliminating high-angle work by assembling equipment at ground level).",
          "Substitution: Replacing a severe hazard with a safer alternative (e.g., swapping a toxic solvent for a non-hazardous water-based cleaner).",
          "Engineering Controls: Isolating people from the hazard mechanically (e.g., machine guards, local exhaust ventilation, safety railing).",
          "Administrative Controls: Changing the way people work through rules and procedures (e.g., job rotation, safety training, warning signs, pre-task hazard assessments).",
          "Personal Protective Equipment (PPE): Protecting the worker with barrier equipment (e.g., safety glasses, gloves, hairnets, lab coats, high-visibility vests, hard hats, earplugs, harnesses)."
        ]
      },
      {
        heading: "2. PPE Selection, Inspection, and Fit",
        bullets: [
          "Pre-Use Inspection: Inspect all PPE before every shift. Check safety glasses for scratches, gloves for tears, boots for exposed toes, and harnesses for frayed webbing. Damaged PPE must be removed immediately.",
          "Facility & Site Compliance: In customer plants (such as Nestlé, etc.), follow all sanitation and safety PPE requirements, including hairnets, beard nets, lab coats, and safety vests during production hours.",
          "Task-Specific Gear: Match gear to the threat—grinding mandates a face shield combined with safety glasses, while chemical handling requires chemical goggles and nitrile gloves."
        ]
      },
      {
        heading: "3. Employee Responsibilities",
        bullets: [
          "Wear Required Gear: Always wear mandatory baseline, facility-specific, and task-specific PPE for the shop floor, outdoor perimeter, or host facility.",
          "Report Uncontrolled Hazards: If a hazard can be eliminated or controlled higher in the hierarchy (such as guardrails or ventilation), notify supervisors immediately rather than relying solely on PPE.",
          "Do Not Alter Equipment: Never modify, cut, or alter PPE (e.g., removing hard hat suspensions, trimming glove fingers, or altering face shields/lab coats)."
        ]
      }
    ],
    question: {
      prompt: "According to the Hierarchy of Hazard Controls, why is Personal Protective Equipment (PPE) classified at the bottom level?",
      options: [
        "PPE is the least expensive control method to implement",
        "PPE is our last line of defense and only protects the worker if the hazard cannot be eliminated, substituted, or engineered out",
        "PPE is only required when performing high-hazard permit tasks",
        "OSHA regulations state that engineering controls are always 100% effective on their own"
      ],
      correct_index: 1,
      explanation: "PPE is the last line of defense because it places a barrier on the individual worker rather than eliminating or isolating the hazard itself."
    }
  },
  {
    id: "briefing-010",
    title: "Lockout/Tagout (LOTO) & Control of Hazardous Energy Policy",
    category: "Energy Isolation",
    core_reminder: "ONE WORKER, ONE LOCK & ZERO ENERGY VERIFICATION: Every authorized employee working on equipment must apply their own personal red lock and tag to each energy-isolating device. Before beginning work, you must physically test and verify zero energy state (attempt to start/operate local controls). Never bypass LOTO or remove another employee's lock—doing so results in immediate termination.",
    intro: "Hazardous energy sources—electrical, mechanical, hydraulic, pneumatic, chemical, and thermal—pose severe risks during maintenance, service, or setup. Lockout/Tagout (LOTO) procedures isolate energy sources and ensure machines cannot be energized or started accidentally while work is being performed.",
    sections: [
      {
        heading: "1. The LOTO Sequence (6 Steps to Safety)",
        bullets: [
          "Step 1 - Preparation: Identify all energy sources (electrical, air, hydraulic, steam, kinetic) feeding the machine and locate all cutoff switches/valves.",
          "Step 2 - Shutdown: Turn off the machine or equipment using normal stopping procedures (push buttons, switches).",
          "Step 3 - Isolation: Open or disconnect all primary energy-isolating devices (throw breakers, close valves, disconnect air lines).",
          "Step 4 - Lock & Tag Application: Attach your personal red LOTO lock and filled-out tag to every energy-isolating device.",
          "Step 5 - Stored Energy Control: Relieve, bleed, block, or drain residual/stored energy (discharge capacitors, bleed air lines, block raised hydraulic rams).",
          "Step 6 - Zero Energy Verification (Try-Out): Verify no personnel are exposed, attempt to start/operate equipment with local controls, confirm zero movement, then return switch to Off."
        ]
      },
      {
        heading: "2. Client Facilities & Group Lockout Protocols",
        bullets: [
          "Host Facility Procedures: When performing LOTO inside customer plants, follow both company protocols and site-specific client LOTO rules.",
          "Group Lockout: When multiple technicians work on the same equipment, a group lockbox protocol is used. The lead places a master lock on the energy source and puts the key inside the box; every worker attaches their personal lock to the box.",
          "Shift Changes: Locks must remain on equipment across shift transitions. Outgoing workers must not remove their locks until incoming workers have applied theirs."
        ]
      },
      {
        heading: "3. Lock Removal & Restoring Power",
        bullets: [
          "Removal Authority: Only the individual worker who applied a lock is authorized to remove it. Removing another worker's lock requires explicit authorization from the Safety Manager under emergency override protocols.",
          "Restoration Procedure: Clear tools and personnel, reinstall all guards, notify affected workers, and remove LOTO devices to safely restore power."
        ]
      }
    ],
    question: {
      prompt: "What critical action must be performed during Step 6 (Zero Energy Verification / Try-Out) of the LOTO sequence?",
      options: [
        "Call the utility company to confirm power disconnection",
        "Attempt to start/operate the equipment using local controls to verify complete energy isolation, then return controls to Off",
        "Wait 10 minutes to ensure hydraulic pressure dissipates on its own",
        "Have a coworker visually inspect the main breaker panel without testing switches"
      ],
      correct_index: 1,
      explanation: "Step 6 requires physically testing local controls (try-out) while ensuring no personnel are exposed to verify that a complete zero energy state exists."
    }
  },
  {
    id: "briefing-011",
    title: "Safety Data Sheet (SDS) & Chemical Hazard Communication Policy",
    category: "Chemical Safety",
    core_reminder: "CHEMICAL SDS ACCESS LOCATIONS: In our shop facilities, Safety Data Sheets for all chemicals are maintained and accessible in the Safety Manager's Office. In customer processing plants (such as Nestlé, etc.), SDS sheets for client-owned chemicals can be obtained immediately by contacting the Site Safety Manager or site representative.",
    intro: "Chemical hazards are present both in our shop facilities and across active customer plant job sites. Understanding how to access Chemical Safety Data Sheets (SDS) and handle hazardous materials properly is critical to protecting yourself, your coworkers, and plant personnel.",
    sections: [
      {
        heading: "1. Understanding Safety Data Sheets (SDS)",
        bullets: [
          "16-Standard Sections: Every SDS contains identical safety information formats nationwide, including chemical identification, hazard identification, composition, first-aid measures, and handling/storage guidelines.",
          "Immediate Reference: Never use or handle a chemical—or work in proximity to an unfamiliar plant chemical—without first reviewing or having access to its SDS.",
          "GHS Labeling: All containers (both primary manufacturer containers and secondary transfer containers) must be properly labeled with product identifiers, signal words, and GHS Hazard Pictograms."
        ]
      },
      {
        heading: "2. Shop Facilities vs. Client Plant Job Sites",
        bullets: [
          "In Our Shop: Before using paints, solvents, degreasers, lubricants, or gases, ensure familiarity with the product. To review an SDS, go directly to the Safety Manager's Office.",
          "In Customer Plants (Nestlé, etc.): When working near host-facility chemicals (ammonia refrigeration lines, industrial sanitizers, process acids), contact the Site Safety Manager immediately to obtain the SDS.",
          "Secondary Containers: Never transfer chemicals into unlabeled bottles or food/beverage vessels. Secondary containers must be clearly marked with GHS-compliant labels."
        ]
      },
      {
        heading: "3. Chemical Safety & Emergency Procedures",
        bullets: [
          "Required PPE: Consult the SDS for required PPE (nitrile gloves, splash goggles, face shields, or respirators) before starting work.",
          "Spills & Exposure: In the event of an accidental splash, notify supervisors, flush at an eyewash station or safety shower for at least 15 minutes, and retrieve the SDS for medical staff."
        ]
      }
    ],
    question: {
      prompt: "Where can an employee immediately locate and review Safety Data Sheets (SDS) when working inside our company shop facilities?",
      options: [
        "In the breakroom vending machine cabinet",
        "In the Safety Manager's Office",
        "Only by requesting a copy by mail from the chemical manufacturer",
        "In the back of the customer delivery truck"
      ],
      correct_index: 1,
      explanation: "In our company shop facilities, SDS master documentation is maintained and accessible in the Safety Manager's Office."
    }
  },
  {
    id: "briefing-012",
    title: "Fall Protection & Working at Heights",
    category: "Fall Protection",
    core_reminder: "4-FOOT LADDER RULE & ELEVATED SURFACES: Fall protection is mandatory when working at heights over 4 feet on a ladder. Fall protection is also strictly required on any elevated surface above the floor—including standing on machinery, equipment frames, tanks, or piping systems.",
    intro: "Gravity doesn't care how short the fall is—injuries from low elevations can still be severe or fatal. Whether you are on a ladder, a scaffold, or standing on top of equipment, you need to recognize height hazards and protect yourself.",
    sections: [
      {
        heading: "1. Understanding the 4-Foot Ladder Rule",
        bullets: [
          "The Threshold: Once your working level or standing height exceeds 4 feet on a ladder, you must use an approved personal fall arrest system (PFAS), a secured cage, or elevated platforms with guardrails.",
          "Ladder Inspection & Setup: Inspect rails, rungs, feet, and locks before use. Set on level ground, secure top/bottom, and follow the 4-to-1 extension ratio (1 foot out for every 4 feet up).",
          "Three Points of Contact: Always maintain two hands and one foot, or two feet and one hand, while climbing. Never carry heavy tools up a ladder; use a hoist or chainfall."
        ]
      },
      {
        heading: "2. Working on Equipment, Pipes, and Structures",
        bullets: [
          "No Unprotected Heights: Standing on top of equipment, skids, vessels, or piping systems without physical fall protection is strictly prohibited when elevated above the floor.",
          "Anchor Points & Gear: Tie-off anchor points must support at least 5,000 lbs per worker. Inspect harnesses, lanyards, and SRLs before every shift for tears, fraying, or latch damage.",
          "Mind the Swing Fall: Ensure your anchor point is directly overhead whenever possible to prevent pendulum swing hazards during a fall."
        ]
      },
      {
        heading: "3. Safe Work Practices & Prevention",
        bullets: [
          "Good Housekeeping: Keep elevated platforms, walkways, and ladder bases clear of tools, debris, and cords.",
          "Never Overreach: Keep your belt buckle centered between the ladder side rails. If you have to lean out, descend and reposition the ladder.",
          "Weather Conditions: High winds, ice, rain, or extreme heat increase fall risks. Stop work and reassess conditions if footing is compromised."
        ]
      }
    ],
    question: {
      prompt: "At what height does company policy mandate fall protection when working off a ladder or elevated surface?",
      options: [
        "Heights over 4 feet",
        "Heights over 6 feet",
        "Heights over 10 feet",
        "Only when working on roofs or outdoor scaffolding"
      ],
      correct_index: 0,
      explanation: "Company policy strictly mandates fall protection when working at heights over 4 feet on ladders, as well as on any elevated equipment or piping."
    }
  },
  {
    id: "briefing-013",
    title: "Portable Fire Extinguisher Safety & Inspection Policy",
    category: "Fire & Gas Safety",
    core_reminder: "36\" CLEARANCE, MONTHLY INSPECTIONS & PASS METHOD: Maintain a minimum 36-inch clearance in front of and around all fire extinguishers at all times. Units must undergo a visual inspection every 30 days verified on the tag. A fully charged ABC extinguisher must be within arm's reach of any Hot Work. Extinguishers are for initial stage fires only—evacuate if fire spreads or smoke compromises your path.",
    intro: "Portable extinguishers are intended only for small, contained, early-stage fires. If a fire spreads beyond the point of origin, produces thick smoke, or endangers your escape route, immediately evacuate and pull the building fire alarm.",
    sections: [
      {
        heading: "1. Visual Inspection & Maintenance Protocol",
        bullets: [
          "Monthly Visual Checks (Every 30 Days): Confirm the unit is in its designated location/mounted, gauge needle is in the green zone, pin/seal are intact, nozzle is clear of obstructions/corrosion, and the tag is signed and dated.",
          "Annual Certified Maintenance: All fire extinguishers must undergo a certified annual maintenance check and hydrostatic testing according to NFPA 10 schedules.",
          "Discharged or Defective Units: Any extinguisher that is discharged (even partially), leaking, unpressurized, or damaged must be taken out of service immediately, tagged out, and replaced with a charged spare."
        ]
      },
      {
        heading: "2. Fire Extinguisher Classes & Selection",
        bullets: [
          "Class A (Combustibles): Wood, paper, cloth, trash, and rubber.",
          "Class B (Flammable Liquids/Gases): Gasoline, diesel, oils, solvents, grease, and paints.",
          "Class C (Energized Electrical): Motors, electrical panels, wiring, and transformers. (Never use water on electrical fires).",
          "Standard IMC Equipment: IMC standardizes on multi-purpose ABC Dry Chemical extinguishers across all shops, job trailers, and mobile service rigs to handle mixed industrial hazards safely."
        ]
      },
      {
        heading: "3. Operating Technique: The P.A.S.S. Method",
        bullets: [
          "P — PULL: Pull the locking pin from the handle to break the tamper seal.",
          "A — AIM: Aim the nozzle or hose low, pointing directly at the base of the fire, not the flames.",
          "S — SQUEEZE: Squeeze the operating lever slowly and evenly to discharge the extinguishing agent.",
          "S — SWEEP: Sweep the nozzle side-to-side across the base of the fire until the flames are fully extinguished. Stand back 6 to 8 feet and watch for potential rekindling."
        ]
      }
    ],
    question: {
      prompt: "According to the P.A.S.S. method for operating a fire extinguisher, where should you aim the nozzle?",
      options: [
        "Directly at the flames shooting into the air",
        "At the center of the smoke cloud",
        "Low, pointing directly at the base of the fire",
        "Above the fire to create a blanket of extinguishing agent"
      ],
      correct_index: 2,
      explanation: "The 'A' in the P.A.S.S. method stands for AIM, specifically instructing users to aim low, directly at the base of the fire, not at the flames themselves."
    }
  },
  {
    id: "briefing-014",
    title: "Motor Vehicle, Fleet & Trailer Towing Safety Policy",
    category: "Site Compliance",
    core_reminder: "ZERO DISTRACTED DRIVING, PRE-TRIP CHECKS & 100% LOAD SECUREMENT: Zero mobile phone use while driving on company business. Drivers must complete a daily visual pre-trip walkaround of the vehicle and any attached trailer. Positive load securement is mandatory—all cargo, pipe, cylinders, and boxes must be secured with rated ratchet straps, chains, or clamps (never rope or gravity). Valid driver's license required; report violations or accidents immediately.",
    intro: "Operating company-owned vehicles, service trucks, and towing equipment trailers carries significant safety and liability exposure. Safe vehicle operation, strict load securement, attentive driving, and daily mechanical pre-trip checks are mandatory for all IMC drivers.",
    sections: [
      {
        heading: "1. Distracted Driving, Seatbelts & General Driving Rules",
        bullets: [
          "Seatbelt Mandate: Seatbelts must be fastened by the driver and all passengers prior to shifting the vehicle into drive. No exceptions.",
          "Speed & Defensive Driving: Obey posted limits, adjust for weather/traffic/weight, and maintain a minimum 4-second following distance (6+ seconds when towing or in rain/snow).",
          "Impaired Driving: Operating under the influence of alcohol, illegal drugs, or impairing medication is strictly prohibited and results in immediate termination and drug testing.",
          "Backing Protocol: Avoid backing by using drive-through spots. If backing in tight jobsite areas, deploy a spotter or conduct a 360-degree walkaround before reversing."
        ]
      },
      {
        heading: "2. Trailer Towing & Hitch Connection Standards",
        bullets: [
          "Hitch & Ball Matching: Verify the trailer coupler matches the hitch ball diameter exactly. Ensure the coupler latch is fully engaged and locked with a steel safety pin or padlock.",
          "Crossed Safety Chains: Connect dual safety chains in an 'X' pattern beneath the trailer tongue to cradle the tongue if it disconnects, leaving sufficient slack for turning without dragging.",
          "Breakaway Cable & Electric Brakes: Attach the emergency breakaway cable securely to the vehicle frame (never the safety chains or ball). Verify electric brakes and all lights function before entering traffic.",
          "Weight Distribution & Tongue Weight: Ensure 10% to 15% of total trailer weight rests on the hitch tongue to prevent dangerous fishtailing. Distribute heavy cargo over or slightly ahead of the axles."
        ]
      },
      {
        heading: "3. Cargo Securement, Pipe Racks & Tool Storage",
        bullets: [
          "Overhead Pipe & Strut Racks: Bundle materials securely using heavy-duty ratchet straps or engineered brackets. Red danger flags must be attached to loads extending more than 4 feet beyond the bumper.",
          "Compressed Gas Cylinders: Cylinders transported in truck beds must be stored upright in approved racks, chained/strapped securely, and equipped with threaded steel valve protection caps. Never transport them loose.",
          "Gang Boxes & Heavy Tools: Secure gang boxes, welders, threaders, and generators directly to vehicle D-rings or structural tie-down rails with rated transport chains or ratchet straps."
        ]
      }
    ],
    question: {
      prompt: "When connecting a trailer to a company vehicle, how must the dual safety chains be configured?",
      options: [
        "Wrapped tightly around the hitch ball to prevent movement",
        "Connected in a parallel, straight-line setup on each side",
        "Connected in an 'X' pattern beneath the trailer tongue",
        "Attached securely to the emergency breakaway cable"
      ],
      correct_index: 2,
      explanation: "Safety chains must be crossed in an 'X' pattern beneath the tongue so that they form a cradle to catch the tongue if the coupler disconnects from the ball."
    }
  },
  {
    id: "briefing-015",
    title: "Heat & Cold Stress Prevention Policy",
    category: "Occupational Health",
    core_reminder: "WATER/SHADE, THERMAL PPE, ACCLIMATIZATION & BUDDY SYSTEM: At a Heat Index of 90°F+, ensure immediate access to cool water (at least 1 qt/worker/hr) and shaded/AC rest areas. In ambient temps below 32°F or industrial freezers (-20°F), thermal PPE, warm-up breaks, and buddy systems are mandatory. Never work alone in extreme environments.",
    intro: "Our work frequently exposes employees to extreme environmental temperatures—from rooftop pipe installations in the summer to sub-zero industrial ammonia freezer boxes and winter field work. Thermal stress can impair mental focus, cause severe physical illness, or result in fatal medical emergencies.",
    sections: [
      {
        heading: "1. Heat Stress Prevention",
        bullets: [
          "Hydration Protocol: Drink small amounts of cool water or electrolyte beverages frequently (every 15 to 20 minutes) rather than large volumes occasionally. Do not rely on thirst alone as a guide.",
          "Work/Rest Cycles: At heat index levels above 90°F, foremen must schedule mandatory shaded rest breaks. When temperatures exceed 100°F, heavy tasks (manual rigging, torch cutting, climbing ladders) must be shifted to cooler morning hours whenever feasible.",
          "Heat Exhaustion Signs & Actions: Heavy sweating, cool/pale/clammy skin, dizziness, headache, nausea, weakness, muscle cramps. Action: Move to shade/AC, loosen clothing, apply cool damp cloths, and sip water.",
          "Heat Stroke (Medical Emergency): High body temperature (103°F+), hot/red/dry skin or profuse sweating, confusion, slurred speech, seizures, loss of consciousness. Call 911 / site ERT immediately and cool the worker rapidly."
        ]
      },
      {
        heading: "2. Cold Stress & Industrial Freezer Protocols",
        bullets: [
          "Layered Clothing & Thermal PPE: Wear three layers of clothing: an inner moisture-wicking synthetic layer, a middle insulating fleece/wool layer, and a wind/waterproof outer shell. Wear insulated work boots, thermal glove liners, and knit caps/hard-hat liners.",
          "Industrial Cold-Storage / Ammonia Freezers: No employee may work in a sub-zero commercial freezer or ammonia refrigeration space alone. Strict buddy system enforcement applies.",
          "Frostbite Recognition: Numbness, tingling, pale/waxy/white or blue skin on fingers, toes, nose, or ears.",
          "Hypothermia (Medical Emergency): Uncontrollable shivering, slurred speech, clumsy fingers, apathy, extreme confusion, and drowsiness."
        ]
      },
      {
        heading: "3. Personal Accountability",
        bullets: [
          "Self-Monitoring: Employees are responsible for monitoring their personal physical condition, pacing their work, taking prescribed rest breaks, and reporting symptoms immediately to their crew lead.",
          "Continuous Observation: Work partners must actively monitor each other's cognitive state and physical condition during extreme hot or cold assignments."
        ]
      }
    ],
    question: {
      prompt: "When the Heat Index reaches or exceeds 90°F, how often should employees drink cool water or electrolyte beverages?",
      options: [
        "Wait until you feel thirsty, then drink a large volume of water",
        "Drink small amounts frequently, every 15 to 20 minutes",
        "Drink one full quart at the beginning of the shift, and one at the end",
        "Drink primarily electrolyte sports drinks only during scheduled lunch breaks"
      ],
      correct_index: 1,
      explanation: "Employees must drink small amounts of cool water or electrolyte beverages frequently (every 15 to 20 minutes) rather than large volumes occasionally, and never rely on thirst alone."
    }
  },
  {
    id: "briefing-016",
    title: "Crystalline Silica Exposure Control Policy",
    category: "Occupational Health",
    core_reminder: "MANDATORY CONTROLS, ZERO DRY SWEEPING & HEPA FILTRATION: All hammer drills, core drills, rotary hammers, and cut-off saws must use integrated water delivery systems or HEPA-filtered vacuum shrouds. Dry sweeping, dry shoveling, or using compressed air to clean dust or slurry is strictly prohibited. Dust extractors require 99.97% HEPA filtration. Respiratory protection (N95, P100, or supplied-air) is mandatory whenever engineering controls cannot maintain exposure below the PEL or when specified by OSHA Table 1.",
    intro: "Interwest Mechanical Contractors frequently conducts concrete drilling for pipe hangers, strut installation, core drilling through floor slabs/walls, and masonry anchoring. Cutting, drilling, grinding, or chipping concrete releases Respirable Crystalline Silica dust, which causes severe lung disease, silicosis, and lung cancer.",
    sections: [
      {
        heading: "1. Housekeeping & Slurry Management",
        bullets: [
          "Slurry Cleanup: Wet slurry generated from core drilling or wet sawing must be cleaned up using wet-vac extraction before it dries into respirable airborne dust.",
          "Dust Disposal: Vacuum collection bags containing dry silica dust must be sealed and tied off inside the vacuum chamber before removal to prevent dust cloud dispersion. Dispose of sealed bags in heavy-duty contractor trash bags.",
          "Prohibited Cleaning Practices: Never blow concrete dust off clothing, boots, or tools with compressed air lines."
        ]
      },
      {
        heading: "2. Competent Person & Written Control Plan",
        bullets: [
          "Designated Competent Person: Every IMC jobsite involving concrete penetration must have a designated Silica Competent Person (Foreman / Lead) capable of identifying silica hazards and enforcing compliance.",
          "Regulated Work Zones: When dry cutting, deep core drilling, or surface grinding occurs, establish a perimeter barrier to keep unauthorized workers without proper PPE out of the dust generation zone."
        ]
      }
    ],
    question: {
      prompt: "According to the housekeeping and slurry management rules, what practice is strictly prohibited for cleaning concrete dust off clothing or tools?",
      options: [
        "Using a HEPA-filtered vacuum extractor",
        "Using compressed air lines to blow off the dust",
        "Using a wet-vac extraction method",
        "Sealing dust bags before disposal"
      ],
      correct_index: 1,
      explanation: "Never use compressed air lines to blow concrete dust off clothing, boots, or tools, as this immediately disperses respirable crystalline silica back into the air."
    }
  },
  {
    id: "briefing-017",
    title: "Hand, Portable Power, Pneumatic & Powder-Actuated Tool Safety Policy",
    category: "Tools & Equipment",
    core_reminder: "TWO-HAND CONTROL, HOSE WHIP CHECKS, & GFCI PROTECTION: Handheld power tools equipped with secondary handles must be operated with both hands firmly on designated grips at all times—one-handed use is prohibited. Pneumatic twist-lock couplings require safety lock pins/wire, and safety whip checks are mandatory at all connections. All 120V portable tools and cords must be GFCI protected.",
    intro: "Hand and portable power tools are fundamental to mechanical, piping, and fabrication work. Because these tools generate high-speed rotational forces, pressurized air hazards, and ballistic impacts, strict control, mandatory two-hand operation, and proper line securing are strictly enforced.",
    sections: [
      {
        heading: "1. Electric Power Tool Safety & Two-Hand Operation",
        bullets: [
          "Guards & Auxiliary Handles: Never remove, pin back, or modify factory wheel guards, blade guards, or side handles.",
          "Grinding Wheel Inspection & Matching: Inspect abrasive discs and cutoff wheels for cracks or chips before mounting. Ensure the wheel's rated RPM meets or exceeds the maximum operating RPM of the grinder.",
          "Trigger Locks Prohibited: Continuous-run lock-on buttons on handheld grinders, sanders, and saws must not be engaged or locked during manual hand operation."
        ]
      },
      {
        heading: "2. Pneumatic (Air) Powered Tools & Hose Safety",
        bullets: [
          "Positive Hose Connections: Pneumatic tools must be secured to air supply lines by positive locking means. Every quarter-turn coupling must have a safety clip/cotter pin or be wired together to prevent accidental disengagement under pressure.",
          "Whip Check Cables: Install braided steel whip check cables across all hose connections and at the tool manifold to restrain the hose if a fitting fails.",
          "No Radiator Clamps: Never use automotive worm-drive (radiator) hose clamps to repair or couple pneumatic lines. Use only factory-crimped or approved mechanical ferrule fittings.",
          "Air Cleaning Restrictions: Compressed air must never be used to blow debris or dust from clothing or skin. For surface cleaning, air nozzles must be OSHA-compliant with pressure regulated below 30 PSI and equipped with chip guarding."
        ]
      },
      {
        heading: "3. Powder-Actuated Fastening Tools (PAT)",
        bullets: [
          "Qualified Operators Only: Only authorized craftsmen may handle or fire powder-actuated tools.",
          "Pre-Operation Material Check: Never fire fasteners into brittle, hardened steel, cast iron, glazed tile, or thin base materials where ricochet or full penetration is possible.",
          "Misfire Protocol: Hold the tool firmly against the working surface for at least 30 seconds. Attempt a second firing while maintaining pressure. If it fails again, keep pointed in a safe direction, carefully remove the charge, and submerge it in water."
        ]
      },
      {
        heading: "4. Electrical Cords, Grounding & Hand Tool Maintenance",
        bullets: [
          "GFCI Mandate: All temporary jobsite power feeds and extension cords must run through a tested GFCI receptacle or in-line portable GFCI unit.",
          "Cord Routing & Protection: Keep extension cords off wet floors, away from high-traffic aisles, and protected from sharp metal corners or pinch points around doors and hatches.",
          "Impact Tool Dressing: Hand impact tools (chisels, punches, wedges) with mushroomed or flared heads must be dressed square on a bench grinder before use to prevent metal fragments from flying off under hammer impact.",
          "No 'Cheater' Pipes: Never use cheater bars, pipes, or improvised levers to extend the handle of a ratchet or wrench to increase torque."
        ]
      }
    ],
    question: {
      prompt: "What is the maximum allowable pressure for an OSHA-compliant air nozzle when used for surface cleaning?",
      options: [
        "15 PSI",
        "30 PSI",
        "60 PSI",
        "90 PSI"
      ],
      correct_index: 1,
      explanation: "Air nozzles used for surface cleaning must be OSHA-compliant with pressure regulated below 30 PSI and equipped with chip guarding."
    }
  },
  {
    id: "briefing-018",
    title: "Rigging Hardware, Slings & Material Handling Safety Policy",
    category: "Material Handling",
    core_reminder: "LEGIBLE TAGS, DAILY INSPECTIONS, CORNER PADDING & CRUSH ZONE CLEARANCE: Every sling and hardware item must have a clearly legible manufacturer rating tag or stamp. Pre-use visual inspections are mandatory prior to each shift. Softeners or corner pads must protect slings from sharp edges. Never position any part of your body beneath a suspended load or within the red zone / fall line.",
    intro: "Rigging and hoisting heavy mechanical components presents extreme hazards of dropped loads, crushing injuries, and structural collapse. IMC mandates daily visual inspections, strict load rating verifications, proper hitch configurations, and certified hardware usage.",
    sections: [
      {
        heading: "1. Sling Inspection & Rejection Criteria",
        bullets: [
          "Synthetic Web Slings: Immediately remove and destroy slings with missing/unreadable tags, acid/chemical/caustic burns, melting or charring from torch/welding slag, holes, tears, cuts, snags, exposed red warning core yarns, or broken stitches in load-bearing splices.",
          "Wire Rope Slings: Immediately remove wire rope slings with 10 randomly distributed broken wires in one lay, 5 broken wires in one strand, severe kinking, bird-caging, core protrusion, or heat/arc strike damage.",
          "Alloy Steel Chains: Daily inspect chain links for excessive wear, stretching, gouges, twists, or heat distortion. Never shorten chain slings with knots, bolts, or makeshift pins."
        ]
      },
      {
        heading: "2. Hardware, Shackles & Safe Rigging Practices",
        bullets: [
          "Shackles & Hoist Rings: Use only drop-forged, alloy steel screw-pin shackles with clearly embossed Working Load Limits. Screw pins must be tightened completely and backed off a quarter-turn (or cotter-pinned if using safety bolt shackles). Never substitute a bolt for a shackle pin.",
          "Shoulder Eyebolts: Standard non-shoulder eyebolts are approved for vertical inline lifts only.",
          "Hook Latches: All crane, hoist, and come-along hooks must be equipped with a functional, spring-loaded safety latch."
        ]
      },
      {
        heading: "3. Sling & Hitch Configurations",
        bullets: [
          "Choker Hitches: When utilizing a choker hitch, ensure the choke angle pulls down flat against the load. Never force the eye down with a hammer, as this drastically weakens the sling at the point of contact.",
          "Tag Lines: Always utilize clean, non-conductive synthetic tag lines of sufficient length to guide and orient suspended loads. Never use your bare hands or body to manually move a suspended load."
        ]
      }
    ],
    question: {
      prompt: "According to the wire rope sling rejection criteria, how many randomly distributed broken wires in one lay dictate immediate removal from service?",
      options: [
        "3 broken wires",
        "5 broken wires",
        "10 broken wires",
        "15 broken wires"
      ],
      correct_index: 2,
      explanation: "A wire rope sling must be immediately removed from service if there are 10 randomly distributed broken wires in one lay, or 5 broken wires in one strand."
    }
  },
 {
    id: "briefing-019",
    title: "Stop Work Authority (SWA) & Safety Intervention Policy",
    category: "Company Policy",
    core_reminder: "STOP WORK OBLIGATION, ZERO RETRIBUTION & 6-STEP RESOLUTION: Every employee, regardless of rank, is empowered and required to stop work immediately if they perceive imminent danger. Retaliation or disciplinary action for initiating SWA in good faith is strictly prohibited—if a worker still feels unsafe after resolution, they will be reassigned. A formal Stop Work Form must be completed before restart if corrective action was required.",
    intro: "IMC guarantees every employee and on-site contractor the absolute responsibility, authority, and obligation to stop work whenever an unsafe condition, behavior, scope change, or environmental hazard arises. Exercising Stop Work Authority in good faith will never result in retribution, reprimand, or negative career impact.",
    sections: [
      {
        heading: "1. Situations Requiring a Stop Work Action",
        bullets: [
          "Alarms & Signals: Facility alarms, gas detection sirens/strobes, or equipment warning indicators.",
          "Scope Changes: Unplanned changes to the job task.",
          "Equipment & Safeguard Failures: Defective rigging, missing machine guards, or damaged cords.",
          "Environmental & Weather Hazards: High winds exceeding lift limits, lightning, excessive heat, chemical spills, or severe leaks.",
          "Unclear Information or Missing Controls: Lack of understanding, unperformed Risk Predictions, missing permits, or untrained personnel."
        ]
      },
      {
        heading: "2. The 6-Step SWA Resolution Process",
        bullets: [
          "Stop: Immediately halt the hazardous activity in a direct, professional, and non-combative manner with the person(s) at risk.",
          "Notify: Notify affected crew members and the immediate supervisor. Remove personnel from the hazard zone and stabilize the area.",
          "Investigate: Discuss the hazard collaboratively. If resolved simply, resume work after thanking the initiator. If valid corrections are needed, complete the Stop Work Issuance Form and suspend work.",
          "Correct: Implement required physical corrections, PPE changes, or procedural controls. A qualified supervisor must inspect and verify modifications.",
          "Resume: Authorized personnel reopen the area and communicate the corrective actions to all affected workers before work recommences.",
          "Follow-Up: Operations Management conducts root-cause analysis, and the Safety Department publishes the lessons learned across all crews."
        ]
      }
    ],
    question: {
      prompt: "What is IMC's policy regarding disciplinary action or retaliation against an employee who initiates a Stop Work Authority (SWA) in good faith?",
      options: [
        "Retaliation is evaluated on a case-by-case basis by site managers",
        "Employees may be reprimanded if the stop-work delays production",
        "Retaliation or disciplinary action is strictly prohibited",
        "Employees lose their shift pay for the duration of the delay"
      ],
      correct_index: 2,
      explanation: "IMC maintains a strict Zero Retribution Policy. Retaliation or disciplinary action against any associate for initiating or supporting a stop-work action in good faith is strictly prohibited."
    }
  },
  {
    id: "briefing-020",
    title: "Workplace Conduct, Anti-Harassment & Security Policy",
    category: "Company Policy",
    core_reminder: "ZERO TOLERANCE FOR HARASSMENT, WEAPONS, HORSEPLAY & JOB ABANDONMENT: Slurs, demeaning acts, or derogatory remarks result in immediate termination. Carrying or storing firearms, concealed weapons, or explosives on company property, vehicles, or client jobsites is strictly forbidden regardless of permits. Horseplay, practical jokes, scuffling, and throwing tools are strictly prohibited.",
    intro: "IMC is committed to maintaining a safe, professional, respectful, and secure work environment across all fabrication shops, administrative offices, and customer job sites. Harassment, discriminatory behavior, weapons possession, and job abandonment directly undermine workplace safety and will not be tolerated.",
    sections: [
      {
        heading: "1. Anti-Harassment, Discrimination & Professional Conduct",
        bullets: [
          "Respectful Workplace: Every associate has the right to work in an environment free of hostility and intimidation. Conduct that creates an intimidating, hostile, or offensive working environment is strictly prohibited.",
          "Prohibited Behavior: Abusive, profane, or threatening language directed at coworkers, subcontractors, client representatives, or the public.",
          "Unwelcome Physical Contact: Suggestive remarks, propositions, or sexual harassment of any nature are strictly forbidden.",
          "Offensive Media: Displaying or circulating offensive, sexually explicit, or racially derogatory images, graffiti, or digital media in shops, break areas, or job sites is prohibited.",
          "Reporting & Non-Retaliation: Employees who witness or experience harassment or discrimination must report the incident immediately to their Foreman, Project Manager, or the Safety Department. Retaliation against any employee reporting in good faith is strictly prohibited."
        ]
      },
      {
        heading: "2. Workplace Security, Weapons & Property Protection",
        bullets: [
          "Weapons Prohibition: IMC maintains a weapons-free workplace. This policy applies to all employees, visitors, suppliers, and subcontractors regardless of state-issued concealed carry permits while on IMC property or client facilities.",
          "Authorized Facility Access: Only authorized IMC personnel and approved subcontractors are permitted in shop fabrication areas, mechanical rooms, or client work zones. Visitors must sign in and be accompanied by authorized personnel.",
          "Company & Client Property Respect: Theft, unauthorized removal, deliberate damage, or misuse of IMC property, tools, scrap metal, or client equipment is grounds for immediate termination and potential criminal prosecution."
        ]
      },
      {
        heading: "3. Attendance, Communication & Job Abandonment",
        bullets: [
          "Reporting Absences: Employees unable to report to their scheduled shift must notify their direct supervisor or project manager before shift start time.",
          "Unexcused Absences: Unscheduled, unexcused, or patterned absences disrupt jobsite safety planning and crew coordination.",
          "Five-Day Rule (Automatic Resignation): In accordance with IMC General Company Policy, failing to report to work and failing to communicate with IMC management for five consecutive working days is considered a voluntary surrender of employment."
        ]
      }
    ],
    question: {
      prompt: "According to the Five-Day Rule, what constitutes a voluntary surrender of employment (Job Abandonment)?",
      options: [
        "Failing to clock in before 8:00 AM five times in one month",
        "Taking five days of unexcused sick leave without a doctor's note",
        "Failing to report to work and failing to communicate with management for five consecutive working days",
        "Leaving the job site early five days in a row without supervisor approval"
      ],
      correct_index: 2,
      explanation: "Failing to report to work and failing to communicate with IMC management for five consecutive working days is considered a voluntary surrender of employment."
    }
  },


  {
    id: "briefing-021",
    title: "Powered Industrial Trucks: Forklifts & Telehandlers Policy",
    category: "Heavy Equipment",
    core_reminder: "AUTHORIZED & CERTIFIED OPERATORS ONLY: No employee may operate without active certification in their possession. Travel Low & Tilted Back: Carry all loads 4 to 6 inches off the ground with the mast/carriage tilted back. Telehandler Load Chart Supremacy: Always reference the cab load chart before extending any load. Mandatory Daily Pre-Start Forms must be completed every shift prior to operation.",
    intro: "Operating forklifts and variable-reach telehandlers requires specialized training, strict adherence to manufacturer load charts, and constant awareness of pedestrian traffic. An overturn, tip-over, or struck-by incident can be fatal.",
    sections: [
      {
        heading: "1. General Forklift & PIT Operational Rules",
        bullets: [
          "Seatbelts Mandatory: Fasten your seatbelt whenever the lift is running. In the event of a rollover, hold on firmly and lean away from the point of impact—never jump from a tipping machine.",
          "Pedestrian Separation & Blind Corners: Pedestrians always have the right of way. Slow down, stop, and sound your horn at all intersections, doorways, and plant aisle crossings. Maintain eye contact with pedestrians before proceeding.",
          "Reverse Travel: If a bulky load blocks your forward field of vision, drive the machine in reverse. Never operate blind.",
          "No Passengers / No Riders: Passengers are strictly prohibited unless the machine is specifically engineered with an approved manufacturer second seat and restraint system.",
          "Never Place Body Parts in the Mast: Never reach through the uprights of the mast or place arms/legs outside the running lines of the cage while operating."
        ]
      },
      {
        heading: "2. Telehandler (Variable-Reach / Rough Terrain) Specific Rules",
        bullets: [
          "Center of Gravity: As a telehandler boom extends forward and up, the machine's center of gravity shifts drastically forward. A load that is safe at 5 feet can cause a tip-over at 25 feet.",
          "Frame Leveling: Frame leveling must be completed before elevating or extending the boom. Never use the frame-leveling tilt control while the boom is elevated.",
          "Outriggers & Stabilizers: If equipped with outriggers, deploy them on solid, level ground or cribbing before lifting loads near capacity or at high reach.",
          "Traveling with a Telehandler: Always travel with the boom fully retracted and lowered to travel height. Travel directly straight up or down slopes—never turn or drive diagonally across an incline."
        ]
      },
      {
        heading: "3. Material Rigging, Attachments & Personnel Restrictions",
        bullets: [
          "Forks are Not Crane Hooks: Do not hang slings, chains, or rigging from standard bare fork tines unless using an engineered, factory-approved lifting attachment secured to the carriage.",
          "Lifting Personnel: Lifting workers on bare forks, wooden pallets, or unapproved platforms is strictly prohibited. Personnel may only be elevated using an approved, factory-manufactured work platform that is secured to the mast/carriage with full guardrails and harness tie-off points.",
          "Parking & Shut-Down: When parking equipment: lower the forks/boom flat to the ground, set controls to neutral, engage the parking brake, and shut off the engine."
        ]
      }
    ],
    question: {
      prompt: "When operating a telehandler, when must frame leveling be performed?",
      options: [
        "While the boom is actively extending to maintain balance",
        "Only when lifting loads exceeding 5,000 lbs",
        "Before elevating or extending the boom",
        "After the load is elevated but before moving forward"
      ],
      correct_index: 2,
      explanation: "Frame leveling must be completed before elevating or extending the boom. You should never use the frame-leveling tilt control while the boom is already elevated."
    }
  },


  {
    id: "briefing-022",
    title: "Chemical Safety: PSM Ammonia Compliance & Defensive Emergency Response",
    category: "Chemical Safety",
    core_reminder: "HAZARDOUS LINE BREAKING PERMIT REQUIRED: Never open, unbolt, cut, or tap into an ammonia line or vessel without an approved permit, certified LOTO, and zero pressure verification. Trained Personnel Only: All work must be led or overseen by designated Ammonia Leads (TJ Beckstrom, Kelly Mower). Defensive Response Only: IMC field personnel are strictly prohibited from acting as emergency HazMat responders or entering an active release cloud. Evacuate immediately upwind/crosswind if levels reach 25 ppm or alarms activate.",
    intro: "Anhydrous Ammonia is a toxic, corrosive gas stored under high pressure in industrial refrigeration systems. Work on or near ammonia systems presents severe health, freeze-burn, and explosive hazards. IMC mandates strict Process Safety Management (PSM) protocols and a strictly defensive emergency response protocol.",
    sections: [
      {
        heading: "1. PSM Contractor Compliance",
        bullets: [
          "Host Facility Coordination: Before performing mechanical work, hot work, or line breaking on host site ammonia systems, IMC supervisors must review the host plant's Process Hazard Analysis (PHA) and specific safe work practices.",
          "Training Documentation: Every IMC pipefitter, welder, and technician working near ammonia systems must maintain verified training on ammonia toxicity, PPE requirements, and plant evacuation routes."
        ]
      },
      {
        heading: "2. Safe Line Breaking & Ammonia System Servicing",
        bullets: [
          "Zero Energy & Pump-Down: Before loosening flanges or opening valves, the system must be evacuated, pumped down below atmospheric pressure, isolated with lockouts/blanks, and purged according to written standard operating procedures.",
          "Line-Breaking PPE: When opening an isolated line for the first time, technicians must wear a full-face shield over safety glasses, chemical-resistant gloves, and have an approved escape respirator immediately accessible.",
          "Controlled Flange Cracking: Always crack the flange bolts on the side facing away from you first to direct any residual liquid or vapor spray away from your body."
        ]
      },
      {
        heading: "3. Defensive Emergency Action & Evacuation",
        bullets: [
          "Stop & Drop Tools: Immediately stop all mechanical work, shut off hot work torches/welders, and avoid operating electrical switches when an alarm sounds or a sudden leak occurs.",
          "Check Wind Direction: Observe plant windsocks or flags. Always evacuate crosswind, then upwind—never run downwind into a vapor plume.",
          "Assemble & Report: Proceed to the designated outdoor Emergency Assembly Station. Report directly to the IMC Foreman for a mandatory headcount and alert the host facility's Emergency Response Team (ERT).",
          "Emergency Decontamination: If liquid ammonia contacts skin or eyes, immediately flush the affected area with clean water at an emergency eyewash/drench shower for at least 15 minutes while medical assistance is summoned."
        ]
      }
    ],
    question: {
      prompt: "At what ambient ammonia concentration level (ppm) are IMC field employees required to stop work and immediately evacuate?",
      options: [
        "10 ppm",
        "25 ppm",
        "50 ppm",
        "100 ppm"
      ],
      correct_index: 1,
      explanation: "If ambient ammonia levels reach 25 ppm or an ammonia plant horn/strobe activates, stop work immediately and evacuate."
    }
  },

  {
    id: "briefing-023",
    title: "Food Plant Operations, Sanitation & Tool Cleanliness Policy",
    category: "Site Compliance",
    core_reminder: "TOOL WASHING, ZERO FOREIGN MATERIAL & GMP COMPLIANCE: Hand tools, power tools, and rigging must be washed and degreased with soap and water prior to entry. Loose fasteners, unclipped pens, and open utility blades are strictly controlled—all hardware must be accounted for. No eating, drinking, tobacco, or cosmetics in processing zones. Hairnets, beard nets, clean smocks, and metal-detectable earplugs are mandatory before crossing the sanitation line.",
    intro: "IMC employees must adhere to strict sanitation and contamination-control standards. Preventing biological, chemical, and physical foreign-material contamination of client food products and packaging lines is mandatory.",
    sections: [
      {
        heading: "1. Tool, Equipment & Rigging Cleanliness Protocol",
        bullets: [
          "Pre-Entry Tool Wash: Grease, oil, metal shavings, and shop grit carry contaminants. Ensure all hand tools (wrenches, ratchets, pipe cutters), power tool casings, and toolboxes are clean of debris before using them in production zones.",
          "Food-Grade Lubricants Only: If machinery or pipe components require lubrication in or around active lines, utilize only food-grade registered lubricants authorized by the host facility. Never use standard non-food industrial greases where incidental food contact is possible.",
          "Dedicated Carts & Tool Trays: Keep tools organized on plastic or stainless steel tool trays/carts. Never place dirty tools, grease rags, or hardware directly on plant conveyor belts, processing tables, or stainless steel food-contact surfaces."
        ]
      },
      {
        heading: "2. Physical & Chemical Contamination Controls",
        bullets: [
          "Work Area Enclosures & Tarps: When cutting, grinding, unbolting, or drilling near open packaging or food processing zones, the work area must be completely curtained with clean plastic to capture metal shavings and dust.",
          "Fastener & Scrap Accounting: Maintain a strict count of nuts, bolts, washers, drill bits, and cutoff wheel segments. If a drill bit snaps or a piece of hardware is dropped into an open tank, hopper, or conveyor, stop work immediately and notify the host plant supervisor.",
          "Metal-Detectable Equipment: When working in high-risk zones, utilize metal-detectable earplugs (with embedded ball bearings/cords) and metal-detectable pens."
        ]
      },
      {
        heading: "3. Personal Hygiene & Sanitation Boundaries",
        bullets: [
          "Sanitation Line: Respect all sanitation hand-washing sinks and boot-scrubbing stations when entering production floors. Wash hands with warm water and soap for at least 20 seconds before putting on gloves or handling process equipment.",
          "Jewelry & Personal Items: Remove all exposed jewelry (rings, watches, necklaces, earrings, facial piercings) prior to entering food processing floors.",
          "Clothing & Outerwear: Wear clean, tear-resistant clothing. Remove soiled or contaminated coveralls, welding jackets, or work smocks before entering plant break rooms, cafeterias, or restrooms.",
          "Illness & Open Wounds: Any employee suffering from an active communicable illness, stomach virus, or open, weeping skin wound must report the condition to the IMC foreman and is prohibited from working around open food-contact surfaces."
        ]
      }
    ],
    question: {
      prompt: "If machinery requires lubrication near active food production lines, what specific type of lubricant must be used?",
      options: [
        "Standard multi-purpose lithium grease",
        "Any water-based synthetic lubricant",
        "NSF H1 food-grade registered lubricants authorized by the host facility",
        "Heavy-duty molybdenum disulfide grease"
      ],
      correct_index: 2,
      explanation: "If lubrication is required near active lines, you must utilize only NSF H1 food-grade registered lubricants authorized by the host facility to prevent chemical contamination."
    }
  },
  {
    id: "briefing-024",
    title: "Biological Safety: Bloodborne Pathogens (BBP) & First Aid Exposure Control Policy",
    category: "Occupational Health",
    core_reminder: "UNIVERSAL PRECAUTIONS, PPE & IMMEDIATE EXPOSURE REPORTING: Treat all human blood and bodily fluids as infectious. Disposable gloves and eye/face protection are mandatory when administering first aid or cleaning spills. Report any cuts, punctures, or bodily fluid contact immediately to the site supervisor and safety director for confidential medical evaluation.",
    intro: "IMC is committed to eliminating or minimizing occupational exposure to bloodborne pathogens such as Hepatitis B, Hepatitis C, and Human Immunodeficiency Virus (HIV). Employees performing designated first aid, HAZMAT response, custodial duties, or handling sharp materials must follow universal precautions and exposure control protocols.",
    sections: [
      {
        heading: "1. Universal Precautions & Safe Work Practices",
        bullets: [
          "First Aid & Injury Response: When rendering first aid to an injured coworker with active bleeding, always put on disposable gloves first. Avoid direct skin contact with blood or bodily fluids.",
          "Hygiene & Sanitation: Wash hands thoroughly with soap and running water immediately after providing first aid or removing protective gloves. If hand-washing facilities are unavailable, use antiseptic wipes/sanitizer and wash as soon as possible.",
          "Prohibited Activities: Do not eat, drink, smoke, chew gum, apply cosmetics, or handle contact lenses where infectious materials may be present. Never store food or beverages in cabinets or refrigerators containing biological/chemical materials."
        ]
      },
      {
        heading: "2. PPE Selection, Use & Disposal",
        bullets: [
          "Gloves: Wear single-use latex or vinyl gloves when handling blood, body secretions, contaminated rags, or open wounds. Never wash or reuse disposable gloves.",
          "Proper Disposal: Place contaminated dressings, rags, towels, and disposable gloves into dedicated red biohazard bags or clearly marked, leak-proof disposal containers. Never discard biohazard waste into standard shop trash cans."
        ]
      },
      {
        heading: "3. Decontamination & Post-Exposure Medical Protocol",
        bullets: [
          "Surface Disinfection: Contaminated tools, equipment, floors, and workstations must be thoroughly cleaned and disinfected using an EPA-registered disinfectant solution or a 1:10 bleach-to-water mixture.",
          "Needle Stick / Puncture Protocol: If stuck by a sharp object or contaminated needle/blade, wash the puncture site immediately with warm water and soap. Do not squeeze or scrub the wound aggressively."
        ]
      }
    ],
    question: {
      prompt: "What is the approved solution ratio for disinfecting tools and surfaces contaminated with blood or bodily fluids?",
      options: [
        "1:10 bleach-to-water mixture",
        "Pure, undiluted isopropyl alcohol",
        "Standard dish soap and hot water",
        "1:5 ammonia-to-water mixture"
      ],
      correct_index: 0,
      explanation: "Contaminated tools, equipment, and surfaces must be thoroughly cleaned and disinfected using an EPA-registered disinfectant solution or a 1:10 bleach-to-water mixture."
    }
  },
  {
    id: "briefing-025",
    title: "Fire Prevention, Hot Work Isolation & Environmental Protection Policy",
    category: "Fire & Gas Safety",
    core_reminder: "35 FT / 50 FT ISOLATION, POST-JOB FIRE WATCH & ZERO UNCONTROLLED SPILLS: Relocate combustibles at least 35 feet away and flammable liquids 50 feet away, or isolate with certified flameproof barriers. A dedicated Fire Watch must monitor during work and for 30 minutes up to 2 hours post-completion. Zero Drain Dumping: Never dispose of oils, solvents, glycol, or chemicals into any drains or sewers.",
    intro: "IMC is dedicated to preventing industrial fires and minimizing environmental impact across all fabrication shops and customer job locations. Cutting, welding, brazing, chemical use, and waste management require proactive isolation, containment, and strict adherence to environmental standards.",
    sections: [
      {
        heading: "1. Hot Work Area Preparation & Spark Isolation",
        bullets: [
          "Combustible Dust Hazards: Hot work is strictly forbidden on or near equipment, ducts, or surfaces containing combustible dust layers. The work area must be thoroughly swept, cleaned, and inspected before hot work begins.",
          "Ducts, Openings & Conveyors: All floor openings, wall penetrations, conveyor chutes, and open pipe sleeves within 35 feet of hot work must be sealed with metal guards or fire-resistant blankets to prevent sparks from traveling to lower levels or adjacent rooms.",
          "Exterior & Outdoor Hot Work: Dry grass, brush, and combustible landscaping in outdoor work zones must be wetted down thoroughly prior to hot work."
        ]
      },
      {
        heading: "2. Fire Watch Responsibilities & Equipment",
        bullets: [
          "Dedicated Role: The Fire Watch person's sole responsibility is to monitor the hot work operation, scan for sparks or embers, and maintain line-of-sight. The watch cannot perform grinding, pipe fitting, or assisting duties while on fire watch duty.",
          "Suppression Equipment: A fully charged, inspected ABC dry chemical fire extinguisher must be within arm's reach of the Fire Watch.",
          "Opposite-Side Monitoring: If welding or cutting is conducted on a metal wall, partition, ceiling, or roof, a secondary fire watch must be positioned on the opposite side to guard against heat-transfer ignition."
        ]
      },
      {
        heading: "3. Environmental Management, Chemical Handling & Spill Control",
        bullets: [
          "Spill Prevention & Containment: Use secondary containment pallets or drip pans under all portable fuel tanks, hydraulic power units, oil storage drums, and chemical transfer pumps.",
          "Active Recycling & Waste Segregation: Segregate scrap metals, copper, stainless steel, cardboard, and clean wood into designated recycling bins to minimize landfill impact. Keep scrap metal bins free of trash and food waste.",
          "Hazardous Waste Disposal: Collect contaminated rags, used absorbents, and spent aerosol cans in dedicated, closed-lid, labeled steel containers. Dispose of chemical waste according to Safety Data Sheet (SDS) guidelines."
        ]
      }
    ],
    question: {
      prompt: "How far must general combustible materials (like cardboard or wood) be relocated away from hot work operations?",
      options: [
        "15 feet",
        "20 feet",
        "35 feet",
        "50 feet"
      ],
      correct_index: 2,
      explanation: "All general combustible materials must be relocated at least 35 feet away from hot work. Flammable liquids and fuel storage require a 50-foot clearance."
    }
  },
  {
    id: "briefing-026",
    title: "Mobile Elevating Work Platforms (MEWPs): Scissor Lifts & Boom Lifts Policy",
    category: "Heavy Equipment",
    core_reminder: "FALL PROTECTION, OVERHEAD CLEARANCE & ZERO CLIMBING: Boom lift occupants must wear a full-body harness tied off exclusively to the factory anchor point inside the basket—never to external structures. Scissor lift users must keep both feet on the platform floor. Climbing rails or using ladders/buckets inside the basket is prohibited. Mandatory Pre-Start Forms must be completed every shift.",
    intro: "Standard Reference: OSHA 29 CFR 1910.67, 1926.453 & ANSI/SAIA A92.20 / A92.22 / A92.24. Operating scissor lifts and articulating/telescopic boom lifts exposes workers to fall, tip-over, crushing, and electrocution hazards. Proper fall arrest equipment, rigorous daily pre-start checks, and strict adherence to operating limits are mandatory.",
    sections: [
      {
        heading: "1. General MEWP Operational & Platform Rules",
        bullets: [
          "Authorized & Trained Operators: Only employees with active, documented third-party MEWP certification may operate lifts. Certification cards must be on your person when operating a lift.",
          "Gate & Chain Closure: Ensure access gates fully shut and latch, or safety chains are securely fastened, before elevating the platform.",
          "Level Ground & Slope Limits: Never elevate on slopes, ramps, or uncompacted soils that exceed the manufacturer's rated slope limit. If the tilt alarm sounds, lower the platform completely before repositioning.",
          "Crush & Pinch Hazards: Keep hands and fingers inside the guardrails when maneuvering near overhead steel, piping, refrigeration racks, or door frames."
        ]
      },
      {
        heading: "2. Boom Lift Specific Rules (Articulating & Telescopic)",
        bullets: [
          "The 'Catapult Effect': Driving a boom lift while elevated over curbs, potholes, or uneven ground creates a sudden whip action at the basket that can eject an unbelted worker. Always look in the direction of travel and lower the boom when driving on uneven terrain.",
          "Overhead Power Line Clearances: Maintain a minimum clearance of at least 10 feet from all energized power lines up to 50 kV (greater distances for higher voltages). Treat all overhead lines as energized.",
          "Exiting at Height: Exiting a boom lift or scissor lift while elevated is strictly prohibited unless authorized under a documented Site-Specific Fall Protection Plan with 100% continuous tie-off to an approved external structural anchor."
        ]
      },
      {
        heading: "3. Pre-Start Inspection & Work Area Assessment",
        bullets: [
          "Daily Mechanical Check: Inspect hydraulics for leaks, test emergency lowering controls, check tires for gouges, and verify limit switches before the start of each shift.",
          "Workplace Survey: Check the travel path for floor holes, drop-offs, trenches, and overhead obstructions.",
          "Barricades & Ground Control: If operating in pedestrian areas or forklift traffic zones, set up safety cones, caution tape, or assign a ground spotter to prevent collisions."
        ]
      }
    ],
    question: {
      prompt: "When working in a boom lift, where must the operator connect their fall arrest lanyard or self-retracting lifeline (SRL)?",
      options: [
        "To the mid-rail of the basket guardrails",
        "To the highest accessible overhead building beam or piping",
        "Exclusively to the factory-installed engineered anchor point inside the basket",
        "To the lifting eye located on the outside of the basket"
      ],
      correct_index: 2,
      explanation: "Every occupant of a boom lift must wear a full-body harness attached exclusively to the factory-installed engineered anchor point inside the basket. Tying off to adjacent pipes, roof steel, or external structures is strictly prohibited."
    }
  },
];

export function getBriefingById(id: string): SafetyBriefing | undefined {
  return SAFETY_BRIEFINGS.find((briefing) => briefing.id === id);
}

export function getDailyBriefing(): SafetyBriefing {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const diff = Date.now() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % SAFETY_BRIEFINGS.length;
  return SAFETY_BRIEFINGS[index];
}
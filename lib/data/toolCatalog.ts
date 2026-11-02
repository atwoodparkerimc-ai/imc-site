// lib/data/toolCatalog.ts

export type ToolCategory = "Hand Tools" | "Power Tools" | "Rigging & Access" | "Shop Tools";

export interface MasterToolItem {
  name: string;
  category: ToolCategory;
  requiresTape?: boolean; // Explicit flag: true = powered / requires monthly tape
}

export const NESTLE_SPRINGVILLE_LOCATION = "Nestle Springville";

/**
 * Validates whether a user's assigned work location matches Nestlé Springville.
 * Used to isolate Nestlé Standard 5959-SHE-INS-0022 compliance, JHAs, and tool check workflows.
 */
export function isNestleSpringville(location?: string | null): boolean {
  if (!location) return false;
  const clean = location.trim().toLowerCase();
  return clean.includes("springville") || clean.includes("nestle");
}

export const MONTHLY_TAPE_COLORS: Record<number, string> = {
  1: "WHITE",
  2: "WHITE & YELLOW",
  3: "WHITE & BLUE",
  4: "GREEN",
  5: "GREEN & YELLOW",
  6: "GREEN & BLUE",
  7: "RED",
  8: "RED & YELLOW",
  9: "RED & BLUE",
  10: "ORANGE",
  11: "ORANGE & YELLOW",
  12: "ORANGE & BLUE",
};

export function getCurrentMonthTapeColor(): { monthName: string; color: string; monthKey: string } {
  const now = new Date();
  const monthNum = now.getMonth() + 1;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthKey = `${now.getFullYear()}-${String(monthNum).padStart(2, "0")}`;

  return {
    monthName: monthNames[monthNum - 1],
    color: MONTHLY_TAPE_COLORS[monthNum] || "WHITE",
    monthKey,
  };
}

export function getFourthWorkingDayDeadline(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let workingDaysCount = 0;
  let day = 1;

  while (workingDaysCount < 4) {
    const checkDate = new Date(year, month, day);
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDaysCount++;
    }
    if (workingDaysCount === 4) {
      return new Date(year, month, day, 23, 59, 59);
    }
    day++;
  }

  return new Date(year, month, 4, 23, 59, 59);
}

// Master list with explicit tape requirements
export const MASTER_TOOL_LIST: MasterToolItem[] = [
  // --- HAND TOOLS (ALL FALSE) ---
  { name: "Round nose shovel", category: "Hand Tools" },
  { name: "Flathead shovel", category: "Hand Tools" },
  { name: "Pry bar", category: "Hand Tools" },
  { name: "Rolling head pry bar", category: "Hand Tools" },
  { name: "Dig bar", category: "Hand Tools" },
  { name: "Crowbar", category: "Hand Tools" },
  { name: "Vise grips", category: "Hand Tools" },
  { name: "Vice grip chain locking pliers", category: "Hand Tools" },
  { name: "Crescent wrench", category: "Hand Tools" },
  { name: "Pliers", category: "Hand Tools" },
  { name: "Needle nose pliers", category: "Hand Tools" },
  { name: "Channel lock pliers", category: "Hand Tools" },
  { name: "Square nose pliers", category: "Hand Tools" },
  { name: "Slip joint pliers", category: "Hand Tools" },
  { name: "Dikes", category: "Hand Tools" },
  { name: "Crimping pliers", category: "Hand Tools" },
  { name: "Snap ring pliers", category: "Hand Tools" },
  { name: "Pipe wrench", category: "Hand Tools" },
  { name: "Freezer wrench", category: "Hand Tools" },
  { name: "Strap wrench", category: "Hand Tools" },
  { name: "Drum plug wrench", category: "Hand Tools" },
  { name: "Torque wrench", category: "Hand Tools" },
  { name: "Socket wrench", category: "Hand Tools" },
  { name: "Thin wheel wrench", category: "Hand Tools" },
  { name: "End wrench", category: "Hand Tools" },
  { name: "Allen wrench", category: "Hand Tools" },
  { name: "Breaker bar", category: "Hand Tools" },
  { name: "Socket adapter", category: "Hand Tools" },
  { name: "Nut driver socket", category: "Hand Tools" },
  { name: "Socket extension", category: "Hand Tools" },
  { name: "Tin snips", category: "Hand Tools" },
  { name: "String line/plumb bob", category: "Hand Tools" },
  { name: "Chisel", category: "Hand Tools" },
  { name: "Philips screw driver", category: "Hand Tools" },
  { name: "Flathead screw driver", category: "Hand Tools" },
  { name: "Multi bit screw driver", category: "Hand Tools" },
  { name: "Files", category: "Hand Tools" },
  { name: "Hole punch", category: "Hand Tools" },
  { name: "Center head punch", category: "Hand Tools" },
  { name: "Stud punch", category: "Hand Tools" },
  { name: "Slag chipping hammer", category: "Hand Tools" },
  { name: "Ball peen hammer", category: "Hand Tools" },
  { name: "Dead blow hammer", category: "Hand Tools" },
  { name: "Claw hammer", category: "Hand Tools" },
  { name: "Hand saw", category: "Hand Tools" },
  { name: "Razor blades", category: "Hand Tools" },
  { name: "Scissors", category: "Hand Tools" },
  { name: "Tape measure", category: "Hand Tools" },
  { name: "Reel tape measure", category: "Hand Tools" },
  { name: "Level", category: "Hand Tools" },
  { name: "Digital level", category: "Hand Tools" },
  { name: "Laser mark", category: "Hand Tools" },
  { name: "Framing square", category: "Hand Tools" },
  { name: "Speed square", category: "Hand Tools" },
  { name: "Bevel gauge", category: "Hand Tools" },
  { name: "Digital caliper", category: "Hand Tools" },
  { name: "Hand mirror", category: "Hand Tools" },
  { name: "Swivel deburring blade", category: "Hand Tools" },
  { name: "Wire brushes", category: "Hand Tools" },
  { name: "Caulk gun", category: "Hand Tools" },
  { name: "Trowel", category: "Hand Tools" },
  { name: "Finishing trowel", category: "Hand Tools" },
  { name: "Concrete finishing Fresno", category: "Hand Tools" },
  { name: "Drywall finishing knife", category: "Hand Tools" },
  { name: "Paint Rollers", category: "Hand Tools" },
  { name: "Broom", category: "Hand Tools" },
  { name: "Dust pan", category: "Hand Tools" },
  { name: "Lock box", category: "Hand Tools" },

  // --- POWER TOOLS (ALL POWERED / TAPE REQUIRED) ---
  { name: "Portaband", category: "Power Tools", requiresTape: true },
  { name: "Sawzall", category: "Power Tools", requiresTape: true },
  { name: "Hackzall", category: "Power Tools", requiresTape: true },
  { name: "Skill saw", category: "Power Tools", requiresTape: true },
  { name: "Jigsaw", category: "Power Tools", requiresTape: true },
  { name: "Cordless hammer drill", category: "Power Tools", requiresTape: true },
  { name: "Hole Hawg Drill", category: "Power Tools", requiresTape: true },
  { name: "Impact driver", category: "Power Tools", requiresTape: true },
  { name: "Rotary hammer", category: "Power Tools", requiresTape: true },
  { name: "Chipping hammer", category: "Power Tools", requiresTape: true },
  { name: "Angle grinder", category: "Power Tools", requiresTape: true },
  { name: "Die grinder", category: "Power Tools", requiresTape: true },
  { name: "Right angle die grinder", category: "Power Tools", requiresTape: true },
  { name: "Multi tool", category: "Power Tools", requiresTape: true },
  { name: "Rivet gun", category: "Power Tools", requiresTape: true },
  { name: "Mag drill", category: "Power Tools", requiresTape: true },
  { name: "Pipe facer", category: "Power Tools", requiresTape: true },
  { name: "Router with bits", category: "Power Tools", requiresTape: true },
  { name: "Pipe belt sander", category: "Power Tools", requiresTape: true },
  { name: "Orbital sander", category: "Power Tools", requiresTape: true },
  { name: "Powered caulk gun", category: "Power Tools", requiresTape: true },
  { name: "Threaded rod cutter", category: "Power Tools", requiresTape: true },
  { name: "Shop vac", category: "Power Tools", requiresTape: true },
  { name: "Milwaukee vacuum", category: "Power Tools", requiresTape: true },
  { name: "Leaf blower", category: "Power Tools", requiresTape: true },
  { name: "Air compressor", category: "Power Tools", requiresTape: true },
  { name: "Portable air pump", category: "Power Tools", requiresTape: true },
  { name: "Air blow gun", category: "Power Tools", requiresTape: true },
  { name: "Heater", category: "Power Tools", requiresTape: true },
  { name: "Fan", category: "Power Tools", requiresTape: true },
  { name: "Portable lights", category: "Power Tools", requiresTape: true },
  { name: "Battery charger", category: "Power Tools", requiresTape: true },
  { name: "Extension cord", category: "Power Tools", requiresTape: true },
  { name: "Tungsten sharpener", category: "Power Tools", requiresTape: true },
  { name: "Gas monitor", category: "Power Tools", requiresTape: true },
  { name: "Drill chucks", category: "Power Tools" },
  { name: "Sawzall blade", category: "Power Tools" },
  { name: "Flap sanding wheel", category: "Power Tools" },
  { name: "Uni bit", category: "Power Tools" },
  { name: "Self feed bit", category: "Power Tools" },
  { name: "Chisel bits", category: "Power Tools" },
  { name: "Hilti bits", category: "Power Tools" },
  { name: "Drill bits", category: "Power Tools" },
  { name: "Hole saw bits", category: "Power Tools" },
  { name: "Annular bits", category: "Power Tools" },
  { name: "Tap bits", category: "Power Tools" },
  { name: "Taps", category: "Power Tools" },
  { name: "Tubing cutter wheels", category: "Power Tools" },
  { name: "Gasket cutter", category: "Power Tools" },

  // --- RIGGING & ACCESS (ALL FALSE) ---
  { name: "Chainfall", category: "Rigging & Access" },
  { name: "Come along", category: "Rigging & Access" },
  { name: "Bottle jacks", category: "Rigging & Access" },
  { name: "Floor jack", category: "Rigging & Access" },
  { name: "Hydraulic hand pump", category: "Rigging & Access" },
  { name: "Mechanical puller", category: "Rigging & Access" },
  { name: "Skate", category: "Rigging & Access" },
  { name: "Skates", category: "Rigging & Access" },
  { name: "Yo-yo (self retracting lanyard)", category: "Rigging & Access" },
  { name: "Fall protection harness", category: "Rigging & Access" },
  { name: "Knee board", category: "Rigging & Access" },
  { name: "Knee pads", category: "Rigging & Access" },
  { name: "Clamp", category: "Rigging & Access" },
  { name: "C clamps", category: "Rigging & Access" },
  { name: "Cowboy clamps", category: "Rigging & Access" },
  { name: "Bar clamp", category: "Rigging & Access" },
  { name: "Caine pipe clamp", category: "Rigging & Access" },
  { name: "Chain vise", category: "Rigging & Access" },
  { name: "Tripod pipe vise", category: "Rigging & Access" },
  { name: "Pipe cutter", category: "Rigging & Access" },
  { name: "Tube bender", category: "Rigging & Access" },

  // --- SHOP TOOLS (SPLIT: POWERED VS MANUAL) ---
  { name: "Cold cut saw", category: "Shop Tools", requiresTape: true },
  { name: "Chop saw", category: "Shop Tools", requiresTape: true },
  { name: "Table saw", category: "Shop Tools", requiresTape: true },
  { name: "Drill press", category: "Shop Tools", requiresTape: true },
  { name: "Pipe threading machine", category: "Shop Tools", requiresTape: true },
  { name: "Ratcheting pipe threader", category: "Shop Tools", requiresTape: false },
  { name: "Threading die", category: "Shop Tools", requiresTape: false },
  { name: "Iron worker", category: "Shop Tools", requiresTape: true },
  { name: "Hand brake", category: "Shop Tools", requiresTape: false },
  { name: "Bench vice", category: "Shop Tools", requiresTape: false },
  { name: "Drum sander", category: "Shop Tools", requiresTape: true },
  { name: "Tig welder", category: "Shop Tools", requiresTape: true },
  { name: "MiG welder", category: "Shop Tools", requiresTape: true },
  { name: "Cutting torch", category: "Shop Tools", requiresTape: false },
  { name: "Welding torch", category: "Shop Tools", requiresTape: false },
  { name: "Micro torch", category: "Shop Tools", requiresTape: false },
  { name: "Blow torch", category: "Shop Tools", requiresTape: false },
  { name: "Weld blankets", category: "Shop Tools", requiresTape: false },
  { name: "Purge box", category: "Shop Tools", requiresTape: false },
  { name: "Dryrod oven", category: "Shop Tools", requiresTape: true },
  { name: "Rotary tumbler", category: "Shop Tools", requiresTape: true },
];

// Single source of truth for tape requirement
export function isToolPowered(toolName: string, category?: string): boolean {
  const match = MASTER_TOOL_LIST.find(
    (t) => t.name.toLowerCase().trim() === toolName.toLowerCase().trim()
  );

  if (match) {
    return Boolean(match.requiresTape);
  }

  // Fallback for custom tools added by users:
  // If not found in the master list, trust the category
  return category === "Power Tools";
}
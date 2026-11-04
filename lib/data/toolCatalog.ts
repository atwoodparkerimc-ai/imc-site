// lib/data/toolCatalog.ts

export type ToolCategory = "Hand Tools" | "Power Tools" | "Rigging & Access" | "Shop Tools";

export interface MasterToolItem {
  name: string;
  category: ToolCategory;
  requiresTape?: boolean;
}

export const NESTLE_SPRINGVILLE_LOCATION = "Nestle Springville";

export function isNestleSpringville(location?: string | null): boolean {
  if (!location) return false;
  const clean = location.trim().toLowerCase();
  if (clean.includes("shop")) return false;
  return clean.includes("nestle");
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

export const MASTER_TOOL_LIST: MasterToolItem[] = [
  // --- HAND TOOLS (ALL FALSE) ---
  { name: "Shovel", category: "Hand Tools" },
  { name: "Pry bars", category: "Hand Tools" },
  { name: "Crowbars", category: "Hand Tools" },
  { name: "Vise grips", category: "Hand Tools" },
  { name: "Vice grip chain locking pliers", category: "Hand Tools" },
  { name: "Crescent wrench", category: "Hand Tools" },
  { name: "Pliers", category: "Hand Tools" },
  { name: "Dikes", category: "Hand Tools" },
  { name: "Pipe wrench", category: "Hand Tools" },
  { name: "Drum plug wrench", category: "Hand Tools" },
  { name: "Torque wrench", category: "Hand Tools" },
  { name: "Socket wrench", category: "Hand Tools" },
  { name: "Thin wheel wrench", category: "Hand Tools" },
  { name: "End wrench", category: "Hand Tools" },
  { name: "Allen wrench", category: "Hand Tools" },
  { name: "Socket adapter", category: "Hand Tools" },
  { name: "Nut driver socket", category: "Hand Tools" },
  { name: "Socket set", category: "Hand Tools" },
  { name: "Tin snips", category: "Hand Tools" },
  { name: "String line/plumb bob", category: "Hand Tools" },
  { name: "Chisel", category: "Hand Tools" },
  { name: "Screw driver set", category: "Hand Tools" },
  { name: "Files", category: "Hand Tools" },
  { name: "Center head punch", category: "Hand Tools" },
  { name: "Hammer", category: "Hand Tools" },
  { name: "Hand saw", category: "Hand Tools" },
  { name: "Scissors", category: "Hand Tools" },
  { name: "Tape measure", category: "Hand Tools" },
  { name: "Level", category: "Hand Tools" },
  { name: "Square", category: "Hand Tools" },
  { name: "Tri square", category: "Hand Tools" },
  { name: "Digital caliper", category: "Hand Tools" },
  { name: "Hand mirror", category: "Hand Tools" },
  { name: "Reamer", category: "Hand Tools" },
  { name: "Caulk gun", category: "Hand Tools" },
  { name: "Trowel set", category: "Hand Tools" },
  { name: "Putty knife", category: "Hand Tools" },
  { name: "Paint Rollers", category: "Hand Tools" },
  { name: "Broom", category: "Hand Tools" },
  { name: "Dust pan", category: "Hand Tools" },

  // --- POWER TOOLS (ALL POWERED / TAPE REQUIRED) ---
  { name: "Portaband corded", category: "Power Tools", requiresTape: true },
  { name: "Portaband battery powered", category: "Power Tools", requiresTape: true },
  { name: "Sawzall battery powered", category: "Power Tools", requiresTape: true },
  { name: "Hackzall battery powered", category: "Power Tools", requiresTape: true },
  { name: "Skill saw corded", category: "Power Tools", requiresTape: true },
  { name: "Skill saw battery powered", category: "Power Tools", requiresTape: true },
  { name: "Jigsaw corded", category: "Power Tools", requiresTape: true },
  { name: "Jigsaw battery powered", category: "Power Tools", requiresTape: true },
  { name: "Hammer drill battery powered", category: "Power Tools", requiresTape: true },
  { name: "Hammer drill corded", category: "Power Tools", requiresTape: true },
  { name: "Impact driver battery powered", category: "Power Tools", requiresTape: true },
  { name: "Hilti corded", category: "Power Tools", requiresTape: true },
  { name: "Hilti battery powered", category: "Power Tools", requiresTape: true },
  { name: "Thin wheel corded", category: "Power Tools", requiresTape: true },
  { name: "Thin wheel battery powered", category: "Power Tools", requiresTape: true },
  { name: "Sander corded", category: "Power Tools", requiresTape: true },
  { name: "Sander battery powered", category: "Power Tools", requiresTape: true },
  { name: "Gray wheel battery powered", category: "Power Tools", requiresTape: true },
  { name: "Wire wheel corded", category: "Power Tools", requiresTape: true },
  { name: "Wire wheel battery powered", category: "Power Tools", requiresTape: true },
  { name: "Die grinder corded", category: "Power Tools", requiresTape: true },
  { name: "Die grinder battery powered", category: "Power Tools", requiresTape: true },
  { name: "Right angle die grinder battery powered", category: "Power Tools", requiresTape: true },
  { name: "Multi tool battery powered", category: "Power Tools", requiresTape: true },
  { name: "Rivet gun battery powered", category: "Power Tools", requiresTape: true },
  { name: "Mag drill corded", category: "Power Tools", requiresTape: true },
  { name: "Pipe facer corded", category: "Power Tools", requiresTape: true },
  { name: "Router battery powered", category: "Power Tools", requiresTape: true },
  { name: "Pipe belt sander corded", category: "Power Tools", requiresTape: true },
  { name: "Orbital sander corded", category: "Power Tools", requiresTape: true },
  { name: "Caulk gun battery powered", category: "Power Tools", requiresTape: true },
  { name: "Threaded rod cutter", category: "Power Tools", requiresTape: true },
  { name: "Shop vac corded", category: "Power Tools", requiresTape: true },
  { name: "Milwaukee vacuum battery powered", category: "Power Tools", requiresTape: true },
  { name: "Leaf blower battery powered", category: "Power Tools", requiresTape: true },
  { name: "Air compressor corded", category: "Power Tools", requiresTape: true },
  { name: "Air compressor battery powered", category: "Power Tools", requiresTape: true },
  { name: "Heater corded", category: "Power Tools", requiresTape: true },
  { name: "Fan corded", category: "Power Tools", requiresTape: true },
  { name: "Portable lights battery powered", category: "Power Tools", requiresTape: true },
  { name: "Battery charger corded", category: "Power Tools", requiresTape: true },
  { name: "Tungsten sharpener battery powered", category: "Power Tools", requiresTape: true },
  { name: "Tungsten sharpener corded", category: "Power Tools", requiresTape: true },
  { name: "Gasket cutter", category: "Power Tools", requiresTape: false },
  { name: "Heat gun corded", category: "Power Tools", requiresTape: true },

  // --- RIGGING & ACCESS (ALL FALSE) ---
  { name: "Chainfall", category: "Rigging & Access" },
  { name: "Come along", category: "Rigging & Access" },
  { name: "Bottle jacks", category: "Rigging & Access" },
  { name: "Floor jack", category: "Rigging & Access" },
  { name: "Pipe jack stand", category: "Rigging & Access" },
  { name: "Skates", category: "Rigging & Access" },
  { name: "Yo-yo (self retracting lanyard)", category: "Rigging & Access" },
  { name: "Knee board", category: "Rigging & Access" },
  { name: "Clamps", category: "Rigging & Access" },
  { name: "Chain vise", category: "Rigging & Access" },
  { name: "Tripod pipe vise", category: "Rigging & Access" },
  { name: "Pipe cutter", category: "Rigging & Access" },
  { name: "Tube bender", category: "Rigging & Access" },
  { name: "Rotary welding positioner", category: "Rigging & Access" },

  // --- SHOP TOOLS (SPLIT: POWERED VS MANUAL) ---
  { name: "Cold cut saw corded", category: "Shop Tools", requiresTape: true },
  { name: "Press brake corded", category: "Shop Tools", requiresTape: true },
  { name: "Press shear corded", category: "Shop Tools", requiresTape: true },
  { name: "Chop saw corded", category: "Shop Tools", requiresTape: true },
  { name: "Table saw corded", category: "Shop Tools", requiresTape: true },
  { name: "Drill press corded", category: "Shop Tools", requiresTape: true },
  { name: "Pipe threading machine corded", category: "Shop Tools", requiresTape: true },
  { name: "Threading die corded", category: "Shop Tools", requiresTape: false },
  { name: "Iron worker corded", category: "Shop Tools", requiresTape: true },
  { name: "Hand brake manual", category: "Shop Tools", requiresTape: false },
  { name: "Bench vice", category: "Shop Tools", requiresTape: false },
  { name: "Drum sander corded", category: "Shop Tools", requiresTape: true },
  { name: "Welder", category: "Shop Tools", requiresTape: true },
  { name: "Cutting torch", category: "Shop Tools", requiresTape: false },
  { name: "Blow torch", category: "Shop Tools", requiresTape: false },
  { name: "Weld blankets", category: "Shop Tools", requiresTape: false },
  { name: "Purge kit", category: "Shop Tools", requiresTape: false },
  { name: "Dryrod oven", category: "Shop Tools", requiresTape: true },
  { name: "Rotary tumbler corded", category: "Shop Tools", requiresTape: true },
];

export function isToolPowered(toolName: string, category?: string): boolean {
  const searchName = toolName.toLowerCase().trim();

  const match = MASTER_TOOL_LIST.find((t) => {
    const listName = t.name.toLowerCase().trim();
    return listName === searchName || listName.includes(searchName) || searchName.includes(listName);
  });

  if (match) {
    return Boolean(match.requiresTape);
  }

  return category === "Power Tools";
}
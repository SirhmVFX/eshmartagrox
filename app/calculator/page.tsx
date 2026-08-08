"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { X, ChevronDown, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

// ── Data ───────────────────────────────────────────────────────────────────

interface Food {
  name: string; cal: number; carbs: number; protein: number; fat: number;
  fibre: number; sodium: number; sugar: number; cholesterol?: number; potassium?: number;
  gl?: number; // glycaemic load estimate
}

const ALL_FOODS: Food[] = [
  // ── Grains & Carbs ──
  { name: "Ofada Rice (cooked)", cal: 130, carbs: 28, protein: 2.7, fat: 0.3, fibre: 0.4, sodium: 1, sugar: 0, cholesterol: 0, potassium: 35, gl: 18 },
  { name: "Brown Rice (cooked)", cal: 123, carbs: 26, protein: 2.7, fat: 1.0, fibre: 1.8, sodium: 1, sugar: 0, cholesterol: 0, potassium: 43, gl: 16 },
  { name: "White Rice (cooked)", cal: 130, carbs: 28, protein: 2.4, fat: 0.2, fibre: 0.4, sodium: 1, sugar: 0, cholesterol: 0, potassium: 26, gl: 22 },
  { name: "Unripe Plantain", cal: 89, carbs: 23, protein: 1.3, fat: 0.1, fibre: 1.7, sodium: 4, sugar: 2, cholesterol: 0, potassium: 450, gl: 12 },
  { name: "Ripe Plantain", cal: 122, carbs: 32, protein: 1.0, fat: 0.2, fibre: 2.3, sodium: 4, sugar: 15, cholesterol: 0, potassium: 465, gl: 20 },
  { name: "Yam (boiled)", cal: 116, carbs: 27, protein: 1.5, fat: 0.1, fibre: 4.1, sodium: 9, sugar: 0.5, cholesterol: 0, potassium: 670, gl: 13 },
  { name: "Sweet Potato", cal: 86, carbs: 20, protein: 1.6, fat: 0.1, fibre: 3.0, sodium: 55, sugar: 4, cholesterol: 0, potassium: 337, gl: 10 },
  { name: "Beans (cooked)", cal: 116, carbs: 21, protein: 8.0, fat: 0.4, fibre: 6.0, sodium: 4, sugar: 3, cholesterol: 0, potassium: 305, gl: 7 },
  { name: "Oats (cooked)", cal: 71, carbs: 12, protein: 2.5, fat: 1.5, fibre: 1.7, sodium: 49, sugar: 0, cholesterol: 0, potassium: 61, gl: 9 },
  { name: "Instant Noodles (cooked)", cal: 138, carbs: 25, protein: 3.6, fat: 3.3, fibre: 1.0, sodium: 830, sugar: 1, cholesterol: 0, potassium: 60, gl: 24 },
  { name: "Spaghetti (cooked)", cal: 131, carbs: 25, protein: 5.0, fat: 1.1, fibre: 1.8, sodium: 1, sugar: 0.6, cholesterol: 0, potassium: 45, gl: 18 },
  { name: "Macaroni (cooked)", cal: 131, carbs: 25, protein: 5.0, fat: 1.1, fibre: 1.8, sodium: 1, sugar: 0.6, cholesterol: 0, potassium: 45, gl: 18 },
  // ── Proteins ──
  { name: "Chicken Breast (grilled)", cal: 165, carbs: 0, protein: 31, fat: 3.6, fibre: 0, sodium: 74, sugar: 0, cholesterol: 85, potassium: 256, gl: 0 },
  { name: "Lean Turkey", cal: 135, carbs: 0, protein: 30, fat: 1.0, fibre: 0, sodium: 63, sugar: 0, cholesterol: 83, potassium: 298, gl: 0 },
  { name: "Tilapia (grilled)", cal: 128, carbs: 0, protein: 26, fat: 2.7, fibre: 0, sodium: 56, sugar: 0, cholesterol: 57, potassium: 302, gl: 0 },
  { name: "Mackerel (Titus)", cal: 189, carbs: 0, protein: 24, fat: 10, fibre: 0, sodium: 94, sugar: 0, cholesterol: 72, potassium: 380, gl: 0 },
  { name: "Egg (boiled)", cal: 78, carbs: 0.6, protein: 6.0, fat: 5.0, fibre: 0, sodium: 62, sugar: 0.6, cholesterol: 186, potassium: 63, gl: 0 },
  { name: "Cow Meat in Stew", cal: 210, carbs: 3, protein: 26, fat: 10, fibre: 0, sodium: 280, sugar: 1, cholesterol: 80, potassium: 310, gl: 1 },
  { name: "Goat Meat in Stew", cal: 195, carbs: 3, protein: 27, fat: 9, fibre: 0, sodium: 260, sugar: 1, cholesterol: 75, potassium: 290, gl: 1 },
  { name: "Mackerel Fish in Soup", cal: 175, carbs: 4, protein: 22, fat: 8, fibre: 0.5, sodium: 310, sugar: 1, cholesterol: 65, potassium: 350, gl: 1 },
  { name: "Titus Fish in Soup", cal: 180, carbs: 4, protein: 22, fat: 9, fibre: 0.5, sodium: 320, sugar: 1, cholesterol: 68, potassium: 360, gl: 1 },
  { name: "Croaker Fish in Stew", cal: 145, carbs: 4, protein: 19, fat: 6, fibre: 0.5, sodium: 290, sugar: 1, cholesterol: 58, potassium: 280, gl: 1 },
  // ── Vegetables ──
  { name: "Ugu Leaves (pumpkin)", cal: 26, carbs: 4, protein: 2.0, fat: 0.2, fibre: 1.6, sodium: 14, sugar: 2, cholesterol: 0, potassium: 340, gl: 1 },
  { name: "Spinach (efo)", cal: 23, carbs: 4, protein: 2.9, fat: 0.4, fibre: 2.2, sodium: 79, sugar: 0.4, cholesterol: 0, potassium: 558, gl: 1 },
  { name: "Garden Egg", cal: 25, carbs: 6, protein: 1.0, fat: 0.2, fibre: 3.0, sodium: 2, sugar: 3, cholesterol: 0, potassium: 229, gl: 2 },
  { name: "Tomato", cal: 18, carbs: 3.9, protein: 0.9, fat: 0.2, fibre: 1.2, sodium: 5, sugar: 2.6, cholesterol: 0, potassium: 237, gl: 1 },
  { name: "Avocado", cal: 160, carbs: 9, protein: 2.0, fat: 15, fibre: 7.0, sodium: 7, sugar: 0.7, cholesterol: 0, potassium: 485, gl: 1 },
  // ── Fats & Oils ──
  { name: "Palm Oil (1 tbsp)", cal: 126, carbs: 0, protein: 0, fat: 14, fibre: 0, sodium: 0, sugar: 0, cholesterol: 0, potassium: 0, gl: 0 },
  { name: "Olive Oil (1 tbsp)", cal: 119, carbs: 0, protein: 0, fat: 13.5, fibre: 0, sodium: 0, sugar: 0, cholesterol: 0, potassium: 0, gl: 0 },
  // ── Fruits ──
  { name: "Banana", cal: 89, carbs: 23, protein: 1.1, fat: 0.3, fibre: 2.6, sodium: 1, sugar: 12, cholesterol: 0, potassium: 358, gl: 11 },
  { name: "Watermelon", cal: 30, carbs: 8, protein: 0.6, fat: 0.2, fibre: 0.4, sodium: 1, sugar: 6, cholesterol: 0, potassium: 112, gl: 4 },
  { name: "Pawpaw / Papaya", cal: 43, carbs: 11, protein: 0.5, fat: 0.3, fibre: 1.7, sodium: 8, sugar: 8, cholesterol: 0, potassium: 182, gl: 4 },
  // ── Dairy & Beverages ──
  { name: "Soy Milk (fortified, 200ml)", cal: 80, carbs: 4, protein: 7, fat: 4, fibre: 1, sodium: 95, sugar: 1, cholesterol: 0, potassium: 300, gl: 3 },
  // ── Condiments ──
  { name: "Seasoning Cube (Maggi/Knorr)", cal: 10, carbs: 1, protein: 0.5, fat: 0.5, fibre: 0, sodium: 980, sugar: 0, cholesterol: 0, potassium: 20, gl: 0 },
  { name: "Curry Powder (1 tsp)", cal: 7, carbs: 1.2, protein: 0.3, fat: 0.3, fibre: 0.7, sodium: 3, sugar: 0, cholesterol: 0, potassium: 48, gl: 0 },
  { name: "Thyme (dried, 1 tsp)", cal: 4, carbs: 0.9, protein: 0.1, fat: 0.1, fibre: 0.5, sodium: 1, sugar: 0, cholesterol: 0, potassium: 11, gl: 0 },
  { name: "Ginger (fresh, 1 tbsp)", cal: 5, carbs: 1.1, protein: 0.1, fat: 0.1, fibre: 0.1, sodium: 1, sugar: 0.1, cholesterol: 0, potassium: 33, gl: 0 },
  { name: "Garlic (fresh, 1 clove)", cal: 4, carbs: 1, protein: 0.2, fat: 0, fibre: 0.1, sodium: 1, sugar: 0, cholesterol: 0, potassium: 12, gl: 0 },
  { name: "Crayfish (ground, 1 tbsp)", cal: 20, carbs: 0, protein: 4, fat: 0.5, fibre: 0, sodium: 90, sugar: 0, cholesterol: 25, potassium: 80, gl: 0 },
  { name: "Dry Pepper (chili, 1 tsp)", cal: 6, carbs: 1.3, protein: 0.3, fat: 0.1, fibre: 0.5, sodium: 2, sugar: 0.2, cholesterol: 0, potassium: 50, gl: 0 },
  { name: "Stockfish (dry, soaked)", cal: 130, carbs: 0, protein: 29, fat: 1, fibre: 0, sodium: 420, sugar: 0, cholesterol: 65, potassium: 200, gl: 0 },
  { name: "Dry Fish (smoked, rinsed)", cal: 150, carbs: 0, protein: 30, fat: 3, fibre: 0, sodium: 360, sugar: 0, cholesterol: 70, potassium: 210, gl: 0 },
  // ── Swallows ──
  { name: "Amala (yam flour swallow)", cal: 145, carbs: 33, protein: 2.0, fat: 0.2, fibre: 3.5, sodium: 2, sugar: 0, cholesterol: 0, potassium: 80, gl: 14 },
  { name: "Eba (garri swallow)", cal: 357, carbs: 85, protein: 1.5, fat: 0.2, fibre: 1.8, sodium: 4, sugar: 0, cholesterol: 0, potassium: 60, gl: 37 },
  { name: "Semovita (semolina swallow)", cal: 160, carbs: 35, protein: 5, fat: 0.5, fibre: 1.0, sodium: 2, sugar: 0, cholesterol: 0, potassium: 90, gl: 17 },
  { name: "Fufu (cassava swallow)", cal: 135, carbs: 32, protein: 0.5, fat: 0.1, fibre: 1.5, sodium: 3, sugar: 0, cholesterol: 0, potassium: 50, gl: 15 },
  // ── Soups ──
  { name: "Okra Soup", cal: 55, carbs: 7, protein: 2.5, fat: 2.0, fibre: 3.0, sodium: 210, sugar: 1, cholesterol: 5, potassium: 180, gl: 2 },
  { name: "Moimoi (steamed bean pudding)", cal: 130, carbs: 15, protein: 8, fat: 4.0, fibre: 3.5, sodium: 180, sugar: 1, cholesterol: 0, potassium: 210, gl: 6 },
  { name: "Afang Soup", cal: 180, carbs: 5, protein: 12, fat: 12, fibre: 2.5, sodium: 310, sugar: 1, cholesterol: 20, potassium: 280, gl: 2 },
  { name: "Ewedu Soup", cal: 40, carbs: 5, protein: 2, fat: 1.5, fibre: 2.5, sodium: 95, sugar: 0.5, cholesterol: 0, potassium: 200, gl: 1 },
  { name: "Vegetable Soup (Efo Riro)", cal: 120, carbs: 6, protein: 8, fat: 7, fibre: 2.5, sodium: 280, sugar: 2, cholesterol: 15, potassium: 290, gl: 2 },
  { name: "Egusi Soup", cal: 298, carbs: 6, protein: 14, fat: 25, fibre: 2.0, sodium: 380, sugar: 0, cholesterol: 12, potassium: 270, gl: 3 },
  { name: "Gbegiri (beans soup)", cal: 90, carbs: 12, protein: 5, fat: 2.5, fibre: 3.5, sodium: 190, sugar: 1, cholesterol: 0, potassium: 220, gl: 4 },
  { name: "Onunbu Soup (Bitterleaf)", cal: 110, carbs: 5, protein: 7, fat: 6, fibre: 3.0, sodium: 240, sugar: 0.5, cholesterol: 10, potassium: 250, gl: 2 },
  { name: "White Soup (Ofe Nsala)", cal: 155, carbs: 6, protein: 14, fat: 8, fibre: 1.5, sodium: 290, sugar: 1, cholesterol: 45, potassium: 260, gl: 2 },
  { name: "Edikang Ikong Soup", cal: 200, carbs: 7, protein: 15, fat: 13, fibre: 3.0, sodium: 320, sugar: 1, cholesterol: 25, potassium: 310, gl: 2 },
  // ── Dishes ──
  { name: "Jollof Rice", cal: 148, carbs: 28, protein: 3.5, fat: 2.5, fibre: 1.2, sodium: 290, sugar: 1, cholesterol: 5, potassium: 140, gl: 21 },
  { name: "Nigerian Fried Rice", cal: 185, carbs: 30, protein: 5, fat: 5, fibre: 1.5, sodium: 340, sugar: 2, cholesterol: 45, potassium: 180, gl: 22 },
  { name: "Cooked Yam (boiled)", cal: 116, carbs: 27, protein: 1.5, fat: 0.1, fibre: 4.1, sodium: 9, sugar: 0.5, cholesterol: 0, potassium: 670, gl: 13 },
  { name: "Yam Porridge (Asaro)", cal: 145, carbs: 30, protein: 2.5, fat: 2.5, fibre: 3.5, sodium: 180, sugar: 1, cholesterol: 0, potassium: 540, gl: 14 },
];

interface Goal {
  id: string; icon: string; label: string; sub: string;
  maxSodium: number; maxSugar: number; maxFat: number; minFibre: number; maxCal: number; maxGL: number;
  alternatives: string[];
}

const GOALS: Goal[] = [
  { id: "diabetes", icon: "🩸", label: "Diabetes Control", sub: "Low glycaemic load, controlled carbs", maxSodium: 1500, maxSugar: 25, maxFat: 65, minFibre: 25, maxCal: 1800, maxGL: 20, alternatives: ["Swap white rice for ofada or brown rice", "Use unripe plantain instead of ripe"] },
  { id: "bp", icon: "🫀", label: "Blood Pressure Control", sub: "Low sodium, high potassium", maxSodium: 1200, maxSugar: 50, maxFat: 65, minFibre: 20, maxCal: 2000, maxGL: 30, alternatives: ["Reduce egusi soup — high sodium", "Add more ugu and spinach for potassium"] },
  { id: "chol", icon: "💚", label: "Cholesterol Control", sub: "Low saturated fat & cholesterol", maxSodium: 2300, maxSugar: 50, maxFat: 55, minFibre: 30, maxCal: 2000, maxGL: 25, alternatives: ["Replace red meat with croaker fish", "Use less palm oil in soups"] },
  { id: "weight", icon: "⚖️", label: "Weight Loss", sub: "Calorie-controlled, high fibre", maxSodium: 2300, maxSugar: 30, maxFat: 60, minFibre: 28, maxCal: 1500, maxGL: 20, alternatives: ["Swap eba for amala — lower calories", "Add more vegetables to bulk out meals"] },
  { id: "senior", icon: "✨", label: "Senior Wellness (50+)", sub: "High protein, calcium-rich", maxSodium: 1800, maxSugar: 40, maxFat: 65, minFibre: 22, maxCal: 1900, maxGL: 25, alternatives: ["Choose fish over chicken for omega-3", "Soft foods: moimoi, eggs, amala"] },
  { id: "general", icon: "🥗", label: "General Healthy Eating", sub: "Balanced macros", maxSodium: 2300, maxSugar: 50, maxFat: 70, minFibre: 20, maxCal: 2200, maxGL: 35, alternatives: ["Aim for variety across food groups", "At least 2 servings of vegetables daily"] },
];

interface IngredientRow { foodIndex: number; qty: number; unit: string; method: string; }
const UNITS = ["cup", "g", "tbsp", "piece", "bowl"];
const METHODS = ["Boiled", "Steamed", "Fried", "Raw", "Stewed"];

// ── Component ─────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [rows, setRows] = useState<IngredientRow[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const addIngredient = (idx: number) => {
    if (rows.find(r => r.foodIndex === idx)) return;
    setRows(prev => [...prev, { foodIndex: idx, qty: 1, unit: "cup", method: "Boiled" }]);
    setDropdownOpen(false);
    setSearch("");
  };

  const removeRow = (i: number) => setRows(prev => prev.filter((_, j) => j !== i));
  const updateRow = (i: number, patch: Partial<IngredientRow>) =>
    setRows(prev => prev.map((r, j) => j === i ? { ...r, ...patch } : r));

  const totals = useMemo(() => {
    return rows.reduce((acc, row) => {
      const f = ALL_FOODS[row.foodIndex];
      const mult = row.qty;
      return {
        cal: acc.cal + f.cal * mult,
        protein: acc.protein + f.protein * mult,
        carbs: acc.carbs + f.carbs * mult,
        fat: acc.fat + f.fat * mult,
        sugar: acc.sugar + f.sugar * mult,
        fibre: acc.fibre + f.fibre * mult,
        sodium: acc.sodium + f.sodium * mult,
        cholesterol: acc.cholesterol + (f.cholesterol ?? 0) * mult,
        potassium: acc.potassium + (f.potassium ?? 0) * mult,
        gl: acc.gl + (f.gl ?? 0) * mult,
      };
    }, { cal: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fibre: 0, sodium: 0, cholesterol: 0, potassium: 0, gl: 0 });
  }, [rows]);

  const score = useMemo(() => {
    if (!rows.length) return 0;

    // Use goal-specific thresholds if a goal is selected, otherwise use general defaults
    const maxSodium = selectedGoal?.maxSodium ?? 2300;
    const maxSugar = selectedGoal?.maxSugar ?? 50;
    const maxGL = selectedGoal?.maxGL ?? 35;
    const maxFat = selectedGoal?.maxFat ?? 70;
    const maxCal = selectedGoal?.maxCal ?? 2200;
    const minFibre = selectedGoal?.minFibre ?? 20;

    let s = 70; // baseline

    // Positive signals
    if (totals.fibre >= minFibre) s += 12;
    else if (totals.fibre >= minFibre / 2) s += 5;

    if (totals.protein >= 15) s += 5;
    if (totals.protein >= 25) s += 3; // bonus for high protein

    // Negative signals — scaled against the goal's specific limits
    if (totals.sodium > maxSodium) s -= 15;
    else if (totals.sodium > maxSodium * 0.8) s -= 7;

    if (totals.sugar > maxSugar) s -= 12;
    else if (totals.sugar > maxSugar * 0.75) s -= 5;

    if (totals.gl > maxGL) s -= 12;
    else if (totals.gl > maxGL * 0.8) s -= 5;

    if (totals.fat > maxFat) s -= 8;
    else if (totals.fat > maxFat * 0.85) s -= 3;

    if (totals.cal > maxCal) s -= 10;
    else if (totals.cal > maxCal * 0.9) s -= 4;

    return Math.max(0, Math.min(100, Math.round(s)));
  }, [rows, totals, selectedGoal]);

  const scoreLabel = score >= 90 ? "Outstanding — ideal for your goal!" :
    score >= 80 ? "Excellent meal balance!" :
      score >= 70 ? "Good — small improvements possible" :
        score >= 55 ? "Decent — see suggestions below" :
          score >= 40 ? "Some improvements needed" :
            "High risk — review ingredients";

  const filtered = ALL_FOODS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const alerts = selectedGoal ? [
    totals.gl > selectedGoal.maxGL ? { type: "warn", msg: `Glycaemic load is high (${Math.round(totals.gl)}). Risk of blood sugar spike.` } : null,
    totals.fibre >= 8 ? { type: "ok", msg: "Good fibre — slows sugar absorption." } : null,
    totals.sodium > selectedGoal.maxSodium ? { type: "warn", msg: `Sodium is high (${Math.round(totals.sodium)} mg — limit ${selectedGoal.maxSodium} mg).` } : null,
    totals.cal > selectedGoal.maxCal ? { type: "warn", msg: `Calories are high (${Math.round(totals.cal)} kcal — limit ${selectedGoal.maxCal} kcal).` } : null,
    totals.fat > selectedGoal.maxFat ? { type: "warn", msg: `Fat is high (${Math.round(totals.fat)} g — limit ${selectedGoal.maxFat} g).` } : null,
  ].filter(Boolean) : [];

  const suggestedPack = selectedGoal?.id === "senior" ? "Senior Wellness Pack (₦28,500)" :
    selectedGoal?.id === "weight" ? "Working Professional Pack (₦22,400)" :
      selectedGoal?.id === "diabetes" ? "Senior Wellness Pack (₦28,500)" :
        "Busy Professional Pack (₦22,400)";

  const portionNote = totals.cal < 400 ? "Light meal — suitable as breakfast or snack." :
    totals.cal < 700 ? "Medium meal — suitable as lunch." : "Heavy meal — best as a main dinner.";

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Page header */}
      <div className="bg-[#FFFDF7] border-b border-gray-200 py-10 text-center">
        <h1 className="text-4xl sm:text-5xl text-gray-900 mb-3">Meal Nutrition Calculator</h1>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          Build a Nigerian meal, pick a health goal, and get instant nutrition analysis with personalized alerts and food alternatives.
        </p>
      </div>

      <div className="container-max py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── LEFT: Steps ─── */}
          <div className="lg:col-span-3 space-y-10">

            {/* Step 1 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-4">1. Choose Your Health Goal</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoal(g)}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedGoal?.id === g.id
                      ? "border-[#14532d] bg-white "
                      : "border-gray-200 bg-white hover:border-gray-400"
                      }`}
                  >
                    <span className="text-2xl block mb-2">{g.icon}</span>
                    <p className={`text-sm font-bold leading-snug ${selectedGoal?.id === g.id ? "text-[#14532d]" : "text-gray-900"}`}>{g.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{g.sub}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2: Ingredients */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">2. Add Ingredients</h2>

              {/* Dropdown */}
              <div className="relative mb-4">
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="w-full flex items-center justify-between border border-gray-200 bg-white px-4 py-3 rounded-xl text-sm text-gray-500 hover:border-gray-400 transition-colors"
                >
                  + Add Nigerian ingredient…
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl  overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                      <input
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search ingredient…"
                        className="w-full px-3 py-2 text-sm outline-none bg-gray-50 rounded-lg"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {filtered.map((f, i) => {
                        const idx = ALL_FOODS.indexOf(f);
                        const added = rows.some(r => r.foodIndex === idx);
                        return (
                          <button
                            key={i}
                            onClick={() => addIngredient(idx)}
                            disabled={added}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between ${added ? "opacity-40" : ""}`}
                          >
                            <span>{f.name}</span>
                            <span className="text-xs text-gray-400">{f.cal} kcal</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Ingredient rows */}
              {rows.length > 0 && (
                <div className="space-y-2">
                  {rows.map((row, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                      <span className="flex-1 text-sm text-gray-800 min-w-0 truncate">{ALL_FOODS[row.foodIndex].name}</span>
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={row.qty}
                        onChange={e => updateRow(i, { qty: parseFloat(e.target.value) || 0.5 })}
                        className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center outline-none focus:border-[#14532d]"
                      />
                      <select value={row.unit} onChange={e => updateRow(i, { unit: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none bg-white focus:border-[#14532d]">
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                      <select value={row.method} onChange={e => updateRow(i, { method: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none bg-white focus:border-[#14532d]">
                        {METHODS.map(m => <option key={m}>{m}</option>)}
                      </select>
                      <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 ml-1">
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-800">
                <strong>Disclaimer:</strong> This calculator provides general nutrition guidance only. It does not replace medical advice. Please consult your doctor or registered dietitian for personal health conditions.
              </div>
            </section>
          </div>

          {/* ── RIGHT: Sticky panel ── */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* Nutrition Score */}
              <div className={`rounded-2xl p-5 text-white transition-colors ${score >= 80 ? "bg-[#14532d]" :
                  score >= 60 ? "bg-green-700" :
                    score >= 40 ? "bg-amber-600" :
                      rows.length ? "bg-red-700" : "bg-[#14532d]"
                }`}>
                <p className="text-xs font-bold uppercase tracking-widest text-green-300 mb-2">Nutrition Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-bold">{rows.length ? score : "—"}</span>
                  {rows.length > 0 && <span className="text-2xl text-green-300 mb-1">/100</span>}
                </div>
                {rows.length > 0 ? (
                  <p className="text-green-200 text-sm mt-1">{scoreLabel}</p>
                ) : (
                  <p className="text-green-300/60 text-sm mt-1">
                    {selectedGoal
                      ? `Goal set: ${selectedGoal.label}. Now add ingredients to calculate.`
                      : "Select a health goal and add ingredients to see your score."}
                  </p>
                )}
                {/* Mini progress bar */}
                {rows.length > 0 && (
                  <div className="mt-3 bg-white/20 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-white transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Goal summary — shown as soon as a goal is selected */}
              {selectedGoal && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="font-bold text-gray-900 text-sm mb-3">
                    {selectedGoal.icon} {selectedGoal.label} — Daily Limits
                  </p>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between"><span>Max Calories</span><span className="font-semibold text-gray-800">{selectedGoal.maxCal} kcal</span></div>
                    <div className="flex justify-between"><span>Max Sodium</span><span className="font-semibold text-gray-800">{selectedGoal.maxSodium} mg</span></div>
                    <div className="flex justify-between"><span>Max Sugar</span><span className="font-semibold text-gray-800">{selectedGoal.maxSugar} g</span></div>
                    <div className="flex justify-between"><span>Max Fat</span><span className="font-semibold text-gray-800">{selectedGoal.maxFat} g</span></div>
                    <div className="flex justify-between"><span>Min Fibre</span><span className="font-semibold text-gray-800">{selectedGoal.minFibre} g</span></div>
                    <div className="flex justify-between"><span>Max Glycemic Load</span><span className="font-semibold text-gray-800">{selectedGoal.maxGL}</span></div>
                  </div>
                </div>
              )}

              {/* Empty state prompt */}
              {rows.length === 0 && !selectedGoal && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-3xl mb-2">🥗</p>
                  <p className="text-sm font-medium text-gray-700 mb-1">Start by selecting a health goal</p>
                  <p className="text-xs text-gray-400">Then add your Nigerian meal ingredients to get instant nutrition analysis.</p>
                </div>
              )}

              {rows.length === 0 && selectedGoal && (
                <div className="bg-white rounded-2xl border border-dashed border-green-300 p-6 text-center">
                  <p className="text-3xl mb-2">➕</p>
                  <p className="text-sm font-medium text-gray-700 mb-1">Now add ingredients</p>
                  <p className="text-xs text-gray-400">Click "Add Nigerian ingredient" and build your meal to see the nutrition score and health alerts.</p>
                </div>
              )}

              {/* Nutrition Facts */}
              {rows.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                  <p className="font-bold text-gray-900 text-sm">Nutrition Facts</p>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Calories", `${Math.round(totals.cal)} kcal`, true],
                      ["Protein", `${Math.round(totals.protein)} g`, false],
                      ["Carbohydrates", `${Math.round(totals.carbs)} g`, false],
                      ["Fat", `${Math.round(totals.fat)} g`, false],
                      ["Sugar", `${Math.round(totals.sugar)} g`, false],
                      ["Fibre", `${Math.round(totals.fibre)} g`, false],
                      ["Sodium", `${Math.round(totals.sodium)} mg`, false],
                      ["Cholesterol", `${Math.round(totals.cholesterol)} mg`, false],
                      ["Potassium", `${Math.round(totals.potassium)} mg`, false],
                      ["Glycemic Load", `${Math.round(totals.gl)}`, true],
                    ].map(([label, val, bold]) => (
                      <div key={label as string}
                        className={`flex items-center justify-between border-b border-gray-100 pb-1.5 last:border-0 last:pb-0 ${bold ? "font-bold" : ""}`}>
                        <span className={bold ? "text-gray-900" : "text-gray-600"}>{label}</span>
                        <span className={bold ? "text-gray-900" : "text-gray-700"}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Alerts — shows when goal AND ingredients are both set */}
              {rows.length > 0 && selectedGoal && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                  <p className="font-bold text-gray-900 text-sm">
                    Health Alerts — <span className="text-green-700">{selectedGoal.label}</span>
                  </p>
                  {alerts.length === 0 ? (
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700">
                      <CheckCircle size={13} /> Meal looks well-balanced for your goal!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map((a, i) => (
                        <div key={i}
                          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${a!.type === "warn" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                            }`}>
                          {a!.type === "warn"
                            ? <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                            : <CheckCircle size={12} className="shrink-0 mt-0.5" />}
                          {a!.msg}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No goal selected but ingredients added — prompt to pick goal */}
              {rows.length > 0 && !selectedGoal && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-amber-800 mb-1">👆 Select a health goal</p>
                  <p className="text-xs text-amber-600">Choose one of the health goals above to see personalised alerts and food alternatives for your meal.</p>
                </div>
              )}

              {/* Better Alternatives */}
              {rows.length > 0 && selectedGoal && selectedGoal.alternatives.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                  <p className="font-bold text-gray-900 text-sm">Better Alternatives</p>
                  <ul className="space-y-2">
                    {selectedGoal.alternatives.map((alt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <ArrowRight size={11} className="text-[#f97316] shrink-0 mt-0.5" /> {alt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Portion + Suggested Pack */}
              {rows.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#14532d]">Recommended Portion</p>
                  <p className="text-xs text-gray-700">{portionNote}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#14532d] mt-2">Suggested Pack</p>
                  <p className="text-xs text-gray-700">{suggestedPack}</p>
                </div>
              )}

              {/* CTA Buttons */}
              {rows.length > 0 && (
                <div className="space-y-2">
                  <Link href="/cart"
                    className="w-full bg-[#f97316] text-white py-3 rounded-full text-sm font-bold flex items-center justify-center hover:bg-orange-600 transition-colors">
                    Add Ingredients to Cart
                  </Link>
                  <Link href="/shop"
                    className="w-full bg-[#14532d] text-white py-3 rounded-full text-sm font-bold flex items-center justify-center hover:bg-green-800 transition-colors">
                    Subscribe to Weekly Meal Pack
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="border border-gray-200 text-gray-700 py-2.5 rounded-full text-xs font-semibold hover:border-gray-400 transition-colors">
                      Save Meal Plan
                    </button>
                    <button className="border border-gray-200 text-gray-700 py-2.5 rounded-full text-xs font-semibold hover:border-gray-400 transition-colors">
                      Share on WhatsApp
                    </button>
                  </div>
                  <Link href="/book-online"
                    className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center hover:border-gray-400 transition-colors">
                    Book Nutrition Consultation
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

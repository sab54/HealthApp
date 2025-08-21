// Client/src/data/symptomHealth.js

const symptomHealth = [
  {
    symptom: "Headache",
    precautions: [
      "Stay hydrated (drink water every 1–2 hours)",
      "Avoid bright screens for long periods",
      "Maintain good posture"
    ],
    what_to_eat: ["Magnesium-rich foods (nuts, seeds, spinach)"],
    medicines: [
      "OTC paracetamol (e.g., Crocin, Tylenol)",
      "OTC ibuprofen (e.g., Brufen, Advil)"
    ],
    what_not_to_take: ["Excess caffeine", "Alcohol"],
    exercises: [
      "Neck stretches (3 sets × 10 reps, slow rotations each side)",
      "Deep breathing (5 minutes, inhale 4s, hold 4s, exhale 6s)",
      "Short walk (10 minutes, ~1,000 steps)"
    ],
    treatment:
      "Rest in a quiet, dark room, apply a cold or warm compress to the forehead or neck, and take OTC pain relievers if needed.",
    timing: {
      precautions: ["08:00 AM", "11:00 AM", "02:00 PM", "05:00 PM", "08:00 PM"],
      what_to_eat: ["09:00 AM", "01:00 PM", "07:30 PM"],
      medicines: ["10:00 AM", "04:00 PM", "09:00 PM (if needed)"],
      exercises: ["10:30 AM", "03:00 PM", "06:30 PM"],
      treatment: ["When headache starts", "09:30 PM before bed"]
    },
    image: require("../assets/symptoms/headache.png")
  },
  {
    symptom: "Runny Nose / Nasal Congestion",
    precautions: ["Avoid dusty or smoky environments", "Use a humidifier indoors"],
    what_to_eat: ["Citrus fruits", "Warm soups", "Honey-ginger tea"],
    medicines: [
      "OTC antihistamines (e.g., Cetzine, Claritin)",
      "Saline nasal spray (e.g., Nasivion Saline, Otrivin Saline)"
    ],
    what_not_to_take: ["Cold drinks", "Ice cream"],
    exercises: [
      "Light yoga (15 minutes, gentle stretches like cat-cow & child’s pose)",
      "Breathing exercises – pranayama (alternate nostril breathing, 5 minutes)"
    ],
    treatment:
      "Use saline spray to clear nasal passages, inhale steam, and rest in a warm environment.",
    timing: {
      precautions: ["09:00 AM", "12:00 PM", "06:00 PM"],
      what_to_eat: ["08:30 AM (citrus fruit)", "01:00 PM (soup)", "08:00 PM (honey tea)"],
      medicines: ["09:00 AM (saline spray)", "09:00 PM (antihistamine)"],
      exercises: ["07:30 AM (yoga)", "06:30 PM (breathing)"],
      treatment: ["08:00 AM (steam inhalation)", "09:30 PM (before bed)"]
    },
    image: require("../assets/symptoms/sneeze.png")
  },
  {
    symptom: "Sore Throat",
    precautions: ["Avoid shouting or overusing your voice", "Keep throat warm"],
    what_to_eat: ["Warm herbal tea", "Honey", "Soft foods"],
    medicines: ["OTC throat lozenges (e.g., Strepsils, Halls)"],
    what_not_to_take: ["Spicy foods", "Acidic foods"],
    exercises: ["Voice rest (no loud talking, minimal whispering)"],
    treatment:
      "Gargle with warm salt water 2–3 times daily, sip warm liquids, and suck on throat lozenges.",
    timing: {
      precautions: ["All day (every few hours)"],
      what_to_eat: ["08:00 AM (herbal tea)", "02:00 PM (soft meal)", "09:00 PM (honey)"],
      medicines: ["10:00 AM", "02:00 PM", "06:00 PM", "09:00 PM (lozenge)"],
      exercises: ["All day (avoid strain)"],
      treatment: ["08:30 AM (gargle)", "02:30 PM (gargle)", "09:30 PM (gargle)"]
    },
    image: require("../assets/symptoms/sore-throat.png")
  },
  {
    symptom: "Fatigue / Low Energy",
    precautions: ["Sleep 7–9 hours daily", "Avoid excessive screen time before bed"],
    what_to_eat: ["Complex carbs (brown rice, oats)", "Iron-rich foods (spinach, lentils)"],
    medicines: [
      "Multivitamin supplements (e.g., Revital, Centrum) if advised by a doctor"
    ],
    what_not_to_take: ["Too much sugar", "Energy drinks"],
    exercises: [
      "Light cardio (15 minutes cycling or brisk walk, ~2,000 steps)",
      "Evening walk (20 minutes, ~3,000 steps)"
    ],
    treatment:
      "Get adequate rest, eat balanced meals, stay hydrated, and gradually increase light physical activity.",
    timing: {
      precautions: ["10:00 PM (bedtime)", "07:00 AM (wake up)"],
      what_to_eat: ["08:00 AM (oats)", "01:00 PM (spinach)", "07:00 PM (lentils)"],
      medicines: ["09:00 AM (if prescribed)"],
      exercises: ["07:30 AM (walk)", "05:00 PM (light cardio)"],
      treatment: ["Throughout the day", "10:00 PM (rest)"]
    },
    image: require("../assets/symptoms/fatigue.png")
  },
  {
    symptom: "Joint Pain",
    precautions: ["Avoid overexertion of affected joints", "Keep warm in cold conditions"],
    what_to_eat: ["Omega-3-rich foods (fish, flaxseeds, walnuts)"],
    medicines: [
      "OTC pain relievers (e.g., Crocin, Brufen)",
      "Topical pain relief gels (e.g., Volini, Iodex)"
    ],
    what_not_to_take: ["Processed junk food"],
    exercises: [
      "Swimming (20 minutes, gentle laps)",
      "Stretching (5 minutes morning & evening)",
      "Yoga – seated poses (15 minutes)"
    ],
    treatment:
      "Apply a warm or cold compress, rest the joint, and use pain relief medication or gels as needed.",
    timing: {
      precautions: ["08:00 AM (warmth)", "09:00 PM (warmth)"],
      what_to_eat: ["01:00 PM (fish/walnuts)", "07:00 PM (flaxseeds)"],
      medicines: ["09:00 AM", "03:00 PM", "09:00 PM"],
      exercises: ["08:00 AM (stretch)", "06:00 PM (yoga)"],
      treatment: ["Morning compress", "Evening compress"]
    },
    image: require("../assets/symptoms/broken-bone.png")
  },
  {
    symptom: "Eye Irritation",
    precautions: ["Avoid rubbing eyes", "Wear sunglasses outdoors"],
    what_to_eat: ["Vitamin A-rich foods (carrots, sweet potatoes)"],
    medicines: ["OTC lubricating eye drops (e.g., Refresh Tears, Systane, I-Kul)"],
    what_not_to_take: ["Prolonged screen use without breaks"],
    exercises: [
      "20-20-20 rule: every 20 mins, look at something 20 feet away for 20 seconds",
      "Palming (cover eyes with warm palms, 2 minutes)"
    ],
    treatment: "Rinse eyes with clean water, use lubricating drops, and rest eyes from screens.",
    timing: {
      precautions: ["10:00 AM (screen break)", "03:00 PM", "07:00 PM"],
      what_to_eat: ["09:00 AM (carrots)", "01:00 PM (sweet potatoes)"],
      medicines: ["09:00 AM", "02:00 PM", "08:00 PM"],
      exercises: ["Every 20 mins screen use"],
      treatment: ["09:30 AM (rinse)", "02:30 PM (drops)", "09:30 PM (before bed)"]
    },
    image: require("../assets/symptoms/irritation.png")
  },
  {
    symptom: "Skin Dryness",
    precautions: ["Avoid very hot showers", "Use mild soaps"],
    what_to_eat: ["Healthy fats (avocado, nuts)"],
    medicines: [
      "Moisturizing creams or lotions (e.g., Nivea Soft, Vaseline, Cetaphil)"
    ],
    what_not_to_take: ["Excess salty food"],
    exercises: ["Normal routine (walking, household work)"],
    treatment:
      "Apply moisturizer immediately after bathing, stay hydrated, and avoid harsh soaps.",
    timing: {
      precautions: ["07:30 AM (after shower)", "09:30 PM (before bed)"],
      what_to_eat: ["09:00 AM (avocado)", "01:00 PM (nuts)"],
      medicines: ["07:30 AM (moisturizer)", "09:30 PM (moisturizer)"],
      exercises: ["Anytime"],
      treatment: ["Morning after shower", "Night before sleep"]
    },
    image: require("../assets/symptoms/dry-skin.png")
  },
  {
    symptom: "Shortness of Breath (Mild, Non-Emergency)",
    precautions: ["Avoid polluted or smoky air", "Don’t overexert yourself"],
    what_to_eat: ["Iron-rich foods (beetroot, spinach)", "Vitamin C for absorption"],
    medicines: ["Only inhalers if prescribed (e.g., Asthalin, Seroflo)"],
    what_not_to_take: ["Avoid allergens if known"],
    exercises: [
      "Pursed-lip breathing (5 minutes, inhale through nose 2s, exhale through lips 4s)",
      "Seated breathing (sit upright, 10 minutes slow deep breathing)"
    ],
    treatment:
      "Sit upright, practice slow breathing, and use prescribed inhalers if necessary.",
    timing: {
      precautions: ["All day (avoid exertion)"],
      what_to_eat: ["08:00 AM (beetroot)", "01:00 PM (spinach)", "07:00 PM (citrus fruit)"],
      medicines: ["As prescribed (usually morning/evening)"],
      exercises: ["09:00 AM", "06:00 PM"],
      treatment: ["Immediately when breathlessness occurs"]
    },
    image: require("../assets/symptoms/headache.png")
  },
  {
    symptom: "Low Mood / Anxiety",
    precautions: ["Avoid social isolation", "Limit negative news exposure"],
    what_to_eat: ["Omega-3-rich foods", "Dark chocolate (in moderation)"],
    medicines: ["None unless prescribed by a doctor"],
    what_not_to_take: ["Excess caffeine", "Alcohol"],
    exercises: [
      "Brisk walking (20 minutes, ~3,000 steps)",
      "Yoga – Surya Namaskar (5 rounds, ~10 minutes)",
      "Meditation (10 minutes mindfulness breathing)"
    ],
    treatment:
      "Practice mindfulness, engage in light exercise, connect with friends or family, and consider professional counseling if symptoms persist.",
    timing: {
      precautions: ["All day"],
      what_to_eat: ["09:00 AM (omega-3)", "08:00 PM (dark chocolate treat)"],
      medicines: ["As prescribed"],
      exercises: ["07:00 AM (walk)", "06:00 PM (yoga)", "09:30 PM (meditation)"],
      treatment: ["Anytime mood dips", "10:00 PM (reflection)"]
    },
    image: require("../assets/symptoms/breathing.png")
  }
];

export default symptomHealth;

// Client/src/data/symptomHealth.js

const symptomHealth = [
  {
    symptom: "Headache",
    precautions: [
      "Stay hydrated (drink water every 1–2 hours)",
      "Avoid bright screens for long periods",
      "Maintain good posture"
    ],
    what_to_eat: [
      "Magnesium-rich foods (nuts, seeds, spinach)"
    ],
    medicines: [
      "OTC paracetamol (e.g., Crocin, Tylenol)",
      "OTC ibuprofen (e.g., Brufen, Advil)"
    ],
    what_not_to_take: [
      "Excess caffeine",
      "Alcohol"
    ],
    exercises: [
      "Neck stretches",
      "Deep breathing",
      "Short walks"
    ],
    treatment: "Rest in a quiet, dark room, apply a cold or warm compress to the forehead or neck, and take OTC pain relievers if needed.",
    image: require("../assets/symptoms/headache.png")
  },
  {
    symptom: "Runny Nose / Nasal Congestion",
    precautions: [
      "Avoid dusty or smoky environments",
      "Use a humidifier indoors"
    ],
    what_to_eat: [
      "Citrus fruits",
      "Warm soups",
      "Honey-ginger tea"
    ],
    medicines: [
      "OTC antihistamines (e.g., Cetzine, Claritin)",
      "Saline nasal spray (e.g., Nasivion Saline, Otrivin Saline)"
    ],
    what_not_to_take: [
      "Cold drinks",
      "Ice cream"
    ],
    exercises: [
      "Light yoga",
      "Breathing exercises (pranayama)"
    ],
    treatment: "Use saline spray to clear nasal passages, inhale steam, and rest in a warm environment.",
    image: require("../assets/symptoms/sneeze.png")
  },
  {
    symptom: "Sore Throat",
    precautions: [
      "Avoid shouting or overusing your voice",
      "Keep throat warm"
    ],
    what_to_eat: [
      "Warm herbal tea",
      "Honey",
      "Soft foods"
    ],
    medicines: [
      "OTC throat lozenges (e.g., Strepsils, Halls)"
    ],
    what_not_to_take: [
      "Spicy foods",
      "Acidic foods"
    ],
    exercises: [
      "Voice rest"
    ],
    treatment: "Gargle with warm salt water 2–3 times daily, sip warm liquids, and suck on throat lozenges.",
    image: require("../assets/symptoms/sore-throat.png")
  },
  {
    symptom: "Fatigue / Low Energy",
    precautions: [
      "Sleep 7–9 hours daily",
      "Avoid excessive screen time before bed"
    ],
    what_to_eat: [
      "Complex carbs (brown rice, oats)",
      "Iron-rich foods (spinach, lentils)"
    ],
    medicines: [
      "Multivitamin supplements (e.g., Revital, Centrum) if advised by a doctor"
    ],
    what_not_to_take: [
      "Too much sugar",
      "Energy drinks"
    ],
    exercises: [
      "Light cardio",
      "Walking"
    ],
    treatment: "Get adequate rest, eat balanced meals, stay hydrated, and gradually increase light physical activity.",
    image: require("../assets/symptoms/fatigue.png")
  },
  {
    symptom: "Joint Pain",
    precautions: [
      "Avoid overexertion of affected joints",
      "Keep warm in cold conditions"
    ],
    what_to_eat: [
      "Omega-3-rich foods (fish, flaxseeds, walnuts)"
    ],
    medicines: [
      "OTC pain relievers (e.g., Crocin, Brufen)",
      "Topical pain relief gels (e.g., Volini, Iodex)"
    ],
    what_not_to_take: [
      "Processed junk food"
    ],
    exercises: [
      "Low-impact activities (swimming, stretching, yoga)"
    ],
    treatment: "Apply a warm or cold compress, rest the joint, and use pain relief medication or gels as needed.",
    image: require("../assets/symptoms/broken-bone.png")
  },
  {
    symptom: "Eye Irritation",
    precautions: [
      "Avoid rubbing eyes",
      "Wear sunglasses outdoors"
    ],
    what_to_eat: [
      "Vitamin A-rich foods (carrots, sweet potatoes)"
    ],
    medicines: [
      "OTC lubricating eye drops (e.g., Refresh Tears, Systane, I-Kul)"
    ],
    what_not_to_take: [
      "Prolonged screen use without breaks"
    ],
    exercises: [
      "Eye relaxation exercises (20-20-20 rule)"
    ],
    treatment: "Rinse eyes with clean water, use lubricating drops, and rest eyes from screens.",
    image: require("../assets/symptoms/irritation.png")
  },
  {
    symptom: "Skin Dryness",
    precautions: [
      "Avoid very hot showers",
      "Use mild soaps"
    ],
    what_to_eat: [
      "Healthy fats (avocado, nuts)"
    ],
    medicines: [
      "Moisturizing creams or lotions (e.g., Nivea Soft, Vaseline, Cetaphil)"
    ],
    what_not_to_take: [
      "Excess salty food"
    ],
    exercises: [
      "Normal routine (no restriction)"
    ],
    treatment: "Apply moisturizer immediately after bathing, stay hydrated, and avoid harsh soaps.",
    image: require("../assets/symptoms/dry-skin.png")
  },
  {
    symptom: "Shortness of Breath (Mild, Non-Emergency)",
    precautions: [
      "Avoid polluted or smoky air",
      "Don’t overexert yourself"
    ],
    what_to_eat: [
      "Iron-rich foods (beetroot, spinach)",
      "Vitamin C for absorption"
    ],
    medicines: [
      "Only inhalers if prescribed (e.g., Asthalin, Seroflo)"
    ],
    what_not_to_take: [
      "Avoid allergens if known"
    ],
    exercises: [
      "Gentle breathing exercises (pursed-lip breathing)"
    ],
    treatment: "Sit upright, practice slow breathing, and use prescribed inhalers if necessary.",
    image: require("../assets/symptoms/headache.png")
  },
  {
    symptom: "Low Mood / Anxiety",
    precautions: [
      "Avoid social isolation",
      "Limit negative news exposure"
    ],
    what_to_eat: [
      "Omega-3-rich foods",
      "Dark chocolate (in moderation)"
    ],
    medicines: [
      "None unless prescribed by a doctor"
    ],
    what_not_to_take: [
      "Excess caffeine",
      "Alcohol"
    ],
    exercises: [
      "Brisk walking",
      "Yoga",
      "Meditation"
    ],
    treatment: "Practice mindfulness, engage in light exercise, connect with friends or family, and consider professional counseling if symptoms persist.",
    image: require("../assets/symptoms/breathing.png")
  }
];

export default symptomHealth;


// Client/src/data/symptomHealth.js

const symptomHealth = [
  {
    "symptom": "Headache",
    "image": require("../assets/symptoms/headache.png"),
    "severity_levels": {
      "mild": {
        "description": "Mild headaches are usually manageable and may present as a dull, persistent ache. They often do not interfere significantly with daily activities.",
        "possible_causes": [
          "Dehydration",
          "Skipping meals",
          "Poor posture",
          "Eye strain (screen exposure)",
          "Lack of sleep"
        ],
        "precautions": [
          "Stay hydrated (drink water every 1–2 hours)",
          "Avoid bright screens for long periods",
          "Maintain good posture"
        ],
        "what_to_eat": ["Magnesium-rich foods (nuts, seeds, spinach)"],
        "medicines": ["Optional: OTC paracetamol (e.g., Crocin, Tylenol)"],
        "what_not_to_take": ["Excess caffeine"],
        "exercises": [
          "Neck stretches (2 sets × 10 reps)",
          "Deep breathing (3 minutes, inhale 4s, hold 4s, exhale 6s)",
          "Short walk (10 minutes)"
        ],
        "treatment": "Rest in a quiet room, hydrate, and apply a warm compress if desired.",
        "timing": {
          "precautions": ["08:00 AM", "02:00 PM", "08:00 PM"],
          "what_to_eat": ["09:00 AM", "01:00 PM", "07:30 PM"],
          "medicines": ["10:00 AM"],
          "exercises": ["10:30 AM", "06:30 PM"],
          "treatment": ["11:00 AM"]
        }
      },
      "moderate": {
        "description": "Moderate headaches cause more noticeable discomfort and can affect focus and productivity. Pain may be throbbing or persistent.",
        "possible_causes": [
          "Stress or tension",
          "Extended screen time",
          "Sinus issues",
          "Hormonal changes",
          "Dietary triggers (e.g., caffeine withdrawal)"
        ],
        "precautions": [
          "Stay hydrated (drink water every 1–2 hours)",
          "Avoid bright lights and noise",
          "Limit screen time",
          "Take regular posture breaks"
        ],
        "what_to_eat": [
          "Magnesium-rich foods (nuts, seeds, spinach)",
          "Fresh fruits"
        ],
        "medicines": [
          "OTC paracetamol (e.g., Crocin, Tylenol)",
          "OTC ibuprofen (e.g., Brufen, Advil)"
        ],
        "what_not_to_take": ["Excess caffeine", "Alcohol"],
        "exercises": [
          "Neck stretches (3 sets × 10 reps)",
          "Deep breathing (5 minutes, inhale 4s, hold 4s, exhale 6s)",
          "Short walk (10 minutes)"
        ],
        "treatment": "Lie down in a quiet, dark room. Apply a cold compress. Use OTC pain relievers if needed.",
        "timing": {
          "precautions": ["08:00 AM", "11:00 AM", "02:00 PM", "05:00 PM", "08:00 PM"],
          "what_to_eat": ["09:00 AM", "01:00 PM", "07:30 PM"],
          "medicines": ["10:00 AM", "04:00 PM"],
          "exercises": ["10:30 AM", "03:00 PM", "06:30 PM"],
          "treatment": ["09:00 AM", "09:30 PM"]
        }
      },
      "severe": {
        "description": "Severe headaches are intense and often disabling, making it difficult to perform daily tasks. These may be migraines or cluster headaches and usually require medical attention if persistent.",
        "possible_causes": [
          "Migraines (with or without aura)",
          "Neurological conditions",
          "High blood pressure",
          "Medication overuse",
          "Chronic stress or sleep disorders"
        ],
        "precautions": [
          "Avoid all triggers (bright light, noise, strong odors)",
          "Stay in a dark, quiet room",
          "Ensure regular hydration (small sips every 30–60 mins)"
        ],
        "what_to_eat": [
          "Light, easily digestible magnesium-rich foods",
          "Hydrating fruits (e.g., watermelon)"
        ],
        "medicines": [
          "OTC ibuprofen or paracetamol (as first-line)",
          "Consult a doctor for prescription migraine medication if recurring"
        ],
        "what_not_to_take": ["Caffeine", "Alcohol", "Processed foods"],
        "exercises": [
          "Only deep breathing (5–10 minutes, calm breathing)",
          "No physical exercise during severe pain"
        ],
        "treatment": "Lie down in a dark, quiet room. Use cold compress on forehead or neck. Take medication. Seek medical advice if pain persists beyond a few hours.",
        "timing": {
          "precautions": ["07:00 AM", "09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM", "09:00 PM"],
          "what_to_eat": ["10:00 AM", "01:00 PM", "07:00 PM"],
          "medicines": ["08:00 AM", "02:00 PM", "08:00 PM"],
          "exercises": ["11:00 AM", "08:00 PM"],
          "treatment": ["08:00 AM", "12:00 PM", "04:00 PM"]
        }
      }
    }
  },
  {
    "symptom": "Runny Nose / Nasal Congestion",
    "image": require("../assets/symptoms/sneeze.png"),
    "severity_levels": {
      "mild": {
        "description": "Mild nasal symptoms involve occasional sneezing or a slightly runny nose. Typically manageable with home care and no disruption to daily life.",
        "possible_causes": [
          "Mild allergies",
          "Weather changes",
          "Mild irritation from dust or pollutants"
        ],
        "precautions": [
          "Avoid dusty or smoky environments",
          "Use a humidifier indoors"
        ],
        "what_to_eat": [
          "Citrus fruits",
          "Warm soups"
        ],
        "medicines": [
          "Saline nasal spray (e.g., Nasivion Saline, Otrivin Saline)"
        ],
        "what_not_to_take": [
          "Cold drinks"
        ],
        "exercises": [
          "Breathing exercises – pranayama (5 minutes)"
        ],
        "treatment": "Use saline spray and stay hydrated. Mild steam inhalation if needed.",
        "timing": {
          "precautions": ["09:00 AM", "06:00 PM"],
          "what_to_eat": ["08:30 AM", "01:00 PM"],
          "medicines": ["09:00 AM"],
          "exercises": ["07:30 AM"],
          "treatment": ["08:00 AM"]
        }
      },
      "moderate": {
        "description": "Moderate nasal congestion includes a persistent runny or stuffy nose, more frequent sneezing, and some interference with sleep or concentration.",
        "possible_causes": [
          "Common cold",
          "Moderate seasonal allergies",
          "Prolonged exposure to pollutants"
        ],
        "precautions": [
          "Avoid allergens or strong odors",
          "Maintain indoor humidity"
        ],
        "what_to_eat": [
          "Warm soups",
          "Honey-ginger tea",
          "Citrus fruits"
        ],
        "medicines": [
          "OTC antihistamines (e.g., Cetzine, Claritin)",
          "Saline nasal spray"
        ],
        "what_not_to_take": [
          "Cold drinks",
          "Ice cream"
        ],
        "exercises": [
          "Light yoga (cat-cow, child’s pose)",
          "Breathing exercises (5 minutes)"
        ],
        "treatment": "Steam inhalation, rest in a warm environment, and manage with OTC medications.",
        "timing": {
          "precautions": ["09:00 AM", "12:00 PM", "06:00 PM"],
          "what_to_eat": ["08:30 AM", "01:00 PM", "08:00 PM"],
          "medicines": ["09:00 AM", "09:00 PM"],
          "exercises": ["07:30 AM", "06:30 PM"],
          "treatment": ["08:00 AM", "09:30 PM"]
        }
      },
      "severe": {
        "description": "Severe nasal congestion causes blocked breathing through the nose, sleep disruption, sinus pressure, or potential infection. Medical attention may be needed if symptoms persist.",
        "possible_causes": [
          "Sinus infection (sinusitis)",
          "Strong allergic reactions",
          "Chronic rhinitis or prolonged cold"
        ],
        "precautions": [
          "Completely avoid allergens or irritants",
          "Use air purifier and stay indoors"
        ],
        "what_to_eat": [
          "Only warm, soothing fluids",
          "Clear broths",
          "Honey with warm water"
        ],
        "medicines": [
          "OTC antihistamines",
          "Saline spray (frequent)",
          "Consult doctor for decongestants or antibiotics if needed"
        ],
        "what_not_to_take": [
          "Cold drinks",
          "Ice cream",
          "Dairy (if it worsens mucus)"
        ],
        "exercises": [
          "Only gentle breathing exercises (5–10 minutes)",
          "Avoid yoga or physical exertion"
        ],
        "treatment": "Frequent steam inhalation, saline rinses, medical consultation if congestion persists or worsens.",
        "timing": {
          "precautions": ["08:00 AM", "11:00 AM", "03:00 PM", "07:00 PM"],
          "what_to_eat": ["09:00 AM", "12:30 PM", "07:30 PM"],
          "medicines": ["08:00 AM", "02:00 PM", "08:00 PM"],
          "exercises": ["10:00 AM", "06:00 PM"],
          "treatment": ["08:00 AM", "12:00 PM", "09:00 PM"]
        }
      }
    }
  },
  {
    "symptom": "Sore Throat",
    "image": require("../assets/symptoms/sore-throat.png"),
    "severity_levels": {
      "mild": {
        "description": "Mild sore throats cause slight irritation or scratchiness, typically from dryness, light vocal strain, or mild viral infections.",
        "possible_causes": [
          "Dry air",
          "Mild viral infection (e.g., common cold)",
          "Minor vocal overuse"
        ],
        "precautions": [
          "Avoid shouting or overusing your voice",
          "Keep throat warm"
        ],
        "what_to_eat": [
          "Warm herbal tea",
          "Honey",
          "Soft foods"
        ],
        "medicines": [
          "OTC throat lozenges (e.g., Strepsils, Halls)"
        ],
        "what_not_to_take": [
          "Spicy foods"
        ],
        "exercises": [
          "Voice rest (no loud talking)"
        ],
        "treatment": "Gargle with warm salt water and sip warm fluids.",
        "timing": {
          "precautions": ["08:00 AM", "12:00 PM", "06:00 PM"],
          "what_to_eat": ["08:00 AM", "02:00 PM"],
          "medicines": ["10:00 AM", "06:00 PM"],
          "exercises": ["All day"],
          "treatment": ["08:30 AM", "09:30 PM"]
        }
      },
      "moderate": {
        "description": "Moderate sore throats may include pain when swallowing, a hoarse voice, and visible redness in the throat. Daily activity may be slightly affected.",
        "possible_causes": [
          "Viral or bacterial infection (e.g., pharyngitis)",
          "Moderate vocal strain",
          "Allergic irritation"
        ],
        "precautions": [
          "Avoid cold air and irritants",
          "Limit speech as much as possible"
        ],
        "what_to_eat": [
          "Warm herbal tea",
          "Honey",
          "Soft, non-acidic meals"
        ],
        "medicines": [
          "OTC throat lozenges",
          "Warm salt water gargle (2–3 times a day)"
        ],
        "what_not_to_take": [
          "Spicy foods",
          "Acidic foods"
        ],
        "exercises": [
          "Voice rest (no speaking unless necessary)"
        ],
        "treatment": "Frequent gargling, warm fluids, lozenges, and rest.",
        "timing": {
          "precautions": ["08:00 AM", "11:00 AM", "05:00 PM"],
          "what_to_eat": ["08:00 AM", "02:00 PM", "09:00 PM"],
          "medicines": ["10:00 AM", "02:00 PM", "06:00 PM", "09:00 PM"],
          "exercises": ["All day"],
          "treatment": ["08:30 AM", "02:30 PM", "09:30 PM"]
        }
      },
      "severe": {
        "description": "Severe sore throats involve intense pain, difficulty swallowing or speaking, possible fever, and may require medical attention if persistent.",
        "possible_causes": [
          "Strep throat (bacterial infection)",
          "Tonsillitis",
          "Severe viral infection"
        ],
        "precautions": [
          "Avoid talking entirely unless required",
          "Use humidifier and keep throat moist"
        ],
        "what_to_eat": [
          "Only warm liquids",
          "Broths",
          "Honey dissolved in warm water"
        ],
        "medicines": [
          "OTC lozenges",
          "Warm salt water gargles",
          "Consult doctor for antibiotics (if bacterial)"
        ],
        "what_not_to_take": [
          "Spicy foods",
          "Acidic foods",
          "Cold beverages"
        ],
        "exercises": [
          "Strict voice rest (no speaking at all)",
          "Breathing relaxation if needed"
        ],
        "treatment": "Multiple salt water gargles, continuous warm fluids, full vocal rest, and seek medical care if not improving.",
        "timing": {
          "precautions": ["07:00 AM", "01:00 PM", "07:00 PM"],
          "what_to_eat": ["08:00 AM", "12:30 PM", "07:30 PM"],
          "medicines": ["08:30 AM", "01:30 PM", "06:30 PM", "09:30 PM"],
          "exercises": ["All day"],
          "treatment": ["08:30 AM", "01:00 PM", "09:30 PM"]
        }
      }
    }
  },
  {
    "symptom": "Fatigue / Low Energy",
    "image": require("../assets/symptoms/fatigue.png"),
    "severity_levels": {
      "mild": {
        "description": "Mild fatigue feels like low energy or sluggishness but doesn't significantly interfere with daily activities.",
        "possible_causes": [
          "Lack of sleep",
          "Poor diet",
          "Sedentary lifestyle"
        ],
        "precautions": [
          "Sleep 7–9 hours daily",
          "Avoid excessive screen time before bed"
        ],
        "what_to_eat": [
          "Oats",
          "Fruits",
          "Nuts"
        ],
        "medicines": [
          "Multivitamin supplements (if prescribed)"
        ],
        "what_not_to_take": [
          "Too much sugar"
        ],
        "exercises": [
          "Morning walk (~2,000 steps)",
          "Light stretching"
        ],
        "treatment": "Prioritize sleep, balanced meals, and gentle morning activity.",
        "timing": {
          "precautions": ["10:00 PM", "07:00 AM"],
          "what_to_eat": ["08:00 AM", "01:00 PM"],
          "medicines": ["09:00 AM"],
          "exercises": ["07:30 AM"],
          "treatment": ["Throughout the day"]
        }
      },
      "moderate": {
        "description": "Moderate fatigue includes persistent tiredness during the day, trouble concentrating, and reduced motivation.",
        "possible_causes": [
          "Chronic sleep deprivation",
          "Iron or vitamin deficiency",
          "Mental stress"
        ],
        "precautions": [
          "Avoid late-night screen time",
          "Follow a consistent sleep schedule"
        ],
        "what_to_eat": [
          "Complex carbs (brown rice, oats)",
          "Iron-rich foods (spinach, lentils)",
          "Hydrating foods (fruits, soups)"
        ],
        "medicines": [
          "Multivitamin supplements (e.g., Revital, Centrum) if advised by a doctor"
        ],
        "what_not_to_take": [
          "Energy drinks",
          "Refined sugar"
        ],
        "exercises": [
          "Brisk walk (~3,000 steps)",
          "Light cardio (15–20 minutes)"
        ],
        "treatment": "Improve sleep hygiene, balanced nutrition, and add regular light physical activity.",
        "timing": {
          "precautions": ["10:00 PM", "07:00 AM"],
          "what_to_eat": ["08:00 AM", "01:00 PM", "07:00 PM"],
          "medicines": ["09:00 AM"],
          "exercises": ["07:30 AM", "05:00 PM"],
          "treatment": ["Throughout the day"]
        }
      },
      "severe": {
        "description": "Severe fatigue leads to significant disruption in daily life, constant exhaustion, and may be a symptom of an underlying condition.",
        "possible_causes": [
          "Chronic fatigue syndrome",
          "Anemia",
          "Thyroid issues",
          "Depression or mental health conditions"
        ],
        "precautions": [
          "Avoid overexertion",
          "Maintain a fixed sleep-wake cycle",
          "Consult a healthcare provider"
        ],
        "what_to_eat": [
          "Easily digestible high-nutrient meals",
          "Iron and B-vitamin-rich foods",
          "Plenty of water and broths"
        ],
        "medicines": [
          "Doctor-prescribed supplements",
          "Iron tablets (if anemic)",
          "Medication for underlying conditions (as advised)"
        ],
        "what_not_to_take": [
          "Caffeine in excess",
          "Processed snacks",
          "Sugary beverages"
        ],
        "exercises": [
          "Short, guided breathing exercises",
          "Minimal stretching or slow walking if tolerated"
        ],
        "treatment": "Full medical evaluation, therapeutic nutrition, monitored activity, and mental health support if needed.",
        "timing": {
          "precautions": ["09:30 PM", "07:30 AM"],
          "what_to_eat": ["08:30 AM", "01:00 PM", "07:00 PM"],
          "medicines": ["09:00 AM", "07:00 PM"],
          "exercises": ["10:00 AM (if tolerated)", "04:00 PM (short walk)"],
          "treatment": ["Throughout the day", "10:00 PM (rest)"]
        }
      }
    }
  },
  {
    "symptom": "Joint Pain",
    "image": require("../assets/symptoms/broken-bone.png"),
    "severity_levels": {
      "mild": {
        "description": "Mild joint pain causes occasional discomfort or stiffness, usually after activity or minor strain.",
        "possible_causes": [
          "Minor injury or overuse",
          "Early arthritis",
          "Muscle strain"
        ],
        "precautions": [
          "Avoid overexertion of affected joints",
          "Keep warm in cold conditions"
        ],
        "what_to_eat": [
          "Omega-3-rich foods (fish, flaxseeds, walnuts)",
          "Fruits and vegetables"
        ],
        "medicines": [
          "OTC pain relievers (e.g., Crocin, Brufen)"
        ],
        "what_not_to_take": [
          "Processed junk food"
        ],
        "exercises": [
          "Gentle stretching (5 minutes morning & evening)",
          "Light walking"
        ],
        "treatment": "Apply warm compress and rest the joint when needed.",
        "timing": {
          "precautions": ["08:00 AM", "09:00 PM"],
          "what_to_eat": ["01:00 PM", "07:00 PM"],
          "medicines": ["09:00 AM", "09:00 PM"],
          "exercises": ["08:00 AM", "06:00 PM"],
          "treatment": ["Morning compress", "Evening compress"]
        }
      },
      "moderate": {
        "description": "Moderate joint pain involves persistent discomfort, stiffness, and may limit movement during daily activities.",
        "possible_causes": [
          "Osteoarthritis",
          "Inflammation or bursitis",
          "Repetitive strain injury"
        ],
        "precautions": [
          "Avoid strenuous activity involving the joint",
          "Use supportive braces if recommended",
          "Keep joints warm and protected"
        ],
        "what_to_eat": [
          "Omega-3-rich foods (fish, flaxseeds, walnuts)",
          "Anti-inflammatory foods (turmeric, ginger)"
        ],
        "medicines": [
          "OTC pain relievers",
          "Topical pain relief gels (e.g., Volini, Iodex)"
        ],
        "what_not_to_take": [
          "Processed junk food",
          "Excessive caffeine"
        ],
        "exercises": [
          "Swimming (gentle laps, 20 minutes)",
          "Stretching and yoga (seated poses, 15 minutes)"
        ],
        "treatment": "Warm or cold compress, pain relief gels, and rest with limited joint use.",
        "timing": {
          "precautions": ["08:00 AM", "09:00 PM"],
          "what_to_eat": ["01:00 PM", "07:00 PM"],
          "medicines": ["09:00 AM", "03:00 PM", "09:00 PM"],
          "exercises": ["08:00 AM", "06:00 PM"],
          "treatment": ["Morning compress", "Evening compress"]
        }
      },
      "severe": {
        "description": "Severe joint pain causes intense pain, significant mobility issues, swelling, and may require medical evaluation.",
        "possible_causes": [
          "Rheumatoid arthritis",
          "Severe injury or joint infection",
          "Advanced osteoarthritis"
        ],
        "precautions": [
          "Avoid any weight-bearing or stress on the joint",
          "Use supportive devices or crutches if necessary",
          "Seek prompt medical care"
        ],
        "what_to_eat": [
          "Omega-3-rich foods",
          "Anti-inflammatory diet",
          "High-protein foods to support healing"
        ],
        "medicines": [
          "Prescription pain medications",
          "Topical gels",
          "Anti-inflammatory drugs as prescribed"
        ],
        "what_not_to_take": [
          "Processed junk food",
          "Excessive caffeine and alcohol"
        ],
        "exercises": [
          "Physical therapy guided gentle exercises",
          "Breathing and relaxation techniques"
        ],
        "treatment": "Use warm/cold compresses, prescribed medications, rest, and consult a healthcare professional urgently.",
        "timing": {
          "precautions": ["08:00 AM", "09:00 PM"],
          "what_to_eat": ["01:00 PM", "07:00 PM"],
          "medicines": ["09:00 AM", "03:00 PM", "09:00 PM"],
          "exercises": ["As per therapist guidance"],
          "treatment": ["Morning compress", "Evening compress"]
        }
      }
    }
  },
  {
    "symptom": "Eye Irritation",
    "image": require("../assets/symptoms/irritation.png"),
    "severity_levels": {
      "mild": {
        "description": "Mild eye irritation includes occasional dryness, slight redness, or itchiness, usually caused by minor strain or environmental factors.",
        "possible_causes": [
          "Dry air",
          "Prolonged screen time",
          "Minor allergens (dust, pollen)"
        ],
        "precautions": [
          "Avoid rubbing eyes",
          "Wear sunglasses outdoors"
        ],
        "what_to_eat": [
          "Vitamin A-rich foods (carrots, sweet potatoes)",
          "Hydrating fruits"
        ],
        "medicines": [
          "OTC lubricating eye drops (e.g., Refresh Tears, Systane)"
        ],
        "what_not_to_take": [
          "Prolonged screen use without breaks"
        ],
        "exercises": [
          "20-20-20 rule: every 20 mins, look at something 20 feet away for 20 seconds",
          "Palming (cover eyes with warm palms, 2 minutes)"
        ],
        "treatment": "Rinse eyes with clean water, use lubricating drops, and take frequent breaks from screens.",
        "timing": {
          "precautions": ["10:00 AM", "03:00 PM", "07:00 PM"],
          "what_to_eat": ["09:00 AM", "01:00 PM"],
          "medicines": ["09:00 AM", "02:00 PM"],
          "exercises": ["Every 20 mins screen use"],
          "treatment": ["09:30 AM", "02:30 PM"]
        }
      },
      "moderate": {
        "description": "Moderate eye irritation causes persistent redness, itching, and discomfort that affects daily activities, possibly due to allergies or mild infection.",
        "possible_causes": [
          "Allergic conjunctivitis",
          "Extended exposure to irritants",
          "Mild eye infections"
        ],
        "precautions": [
          "Avoid rubbing eyes",
          "Wear sunglasses outdoors",
          "Use air purifiers if needed"
        ],
        "what_to_eat": [
          "Vitamin A-rich foods",
          "Anti-inflammatory foods (e.g., turmeric, green leafy vegetables)"
        ],
        "medicines": [
          "OTC lubricating eye drops",
          "Antihistamine eye drops (if allergy suspected, consult doctor)"
        ],
        "what_not_to_take": [
          "Prolonged screen use without breaks",
          "Exposure to smoke or dust"
        ],
        "exercises": [
          "20-20-20 rule",
          "Palming exercises"
        ],
        "treatment": "Use lubricating and antihistamine drops, rinse eyes regularly, and limit screen time.",
        "timing": {
          "precautions": ["10:00 AM", "03:00 PM", "07:00 PM"],
          "what_to_eat": ["09:00 AM", "01:00 PM"],
          "medicines": ["09:00 AM", "02:00 PM", "08:00 PM"],
          "exercises": ["Every 20 mins screen use"],
          "treatment": ["09:30 AM", "02:30 PM", "09:30 PM"]
        }
      },
      "severe": {
        "description": "Severe eye irritation includes intense redness, pain, swelling, discharge, and vision changes that require urgent medical attention.",
        "possible_causes": [
          "Severe eye infection (e.g., bacterial conjunctivitis)",
          "Corneal abrasion or injury",
          "Allergic reaction"
        ],
        "precautions": [
          "Avoid touching or rubbing eyes",
          "Wear protective eyewear",
          "Seek immediate medical care"
        ],
        "what_to_eat": [
          "Vitamin A-rich foods",
          "Nutrient-dense, anti-inflammatory diet"
        ],
        "medicines": [
          "Prescription antibiotic or anti-inflammatory eye drops",
          "Lubricating drops as recommended"
        ],
        "what_not_to_take": [
          "Any irritants (smoke, dust)",
          "Screen exposure without breaks"
        ],
        "exercises": [
          "Only gentle palming or as advised by a doctor"
        ],
        "treatment": "Medical evaluation, prescribed medications, rest, and avoid screen exposure.",
        "timing": {
          "precautions": ["Throughout the day"],
          "what_to_eat": ["09:00 AM", "01:00 PM", "07:00 PM"],
          "medicines": ["As prescribed by doctor"],
          "exercises": ["Only gentle palming if recommended"],
          "treatment": ["Immediately on symptoms worsening"]
        }
      }
    }
  },
  {
    "symptom": "Skin Dryness",
    "image": require("../assets/symptoms/dry-skin.png"),
    "severity_levels": {
      "mild": {
        "description": "Mild skin dryness causes slight flaking, rough patches, or tightness without cracking or irritation.",
        "possible_causes": [
          "Cold or dry weather",
          "Frequent washing",
          "Use of mild soaps"
        ],
        "precautions": [
          "Avoid very hot showers",
          "Use mild soaps"
        ],
        "what_to_eat": [
          "Healthy fats (avocado, nuts)",
          "Hydrating fruits and vegetables"
        ],
        "medicines": [
          "Moisturizing creams or lotions (e.g., Nivea Soft, Vaseline)"
        ],
        "what_not_to_take": [
          "Excess salty food"
        ],
        "exercises": [
          "Normal routine (walking, household work)"
        ],
        "treatment": "Apply moisturizer immediately after bathing, stay hydrated, and avoid harsh soaps.",
        "timing": {
          "precautions": ["07:30 AM", "09:30 PM"],
          "what_to_eat": ["09:00 AM", "01:00 PM"],
          "medicines": ["07:30 AM", "09:30 PM"],
          "exercises": ["Anytime"],
          "treatment": ["Morning after shower", "Night before sleep"]
        }
      },
      "moderate": {
        "description": "Moderate dryness leads to visible scaling, itchiness, and occasional redness; skin may crack in some areas.",
        "possible_causes": [
          "Dehydration",
          "Use of harsh soaps or detergents",
          "Eczema or mild dermatitis"
        ],
        "precautions": [
          "Avoid hot showers and harsh soaps",
          "Wear gloves when using cleaning agents",
          "Use humidifier if air is dry"
        ],
        "what_to_eat": [
          "Healthy fats",
          "Vitamin E-rich foods (nuts, seeds)"
        ],
        "medicines": [
          "Thick moisturizing creams or ointments",
          "Anti-itch lotions if needed"
        ],
        "what_not_to_take": [
          "Salty and processed foods"
        ],
        "exercises": [
          "Normal routine with skin care after activity"
        ],
        "treatment": "Regular moisturizing, avoid irritants, stay hydrated, and consider anti-itch treatment if needed.",
        "timing": {
          "precautions": ["07:30 AM", "09:30 PM"],
          "what_to_eat": ["09:00 AM", "01:00 PM"],
          "medicines": ["07:30 AM", "09:30 PM"],
          "exercises": ["Anytime"],
          "treatment": ["Morning after shower", "Night before sleep"]
        }
      },
      "severe": {
        "description": "Severe skin dryness includes cracked, bleeding, and inflamed skin, possibly accompanied by pain and infection risk.",
        "possible_causes": [
          "Chronic eczema or psoriasis",
          "Severe dehydration",
          "Underlying medical conditions"
        ],
        "precautions": [
          "Avoid hot water and irritants",
          "Use protective clothing and gloves",
          "Seek medical advice promptly"
        ],
        "what_to_eat": [
          "Healthy fats",
          "Foods rich in vitamins A, C, and E"
        ],
        "medicines": [
          "Prescription moisturizing creams or corticosteroids",
          "Medicated ointments as prescribed"
        ],
        "what_not_to_take": [
          "Salty, processed, or inflammatory foods"
        ],
        "exercises": [
          "Gentle activity avoiding skin trauma"
        ],
        "treatment": "Use prescribed medications, intensive moisturizing, avoid irritants, and consult a dermatologist.",
        "timing": {
          "precautions": ["07:30 AM", "09:30 PM"],
          "what_to_eat": ["09:00 AM", "01:00 PM", "07:00 PM"],
          "medicines": ["07:30 AM", "09:30 PM", "As prescribed"],
          "exercises": ["Gentle routine"],
          "treatment": ["Morning after shower", "Night before sleep"]
        }
      }
    }
  },
  {
    "symptom": "Shortness of Breath (Mild, Non-Emergency)",
    "image": require("../assets/symptoms/headache.png"),
    "severity_levels": {
      "mild": {
        "description": "Mild shortness of breath involves occasional difficulty breathing during mild exertion or environmental triggers, without severe symptoms.",
        "possible_causes": [
          "Mild asthma",
          "Allergic reactions",
          "Anxiety or mild respiratory infections"
        ],
        "precautions": [
          "Avoid polluted or smoky air",
          "Don’t overexert yourself"
        ],
        "what_to_eat": [
          "Iron-rich foods (beetroot, spinach)",
          "Vitamin C for better iron absorption"
        ],
        "medicines": [
          "Only inhalers if prescribed (e.g., Asthalin, Seroflo)"
        ],
        "what_not_to_take": [
          "Avoid allergens if known"
        ],
        "exercises": [
          "Pursed-lip breathing (5 minutes, inhale through nose 2 seconds, exhale through lips 4 seconds)",
          "Seated breathing (sit upright, 10 minutes slow deep breathing)"
        ],
        "treatment": "Sit upright, practice slow breathing, and use prescribed inhalers if necessary.",
        "timing": {
          "precautions": ["All day (avoid exertion)"],
          "what_to_eat": ["08:00 AM", "01:00 PM", "07:00 PM"],
          "medicines": ["As prescribed (usually morning/evening)"],
          "exercises": ["09:00 AM", "06:00 PM"],
          "treatment": ["Immediately when breathlessness occurs"]
        }
      },
      "moderate": {
        "description": "Moderate shortness of breath causes discomfort during normal daily activities, with some wheezing or coughing.",
        "possible_causes": [
          "Mild to moderate asthma",
          "Bronchitis",
          "Allergic reactions"
        ],
        "precautions": [
          "Avoid pollutants and allergens",
          "Limit physical exertion"
        ],
        "what_to_eat": [
          "Iron-rich foods",
          "Vitamin C-rich fruits and vegetables"
        ],
        "medicines": [
          "Inhalers as prescribed",
          "Oral antihistamines if allergy-related"
        ],
        "what_not_to_take": [
          "Avoid allergens and smoke"
        ],
        "exercises": [
          "Pursed-lip breathing",
          "Seated deep breathing exercises"
        ],
        "treatment": "Follow prescribed medication, avoid triggers, rest, and monitor symptoms.",
        "timing": {
          "precautions": ["All day"],
          "what_to_eat": ["08:00 AM", "01:00 PM", "07:00 PM"],
          "medicines": ["Morning", "Evening"],
          "exercises": ["09:00 AM", "06:00 PM"],
          "treatment": ["When symptoms arise"]
        }
      },
      "severe": {
        "description": "Severe shortness of breath is characterized by persistent difficulty breathing, chest tightness, and requires urgent medical attention.",
        "possible_causes": [
          "Severe asthma attack",
          "Heart or lung conditions",
          "Anaphylaxis"
        ],
        "precautions": [
          "Avoid all known triggers",
          "Seek immediate medical help"
        ],
        "what_to_eat": [
          "Iron and vitamin-rich foods to support overall health"
        ],
        "medicines": [
          "Emergency inhalers or nebulizers",
          "Other medications as prescribed by doctor"
        ],
        "what_not_to_take": [
          "Avoid allergens, smoke, and exertion"
        ],
        "exercises": [
          "Only gentle breathing exercises if recommended by a doctor"
        ],
        "treatment": "Seek urgent medical care, use emergency medications, and avoid physical exertion.",
        "timing": {
          "precautions": ["Constant vigilance"],
          "what_to_eat": ["Regular balanced meals"],
          "medicines": ["As emergency prescribed"],
          "exercises": ["Only under medical advice"],
          "treatment": ["Immediate on symptom onset"]
        }
      }
    }
  },
  {
    "symptom": "Low Mood / Anxiety",
    "image": require("../assets/symptoms/breathing.png"),
    "severity_levels": {
      "mild": {
        "description": "Mild low mood or anxiety involves occasional feelings of sadness or nervousness that do not significantly interfere with daily activities.",
        "possible_causes": [
          "Stress",
          "Temporary life changes",
          "Mild anxiety disorders"
        ],
        "precautions": [
          "Avoid social isolation",
          "Limit negative news exposure"
        ],
        "what_to_eat": [
          "Omega-3-rich foods",
          "Dark chocolate (in moderation)"
        ],
        "medicines": [
          "None unless prescribed by a doctor"
        ],
        "what_not_to_take": [
          "Excess caffeine",
          "Alcohol"
        ],
        "exercises": [
          "Brisk walking (20 minutes, ~3,000 steps)",
          "Yoga – Surya Namaskar (5 rounds, ~10 minutes)",
          "Meditation (10 minutes mindfulness breathing)"
        ],
        "treatment": "Practice mindfulness, engage in light exercise, connect with friends or family, and consider professional counseling if symptoms persist.",
        "timing": {
          "precautions": ["All day"],
          "what_to_eat": ["09:00 AM", "08:00 PM"],
          "medicines": ["As prescribed"],
          "exercises": ["07:00 AM", "06:00 PM", "09:30 PM"],
          "treatment": ["Anytime mood dips", "10:00 PM"]
        }
      },
      "moderate": {
        "description": "Moderate low mood or anxiety includes frequent feelings of worry or sadness affecting daily routines and social interactions.",
        "possible_causes": [
          "Generalized anxiety disorder",
          "Situational stress",
          "Mild depression"
        ],
        "precautions": [
          "Avoid social isolation",
          "Limit exposure to stressors"
        ],
        "what_to_eat": [
          "Omega-3-rich foods",
          "Dark chocolate (in moderation)"
        ],
        "medicines": [
          "None unless prescribed by a doctor"
        ],
        "what_not_to_take": [
          "Excess caffeine",
          "Alcohol"
        ],
        "exercises": [
          "Regular brisk walking",
          "Yoga and meditation"
        ],
        "treatment": "Regular mindfulness practice, counseling support, maintain social connections, and follow medical advice if needed.",
        "timing": {
          "precautions": ["All day"],
          "what_to_eat": ["09:00 AM", "08:00 PM"],
          "medicines": ["As prescribed"],
          "exercises": ["07:00 AM", "06:00 PM", "09:30 PM"],
          "treatment": ["When symptoms worsen", "Before sleep"]
        }
      },
      "severe": {
        "description": "Severe low mood or anxiety significantly disrupts daily life, causing persistent sadness, panic attacks, or debilitating worry requiring professional intervention.",
        "possible_causes": [
          "Major depressive disorder",
          "Severe anxiety disorders",
          "Other psychiatric conditions"
        ],
        "precautions": [
          "Avoid social isolation",
          "Seek professional mental health support promptly"
        ],
        "what_to_eat": [
          "Balanced diet with omega-3",
          "Avoid triggers like caffeine and alcohol"
        ],
        "medicines": [
          "Psychiatric medications as prescribed"
        ],
        "what_not_to_take": [
          "Excess caffeine",
          "Alcohol"
        ],
        "exercises": [
          "Gentle yoga and guided meditation",
          "Light walks as tolerated"
        ],
        "treatment": "Engage in professional therapy, adhere to medication, maintain social support, and practice self-care.",
        "timing": {
          "precautions": ["Constant awareness"],
          "what_to_eat": ["09:00 AM", "08:00 PM"],
          "medicines": ["As prescribed"],
          "exercises": ["Gentle routines"],
          "treatment": ["As directed by mental health professionals"]
        }
      }
    }
  }
];
function getAllSeverities(symptomName) {
  const symptom = symptomHealth.find(s => s.symptom === symptomName);
  if (!symptom) return null;
  return symptom.severity_levels;
}

export { symptomHealth,getAllSeverities};


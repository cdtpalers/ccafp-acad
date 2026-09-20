export const competitionsData = [
  {
    title: 'Robotics Competition: Autonomous Ground Drone Racing Challenge',
    type: 'Team Event',
    desc: 'High-intensity autonomous ground drone racing challenge testing rapid integration, autonomous programming, sensor utilization, and mission-oriented decision-making.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>Each company will form one (1) team with five (5) members.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>Teams shall arrive with a fully assembled and operational Arduino-based ground drone.</li>
        <li><strong>Segment 1:</strong> Integration, Calibration, and Testing (30 Minutes). Test obstacle avoidance, target detection, payload release.</li>
        <li><strong>Segment 2:</strong> Autonomous Ground Drone Race. Eight drones compete simultaneously across four phases: Autonomous Object Avoidance, Zigzag Navigation, Target Detection and Payload Deployment, and Straight-Line Sprint to Finish.</li>
        <li>No Bluetooth, Wi-Fi, RF controller, or manual control is permitted once the race begins.</li>
      </ul>
      <h4>Scoring (100 Points Total)</h4>
      <ul>
        <li>Drone Design and Integration: 10 pts</li>
        <li>Autonomous Object Detection: 10 pts</li>
        <li>Buzzer Activation: 5 pts</li>
        <li>Successful Obstacle Avoidance: 10 pts</li>
        <li>Completion of Zigzag Course: 15 pts</li>
        <li>Target Detection: 10 pts</li>
        <li>Successful Payload Deployment: 15 pts</li>
        <li>Payload Accuracy: 10 pts</li>
        <li>Finish Position: 10 pts</li>
        <li>Mission Completion Reliability: 5 pts</li>
      </ul>
    `
  },
  {
    title: 'Python Programming',
    type: 'Team Event',
    desc: 'Python-based programming challenge testing logic formulation, algorithmic thinking, and basic data handling relevant to military scenarios.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>Each company will form three (3) teams composed of three (3) First-Class Cadets.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>There will be three (3) distinct rounds. One team from each company competes per round.</li>
        <li>All programming activities shall be conducted offline without internet. No external references allowed.</li>
        <li><strong>Easy Round:</strong> 5 Programs, 2 pts each, 2 mins per program.</li>
        <li><strong>Average Round:</strong> 3 Programs, 3 pts each, 5 mins per program.</li>
        <li><strong>Difficult Round:</strong> 2 Programs, 5 pts each, 10 mins per program.</li>
        <li><strong>Mystery Program:</strong> Tie-breaker.</li>
      </ul>
      <h4>Scoring</h4>
      <p>A program must be executed successfully and meet all stated requirements to earn full points. Partial solutions with logical errors receive no points.</p>
    `
  },
  {
    title: 'Data Analytics and Artificial Intelligence Datathon',
    type: 'Team Event',
    desc: 'Structured competition for cadets to exhibit systematic use of data, algorithms, and intelligent systems to support military decision-making.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>Each company forms one (1) team with eight (8) members (3x 1CL, 3x 2CL, 2x 3CL).</p>
      <h4>Mechanics</h4>
      <ul>
        <li><strong>Phase 1:</strong> Orientation and Ethics Briefing.</li>
        <li><strong>Phase 2:</strong> Data Analytics and Model Development. Cadets clean data, build machine learning models, and test readiness.</li>
        <li><strong>Phase 3:</strong> AI Interpretation and Decision Support. Translate results into clear recommendations.</li>
        <li><strong>Phase 4:</strong> Submission and Final Presentation. Submit source code, technical report, slide presentation, and a 10-minute briefing.</li>
      </ul>
      <h4>Scoring (100% Total)</h4>
      <ul>
        <li>Mission Relevance: 15%</li>
        <li>Data Analytics: 15%</li>
        <li>AI and ML: 25%</li>
        <li>AI Trust and Ethics: 15%</li>
        <li>Clear Communication: 15%</li>
        <li>Presentation and Defense: 15%</li>
      </ul>
    `
  },
  {
    title: 'Defense Systems Innovation Challenge',
    type: 'Team Event',
    desc: 'Interdisciplinary competition to conceptualize, design, and develop innovative military systems supporting modern Multi-Domain Operations.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>Three (3) teams composed of six (6) members each per company. Each team assigned to a different project category.</p>
      <h4>Categories</h4>
      <ul>
        <li>Smart Weapon Support System</li>
        <li>Force Protection and Base Defense System</li>
        <li>Multi-Domain ISR System</li>
        <li>Logistics and Sustainment System</li>
        <li>Disaster Response and Human Security System</li>
      </ul>
      <h4>Mechanics</h4>
      <ul>
        <li>Must use Arduino-based or equivalent microcontroller platform.</li>
        <li>Must include minimum of three (3) sensors/modules and wireless communication capability.</li>
        <li>Outputs: Functional Prototype, Engineering Drawings, System Schematic, Flow Diagram, Source Code, Technical Documentation, 5-Minute Briefing, and 30-Second Video.</li>
      </ul>
      <h4>Scoring (100% Total)</h4>
      <ul>
        <li>Creativity and Innovation: 35%</li>
        <li>Functionality: 35%</li>
        <li>Documentation: 10%</li>
        <li>Presentation: 10%</li>
        <li>Aesthetics: 10%</li>
      </ul>
    `
  },
  {
    title: 'SIMEX: Inter-Company Crisis Management Simulation Exercise',
    type: 'Team Event',
    desc: 'A national security decision simulation where company teams operate simultaneously analyzing and responding to identical scenario injects.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>One (1) team with seven (7) cadets (2x 1CL, 3x 2CL, 2x 3CL) per company.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>Eight company teams operate simultaneously in separate rooms with a centralized exercise directorate releasing injects via Zoom.</li>
        <li>Roles: Team Leader, Scribe, Briefer, Risk/Escalation Officer, Interagency/Policy Officer, Information/Cyber Officer, HADR/Resource Officer.</li>
        <li>Teams complete decision cards under time pressure based on EO 82, s. 2012.</li>
        <li>Internet search, messaging apps, and AI tools are prohibited.</li>
      </ul>
      <h4>Scoring (100 Points Total)</h4>
      <ul>
        <li>Six scenario decision cards: 60 pts (10 pts per inject on problem framing, EO82 5P alignment, COA logic).</li>
        <li>Final NSC-style brief: 25 pts (Strategic synthesis, feasibility, risk management).</li>
        <li>Team process and time discipline: 15 pts.</li>
      </ul>
    `
  },
  {
    title: 'Academic Mustering: Military Undergraduate Symposium',
    type: 'Team Event',
    desc: 'Culminating research competition challenging companies to conduct original research and defend their work before a panel of evaluators.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>One (1) team with 10 members (4x 1CL, 4x 2CL, 2x 3CL) per company.</p>
      <h4>Mechanics</h4>
      <ul>
        <li><strong>Event 1: The Brief (Research Paper Competition)</strong>. 25-page max IMRAD format paper on a prescribed thematic area.</li>
        <li><strong>Event 2: The Battle Board (Research Poster Competition)</strong>. 36" x 48" poster presented in a 10-minute presentation + 10 min Q&A.</li>
        <li><strong>Event 3: The Intel Report (Research Video Presentation)</strong>. 5 to 8-minute MP4 video explaining the research context, methodology, findings, and strategic implications.</li>
      </ul>
      <h4>Scoring (300 Points Total)</h4>
      <ul>
        <li>The Brief: 100 points</li>
        <li>The Battle Board: 100 points</li>
        <li>The Intel Report: 100 points</li>
      </ul>
    `
  },
  {
    title: 'Advocacy Film',
    type: 'Team Event',
    desc: 'Creative messaging competition to develop communication skills, critical thinking, and artistic expression through visual storytelling.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>One (1) team with ten (10) members regardless of rank/class per company.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>Produce one original advocacy film based on the official theme.</li>
        <li>Duration: 4 to 5 minutes (including credits).</li>
        <li>Dialogues may be English, Filipino, or mixed, but English subtitles are required.</li>
        <li>Must not contain offensive, discriminatory, or politically partisan content.</li>
      </ul>
      <h4>Scoring (100% Total)</h4>
      <ul>
        <li>Relevance to Theme and Message Clarity: 30%</li>
        <li>Storyline and Script: 25%</li>
        <li>Creativity and Originality: 20%</li>
        <li>Technical Quality (cinematography, editing, sound, lighting): 15%</li>
        <li>Teamwork and Overall Presentation: 10%</li>
      </ul>
    `
  },
  {
    title: 'Position Paper Challenge',
    type: 'Team Event',
    desc: 'Cadets prepare a position paper based on a contemporary issue or operational scenario, emphasizing critical thinking and analytical writing.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>One (1) team with eight (8) representatives per company.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>Participants draw a contemporary security issue (e.g., West Philippine Sea, terrorism, cyber threats, disaster response).</li>
        <li>The paper must present a concise analysis incorporating social, political, economic, and operational factors.</li>
        <li>Must apply ethical reasoning and security studies concepts.</li>
        <li>Must adhere to the prescribed memorandum format.</li>
      </ul>
      <h4>Scoring (100% Total)</h4>
      <ul>
        <li>Analysis of Security Issue: 30%</li>
        <li>Application of Concepts and Ethical Reasoning: 25%</li>
        <li>Quality and Feasibility of Recommendations: 25%</li>
        <li>Organization and Clarity of Writing: 10%</li>
        <li>Grammar, Mechanics, and Professional Presentation: 10%</li>
      </ul>
    `
  },
  {
    title: 'Magsaysay Cup: Debate Open',
    type: 'Team Event',
    desc: 'Asian Parliamentary format debate testing effective communication, persuasion, and critical thinking on motions revolving around national security.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>One team composed of three (3) members and one (1) adjudicator (N-1 rule). At least one member must be a 1CL cadet.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>Asian Parliamentary format (Government vs Opposition).</li>
        <li>Speakers deliver 7-minute constructive speeches. Reply speeches are 4 minutes.</li>
        <li>Points of Information (POI) allowed between the 1st and 6th minute of constructive speeches.</li>
        <li>Teams must supply one adjudicator who will be rated by the debaters.</li>
      </ul>
      <h4>Scoring</h4>
      <p>Judged on Matter, Manner, and Method. Adjudicators give speaker scores (69-83 scale) and determine the round winner based on combined scores.</p>
    `
  },
  {
    title: 'Language Proficiency Contest',
    type: 'Team Event',
    desc: 'Academic competition promoting the development and enhancement of English language skills in reading, listening, vocabulary, and grammar.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>Ten (10) representatives from each cadet class (3CL, 2CL, 1CL) per company, totaling thirty (30) representatives.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>All representatives take the English Proficiency Test on the scheduled date.</li>
        <li>Representatives compete against participants belonging to the same cadet class.</li>
        <li>The company score is determined by computing the average of the scores of its 30 representatives.</li>
      </ul>
      <h4>Scoring</h4>
      <p>Company Final Score = (3rd Class Score + 2nd Class Score + 1st Class Score) / 3</p>
    `
  },
  {
    title: 'Company Mural',
    type: 'Team Event',
    desc: 'Focused on creative thinking and artistic expression that leads toward civic engagement, education, and advocacy demonstration.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>One (1) team composed of fifteen (15) cadets per company.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>The mural must be an original work prominently embodying the contest theme and upholding PMA ideals.</li>
        <li>AI-generated images, copied artworks, or previously published designs are strictly prohibited.</li>
        <li>Must be created only within the designated wall/area using approved paints and materials.</li>
      </ul>
      <h4>Scoring (100% Total)</h4>
      <ul>
        <li>Creativity & Originality: 20%</li>
        <li>Visual Impact: 20%</li>
        <li>Relevance to Theme: 20%</li>
        <li>Composition & Layout: 15%</li>
        <li>Color & Typography: 15%</li>
        <li>Technical Quality/Craftsmanship: 10%</li>
      </ul>
    `
  },
  {
    title: 'Mathenik: Mathematical Excellence and Knowledge Challenge',
    type: 'Team Event',
    desc: 'Mathematics competition designed to develop and showcase mathematical knowledge, analytical thinking, teamwork, and problem-solving skills.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>Five (5) teams per company. Each round features one team composed of 1x 1CL, 1x 2CL, and 1x 3CL.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>Competition consists of five (5) rounds. Each round has 10 questions (Easy, Average, Difficult).</li>
        <li><strong>Easy:</strong> 4 multiple-choice questions (20 secs, 1 pt).</li>
        <li><strong>Average:</strong> 3 identification questions (30 secs, 2 pts).</li>
        <li><strong>Difficult:</strong> 3 word problems involving military/operational scenarios (1 minute, 3 pts).</li>
        <li>Teams discuss collaboratively and submit one final group answer.</li>
      </ul>
      <h4>Scoring</h4>
      <p>Scores from all five rounds are accumulated. Max possible points: 108 points.</p>
    `
  },
  {
    title: 'Lawpardy: A Law Jeopardy Game',
    type: 'Team Event',
    desc: 'Jeopardy-inspired competition to reinforce knowledge of law subjects like Law and Discipline, Human Rights, and International Humanitarian Law.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>One (1) team composed of 3 cadets (one from 1st, 2nd, and 3rd class) per company.</p>
      <h4>Mechanics</h4>
      <ul>
        <li>Categories include: Law and Discipline, Human Rights, Peace Studies, International Law, IHL, and Legal Scenarios.</li>
        <li>Three stages: Elimination, Semifinal, Championship.</li>
        <li>Questions types: Identification (2 pts), Enumeration (up to 3 pts), Charade (3 pts), Modified True/False (1 pt + 1 pt for correction).</li>
        <li>Teams have 10 seconds to answer (60 seconds for charades). Incorrect answers allow a 5-second steal.</li>
        <li><strong>Final Lawpardy:</strong> Teams secretly wager accumulated points on a final question. Correct answers double the wager; incorrect answers deduct it.</li>
      </ul>
    `
  },
  {
    title: 'Tactix: The E-games Challenge',
    type: 'Team Event',
    desc: 'E-games competition (World of Warships, CoH3, Wargame: Red Dragon) to enhance decision-making and performance in tactical operations.',
    rulesHtml: `
      <h4>Team Composition</h4>
      <p>Three (3) players + One (1) substitute per game title.</p>
      <h4>Mechanics</h4>
      <ul>
        <li><strong>World of Warships (3v3):</strong> Round-Robin format. Best of 3. Upgrades restricted in qualifiers (Stock Base T1 ships only). "Pit Stop" upgrade window before Semi-finals.</li>
        <li><strong>Company of Heroes 3 (3v3):</strong> Victory Point Control. 30-minute time limit. Base units only in qualifiers; full tech tree unlocked for Semi-finals. Map: Gazala Landing, Pachino Farmlands, Melfa River.</li>
        <li><strong>Wargame: Red Dragon (3v3):</strong> Conquest mode (1000 pts). 60-minute limit. Static loadouts using provided deck codes (Amphibious, Heavy Support, Air/Sea Denial). Map: "Straight to the Point".</li>
      </ul>
    `
  }
];

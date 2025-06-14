import { Injectable } from '@angular/core';

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface Skill {
  name: string;
  level: number; // 1-100
  category: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  logo?: string;
  website?: string;
  programPdf?: string;
  detailedDescription?: string;
  skills?: string[];
  courses?: string[];
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description?: string; // Keep for backward compatibility
  bulletPoints?: string[]; // New structured format
  logo?: string;
  certificate?: string;
  skills?: string[];
}

export interface Project {
  title: string;
  description: string;
  imageUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
  tags: string[];
  isAiProject?: boolean;
}

export interface Brand {
  name: string;
  description: string;
  logo: string;
  url?: string;
  github?: string;
  linkedin?: string;
}

export interface Testimonial {
  name: string;
  position: string;
  company: string;
  text: string;
  avatar?: string;
  linkedinUrl?: string;
}

export interface PortfolioContent {
  name: string;
  title: string;
  subtitle: string;
  about: string;
  email: string;
  avatarUrl: string;
  location: string;
  socialLinks: SocialLink[];
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  brands: Brand[];
  testimonials: Testimonial[];
  showBlog?: boolean; // Flag to control blog section visibility
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private portfolioContent: PortfolioContent = {
    name: 'Ayoub Achak',
    title: 'Machine Learning Engineer',
    subtitle: 'A seasoned Machine Learning Engineer with a strong background in AI and full-stack development',
    about: 'A seasoned Machine Learning Engineer with a strong background in AI and full-stack development. Successfully developed multi-user FastAPI platforms leveraging AI agents and integrated natural language processing solutions to enhance code execution accuracy. Proven ability to design and deploy scalable solutions, to leverage machine learning expertise to drive innovation and efficiency in the target role.',
    email: 'ayoub.achak01@gmail.com',
    avatarUrl: 'assets/images/avatar.jpg',
    location: 'France',
    socialLinks: [
      {
        platform: 'GitHub',
        url: 'https://github.com/ayoubachak',
        icon: 'github'
      },
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/ayoubachak',
        icon: 'linkedin'
      },
      {
        platform: 'Website',
        url: 'https://ayoubachak.me',
        icon: 'globe'
      }
    ],
    skills: [
      { name: 'Python', level: 95, category: 'Languages' },
      { name: 'JavaScript', level: 90, category: 'Languages' },
      { name: 'TypeScript', level: 85, category: 'Languages' },
      { name: 'C/C++', level: 80, category: 'Languages' },
      { name: 'Rust', level: 75, category: 'Languages' },
      { name: 'Java', level: 80, category: 'Languages' },
      { name: 'PHP', level: 70, category: 'Languages' },
      { name: 'R', level: 65, category: 'Languages' },
      { name: 'PostgreSQL', level: 85, category: 'Databases' },
      { name: 'MongoDB', level: 85, category: 'Databases' },
      { name: 'MySQL', level: 80, category: 'Databases' },
      { name: 'SQLite', level: 75, category: 'Databases' },
      { name: 'Chroma DB', level: 80, category: 'Databases' },
      { name: 'PL SQL/Oracle SQL', level: 70, category: 'Databases' },
      { name: 'TensorFlow', level: 90, category: 'ML & AI' },
      { name: 'PyTorch', level: 85, category: 'ML & AI' },
      { name: 'SKlearn', level: 85, category: 'ML & AI' },
      { name: 'OpenCV', level: 80, category: 'ML & AI' },
      { name: 'Pandas', level: 90, category: 'ML & AI' },
      { name: 'Numpy', level: 90, category: 'ML & AI' },
      { name: 'LangChain', level: 85, category: 'ML & AI' },
      { name: 'RAG', level: 80, category: 'ML & AI' },
      { name: 'Vector DBs', level: 85, category: 'ML & AI' },
      { name: 'FastAPI', level: 90, category: 'Web & DevOps' },
      { name: 'Flask', level: 85, category: 'Web & DevOps' },
      { name: 'Django', level: 80, category: 'Web & DevOps' },
      { name: 'React', level: 85, category: 'Web & DevOps' },
      { name: 'Spring Boot', level: 75, category: 'Web & DevOps' },
      { name: 'Docker', level: 85, category: 'Web & DevOps' },
      { name: 'Kubernetes', level: 80, category: 'Web & DevOps' },
      { name: 'AWS', level: 75, category: 'Web & DevOps' },
      { name: 'Azure', level: 75, category: 'Web & DevOps' },
      { name: 'CI/CD', level: 80, category: 'Web & DevOps' }
    ],
    education: [
      {
        institution: 'Brest National School of Engineering',
        degree: 'Software Engineer\'s Degree',
        field: 'Software Engineering',
        startDate: '2023',
        endDate: '2025',
        description: 'Dual Engineer\'s Degree Program',
        logo: 'assets/images/schools/enib-logo.png',
        website: 'https://www.enib.fr/',
        // programPdf: 'assets/documents/enib-program.pdf',
        programPdf: 'https://web.enib.fr/programmepeda/',
        detailedDescription: 'The National School of Engineering in Brest (ENIB) is a public engineering school that specializes in multidisciplinary engineering with a focus on software, electronics, and mechatronics. The program emphasizes practical engineering skills through project-based learning and industry collaborations.',
        skills: ['Software Architecture', 'System Design', 'Embedded Systems', 'Real-time Programming', 'Applied Mathematics'],
        courses: ['Advanced Software Engineering', 'Distributed Systems', 'Computer Networks', 'Digital Signal Processing', 'Machine Learning']
      },
      {
        institution: 'ENSAM Casablanca Engineering School',
        degree: 'Software and Machine Learning Engineer\'s Degree',
        field: 'Software and Machine Learning Engineering',
        startDate: '2019',
        endDate: '2025',
        description: 'Dual Engineer\'s Degree Program',
        logo: 'assets/images/schools/ensam-logo.png',
        website: 'https://ensam-casa.ma/',
        // programPdf: 'assets/documents/ensam-program.pdf',
        programPdf: 'https://ensam-casa.ma/filieres/details?id=19',
        detailedDescription: 'The National Higher School of Arts and Crafts (ENSAM) in Casablanca is one of Morocco\'s premier engineering institutions. The program focuses on developing expertise in software engineering with specialization in artificial intelligence and machine learning. The curriculum includes both theoretical foundations and practical applications through industry partnerships.',
        skills: ['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Software Development', 'Data Engineering'],
        courses: ['Statistical Learning', 'Neural Networks', 'Big Data Processing', 'Cloud Computing', 'Software Engineering Methodologies', 'AI Ethics']
      }
    ],
    experience: [
      {
        company: 'Ansys',
        role: 'R&D Engineer',
        startDate: 'Oct 2024',
        endDate: 'Sep 2025',
        bulletPoints: [
          'Working on a No-Code UI Builder solution to allow Ansys clients to easily get solutions running in minutes instead of days by providing them with a robust Drag-n-Drop UI',
          'Users can export their solutions from canvas to Python Dash code'
        ],
        logo: 'assets/images/companies/ansys-logo.png',
        skills: ['Python', 'Dash', 'No-Code', 'UI Builder', 'Drag-n-Drop']
      },
      {
        company: 'ALTEN',
        role: 'Machine Learning Engineer (NLP & Automation)',
        startDate: 'Feb 2024',
        endDate: 'Aug 2024',
        bulletPoints: [
          'Designed & fine-tuned a prompt-based code-generation pipeline using Mistral 7B & Phi-2 70B, incorporating chain-of-thought prompting and dynamic temperature scheduling to boost functional correctness',
          'Evaluated on a 1,000-snippet benchmark with unit tests, achieving 40% pass@1 (vs. 12% heuristic baseline) and 65% pass@5 cutting manual debugging time by 3×',
          'Built a FastAPI orchestration platform to manage LLM agents, automated test execution, and result aggregation; integrated ChromaDB for code retrieval, PostgreSQL for test metadata, and AI agents for failure triage—processing 200+ tests/min at sub 200 ms latency',
          'Implemented OAuth2 SSO via Azure AD and JWT scopes; containerized with Docker and deployed via Azure DevOps pipelines for zero-downtime releases',
          'Recognized and accepted by IRISA Research School for further academic research'
        ],
        logo: 'assets/images/companies/alten-logo.png',
        skills: ['FastAPI', 'NLP', 'LLMs', 'Mistral 7B', 'Phi-2 70B', 'ChromaDB', 'PostgreSQL', 'AI Agents', 'OAuth2', 'Azure AD', 'JWT', 'Docker', 'Azure DevOps']
      },
      {
        company: 'CBI',
        role: 'Software Engineer (Automation and ML Integration)',
        startDate: 'May 2023',
        endDate: 'Sep 2023',
        bulletPoints: [
          'Designed and deployed an automation device using Raspberry Pi Zero W to monitor and update Cisco network devices remotely, reducing manual intervention in remote locations and costs by thousands of $',
          'Developed a log analysis system with Flask backend and React (TypeScript) frontend that utilized an NLP model to classify and prioritize critical infrastructure issues',
          'Pruned the NLP TFLite model for optimal performance on Raspberry Pi'
        ],
        logo: 'assets/images/companies/cbi-logo.jpg',
        skills: ['Flask', 'React', 'TypeScript', 'NLP', 'TFLite', 'Raspberry Pi', 'Cisco', 'Network Automation']
      },
      {
        company: 'Kezakoo',
        role: 'Software Engineer',
        startDate: 'Apr 2022',
        endDate: 'Jan 2023',
        bulletPoints: [
          'Implemented a gamification system to increase user engagement with features including achievement badges, leaderboards, and progress tracking',
          'Deployed the solution on AWS EC2 using Docker and Kubernetes for scalability and seamless updates',
          'Enhanced content discoverability by integrating an ML-powered real-time search feature, utilizing Pinecone with BERT and HNSW indexing for efficient vector similarity search',
          'Deployed via AWS Lambda and integrated through a REST API',
          'Created a comprehensive knowledge base by indexing all course pages from their original HTML format, extracting key concepts and metadata to improve search relevance',
          'Implemented custom HTML parsers and content extractors to maintain document structure while optimizing for semantic search (BeautifulSoup, regex)'
        ],
        logo: 'assets/images/companies/kezakoo-logo.webp',
        skills: ['AWS EC2', 'Docker', 'Kubernetes', 'ML', 'Pinecone', 'BERT', 'HNSW', 'AWS Lambda', 'REST API', 'BeautifulSoup', 'HTML Parsing', 'Semantic Search']
      },
      {
        company: 'Miratti Bags',
        role: 'IoT and Software Engineer (Luxurious Leather Bags)',
        startDate: 'Jan 2021',
        endDate: 'Mar 2022',
        bulletPoints: [
          'Developed a smart IoT Android app integrating BLE (Bluetooth 5.0), nRF, RFID, GPS, and 3G connectivity for seamless tracking',
          'Collaborated with Protomain for hardware integration, ensuring secure data transmission with encryption between IoT devices and the app',
          'Built using Android Studio and Java',
          'Launched the Miratti community portfolio website with user authentication and data sharing via WordPress REST API, deployed on AWS with SMTP setup for real-time notifications'
        ],
        logo: 'assets/images/companies/miratti-logo.png',
        skills: ['IoT', 'Android', 'Java', 'BLE', 'Bluetooth 5.0', 'nRF', 'RFID', 'GPS', '3G', 'WordPress', 'AWS', 'SMTP', 'Encryption']
      }
    ],
    projects: [
      {
        title: 'Genetic AI Flappy Bird',
        description: 'Built an AI-driven Flappy Bird clone in Angular/TypeScript, implementing a custom feed-forward neural network and a genetic algorithm (selection, crossover, mutation) to evolve 50 bird agents that progressively learn to navigate pipes.',
        imageUrl: 'assets/images/aiprojects/flappybird.png',
        tags: ['Angular', 'TypeScript', 'Genetic Algorithm', 'Neural Networks', 'AI'],
        repoUrl: 'https://github.com/ayoubachak/flappy-bird.git',
        isAiProject: true
      },
      {
        title: 'RL-Powered Sudoku',
        description: 'Created a TypeScript/TF.js Sudoku game with Double-DQN & PPO agents that learn via experience replay, action masking and PPO clipping, plus a rule-based tutorial mode offering step-by-step elimination and pattern hints.',
        imageUrl: 'assets/images/aiprojects/sodoku.png',
        tags: ['TypeScript', 'TensorFlow.js', 'Reinforcement Learning', 'DQN', 'PPO'],
        repoUrl: 'https://github.com/ayoubachak/sodoku.git',
        isAiProject: true
      },
      {
        title: 'NeuroChess Engine',
        description: 'Developed an Angular chess app featuring AlphaZero-style MCTS (UCB1 selection, Dirichlet noise, neural priors with uniform/material-count fallbacks) and multi-backend, GPU-optimized tf.js (WebGPU → WebGL → CPU) with an 8-block residual CNN policy/value network. Includes player-vs-player, postgame move evaluation, self-play training UI, three-tier bot difficulty and a creative mode for custom setups.',
        imageUrl: 'assets/images/aiprojects/neurochess.png',
        tags: ['Angular', 'MCTS', 'WebGPU', 'WebGL', 'TensorFlow', 'Neural Networks'],
        repoUrl: 'https://github.com/theleetai/chess.git',
        isAiProject: true
      },
      {
        title: 'NeuroPong',
        description: 'Built a HTML5/TypeScript Pong game with PvP and PvBot modes, plus a DQN-based training interface that runs two neural agents in self-play—complete with Double-DQN, prioritized replay, batched updates and fast epsilon decay. Integrated real-time D3 network visualizations over canvas to display dual-agent activations and weight flows during gameplay.',
        imageUrl: 'assets/images/aiprojects/pongrl.png',
        tags: ['HTML5', 'TypeScript', 'DQN', 'D3.js', 'Neural Networks', 'Visualization'],
        repoUrl: 'https://github.com/ayoubachak/pong-rl.git',
        isAiProject: true
      },
      {
        title: 'Interactive Image Transformation Lab',
        description: 'Created an OpenCV-powered, node-based canvas where users drag-and-drop Input, Transform (Gaussian/custom blur, morphology, sharpening, edge detection, etc.) and Output nodes to build and configure live image-processing pipelines—complete with guided, hands-on lessons.',
        imageUrl: 'assets/images/aiprojects/image-transform-lab.png',
        tags: ['OpenCV', 'Computer Vision', 'Node-based UI', 'Image Processing', 'Interactive Learning'],
        repoUrl: 'https://github.com/ayoubachak/image-transformation-lab.git',
        isAiProject: true
      },
      {
        title: 'JLang Programming Language',
        description: 'Built an interpreted language in Java featuring Python/JavaScript-like syntax, JSON objects, multiple inheritance, list comprehension, and anonymous functions. Achieved Python speed.',
        imageUrl: '/assets/images/ai-projects/jlang.jpg',
        repoUrl: 'https://github.com/Low-Level-Code/jlang.git',
        tags: ['Java', 'Interpreters', 'Programming Languages', 'Compilers'],
      },
      {
        title: 'Leetlang Programming Language',
        description: 'Developed a bytecode virtual machine compiled language in C with functions, classes, inheritance, modules, loops, and scope management.',
        imageUrl: '/assets/images/ai-projects/leetlang.jpg',
        repoUrl: 'https://github.com/ayoubachak/leetlang.git',
        tags: ['C', 'Bytecode VM', 'Programming Languages', 'Compilers']
      },
      {
        title: 'Project CM33',
        description: 'Enhanced C programming language for LPC55S69 board with Power Quad optimizations and new accelerometer functions.',
        imageUrl: '/assets/images/ai-projects/cm33.jpg',
        repoUrl: 'https://github.com/ayoubachak/projet_cm33.git',
        tags: ['C', 'Embedded Systems', 'LPC55S69', 'Accelerometer']
      },
      {
        title: 'Real-time OS',
        description: 'Developed a real-time OS with efficient task management and semaphore patterns for LPC55S69 board.',
        imageUrl: '/assets/images/ai-projects/rtos.jpg',
        repoUrl: 'https://github.com/ayoubachak/LPC55S69-OS.git',
        tags: ['C', 'RTOS', 'Embedded Systems', 'LPC55S69']
      },
      {
        title: 'SQL Query Generation',
        description: 'Implemented AI models in Python to generate SQL queries from text prompts. Initially developed a Seq2Seq model but observed low performance. Subsequently, fine-tuned a GPT-2 model on company-specific data to enhance accuracy. Leveraged vector stores and semantic search techniques to further improve query relevance and precision. This resulted in a 35% increase in query accuracy and a significant reduction in manual query generation time.',
        imageUrl: 'assets/images/aiprojects/sqlquerygenerator.png',
        tags: ['Python', 'NLP', 'GPT-2', 'Vector Stores', 'Semantic Search'],
        isAiProject: true
      },
    ],
    brands: [
      {
        name: 'The Leet AI',
        description: 'Curate and share open-source AI tools for the community of developers.',
        logo: 'assets/images/brands/leetai-logo.jpeg',
        url: 'https://github.com/orgs/The-Leet-AI/',
        github: 'https://github.com/orgs/The-Leet-AI/',
        linkedin: 'https://www.linkedin.com/company/the-leet-ai/'
      },
      {
        name: 'ExtraConnect',
        description: 'A former startup focused on fleet management solutions, leveraging Raspberry Pi, IoT, and machine learning.',
        logo: 'assets/images/brands/extraconnect-logo.jpeg',
        url: 'https://github.com/orgs/ExtraConnect/',
        github: 'https://github.com/orgs/ExtraConnect/',
        linkedin: 'https://www.linkedin.com/company/extra-connect/'
      }
    ],
    testimonials: [
      {
        name: 'Ismail Essagar',
        position: 'AI and Computer Science Engineering Student',
        company: 'Engineering School',
        text: 'Working with Ayoub on various projects has been an experience that I truly cherish. His dedication and commitment to delivering impeccable work was truly inspiring. His proactive approach and ability to effectively manage tasks never ceased to impress me. Together we have reached remarkable milestones, from winning competitions to successful speedrun projects. He always makes me want to work with him again and overcome challenges together.',
        avatar: 'assets/images/testimonials/ismailessagar.jpg',
        linkedinUrl: 'https://www.linkedin.com/in/ismail-essagar'
      },
      {
        name: 'ABDELLAH HALLOU',
        position: 'Data Engineer',
        company: 'Cloud Solutions',
        text: 'I\'ve had the pleasure of working closely with Ayoub in a team on numerous projects. He puts his full effort into the things he is working on. Ayoub is super motivated and always ready for all great new projects. His curious nature and discipline make him easy to work with! He\'s a great team player, who always keeps an eye on everything and brings important ideas and perspectives to the projects in a great manner.',
        avatar: 'assets/images/testimonials/abdellahhalou.jpg',
        linkedinUrl: 'https://www.linkedin.com/in/abdellah-hallou'
      },
      {
        name: 'Amine EL ARIF',
        position: 'Cybersecurity Intern',
        company: 'Michelin',
        text: 'I have worked with Ayoub on different projects during our studies in Morocco, and I wholeheartedly recommend him as a professional individual. His hard work and commitment are top-notch. He consistently delivers and is reliable in everything he does. Strongly recommend.',
        avatar: 'assets/images/testimonials/amineelarif.jpg',
        linkedinUrl: 'https://www.linkedin.com/in/elarif-amine'
      },
    ],
    showBlog: false // Hide blog section by default
  };

  constructor() { }

  /**
   * Get the entire portfolio content
   */
  getPortfolioContent(): PortfolioContent {
    return this.portfolioContent;
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return this.portfolioContent.projects;
  }

  /**
   * Get AI projects only
   */
  getAiProjects(): Project[] {
    return this.portfolioContent.projects.filter(project => project.isAiProject);
  }

  /**
   * Get regular (non-AI) projects
   */
  getNonAiProjects(): Project[] {
    return this.portfolioContent.projects.filter(project => !project.isAiProject);
  }

  /**
   * Get skills grouped by category
   */
  getSkillsByCategory(): Record<string, Skill[]> {
    return this.portfolioContent.skills.reduce((acc, skill) => {
      const category = skill.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
  }
}

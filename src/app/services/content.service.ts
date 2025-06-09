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
  description: string;
  logo?: string;
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
        programPdf: 'assets/documents/ensam-program.pdf',
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
        description: 'Working on a No-Code UI Builder solution to allow Ansys clients to easily get solutions running in minutes instead of days by providing them with a robust Drag-n-Drop UI. Users then can export their solutions from canvas to Python Dash code. Working on integrating an AI agent with the UI-Builder so that creating solutions would be done using natural language to abstract potentially complex components to users with no expertise.',
        logo: 'assets/images/companies/ansys-logo.png',
        skills: ['Python', 'AI Agents', 'UI Builder', 'Dash', 'No-Code']
      },
      {
        company: 'ALTEN',
        role: 'Machine Learning Engineer (NLP & Automation)',
        startDate: 'Feb 2024',
        endDate: 'Aug 2024',
        description: 'Designed & fine-tuned a prompt-based code-generation pipeline using Mistral 7B & Phi-2 70B, incorporating chain-of-thought prompting and dynamic temperature scheduling to boost functional correctness. Evaluated on a 1,000-snippet benchmark with unit tests, achieving 40% pass@1 (vs. 12% heuristic baseline) and 65% pass@5 cutting manual debugging time by 3×. Built a FastAPI orchestration platform to manage LLM agents, automated test execution, and result aggregation; integrated ChromaDB for code retrieval, PostgreSQL for test metadata, and AI agents for failure triage—processing 200+ tests/min at sub 200 ms latency.',
        logo: 'assets/images/companies/alten-logo.png',
        skills: ['FastAPI', 'NLP', 'LLMs', 'ChromaDB', 'PostgreSQL', 'AI Agents']
      },
      {
        company: 'CBI',
        role: 'Software Engineer (Automation and ML Integration)',
        startDate: 'May 2023',
        endDate: 'Sep 2023',
        description: 'Designed and deployed an automation device using Raspberry Pi Zero W to monitor and update Cisco network devices remotely, reducing manual intervention in remote locations and costs by thousands of $. Developed a log analysis system with Flask backend and React (TypeScript) frontend that utilized an NLP model to classify and prioritize critical infrastructure issues, pruned the NLP TFLite model for optimal performance on Raspberry Pi.',
        logo: 'assets/images/companies/cbi-logo.jpg',
        skills: ['Raspberry Pi', 'Flask', 'React', 'TypeScript', 'NLP', 'TFLite']
      },
      {
        company: 'Kezakoo',
        role: 'Software Engineer',
        startDate: 'Apr 2022',
        endDate: 'Jan 2023',
        description: 'Implemented a gamification system to increase user engagement with features including achievement badges, leaderboards, and progress tracking. Deployed the solution on AWS EC2 using Docker and Kubernetes for scalability and seamless updates. Enhanced content discoverability by integrating an ML-powered real-time search feature, utilizing Pinecone with BERT and HNSW indexing for efficient vector similarity search. Deployed via AWS Lambda and integrated through a REST API.',
        logo: 'assets/images/companies/kezakoo-logo.webp',
        skills: ['AWS EC2', 'Docker', 'Kubernetes', 'ML', 'Pinecone', 'BERT', 'AWS Lambda', 'REST API']
      },
      {
        company: 'Miratti Bags',
        role: 'IoT and Software Engineer (Luxurious Leather Bags)',
        startDate: 'Jan 2021',
        endDate: 'Mar 2022',
        description: 'Developed a smart IoT Android app integrating BLE (Bluetooth 5.0), nRF, RFID, GPS, and 3G connectivity for seamless tracking. Collaborated with Protomain for hardware integration, ensuring secure data transmission with encryption between IoT devices and the app. Built using Android Studio and Java. Launched the Miratti community portfolio website with user authentication and data sharing via WordPress REST API, deployed on AWS with SMTP setup for real-time notifications.',
        logo: 'assets/images/companies/miratti-logo.png',
        skills: ['IoT', 'Android', 'BLE', 'RFID', 'GPS', 'WordPress', 'AWS']
      }
    ],
    projects: [
      {
        title: 'SQL Query Generation',
        description: 'Implemented AI models in Python to generate SQL queries from text prompts. Initially developed a Seq2Seq model but observed low performance. Subsequently, fine-tuned a GPT-2 model on company-specific data to enhance accuracy. Leveraged vector stores and semantic search techniques to further improve query relevance and precision. This resulted in a 35% increase in query accuracy and a significant reduction in manual query generation time.',
        imageUrl: 'assets/images/projects/sql-gen.jpg',
        tags: ['Python', 'NLP', 'GPT-2', 'Vector Stores', 'Semantic Search'],
        isAiProject: true
      },
      {
        title: 'JLang Programming Language',
        description: 'Built an interpreted language in Java featuring Python/JavaScript-like syntax, JSON objects, multiple inheritance, list comprehension, and anonymous functions. Achieved Python speed.',
        imageUrl: 'assets/images/projects/jlang.jpg',
        repoUrl: 'https://github.com/Low-Level-Code/jlang.git',
        tags: ['Java', 'Interpreters', 'Programming Languages', 'Compilers']
      },
      {
        title: 'Leetlang Programming Language',
        description: 'Developed a bytecode virtual machine compiled language in C with functions, classes, inheritance, modules, loops, and scope management.',
        imageUrl: 'assets/images/projects/leetlang.jpg',
        repoUrl: 'https://github.com/ayoubachak/leetlang.git',
        tags: ['C', 'Bytecode VM', 'Programming Languages', 'Compilers']
      },
      {
        title: 'Project CM33',
        description: 'Enhanced C programming language for LPC55S69 board with Power Quad optimizations and new accelerometer functions.',
        imageUrl: 'assets/images/projects/cm33.jpg',
        repoUrl: 'https://github.com/ayoubachak/projet_cm33.git',
        tags: ['C', 'Embedded Systems', 'LPC55S69', 'Accelerometer']
      },
      {
        title: 'Real-time OS',
        description: 'Developed a real-time OS with efficient task management and semaphore patterns for LPC55S69 board.',
        imageUrl: 'assets/images/projects/rtos.jpg',
        repoUrl: 'https://github.com/ayoubachak/LPC55S69-OS.git',
        tags: ['C', 'RTOS', 'Embedded Systems', 'LPC55S69']
      }
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
        name: 'HCIA AI & Big Data',
        position: 'Certification',
        company: 'Huawei',
        text: 'Professional certification in Artificial Intelligence and Big Data technologies.',
        avatar: 'assets/images/testimonials/huawei.jpg'
      },
      {
        name: 'HCIA 5G',
        position: 'Certification',
        company: 'Huawei',
        text: 'Professional certification in 5G technologies and networking.',
        avatar: 'assets/images/testimonials/huawei5g.jpg'
      },
      {
        name: 'AWS Cloud Foundations',
        position: 'Certification',
        company: 'Amazon Web Services',
        text: 'Professional certification in AWS cloud technologies and services.',
        avatar: 'assets/images/testimonials/aws.jpg'
      }
    ]
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

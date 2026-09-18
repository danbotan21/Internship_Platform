export interface Opportunity {
  id: string
  title: string
  company: string
  location: string
  locationType: 'On-site' | 'Hybrid' | 'Remote'
  type: 'Full-time' | 'Part-time'
  duration: string
  durationCategory: '1-3 months' | '3-6 months' | '6+ months'
  field: string
  tags: string[]
  logoBg: string
  logoType: 'leaf' | 'code' | 'chart' | 'check'
  aboutCompany: string
  aboutInternship: string
  responsibilities: string[]
  requirements: string[]
  technologies: string[]
}

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Software Development Intern',
    company: 'GreenTech Solutions',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '3–6 months',
    durationCategory: '3-6 months',
    field: 'Software Engineering',
    tags: ['Software Engineering', 'Internship'],
    logoBg: 'bg-[#1b5e3a]',
    logoType: 'leaf',
    aboutCompany:
      'GreenTech Solutions is a technology company focused on creating innovative solutions for a more sustainable future. We develop digital products that help businesses reduce their environmental footprint and operate more efficiently.',
    aboutInternship:
      'Join our engineering team and work on real products that make a difference. As a Software Development Intern, you will collaborate with experienced developers, contribute to meaningful features, and gain hands-on experience with modern technologies.',
    responsibilities: [
      'Work on backend and/or frontend features',
      'Collaborate with the development team',
      'Write clean, maintainable code',
      'Participate in code reviews',
      'Learn and apply best practices',
    ],
    requirements: [
      'Currently enrolled in a relevant field (Computer Science, Software Engineering, etc.)',
      'Basic knowledge of C# and .NET (or C / C++)',
      'Eagerness to learn and a problem-solving mindset',
      'Good communication skills',
      'Passion for technology and sustainability',
    ],
    technologies: ['C#', '.NET', 'SQL', 'C++', 'Azure', 'Git', 'Docker'],
  },
  {
    id: '2',
    title: 'Frontend Intern',
    company: 'TechVision',
    location: 'Remote',
    locationType: 'Remote',
    type: 'Part-time',
    duration: '3 months',
    durationCategory: '1-3 months',
    field: 'Web Development',
    tags: ['Web Development', 'Internship'],
    logoBg: 'bg-[#2563eb]',
    logoType: 'code',
    aboutCompany:
      'TechVision is a leading digital studio crafting high-performance web and mobile applications for clients around the globe. We push the boundaries of user experience and visual design.',
    aboutInternship:
      'We are looking for an enthusiastic Frontend Intern to build responsive, modern interfaces using React and modern CSS. You will work closely with UI designers and senior frontend developers to deliver polished web experiences.',
    responsibilities: [
      'Develop scalable React components and web interfaces',
      'Translate UI design mockups into pixel-perfect web pages',
      'Optimize application performance and responsiveness',
      'Fix UI bugs and improve user accessibility',
      'Participate in daily standups and sprint planning',
    ],
    requirements: [
      'Proficiency in JavaScript/TypeScript, HTML5, and CSS3',
      'Familiarity with React and modern frontend build tools',
      'Understanding of responsive design principles',
      'Strong attention to detail and UI aesthetic sense',
      'Ability to work remotely and manage time effectively',
    ],
    technologies: [
      'TypeScript',
      'React',
      'JavaScript',
      'Tailwind CSS',
      'Vite',
      'Git',
      'REST API',
    ],
  },
  {
    id: '3',
    title: 'Data Analytics Intern',
    company: 'NextGen Analytics',
    location: 'Chișinău, MD',
    locationType: 'Hybrid',
    type: 'Full-time',
    duration: '6 months',
    durationCategory: '6+ months',
    field: 'Data & Analytics',
    tags: ['Data & Analytics', 'Internship'],
    logoBg: 'bg-[#0f172a]',
    logoType: 'chart',
    aboutCompany:
      'NextGen Analytics builds enterprise data pipelines, predictive AI models, and real-time visualization dashboards for global clients.',
    aboutInternship:
      'Gain hands-on experience building SQL queries, Python data analysis scripts, and Business Intelligence dashboards working directly with data engineers.',
    responsibilities: [
      'Analyze complex dataset queries using SQL and Python',
      'Build BI reports and automated data pipelines',
      'Assist senior data scientists with data cleaning and ETL process',
    ],
    requirements: [
      'Knowledge of Python, SQL, and basic statistical analysis',
      'Familiarity with Pandas, NumPy, or PowerBI',
      'Analytical mindset with strong problem-solving skills',
    ],
    technologies: ['Python', 'SQL', 'PowerBI', 'Pandas', 'PostgreSQL'],
  },
  {
    id: '4',
    title: 'QA Automation Intern',
    company: 'AlphaSystems',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '3 months',
    durationCategory: '1-3 months',
    field: 'Quality Assurance',
    tags: ['Quality Assurance', 'Internship'],
    logoBg: 'bg-[#ea580c]',
    logoType: 'check',
    aboutCompany:
      'AlphaSystems delivers high-reliability fintech software used by millions of transaction users.',
    aboutInternship:
      'Learn automated testing frameworks, write Java/Python automation test suites, and perform manual & API testing for enterprise web services.',
    responsibilities: [
      'Write end-to-end automation scripts using Java and Selenium',
      'Perform API integration testing with Postman',
      'Document bug reports and verify fix releases',
    ],
    requirements: [
      'Basic knowledge of Java or Python programming',
      'Understanding of software testing fundamentals',
      'Strong logical thinking and attention to edge cases',
    ],
    technologies: ['Java', 'Selenium', 'Python', 'Postman', 'Git'],
  },
]

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

// CV/Portfolio related models
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PersonalInfo {
    pub name: String,
    pub title: String,
    pub email: String,
    pub location: String,
    pub summary: String,
    pub about_me: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Experience {
    pub title: String,
    pub company: String,
    pub duration: String,
    pub description: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Education {
    pub degree: String,
    pub institution: String,
    pub year: String,
    pub gpa: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Skill {
    pub name: String,
    pub level: u8,
    pub category: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Project {
    pub name: String,
    pub description: String,
    pub technologies: Vec<String>,
    pub github_url: Option<String>,
    pub demo_url: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CVData {
    pub personal_info: PersonalInfo,
    pub experience: Vec<Experience>,
    pub education: Vec<Education>,
    pub skills: Vec<Skill>,
    pub projects: Vec<Project>,
}

// Future blog/API models
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BlogPost {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    pub content: String,
    pub excerpt: Option<String>,
    pub published: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tags: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateBlogPost {
    pub title: String,
    pub content: String,
    pub excerpt: Option<String>,
    pub published: bool,
    pub tags: Vec<String>,
}

// API response wrappers
#[derive(Serialize, Debug)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            message: Some(message),
        }
    }
}

impl Default for CVData {
    fn default() -> Self {
        CVData {
            personal_info: PersonalInfo {
                name: "DAVID AGHAYAN".to_string(),
                title: "Senior Software Engineer".to_string(),
                email: "dav88dev@gmail.com".to_string(),
                location: "International".to_string(),
                summary: "Results-driven Senior Software Engineer & Site Reliability Specialist with 10+ years building and scaling full-stack, AI-powered systems. Expert in PHP, Python, Vue.js, Laravel, MySQL, and DevOps. Proven track record delivering features that matter and keeping platforms up 24/7. Architected robust data pipelines, handled critical incidents, and raised performance across the stack. Obsessed with AI, intelligent agents, and machine learning. Passionate about real-time analytics and automation.".to_string(),
                about_me: "Over ten years building systems that deliver results, scale effortlessly, and stay rock-solid. I design, build, and maintain full-stack platforms-PHP, Laravel, Python, Vue.js, MySQL, and proven DevOps. My thing ? Making sure things stay fast, online, and ready to grow. I've led high-impact performance upgrades, built scalable data pipelines, and navigated tough production issues with a cool head. Lately, I'm diving deep into AI, intelligent agents, and automation-driving real-time systems to do more with less. Above all, I'm result-driven-every project, every line of code, every day. If you're building something bold and smart, I'm ready to make an impact.".to_string(),
            },
            experience: vec![
                Experience {
                    title: "Software Developer".to_string(),
                    company: "LenderHomePage.com (Remote, Anaheim, CA)".to_string(),
                    duration: "May 2018 – Current".to_string(),
                    description: vec![
                        "Maintained and enhanced production systems for enterprise clients".to_string(),
                        "Built high-impact features and collaborated with stakeholders".to_string(),
                        "Lead incident triage to maintain 24/7 uptime".to_string(),
                        "Customized solutions and improved system performance".to_string(),
                    ],
                },
                Experience {
                    title: "Full Stack Engineer".to_string(),
                    company: "GuestCompass (Remote, Netherlands)".to_string(),
                    duration: "Mar 2017 – Mar 2018".to_string(),
                    description: vec![
                        "Sole engineer & DevOps lead".to_string(),
                        "Developed Vue.js network apps, REST APIs (Laravel/Lumen/Symfony)".to_string(),
                        "Created modern MySQL schemas, migrations, unit tests, and legacy content migrations".to_string(),
                        "Delivered a hotel management platform deployed in 100+ EU hotels".to_string(),
                    ],
                },
                Experience {
                    title: "Back-end Developer".to_string(),
                    company: "Freelance".to_string(),
                    duration: "Feb 2016 – Mar 2017".to_string(),
                    description: vec![
                        "Python web scraping (BeautifulSoup, Scrapy)".to_string(),
                        "Full-stack LEMP/LAMP stack apps, RESTful APIs, SQL optimization".to_string(),
                        "Wrote unit/integration tests, managed modular customizations".to_string(),
                    ],
                },
                Experience {
                    title: "Back-end Developer".to_string(),
                    company: "I LIKE IT (Yerevan, Armenia)".to_string(),
                    duration: "Aug 2015 – Feb 2016".to_string(),
                    description: vec![
                        "Full-stack MySQL/PHP in LEMP/LAMP stack".to_string(),
                        "MVC design, module development, third-party vendor coordination".to_string(),
                        "Worked with Drupal, AJAX, JavaScript, and legacy system migrations".to_string(),
                    ],
                },
                Experience {
                    title: "Web Developer & System/Network Admin".to_string(),
                    company: "Self-employed (Yerevan)".to_string(),
                    duration: "Aug 2013 – Jul 2015".to_string(),
                    description: vec![
                        "Built PHP websites with frameworks/CMS".to_string(),
                        "JavaScript-heavy interactive frontends with jQuery/AJAX".to_string(),
                        "Bug fixing, user communication, frontend/backend development".to_string(),
                    ],
                },
            ],
            education: vec![
                Education {
                    degree: "MSc Informatics".to_string(),
                    institution: "National Polytechnic University of Armenia".to_string(),
                    year: "2020–2022".to_string(),
                    gpa: Some("Thesis: Stock Price Forecasting Tools Using ML".to_string()),
                },
                Education {
                    degree: "BSc Insurance".to_string(),
                    institution: "Armenian National Agrarian University".to_string(),
                    year: "2005–2009".to_string(),
                    gpa: Some("Actuarial Science and Insurance focus".to_string()),
                },
            ],
            skills: vec![
                Skill { name: "PHP".to_string(), level: 95, category: "Backend".to_string() },
                Skill { name: "Python".to_string(), level: 90, category: "Backend".to_string() },
                Skill { name: "JavaScript".to_string(), level: 92, category: "Frontend".to_string() },
                Skill { name: "Vue.js".to_string(), level: 88, category: "Frontend".to_string() },
                Skill { name: "Laravel".to_string(), level: 93, category: "Backend".to_string() },
                Skill { name: "MySQL".to_string(), level: 90, category: "Database".to_string() },
                Skill { name: "Docker".to_string(), level: 85, category: "DevOps".to_string() },
                Skill { name: "AWS".to_string(), level: 80, category: "DevOps".to_string() },
                Skill { name: "Go".to_string(), level: 75, category: "Backend".to_string() },
                Skill { name: "TensorFlow".to_string(), level: 70, category: "AI/ML".to_string() },
                Skill { name: "Kubernetes".to_string(), level: 78, category: "DevOps".to_string() },
                Skill { name: "Node.js".to_string(), level: 85, category: "Backend".to_string() },
            ],
            projects: vec![
                Project {
                    name: "Stock Price Forecasting ML Tool".to_string(),
                    description: "Machine learning system for stock price prediction using advanced algorithms and real-time data processing. Published thesis on Academia.edu".to_string(),
                    technologies: vec!["Python".to_string(), "TensorFlow".to_string(), "Machine Learning".to_string(), "Data Analysis".to_string()],
                    github_url: Some("https://github.com/dav88dev".to_string()),
                    demo_url: Some("https://www.dav88.dev/".to_string()),
                },
                Project {
                    name: "Hotel Management Platform".to_string(),
                    description: "Full-stack hotel management system deployed in 100+ EU hotels with Vue.js frontend and Laravel backend".to_string(),
                    technologies: vec!["Vue.js".to_string(), "Laravel".to_string(), "MySQL".to_string(), "REST APIs".to_string()],
                    github_url: Some("https://github.com/dav88dev".to_string()),
                    demo_url: None,
                },
                Project {
                    name: "Enterprise Production Systems".to_string(),
                    description: "Scalable production systems for enterprise clients with 24/7 uptime, real-time monitoring, and automated deployments".to_string(),
                    technologies: vec!["PHP".to_string(), "Python".to_string(), "DevOps".to_string(), "Monitoring".to_string()],
                    github_url: Some("https://github.com/dav88dev".to_string()),
                    demo_url: None,
                },
            ],
        }
    }
}
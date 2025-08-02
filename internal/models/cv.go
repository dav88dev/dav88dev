// Package models defines data structures for the portfolio website
package models

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

// CVData represents the complete CV data structure
type CVData struct {
	PersonalInfo PersonalInfo `json:"personal_info"`
	Experience   []Experience `json:"experience"`
	Education    []Education  `json:"education"`
	Skills       []Skill      `json:"skills"`
	Projects     []Project    `json:"projects"`
}

// PersonalInfo contains personal information
type PersonalInfo struct {
	Name     string `json:"name"`
	Title    string `json:"title"`
	Email    string `json:"email"`
	Location string `json:"location"`
	Summary  string `json:"summary"`
	AboutMe  string `json:"about_me"`
}

// Experience represents work experience
type Experience struct {
	Title       string   `json:"title"`
	Company     string   `json:"company"`
	Duration    string   `json:"duration"`
	Description []string `json:"description"`
}

// Education represents educational background
type Education struct {
	Degree      string `json:"degree"`
	Institution string `json:"institution"`
	Year        string `json:"year"`
	GPA         string `json:"gpa,omitempty"`
}

// Skill represents a technical skill
type Skill struct {
	Name       string `json:"name"`
	Category   string `json:"category"`
	Level      int    `json:"level"`
	Experience string `json:"experience"`
}

// Project represents a portfolio project
type Project struct {
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Technologies []string `json:"technologies"`
	GithubURL    string   `json:"github_url,omitempty"`
	DemoURL      string   `json:"demo_url,omitempty"`
}

// Assets represents the built frontend assets
type Assets struct {
	CSSMain      string `json:"css_main"`
	JSMain       string `json:"js_main"`
	JSThreeScene string `json:"js_three_scene"`
}

// TemplateData represents data passed to templates
type TemplateData struct {
	CVData   CVData `json:"cv_data"`
	Assets   Assets `json:"assets"`
	CSPNonce string `json:"csp_nonce"`
}

// LoadCVData loads CV data from multiple possible sources
func LoadCVData() (*CVData, error) {
	// Try to load from a JSON file first
	possiblePaths := []string{
		"cv_data.json",
		"data/cv_data.json",
		"static/data/cv_data.json",
	}

	for _, path := range possiblePaths {
		if data, err := loadFromFile(path); err == nil {
			return data, nil
		}
	}

	// Return default data if no file found
	return getDefaultCVData(), nil
}

// loadFromFile loads CV data from a JSON file with security checks
func loadFromFile(path string) (*CVData, error) {
	// Get the working directory
	workDir, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	// Get absolute path
	absPath, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}

	// Security: Ensure path is within project directory
	if !strings.HasPrefix(absPath, workDir) {
		return nil, os.ErrPermission
	}

	data, err := os.ReadFile(absPath)
	if err != nil {
		return nil, err
	}

	var cvData CVData
	err = json.Unmarshal(data, &cvData)
	if err != nil {
		return nil, err
	}

	return &cvData, nil
}

// getDefaultCVData returns realistic default CV data
func getDefaultCVData() *CVData {
	return &CVData{
		PersonalInfo: PersonalInfo{
			Name:     "DAVID AGHAYAN",
			Title:    "Senior Software Engineer",
			Email:    "info@dav88.dev",
			Location: "International",
			Summary:  "Results-driven Senior Software Engineer & Site Reliability Specialist with 10+ years building and scaling full-stack, AI-powered systems. Expert in PHP, Python, Vue.js, Laravel, MySQL, and DevOps. Proven track record delivering features that matter and keeping platforms up 24/7.",
			AboutMe:  "Over ten years building systems that deliver results, scale effortlessly, and stay rock-solid. I design, build, and maintain full-stack platforms-PHP, Laravel, Python, Vue.js, MySQL, and proven DevOps. My thing ? Making sure things stay fast, online, and ready to grow. I've led high-impact performance upgrades, built scalable data pipelines, and navigated tough production issues with a cool head. Lately, I'm diving deep into AI, intelligent agents, and automation-driving real-time systems to do more with less. Above all, I'm result-driven-every project, every line of code, every day. If you're building something bold and smart, I'm ready to make an impact.",
		},
		Experience: []Experience{
			{
				Title:    "Software Developer",
				Company:  "LenderHomePage.com (Remote, Anaheim, CA)",
				Duration: "May 2018 – Current",
				Description: []string{
					"Maintained and enhanced production systems for enterprise clients",
					"Built high-impact features and collaborated with stakeholders",
					"Lead incident triage to maintain 24/7 uptime",
					"Customized solutions and improved system performance",
				},
			},
			{
				Title:    "Full Stack Engineer",
				Company:  "GuestCompass (Remote, Netherlands)",
				Duration: "Mar 2017 – Mar 2018",
				Description: []string{
					"Sole engineer & DevOps lead",
					"Developed Vue.js network apps, REST APIs (Laravel/Lumen/Symfony)",
					"Created modern MySQL schemas, migrations, unit tests, and legacy content migrations",
					"Delivered a hotel management platform deployed in 100+ EU hotels",
				},
			},
			{
				Title:    "Back-end Developer",
				Company:  "Freelance",
				Duration: "Feb 2016 – Mar 2017",
				Description: []string{
					"Python web scraping (BeautifulSoup, Scrapy)",
					"Full-stack LEMP/LAMP stack apps, RESTful APIs, SQL optimization",
					"Wrote unit/integration tests, managed modular customizations",
				},
			},
		},
		Education: []Education{
			{
				Degree:      "MSc Informatics",
				Institution: "National Polytechnic University of Armenia",
				Year:        "2020–2022",
				GPA:         "Thesis: Stock Price Forecasting Tools Using ML",
			},
			{
				Degree:      "BSc Insurance",
				Institution: "Armenian National Agrarian University",
				Year:        "2005–2009",
				GPA:         "Actuarial Science and Insurance focus",
			},
		},
		Skills: []Skill{
			{Name: "PHP", Category: "Backend", Level: 10, Experience: "10+ years"},
			{Name: "Laravel", Category: "Backend", Level: 10, Experience: "8+ years"},
			{Name: "Python", Category: "Backend", Level: 9, Experience: "6+ years"},
			{Name: "Vue.js", Category: "Frontend", Level: 9, Experience: "5+ years"},
			{Name: "JavaScript", Category: "Frontend", Level: 9, Experience: "10+ years"},
			{Name: "MySQL", Category: "Database", Level: 9, Experience: "10+ years"},
			{Name: "DevOps", Category: "Infrastructure", Level: 8, Experience: "5+ years"},
			{Name: "AWS", Category: "Cloud", Level: 8, Experience: "4+ years"},
			{Name: "Machine Learning", Category: "AI", Level: 7, Experience: "3+ years"},
		},
		Projects: []Project{
			{
				Name:         "Stock Price Forecasting ML Tool",
				Description:  "Machine learning system for stock price prediction using advanced algorithms and real-time data processing. Published thesis on Academia.edu",
				Technologies: []string{"Python", "TensorFlow", "Machine Learning", "Data Analysis"},
				GithubURL:    "https://github.com/dav88dev",
				DemoURL:      "https://www.dav88.dev/",
			},
			{
				Name:         "Hotel Management Platform",
				Description:  "Full-stack hotel management system deployed in 100+ EU hotels with Vue.js frontend and Laravel backend",
				Technologies: []string{"Vue.js", "Laravel", "MySQL", "REST APIs"},
				GithubURL:    "https://github.com/dav88dev",
			},
			{
				Name:         "Enterprise Production Systems",
				Description:  "Scalable production systems for enterprise clients with 24/7 uptime, real-time monitoring, and automated deployments",
				Technologies: []string{"PHP", "Python", "DevOps", "Monitoring"},
				GithubURL:    "https://github.com/dav88dev",
			},
		},
	}
}

// LoadAssets loads the built frontend assets from Vite manifest
func LoadAssets() (*Assets, error) {
	// Load the Vite manifest to get asset paths
	manifestPath := "static/.vite/manifest.json"

	// Security check
	absPath, err := filepath.Abs(manifestPath)
	if err != nil {
		return getDefaultAssets(), nil
	}

	workDir, err := os.Getwd()
	if err != nil {
		return getDefaultAssets(), nil
	}

	if !strings.HasPrefix(absPath, workDir) {
		return getDefaultAssets(), nil
	}

	manifestData, err := os.ReadFile(manifestPath)
	if err != nil {
		// Return default paths if manifest not found
		return getDefaultAssets(), nil
	}

	var manifest map[string]interface{}
	err = json.Unmarshal(manifestData, &manifest)
	if err != nil {
		return nil, err
	}

	assets := &Assets{
		CSSMain:      "/static/css/style-vzPr3PIw.css", // Default fallback
		JSMain:       "/static/js/main-CpuuI82n.js",
		JSThreeScene: "/static/js/threeScene-1KqCK-lv.js",
	}

	// Extract actual asset paths from manifest
	if mainJS, ok := manifest["js/main.js"].(map[string]interface{}); ok {
		if file, ok := mainJS["file"].(string); ok {
			assets.JSMain = "/static/" + file
		}
		if css, ok := mainJS["css"].([]interface{}); ok && len(css) > 0 {
			if cssFile, ok := css[0].(string); ok {
				assets.CSSMain = "/static/" + cssFile
			}
		}
	}

	if threeJS, ok := manifest["js/three-scene.js"].(map[string]interface{}); ok {
		if file, ok := threeJS["file"].(string); ok {
			assets.JSThreeScene = "/static/" + file
		}
	}

	return assets, nil
}

// getDefaultAssets returns default asset paths
func getDefaultAssets() *Assets {
	return &Assets{
		CSSMain:      "/static/css/style-vzPr3PIw.css",
		JSMain:       "/static/js/main-CpuuI82n.js",
		JSThreeScene: "/static/js/threeScene-1KqCK-lv.js",
	}
}

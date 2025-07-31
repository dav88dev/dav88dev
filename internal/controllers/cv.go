package controllers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// CVController handles CV-related endpoints
type CVController struct {
	cvDataCache map[string]interface{} // Simple in-memory cache
}

// NewCVController creates a new CV controller instance
func NewCVController() *CVController {
	return &CVController{
		cvDataCache: make(map[string]interface{}),
	}
}

// CVResponse represents the structure of CV API responses
type CVResponse struct {
	Success bool                   `json:"success"`
	Data    map[string]interface{} `json:"data,omitempty"`
	Error   string                 `json:"error,omitempty"`
}

// GetCV returns the complete CV data
// GET /api/cv
func (cv *CVController) GetCV(c *gin.Context) {
	// Try to get from cache first
	if len(cv.cvDataCache) > 0 {
		c.JSON(http.StatusOK, CVResponse{
			Success: true,
			Data:    cv.cvDataCache,
		})
		return
	}
	
	// Load CV data from JSON file
	cvData, err := cv.loadCVData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, CVResponse{
			Success: false,
			Error:   "Failed to load CV data: " + err.Error(),
		})
		return
	}
	
	// Cache the data
	cv.cvDataCache = cvData
	
	c.JSON(http.StatusOK, CVResponse{
		Success: true,
		Data:    cvData,
	})
}

// GetCVSection returns a specific section of the CV
// GET /api/cv/:section
func (cv *CVController) GetCVSection(c *gin.Context) {
	section := c.Param("section")
	
	// Validate section parameter
	if !isValidSection(section) {
		c.JSON(http.StatusBadRequest, CVResponse{
			Success: false,
			Error:   "Invalid section parameter",
		})
		return
	}
	
	// Load CV data if not cached
	if len(cv.cvDataCache) == 0 {
		cvData, err := cv.loadCVData()
		if err != nil {
			c.JSON(http.StatusInternalServerError, CVResponse{
				Success: false,
				Error:   "Failed to load CV data: " + err.Error(),
			})
			return
		}
		cv.cvDataCache = cvData
	}
	
	// Get specific section
	if sectionData, exists := cv.cvDataCache[section]; exists {
		c.JSON(http.StatusOK, CVResponse{
			Success: true,
			Data: map[string]interface{}{
				section: sectionData,
			},
		})
		return
	}
	
	// Section not found
	c.JSON(http.StatusNotFound, CVResponse{
		Success: false,
		Error:   "CV section '" + section + "' not found",
	})
}

// loadCVData loads CV data from JSON file
// This will be migrated to MongoDB in future phases
func (cv *CVController) loadCVData() (map[string]interface{}, error) {
	// Try different possible CV data file locations
	possiblePaths := []string{
		"cv_data.json",
		"data/cv_data.json",
		"static/data/cv_data.json",
		"assets/cv_data.json",
	}
	
	var data map[string]interface{}
	
	// Get the working directory to ensure we only read from project
	workDir, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	
	for _, path := range possiblePaths {
		absPath, err := filepath.Abs(path)
		if err != nil {
			continue
		}
		
		// Security: Ensure path is within project directory
		if !strings.HasPrefix(absPath, workDir) {
			continue
		}
		
		fileData, err := os.ReadFile(absPath)
		if err != nil {
			continue
		}
		
		err = json.Unmarshal(fileData, &data)
		if err != nil {
			continue
		}
		
		// Successfully loaded data
		return data, nil
	}
	
	// If no file found, return mock data
	return cv.getMockCVData(), nil
}

// getMockCVData returns mock CV data for development
func (cv *CVController) getMockCVData() map[string]interface{} {
	return map[string]interface{}{
		"personal": map[string]interface{}{
			"name":     "DAV88DEV",
			"email":    "contact@dav88dev.com",
			"location": "Remote",
			"summary":  "Full-stack developer passionate about modern web technologies",
		},
		"experience": []map[string]interface{}{
			{
				"company":     "Tech Company",
				"role":        "Senior Developer",
				"start_date":  "2022-01-01",
				"end_date":    nil,
				"description": "Leading development team and architecting scalable solutions",
			},
		},
		"skills": []map[string]interface{}{
			{
				"name":       "Go",
				"category":   "Backend",
				"level":      9,
				"experience": "3+ years",
			},
			{
				"name":       "Rust",
				"category":   "Backend",
				"level":      8,
				"experience": "2+ years",
			},
			{
				"name":       "JavaScript/TypeScript",
				"category":   "Frontend",
				"level":      9,
				"experience": "5+ years",
			},
		},
		"projects": []map[string]interface{}{
			{
				"name":         "Personal Portfolio",
				"description":  "Modern portfolio website built with Rust/Go and modern frontend technologies",
				"technologies": []string{"Rust", "Go", "TypeScript", "Vite", "WASM"},
				"github_url":   "https://github.com/dav88dev/myWebsite",
			},
		},
	}
}

// isValidSection validates if the section parameter is allowed
func isValidSection(section string) bool {
	validSections := []string{
		"personal", "personal_info",
		"experience",
		"education",
		"skills",
		"projects",
		"certifications",
		"languages",
		"interests",
	}
	
	for _, valid := range validSections {
		if section == valid {
			return true
		}
	}
	return false
}
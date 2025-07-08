// Clean, Simple Skills Renderer - Elegant and Readable
use wasm_bindgen::prelude::*;
use web_sys::{HtmlCanvasElement, CanvasRenderingContext2d, console};
use glam::Vec2;
use serde::{Deserialize, Serialize};
use std::f32::consts::PI;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub name: String,
    pub category: String,
    pub color: String,
    pub description: String,
    pub years_experience: u8,
    pub connections: Vec<String>, // Skills that connect to this one
}

#[wasm_bindgen]
pub struct CleanSkillsRenderer {
    canvas: Option<HtmlCanvasElement>,
    context: Option<CanvasRenderingContext2d>,
    skills: Vec<Skill>,
    skill_positions: Vec<Vec2>,
    skill_sizes: Vec<f32>,
    animation_time: f32,
    canvas_width: f32,
    canvas_height: f32,
    hovered_skill: Option<usize>,
    is_initialized: bool,
}

#[wasm_bindgen]
impl CleanSkillsRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> CleanSkillsRenderer {
        CleanSkillsRenderer {
            canvas: None,
            context: None,
            skills: Vec::new(),
            skill_positions: Vec::new(),
            skill_sizes: Vec::new(),
            animation_time: 0.0,
            canvas_width: 800.0,
            canvas_height: 500.0,
            hovered_skill: None,
            is_initialized: false,
        }
    }

    #[wasm_bindgen]
    pub fn init(&mut self, canvas_id: &str) -> Result<(), JsValue> {
        console::log_1(&"🎨 Initializing Clean Skills Renderer...".into());

        // Create skills data with connections
        self.create_skills_data();

        // Get canvas element
        let window = web_sys::window().ok_or("No window object")?;
        let document = window.document().ok_or("No document object")?;
        let canvas_element = document
            .get_element_by_id(canvas_id)
            .ok_or("Canvas element not found")?;

        let canvas = canvas_element
            .dyn_into::<HtmlCanvasElement>()
            .map_err(|_| "Element is not a canvas")?;

        // Get 2D context
        let context = canvas
            .get_context("2d")?
            .ok_or("Failed to get 2D context")?
            .dyn_into::<CanvasRenderingContext2d>()?;

        // Set canvas size
        self.canvas_width = canvas.client_width() as f32;
        self.canvas_height = canvas.client_height() as f32;
        canvas.set_width(self.canvas_width as u32);
        canvas.set_height(self.canvas_height as u32);

        // Calculate skill positions in a clean grid
        self.calculate_skill_positions();

        self.canvas = Some(canvas);
        self.context = Some(context);
        self.is_initialized = true;

        console::log_1(&"✅ Clean Skills Renderer initialized!".into());
        Ok(())
    }

    fn create_skills_data(&mut self) {
        self.skills = vec![
            Skill {
                name: "PHP".to_string(),
                category: "Backend".to_string(),
                color: "#777BB4".to_string(),
                description: "Building robust web applications since 2014. Expert in modern PHP development with strong focus on clean architecture and performance.".to_string(),
                years_experience: 10,
                connections: vec!["Laravel".to_string(), "MySQL".to_string(), "Composer".to_string()],
            },
            Skill {
                name: "Laravel".to_string(),
                category: "Backend".to_string(),
                color: "#FF2D20".to_string(),
                description: "Laravel artisan since 2016. Built countless web applications, APIs, and microservices. Expert in Eloquent, Artisan, and the entire ecosystem.".to_string(),
                years_experience: 8,
                connections: vec!["PHP".to_string(), "MySQL".to_string(), "Vue.js".to_string(), "Redis".to_string()],
            },
            Skill {
                name: "JavaScript".to_string(),
                category: "Frontend".to_string(),
                color: "#F7DF1E".to_string(),
                description: "Full-stack JavaScript development since 2015. From vanilla JS to modern ES6+, building interactive web experiences that users love.".to_string(),
                years_experience: 9,
                connections: vec!["Vue.js".to_string(), "Node.js".to_string(), "TypeScript".to_string()],
            },
            Skill {
                name: "Rust".to_string(),
                category: "Systems".to_string(),
                color: "#CE422B".to_string(),
                description: "Systems programming with Rust since 2022. Built high-performance web services and WASM applications. This website is powered by Rust!".to_string(),
                years_experience: 2,
                connections: vec!["WebAssembly".to_string(), "Axum".to_string()],
            },
            Skill {
                name: "Vue.js".to_string(),
                category: "Frontend".to_string(),
                color: "#4FC08D".to_string(),
                description: "Vue.js developer since 2018. Love the simplicity and power of Vue ecosystem. Built production apps with Vuex, Vue Router, and Composition API.".to_string(),
                years_experience: 6,
                connections: vec!["JavaScript".to_string(), "Laravel".to_string(), "TypeScript".to_string()],
            },
            Skill {
                name: "Python".to_string(),
                category: "Backend".to_string(),
                color: "#3776AB".to_string(),
                description: "Python automation and web development since 2016. From Django applications to data processing scripts and machine learning pipelines.".to_string(),
                years_experience: 8,
                connections: vec!["Django".to_string(), "Machine Learning".to_string(), "Docker".to_string()],
            },
            Skill {
                name: "MySQL".to_string(),
                category: "Database".to_string(),
                color: "#4479A1".to_string(),
                description: "Database architect since 2014. Designed and optimized databases for high-traffic applications. Expert in complex queries, indexing, and performance tuning.".to_string(),
                years_experience: 10,
                connections: vec!["PHP".to_string(), "Laravel".to_string(), "PostgreSQL".to_string()],
            },
            Skill {
                name: "Docker".to_string(),
                category: "DevOps".to_string(),
                color: "#2496ED".to_string(),
                description: "Container orchestration expert since 2018. Streamlined deployment processes and built scalable microservices architectures with Docker and Kubernetes.".to_string(),
                years_experience: 6,
                connections: vec!["Kubernetes".to_string(), "AWS".to_string(), "Python".to_string()],
            },
            Skill {
                name: "AWS".to_string(),
                category: "DevOps".to_string(),
                color: "#FF9900".to_string(),
                description: "Cloud solutions architect since 2017. Built and managed scalable infrastructure on AWS. Expert in EC2, S3, RDS, Lambda, and CloudFormation.".to_string(),
                years_experience: 7,
                connections: vec!["Docker".to_string(), "Kubernetes".to_string(), "Terraform".to_string()],
            },
        ];
    }

    fn calculate_skill_positions(&mut self) {
        let skills_count = self.skills.len();
        let cols = 4; // 4 columns
        let rows = (skills_count + cols - 1) / cols;
        
        let margin = 80.0;
        let available_width = self.canvas_width - (margin * 2.0);
        let available_height = self.canvas_height - (margin * 2.0);
        
        let cell_width = available_width / cols as f32;
        let cell_height = available_height / rows as f32;
        
        self.skill_positions.clear();
        self.skill_sizes.clear();
        
        for (i, _skill) in self.skills.iter().enumerate() {
            let row = i / cols;
            let col = i % cols;
            
            let x = margin + (col as f32 * cell_width) + (cell_width / 2.0);
            let y = margin + (row as f32 * cell_height) + (cell_height / 2.0);
            
            self.skill_positions.push(Vec2::new(x, y));
            self.skill_sizes.push(40.0); // Base size
        }
    }

    #[wasm_bindgen]
    pub fn update(&mut self, delta_time: f32) {
        if !self.is_initialized {
            return;
        }
        
        self.animation_time += delta_time * 0.5; // Slower animation
        
        // Update skill sizes with gentle breathing animation
        for (i, base_size) in self.skill_sizes.iter_mut().enumerate() {
            let breathing = (self.animation_time * 2.0 + i as f32 * 0.5).sin() * 3.0;
            *base_size = 40.0 + breathing;
        }
    }

    #[wasm_bindgen]
    pub fn render(&self) -> Result<(), JsValue> {
        if !self.is_initialized {
            return Ok(());
        }

        let context = self.context.as_ref().ok_or("No context available")?;

        // Clear canvas with clean light background
        context.set_fill_style(&JsValue::from_str("#f8fafc"));
        context.fill_rect(0.0, 0.0, self.canvas_width as f64, self.canvas_height as f64);

        // Draw connection lines first (so they appear behind skills)
        if let Some(hovered_index) = self.hovered_skill {
            self.draw_connections(context, hovered_index)?;
        }

        // Draw skills
        for (i, (skill, pos)) in self.skills.iter().zip(self.skill_positions.iter()).enumerate() {
            let size = self.skill_sizes[i];
            let is_hovered = self.hovered_skill == Some(i);
            let is_connected = self.is_skill_connected(i);
            
            self.draw_skill(context, skill, pos, size, is_hovered, is_connected)?;
        }

        // Draw description box if hovering
        if let Some(hovered_index) = self.hovered_skill {
            self.draw_description(context, hovered_index)?;
        }

        Ok(())
    }

    fn draw_skill(&self, context: &CanvasRenderingContext2d, skill: &Skill, pos: &Vec2, size: f32, is_hovered: bool, is_connected: bool) -> Result<(), JsValue> {
        let radius = if is_hovered { size * 1.3 } else if is_connected { size * 1.1 } else { size };
        
        // Draw shadow
        context.set_fill_style(&JsValue::from_str("rgba(0, 0, 0, 0.1)"));
        context.begin_path();
        context.arc((pos.x + 3.0) as f64, (pos.y + 3.0) as f64, radius as f64, 0.0, PI as f64 * 2.0)?;
        context.fill();
        
        // Draw main circle with skill color
        context.set_fill_style(&JsValue::from_str(&skill.color));
        context.begin_path();
        context.arc(pos.x as f64, pos.y as f64, radius as f64, 0.0, PI as f64 * 2.0)?;
        context.fill();
        
        // Draw white border
        context.set_stroke_style(&JsValue::from_str("white"));
        context.set_line_width(if is_hovered { 4.0 } else { 2.0 });
        context.begin_path();
        context.arc(pos.x as f64, pos.y as f64, radius as f64, 0.0, PI as f64 * 2.0)?;
        context.stroke();
        
        // Draw skill name
        context.set_fill_style(&JsValue::from_str("white"));
        context.set_font(&format!("bold {}px Arial", if is_hovered { 14 } else { 12 }));
        context.set_text_align("center");
        context.set_text_baseline("middle");
        context.fill_text(&skill.name, pos.x as f64, pos.y as f64)?;
        
        Ok(())
    }

    fn draw_connections(&self, context: &CanvasRenderingContext2d, skill_index: usize) -> Result<(), JsValue> {
        let hovered_skill = &self.skills[skill_index];
        let hovered_pos = &self.skill_positions[skill_index];
        
        context.set_stroke_style(&JsValue::from_str(&hovered_skill.color));
        context.set_line_width(3.0);
        
        for connection_name in &hovered_skill.connections {
            if let Some(connected_index) = self.skills.iter().position(|s| &s.name == connection_name) {
                let connected_pos = &self.skill_positions[connected_index];
                
                // Draw animated line
                context.begin_path();
                context.move_to(hovered_pos.x as f64, hovered_pos.y as f64);
                context.line_to(connected_pos.x as f64, connected_pos.y as f64);
                context.stroke();
                
                // Draw arrowhead
                let angle = (connected_pos.y - hovered_pos.y).atan2(connected_pos.x - hovered_pos.x);
                let arrow_size = 10.0;
                let arrow_x = connected_pos.x - angle.cos() * 50.0;
                let arrow_y = connected_pos.y - angle.sin() * 50.0;
                
                context.begin_path();
                context.move_to(arrow_x as f64, arrow_y as f64);
                context.line_to((arrow_x - arrow_size * (angle - 0.5).cos()) as f64, (arrow_y - arrow_size * (angle - 0.5).sin()) as f64);
                context.line_to((arrow_x - arrow_size * (angle + 0.5).cos()) as f64, (arrow_y - arrow_size * (angle + 0.5).sin()) as f64);
                context.close_path();
                context.fill();
            }
        }
        
        Ok(())
    }

    fn draw_description(&self, context: &CanvasRenderingContext2d, skill_index: usize) -> Result<(), JsValue> {
        let skill = &self.skills[skill_index];
        
        // Description box
        let box_width = 300.0;
        let box_height = 80.0;
        let box_x = 20.0;
        let box_y = self.canvas_height - box_height - 20.0;
        
        // Draw box background
        context.set_fill_style(&JsValue::from_str("rgba(255, 255, 255, 0.95)"));
        context.set_stroke_style(&JsValue::from_str(&skill.color));
        context.set_line_width(2.0);
        context.fill_rect(box_x as f64, box_y as f64, box_width as f64, box_height as f64);
        context.stroke_rect(box_x as f64, box_y as f64, box_width as f64, box_height as f64);
        
        // Draw skill name
        context.set_fill_style(&JsValue::from_str(&skill.color));
        context.set_font("bold 16px Arial");
        context.set_text_align("left");
        context.fill_text(&skill.name, (box_x + 10.0) as f64, (box_y + 20.0) as f64)?;
        
        // Draw experience
        context.set_fill_style(&JsValue::from_str("#666"));
        context.set_font("12px Arial");
        context.fill_text(&format!("{} years experience", skill.years_experience), (box_x + 10.0) as f64, (box_y + 40.0) as f64)?;
        
        // Draw description (truncated)
        let truncated_desc = if skill.description.len() > 60 {
            format!("{}...", &skill.description[..57])
        } else {
            skill.description.clone()
        };
        context.fill_text(&truncated_desc, (box_x + 10.0) as f64, (box_y + 60.0) as f64)?;
        
        Ok(())
    }

    fn is_skill_connected(&self, skill_index: usize) -> bool {
        if let Some(hovered_index) = self.hovered_skill {
            let hovered_skill = &self.skills[hovered_index];
            let current_skill = &self.skills[skill_index];
            
            // Check if current skill is in hovered skill's connections
            hovered_skill.connections.contains(&current_skill.name) ||
            // Or if hovered skill is in current skill's connections
            current_skill.connections.contains(&hovered_skill.name)
        } else {
            false
        }
    }

    #[wasm_bindgen]
    pub fn handle_mouse_move(&mut self, x: f32, y: f32) {
        self.hovered_skill = None;
        
        for (i, pos) in self.skill_positions.iter().enumerate() {
            let distance = Vec2::new(x - pos.x, y - pos.y).length();
            if distance <= self.skill_sizes[i] + 10.0 {
                self.hovered_skill = Some(i);
                break;
            }
        }
    }

    #[wasm_bindgen]
    pub fn handle_mouse_leave(&mut self) {
        self.hovered_skill = None;
    }

    #[wasm_bindgen]
    pub fn resize(&mut self, width: u32, height: u32) {
        if let Some(canvas) = &self.canvas {
            self.canvas_width = width as f32;
            self.canvas_height = height as f32;
            canvas.set_width(width);
            canvas.set_height(height);
            self.calculate_skill_positions();
        }
    }

    #[wasm_bindgen]
    pub fn is_ready(&self) -> bool {
        self.is_initialized
    }
}
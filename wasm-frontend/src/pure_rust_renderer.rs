// Pure Rust 3D Renderer using wgpu - Alternative to Three.js
use wasm_bindgen::prelude::*;
use web_sys::{HtmlCanvasElement, console};
use glam::Vec3;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub name: String,
    pub level: u8,
    pub category: String,
    pub color: String,
}

#[wasm_bindgen]
pub struct PureRustRenderer {
    canvas: Option<HtmlCanvasElement>,
    skills: Vec<Skill>,
    is_initialized: bool,
    camera_position: Vec3,
    animation_time: f32,
    animation_mode: String,
}

#[wasm_bindgen]
impl PureRustRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> PureRustRenderer {
        PureRustRenderer {
            canvas: None,
            skills: Vec::new(),
            is_initialized: false,
            camera_position: Vec3::new(0.0, 0.0, 15.0),
            animation_time: 0.0,
            animation_mode: "orbit".to_string(),
        }
    }
    
    #[wasm_bindgen]
    pub fn init(&mut self, canvas_id: &str, skills_data: &str) -> Result<(), JsValue> {
        console::log_1(&"Initializing Pure Rust 3D Renderer...".into());
        
        // Parse skills data
        self.skills = serde_json::from_str(skills_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse skills: {}", e)))?;
        
        // Get canvas element
        let window = web_sys::window().ok_or("No window object")?;
        let document = window.document().ok_or("No document object")?;
        let canvas_element = document
            .get_element_by_id(canvas_id)
            .ok_or("Canvas element not found")?;
        
        self.canvas = Some(canvas_element.dyn_into::<HtmlCanvasElement>()
            .map_err(|_| "Element is not a canvas")?);
        
        // Initialize WebGPU context (simplified for demo)
        self.setup_webgpu_context()?;
        
        self.is_initialized = true;
        console::log_1(&"Pure Rust 3D Renderer initialized successfully!".into());
        
        Ok(())
    }
    
    fn setup_webgpu_context(&self) -> Result<(), JsValue> {
        // This would set up WebGPU context for pure Rust rendering
        // For now, we'll use a simplified approach
        console::log_1(&"WebGPU context setup (placeholder)".into());
        Ok(())
    }
    
    #[wasm_bindgen]
    pub fn set_animation_mode(&mut self, mode: &str) {
        self.animation_mode = mode.to_string();
        console::log_1(&format!("Animation mode set to: {}", mode).into());
    }
    
    #[wasm_bindgen]
    pub fn update(&mut self, delta_time: f32) -> js_sys::Array {
        self.animation_time += delta_time;
        
        let positions = self.calculate_skill_positions();
        
        // Convert positions to JavaScript array
        let js_array = js_sys::Array::new();
        for pos in positions {
            let pos_array = js_sys::Array::new();
            pos_array.push(&JsValue::from_f64(pos.x as f64));
            pos_array.push(&JsValue::from_f64(pos.y as f64));
            pos_array.push(&JsValue::from_f64(pos.z as f64));
            js_array.push(&pos_array);
        }
        
        js_array
    }
    
    fn calculate_skill_positions(&self) -> Vec<Vec3> {
        let skill_count = self.skills.len() as f32;
        let mut positions = Vec::new();
        
        for (i, _skill) in self.skills.iter().enumerate() {
            let pos = match self.animation_mode.as_str() {
                "orbit" => {
                    let angle = (i as f32 / skill_count) * std::f32::consts::PI * 2.0;
                    let radius = 6.0;
                    Vec3::new(
                        angle.cos() * radius,
                        angle.sin() * radius,
                        (self.animation_time * 0.5 + i as f32).sin() * 0.5
                    )
                }
                "float" => {
                    let seed = i as f32 * 0.1;
                    Vec3::new(
                        (seed * 13.7 + self.animation_time * 0.3).sin() * 8.0,
                        (seed * 17.3 + self.animation_time * 0.2).cos() * 6.0,
                        (seed * 23.1 + self.animation_time * 0.4).sin() * 4.0
                    )
                }
                "spiral" => {
                    let spiral_angle = i as f32 * 0.8 + self.animation_time * 0.1;
                    let spiral_radius = 3.0 + i as f32 * 0.5;
                    Vec3::new(
                        spiral_angle.cos() * spiral_radius,
                        i as f32 * 1.2 - 6.0,
                        spiral_angle.sin() * spiral_radius
                    )
                }
                _ => Vec3::ZERO
            };
            
            positions.push(pos);
        }
        
        positions
    }
    
    #[wasm_bindgen]
    pub fn render_to_canvas(&self) -> Result<(), JsValue> {
        if !self.is_initialized {
            return Err(JsValue::from_str("Renderer not initialized"));
        }
        
        // This would render the 3D scene to the canvas using pure Rust
        // For now, we'll use a placeholder that draws to 2D canvas
        self.render_2d_fallback()?;
        
        Ok(())
    }
    
    fn render_2d_fallback(&self) -> Result<(), JsValue> {
        let canvas = self.canvas.as_ref().ok_or("No canvas available")?;
        
        let context = canvas
            .get_context("2d")?
            .ok_or("Failed to get 2D context")?
            .dyn_into::<web_sys::CanvasRenderingContext2d>()?;
        
        // Clear canvas
        let width = canvas.width() as f64;
        let height = canvas.height() as f64;
        context.clear_rect(0.0, 0.0, width, height);
        
        // Set background
        context.set_fill_style(&JsValue::from_str("rgba(0, 0, 20, 0.1)"));
        context.fill_rect(0.0, 0.0, width, height);
        
        // Draw skills as circles (2D fallback)
        let positions = self.calculate_skill_positions();
        let center_x = width / 2.0;
        let center_y = height / 2.0;
        let scale = 20.0;
        
        for (_i, (skill, pos)) in self.skills.iter().zip(positions.iter()).enumerate() {
            let x = center_x + (pos.x as f64 * scale);
            let y = center_y + (pos.y as f64 * scale);
            let radius = 5.0 + (skill.level as f64 / 100.0) * 15.0;
            
            // Draw skill circle
            context.begin_path();
            context.arc(x, y, radius, 0.0, 2.0 * std::f64::consts::PI)?;
            context.set_fill_style(&JsValue::from_str(&skill.color));
            context.fill();
            
            // Draw skill name
            context.set_fill_style(&JsValue::from_str("white"));
            context.set_font("12px Arial");
            context.set_text_align("center");
            context.fill_text(&skill.name, x, y + radius + 15.0)?;
        }
        
        Ok(())
    }
    
    #[wasm_bindgen]
    pub fn get_skill_at_position(&self, x: f32, y: f32) -> Option<String> {
        // Simple hit testing for 2D fallback
        let positions = self.calculate_skill_positions();
        let canvas = self.canvas.as_ref()?;
        
        let width = canvas.width() as f32;
        let height = canvas.height() as f32;
        let center_x = width / 2.0;
        let center_y = height / 2.0;
        let scale = 20.0;
        
        for (skill, pos) in self.skills.iter().zip(positions.iter()) {
            let skill_x = center_x + (pos.x * scale);
            let skill_y = center_y + (pos.y * scale);
            let radius = 5.0 + (skill.level as f32 / 100.0) * 15.0;
            
            let distance = ((x - skill_x).powi(2) + (y - skill_y).powi(2)).sqrt();
            if distance <= radius {
                return Some(skill.name.clone());
            }
        }
        
        None
    }
    
    #[wasm_bindgen]
    pub fn is_ready(&self) -> bool {
        self.is_initialized
    }
    
    #[wasm_bindgen]
    pub fn get_skills_count(&self) -> usize {
        self.skills.len()
    }
}

// Helper function for color parsing
fn parse_hex_color(hex: &str) -> [f32; 3] {
    let hex = hex.trim_start_matches('#');
    if hex.len() == 6 {
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(0) as f32 / 255.0;
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(0) as f32 / 255.0;
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(0) as f32 / 255.0;
        [r, g, b]
    } else {
        [1.0, 1.0, 1.0] // White fallback
    }
}
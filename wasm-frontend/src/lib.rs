use wasm_bindgen::prelude::*;
use web_sys::{console, window, Element};
use js_sys::{Array, Object};
use serde::{Deserialize, Serialize};
use glam::Vec3;

// Modules
mod pure_rust_renderer;
mod simple_skills_renderer;
mod clean_skills_renderer;
pub use pure_rust_renderer::PureRustRenderer;
pub use simple_skills_renderer::SimpleSkillsRenderer;
pub use clean_skills_renderer::CleanSkillsRenderer;

// Enable logging and panic handling
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    
    console::log_1(&"WASM Frontend initialized!".into());
}

// Data structures matching our current CV data
#[derive(Serialize, Deserialize, Clone)]
pub struct Skill {
    pub name: String,
    pub level: u8,
    pub category: String,
    pub color: String,
}

#[derive(Serialize, Deserialize)]
pub struct CVData {
    pub name: String,
    pub title: String,
    pub email: String,
    pub phone: String,
    pub skills: Vec<Skill>,
}

// Skills visualization calculator (replaces skillsVisualization.js)
#[wasm_bindgen]
pub struct SkillsCalculator {
    skills: Vec<Skill>,
    positions: Vec<Vec3>,
    target_positions: Vec<Vec3>,
    animation_mode: String,
    time: f32,
}

#[wasm_bindgen]
impl SkillsCalculator {
    #[wasm_bindgen(constructor)]
    pub fn new(skills_data: &str) -> Result<SkillsCalculator, JsValue> {
        let skills: Vec<Skill> = serde_json::from_str(skills_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse skills: {}", e)))?;
        
        let skill_count = skills.len();
        let positions = vec![Vec3::ZERO; skill_count];
        let target_positions = vec![Vec3::ZERO; skill_count];
        
        Ok(SkillsCalculator {
            skills,
            positions,
            target_positions,
            animation_mode: "orbit".to_string(),
            time: 0.0,
        })
    }
    
    #[wasm_bindgen]
    pub fn set_animation_mode(&mut self, mode: &str) {
        self.animation_mode = mode.to_string();
        self.update_target_positions();
    }
    
    #[wasm_bindgen]
    pub fn update(&mut self, delta_time: f32) -> js_sys::Array {
        self.time += delta_time;
        
        // Update target positions based on animation mode
        self.update_target_positions();
        
        // Smooth interpolation to target positions
        for i in 0..self.positions.len() {
            self.positions[i] = self.positions[i].lerp(self.target_positions[i], 0.02);
            
            // Add floating animation
            let float_offset = (self.time * 2.0 + i as f32).sin() * 0.2;
            self.positions[i].y += float_offset;
        }
        
        // Convert to JavaScript array format
        let result = Array::new();
        for pos in &self.positions {
            let pos_array = Array::new();
            pos_array.push(&JsValue::from_f64(pos.x as f64));
            pos_array.push(&JsValue::from_f64(pos.y as f64));
            pos_array.push(&JsValue::from_f64(pos.z as f64));
            result.push(&pos_array);
        }
        
        result
    }
    
    fn update_target_positions(&mut self) {
        let skill_count = self.skills.len() as f32;
        
        for (i, target_pos) in self.target_positions.iter_mut().enumerate() {
            match self.animation_mode.as_str() {
                "orbit" => {
                    let angle = (i as f32 / skill_count) * std::f32::consts::PI * 2.0;
                    let radius = 6.0;
                    target_pos.x = angle.cos() * radius;
                    target_pos.y = angle.sin() * radius;
                    target_pos.z = 0.0;
                }
                "float" => {
                    // Pseudo-random positioning based on skill index
                    let seed = i as f32 * 0.1;
                    target_pos.x = (seed * 13.7).sin() * 8.0;
                    target_pos.y = (seed * 17.3).cos() * 6.0;
                    target_pos.z = (seed * 23.1).sin() * 4.0;
                }
                "spiral" => {
                    let spiral_angle = i as f32 * 0.8;
                    let spiral_radius = 3.0 + i as f32 * 0.5;
                    target_pos.x = spiral_angle.cos() * spiral_radius;
                    target_pos.y = i as f32 * 1.2 - 6.0;
                    target_pos.z = spiral_angle.sin() * spiral_radius;
                }
                _ => {}
            }
        }
    }
    
    #[wasm_bindgen]
    pub fn get_hover_info(&self, _mouse_x: f32, _mouse_y: f32, _camera_matrix: &str) -> JsValue {
        // Simplified raycasting - in a real implementation, you'd want proper
        // 3D raycasting with the camera matrix
        
        // For now, return the first skill for demonstration
        if !self.skills.is_empty() {
            let skill = &self.skills[0];
            let info = Object::new();
            js_sys::Reflect::set(&info, &"name".into(), &skill.name.clone().into()).unwrap();
            js_sys::Reflect::set(&info, &"level".into(), &JsValue::from_f64(skill.level as f64)).unwrap();
            js_sys::Reflect::set(&info, &"category".into(), &skill.category.clone().into()).unwrap();
            info.into()
        } else {
            JsValue::NULL
        }
    }
    
    #[wasm_bindgen]
    pub fn get_skills_count(&self) -> usize {
        self.skills.len()
    }
    
    #[wasm_bindgen]
    pub fn get_skill_data(&self, index: usize) -> JsValue {
        if let Some(skill) = self.skills.get(index) {
            serde_wasm_bindgen::to_value(skill).unwrap_or(JsValue::NULL)
        } else {
            JsValue::NULL
        }
    }
}

// Main application state manager
#[wasm_bindgen]
pub struct WasmApp {
    skills_calculator: Option<SkillsCalculator>,
    is_initialized: bool,
}

#[wasm_bindgen]
impl WasmApp {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmApp {
        WasmApp {
            skills_calculator: None,
            is_initialized: false,
        }
    }
    
    #[wasm_bindgen]
    pub fn init(&mut self, cv_data: &str) -> Result<(), JsValue> {
        console::log_1(&"Initializing WASM App...".into());
        
        // Parse CV data and create skills calculator
        let skills_calculator = SkillsCalculator::new(cv_data)?;
        self.skills_calculator = Some(skills_calculator);
        self.is_initialized = true;
        
        console::log_1(&"WASM App initialized successfully!".into());
        Ok(())
    }
    
    #[wasm_bindgen]
    pub fn update_skills(&mut self, delta_time: f32) -> js_sys::Array {
        if let Some(calculator) = &mut self.skills_calculator {
            calculator.update(delta_time)
        } else {
            Array::new()
        }
    }
    
    #[wasm_bindgen]
    pub fn set_skills_animation_mode(&mut self, mode: &str) {
        if let Some(calculator) = &mut self.skills_calculator {
            calculator.set_animation_mode(mode);
        }
    }
    
    #[wasm_bindgen]
    pub fn handle_mouse_hover(&self, x: f32, y: f32) -> JsValue {
        if let Some(calculator) = &self.skills_calculator {
            calculator.get_hover_info(x, y, "")
        } else {
            JsValue::NULL
        }
    }
    
    #[wasm_bindgen]
    pub fn is_ready(&self) -> bool {
        self.is_initialized
    }
}

// Utility functions for DOM interaction
#[wasm_bindgen]
pub fn log(s: &str) {
    console::log_1(&s.into());
}

#[wasm_bindgen]
pub fn get_element_by_id(id: &str) -> Option<Element> {
    let window = window()?;
    let document = window.document()?;
    document.get_element_by_id(id)
}

// Export functions for JavaScript interop
#[wasm_bindgen]
extern "C" {
    // Bind to Three.js functions if needed
    #[wasm_bindgen(js_namespace = THREE)]
    type Vector3;
    
    #[wasm_bindgen(js_namespace = THREE)]
    type Scene;
}
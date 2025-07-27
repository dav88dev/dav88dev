// Simple, 100% Reliable WASM Skills Renderer - No Three.js Dependencies
use glam::Vec2;
use serde::{Deserialize, Serialize};
use std::f32::consts::PI;
use wasm_bindgen::prelude::*;
use web_sys::{console, window, CanvasRenderingContext2d, HtmlCanvasElement};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub name: String,
    pub level: u8,
    pub category: String,
    pub color: String,
}

#[wasm_bindgen]
pub struct SimpleSkillsRenderer {
    canvas: Option<HtmlCanvasElement>,
    context: Option<CanvasRenderingContext2d>,
    skills: Vec<Skill>,
    skill_positions: Vec<Vec2>,
    target_positions: Vec<Vec2>,
    animation_time: f32,
    animation_mode: String,
    canvas_width: f32,
    canvas_height: f32,
    center_x: f32,
    center_y: f32,
    is_initialized: bool,
}

#[wasm_bindgen]
impl SimpleSkillsRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> SimpleSkillsRenderer {
        SimpleSkillsRenderer {
            canvas: None,
            context: None,
            skills: Vec::new(),
            skill_positions: Vec::new(),
            target_positions: Vec::new(),
            animation_time: 0.0,
            animation_mode: "orbit".to_string(),
            canvas_width: 800.0,
            canvas_height: 600.0,
            center_x: 400.0,
            center_y: 300.0,
            is_initialized: false,
        }
    }

    #[wasm_bindgen]
    pub fn init(&mut self, canvas_id: &str, skills_data: &str) -> Result<(), JsValue> {
        console::log_1(&"Initializing Simple Skills Renderer...".into());

        // Parse skills data
        self.skills = serde_json::from_str(skills_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse skills: {}", e)))?;

        // Get canvas element
        let window = window().ok_or("No window object")?;
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

        self.center_x = self.canvas_width / 2.0;
        self.center_y = self.canvas_height / 2.0;

        // Initialize skill positions
        let skill_count = self.skills.len();
        self.skill_positions = vec![Vec2::new(self.center_x, self.center_y); skill_count];
        self.target_positions = vec![Vec2::new(self.center_x, self.center_y); skill_count];

        self.canvas = Some(canvas);
        self.context = Some(context);
        self.is_initialized = true;

        self.update_target_positions();

        console::log_1(&"Simple Skills Renderer initialized successfully!".into());
        Ok(())
    }

    #[wasm_bindgen]
    pub fn set_animation_mode(&mut self, mode: &str) {
        self.animation_mode = mode.to_string();
        self.update_target_positions();
        console::log_1(&format!("Animation mode set to: {}", mode).into());
    }

    #[wasm_bindgen]
    pub fn update(&mut self, delta_time: f32) {
        if !self.is_initialized {
            return;
        }

        self.animation_time += delta_time;

        // Update target positions based on animation mode
        self.update_target_positions();

        // Smooth interpolation to target positions
        for i in 0..self.skill_positions.len() {
            let current = self.skill_positions[i];
            let target = self.target_positions[i];

            // Lerp with smooth easing
            let lerp_speed = 0.05;
            self.skill_positions[i] = current.lerp(target, lerp_speed);

            // Add floating animation
            let float_offset = (self.animation_time * 2.0 + i as f32 * 0.5).sin() * 10.0;
            self.skill_positions[i].y += float_offset;
        }
    }

    fn update_target_positions(&mut self) {
        let skill_count = self.skills.len() as f32;
        let radius = (self.canvas_width.min(self.canvas_height) * 0.3).min(200.0);

        for (i, target_pos) in self.target_positions.iter_mut().enumerate() {
            match self.animation_mode.as_str() {
                "orbit" => {
                    let angle = (i as f32 / skill_count) * PI * 2.0 + self.animation_time * 0.2;
                    target_pos.x = self.center_x + angle.cos() * radius;
                    target_pos.y = self.center_y + angle.sin() * radius;
                }
                "grid" => {
                    let cols = (skill_count.sqrt().ceil()) as usize;
                    let row = i / cols;
                    let col = i % cols;
                    let spacing = radius * 0.8;

                    target_pos.x =
                        self.center_x - (cols as f32 * spacing / 2.0) + (col as f32 * spacing);
                    target_pos.y =
                        self.center_y - (row as f32 * spacing / 2.0) + (row as f32 * spacing);
                }
                "wave" => {
                    let x_spacing = self.canvas_width / skill_count;
                    target_pos.x = i as f32 * x_spacing + x_spacing / 2.0;
                    target_pos.y =
                        self.center_y + (i as f32 * 0.8 + self.animation_time).sin() * radius * 0.5;
                }
                "spiral" => {
                    let spiral_angle = i as f32 * 0.5 + self.animation_time * 0.1;
                    let spiral_radius = (i as f32 * 20.0 + 50.0).min(radius);
                    target_pos.x = self.center_x + spiral_angle.cos() * spiral_radius;
                    target_pos.y = self.center_y + spiral_angle.sin() * spiral_radius;
                }
                _ => {
                    // Default to orbit
                    let angle = (i as f32 / skill_count) * PI * 2.0;
                    target_pos.x = self.center_x + angle.cos() * radius;
                    target_pos.y = self.center_y + angle.sin() * radius;
                }
            }
        }
    }

    #[wasm_bindgen]
    pub fn render(&self) -> Result<(), JsValue> {
        if !self.is_initialized {
            return Ok(());
        }

        let context = self.context.as_ref().ok_or("No context available")?;

        // Clear canvas with dark background
        context.set_fill_style(&JsValue::from_str("rgba(0, 10, 30, 0.95)"));
        context.fill_rect(
            0.0,
            0.0,
            self.canvas_width as f64,
            self.canvas_height as f64,
        );

        // Draw constellation lines
        self.draw_constellation_lines(context)?;

        // Draw skills
        for (i, (skill, pos)) in self
            .skills
            .iter()
            .zip(self.skill_positions.iter())
            .enumerate()
        {
            self.draw_skill(context, skill, pos, i)?;
        }

        // Draw particles
        self.draw_particles(context)?;

        Ok(())
    }

    fn draw_constellation_lines(&self, context: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        context.set_stroke_style(&JsValue::from_str("rgba(99, 102, 241, 0.2)"));
        context.set_line_width(1.0);

        for i in 0..self.skill_positions.len() {
            for j in (i + 1)..self.skill_positions.len() {
                let pos1 = self.skill_positions[i];
                let pos2 = self.skill_positions[j];
                let distance = pos1.distance(pos2);

                if distance < 150.0 {
                    let alpha = (1.0 - distance / 150.0) * 0.3;
                    context.set_stroke_style(&JsValue::from_str(&format!(
                        "rgba(99, 102, 241, {})",
                        alpha
                    )));

                    context.begin_path();
                    context.move_to(pos1.x as f64, pos1.y as f64);
                    context.line_to(pos2.x as f64, pos2.y as f64);
                    context.stroke();
                }
            }
        }

        Ok(())
    }

    fn draw_skill(
        &self,
        context: &CanvasRenderingContext2d,
        skill: &Skill,
        pos: &Vec2,
        index: usize,
    ) -> Result<(), JsValue> {
        let radius = 8.0 + (skill.level as f32 / 100.0) * 25.0;
        let pulse = (self.animation_time * 3.0 + index as f32 * 0.5).sin() * 0.1 + 1.0;
        let animated_radius = radius * pulse;

        // Draw outer glow (simplified)
        context.set_fill_style(&JsValue::from_str("rgba(99, 102, 241, 0.2)"));
        context.begin_path();
        context.arc(
            pos.x as f64,
            pos.y as f64,
            animated_radius as f64 * 2.0,
            0.0,
            PI as f64 * 2.0,
        )?;
        context.fill();

        // Draw main circle
        context.set_fill_style(&JsValue::from_str(&skill.color));
        context.begin_path();
        context.arc(
            pos.x as f64,
            pos.y as f64,
            animated_radius as f64,
            0.0,
            PI as f64 * 2.0,
        )?;
        context.fill();

        // Draw inner highlight
        context.set_fill_style(&JsValue::from_str("rgba(255, 255, 255, 0.3)"));
        context.begin_path();
        context.arc(
            (pos.x - animated_radius * 0.3) as f64,
            (pos.y - animated_radius * 0.3) as f64,
            (animated_radius * 0.4) as f64,
            0.0,
            PI as f64 * 2.0,
        )?;
        context.fill();

        // Draw skill name
        context.set_fill_style(&JsValue::from_str("white"));
        context.set_font("12px Arial");
        context.set_text_align("center");
        context.fill_text(
            &skill.name,
            pos.x as f64,
            (pos.y + animated_radius + 20.0) as f64,
        )?;

        // Draw level indicator
        context.set_fill_style(&JsValue::from_str("rgba(255, 255, 255, 0.8)"));
        context.set_font("10px Arial");
        context.fill_text(
            &format!("{}%", skill.level),
            pos.x as f64,
            (pos.y + animated_radius + 35.0) as f64,
        )?;

        Ok(())
    }

    fn draw_particles(&self, context: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        context.set_fill_style(&JsValue::from_str("rgba(255, 255, 255, 0.6)"));

        for i in 0..20 {
            let x = (self.animation_time * 0.5 + i as f32 * 0.1).sin() * self.canvas_width * 0.4
                + self.center_x;
            let y = (self.animation_time * 0.3 + i as f32 * 0.2).cos() * self.canvas_height * 0.4
                + self.center_y;
            let size = (self.animation_time * 2.0 + i as f32).sin().abs() * 2.0 + 1.0;

            context.begin_path();
            context.arc(x as f64, y as f64, size as f64, 0.0, PI as f64 * 2.0)?;
            context.fill();
        }

        Ok(())
    }

    #[wasm_bindgen]
    pub fn get_skill_at_position(&self, x: f32, y: f32) -> Option<String> {
        for (skill, pos) in self.skills.iter().zip(self.skill_positions.iter()) {
            let radius = 8.0 + (skill.level as f32 / 100.0) * 25.0;
            let distance = Vec2::new(x - pos.x, y - pos.y).length();

            if distance <= radius * 1.5 {
                return Some(skill.name.clone());
            }
        }
        None
    }

    #[wasm_bindgen]
    pub fn get_skill_info(&self, skill_name: &str) -> JsValue {
        if let Some(skill) = self.skills.iter().find(|s| s.name == skill_name) {
            let info = js_sys::Object::new();
            js_sys::Reflect::set(&info, &"name".into(), &skill.name.clone().into()).unwrap();
            js_sys::Reflect::set(
                &info,
                &"level".into(),
                &JsValue::from_f64(skill.level as f64),
            )
            .unwrap();
            js_sys::Reflect::set(&info, &"category".into(), &skill.category.clone().into())
                .unwrap();
            js_sys::Reflect::set(&info, &"color".into(), &skill.color.clone().into()).unwrap();
            info.into()
        } else {
            JsValue::NULL
        }
    }

    #[wasm_bindgen]
    pub fn resize(&mut self, width: u32, height: u32) {
        if let Some(canvas) = &self.canvas {
            self.canvas_width = width as f32;
            self.canvas_height = height as f32;
            self.center_x = self.canvas_width / 2.0;
            self.center_y = self.canvas_height / 2.0;

            canvas.set_width(width);
            canvas.set_height(height);

            self.update_target_positions();
        }
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

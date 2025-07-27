use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, Element, HtmlCanvasElement, HtmlElement};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub name: String,
    pub level: u8,
    pub category: String,
    pub color: String,
    pub x: f32,
    pub y: f32,
    pub base_x: f32,
    pub base_y: f32,
    pub description: String,
}

#[derive(Debug, Clone)]
pub struct Connection {
    pub from: String,
    pub to: String,
}

#[wasm_bindgen]
pub struct FullWasmRenderer {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    skills: Vec<Skill>,
    connections: Vec<Connection>,
    animation_time: f32,
    hovered_skill_index: Option<usize>,
    mouse_x: f32,
    mouse_y: f32,
    canvas_width: f32,
    canvas_height: f32,
}

#[wasm_bindgen]
impl FullWasmRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_id: &str) -> Result<FullWasmRenderer, JsValue> {
        let document = web_sys::window().unwrap().document().unwrap();
        let canvas = document
            .get_element_by_id(canvas_id)
            .ok_or_else(|| JsValue::from_str("Canvas not found"))?
            .dyn_into::<HtmlCanvasElement>()?;

        let ctx = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()?;

        // Initialize skills with exact same data as JavaScript
        let skills = vec![
            Skill {
                name: "ML".to_string(),
                level: 85,
                category: "AI/ML".to_string(),
                color: "#f59e0b".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Machine Learning expertise with TensorFlow and more".to_string(),
            },
            Skill {
                name: "PHP".to_string(),
                level: 95,
                category: "Backend".to_string(),
                color: "#777BB4".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Backend development with 10+ years experience".to_string(),
            },
            Skill {
                name: "Laravel".to_string(),
                level: 93,
                category: "Backend".to_string(),
                color: "#FF2D20".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Full-stack Laravel development since 2016".to_string(),
            },
            Skill {
                name: "JavaScript".to_string(),
                level: 92,
                category: "Frontend".to_string(),
                color: "#F7DF1E".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Frontend and Node.js development".to_string(),
            },
            Skill {
                name: "Rust".to_string(),
                level: 80,
                category: "Backend".to_string(),
                color: "#CE422B".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Systems programming and WebAssembly".to_string(),
            },
            Skill {
                name: "Vue.js".to_string(),
                level: 88,
                category: "Frontend".to_string(),
                color: "#4FC08D".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Modern reactive frontend frameworks".to_string(),
            },
            Skill {
                name: "Python".to_string(),
                level: 90,
                category: "Backend".to_string(),
                color: "#3776AB".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Data science and backend automation".to_string(),
            },
            Skill {
                name: "MySQL".to_string(),
                level: 90,
                category: "Database".to_string(),
                color: "#4479A1".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Database design and optimization".to_string(),
            },
            Skill {
                name: "Docker".to_string(),
                level: 85,
                category: "DevOps".to_string(),
                color: "#2496ED".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Containerization and DevOps".to_string(),
            },
            Skill {
                name: "AWS".to_string(),
                level: 82,
                category: "DevOps".to_string(),
                color: "#FF9900".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Cloud infrastructure and services".to_string(),
            },
            Skill {
                name: "Kubernetes".to_string(),
                level: 78,
                category: "DevOps".to_string(),
                color: "#326CE5".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Container orchestration".to_string(),
            },
            Skill {
                name: "Redis".to_string(),
                level: 85,
                category: "Database".to_string(),
                color: "#DC382D".to_string(),
                x: 0.0,
                y: 0.0,
                base_x: 0.0,
                base_y: 0.0,
                description: "Caching and session management".to_string(),
            },
        ];

        // Initialize connections
        let connections = vec![
            Connection {
                from: "PHP".to_string(),
                to: "Laravel".to_string(),
            },
            Connection {
                from: "Laravel".to_string(),
                to: "MySQL".to_string(),
            },
            Connection {
                from: "JavaScript".to_string(),
                to: "Vue.js".to_string(),
            },
            Connection {
                from: "Python".to_string(),
                to: "AWS".to_string(),
            },
            Connection {
                from: "Docker".to_string(),
                to: "Kubernetes".to_string(),
            },
            Connection {
                from: "MySQL".to_string(),
                to: "Redis".to_string(),
            },
            Connection {
                from: "AWS".to_string(),
                to: "Docker".to_string(),
            },
            Connection {
                from: "Rust".to_string(),
                to: "JavaScript".to_string(),
            },
            Connection {
                from: "PHP".to_string(),
                to: "JavaScript".to_string(),
            },
            Connection {
                from: "Python".to_string(),
                to: "Docker".to_string(),
            },
        ];

        let rect = canvas.get_bounding_client_rect();
        let canvas_width = rect.width() as f32;
        let canvas_height = rect.height() as f32;

        let mut renderer = FullWasmRenderer {
            canvas,
            ctx,
            skills,
            connections,
            animation_time: 0.0,
            hovered_skill_index: None,
            mouse_x: 0.0,
            mouse_y: 0.0,
            canvas_width,
            canvas_height,
        };

        renderer.setup_canvas_size()?;
        renderer.initialize_skill_positions();

        Ok(renderer)
    }

    fn setup_canvas_size(&mut self) -> Result<(), JsValue> {
        let rect = self.canvas.get_bounding_client_rect();
        let device_pixel_ratio = web_sys::window().unwrap().device_pixel_ratio();

        let width = rect.width() * device_pixel_ratio;
        let height = rect.height() * device_pixel_ratio;

        self.canvas.set_width(width as u32);
        self.canvas.set_height(height as u32);

        self.ctx.scale(device_pixel_ratio, device_pixel_ratio)?;

        self.canvas
            .style()
            .set_property("width", &format!("{}px", rect.width()))?;
        self.canvas
            .style()
            .set_property("height", &format!("{}px", rect.height()))?;

        self.canvas_width = rect.width() as f32;
        self.canvas_height = rect.height() as f32;

        Ok(())
    }

    fn initialize_skill_positions(&mut self) {
        let center_x = self.canvas_width / 2.0;
        let center_y = self.canvas_height / 2.0;
        let radius = f32::min(center_x, center_y) * 0.6;

        // Central ML skill
        self.skills[0].base_x = center_x;
        self.skills[0].base_y = center_y;

        // Orbiting skills
        for i in 1..self.skills.len() {
            let angle =
                ((i - 1) as f32 / (self.skills.len() - 1) as f32) * std::f32::consts::PI * 2.0;
            self.skills[i].base_x = center_x + angle.cos() * radius;
            self.skills[i].base_y = center_y + angle.sin() * radius;
        }
    }

    #[wasm_bindgen]
    pub fn render(&mut self, delta_time: f32) -> Result<(), JsValue> {
        self.animation_time += delta_time;

        // Update skill positions with floating animation
        for (index, skill) in self.skills.iter_mut().enumerate() {
            let time = self.animation_time + index as f32 * 0.5;
            let float_amount = if skill.name == "ML" { 4.0 } else { 8.0 };
            let float_speed = if skill.name == "ML" { 3.0 } else { 6.0 };

            skill.x = skill.base_x + (time * 0.8).sin() * float_amount;
            skill.y = skill.base_y + (time * 0.6).cos() * float_speed;
        }

        // Clear canvas
        self.ctx.clear_rect(
            0.0,
            0.0,
            self.canvas_width as f64,
            self.canvas_height as f64,
        );

        // Set background
        self.ctx.set_fill_style(&JsValue::from_str("#f8fafc"));
        self.ctx.fill_rect(
            0.0,
            0.0,
            self.canvas_width as f64,
            self.canvas_height as f64,
        );

        // Draw connections
        self.draw_connections()?;

        // Draw skills
        self.draw_skills()?;

        Ok(())
    }

    fn draw_connections(&self) -> Result<(), JsValue> {
        for connection in &self.connections {
            let from_skill = self.skills.iter().find(|s| s.name == connection.from);
            let to_skill = self.skills.iter().find(|s| s.name == connection.to);

            if let (Some(from), Some(to)) = (from_skill, to_skill) {
                let is_highlighted = if let Some(hovered_idx) = self.hovered_skill_index {
                    self.skills[hovered_idx].name == from.name
                        || self.skills[hovered_idx].name == to.name
                } else {
                    false
                };

                self.ctx.begin_path();
                self.ctx.move_to(from.x as f64, from.y as f64);
                self.ctx.line_to(to.x as f64, to.y as f64);

                if is_highlighted {
                    self.ctx.set_stroke_style(&JsValue::from_str("#6366f1"));
                    self.ctx.set_line_width(3.0);
                } else {
                    self.ctx
                        .set_stroke_style(&JsValue::from_str("rgba(99, 102, 241, 0.2)"));
                    self.ctx.set_line_width(1.0);
                }

                self.ctx.stroke();
            }
        }
        Ok(())
    }

    fn draw_skills(&self) -> Result<(), JsValue> {
        for (index, skill) in self.skills.iter().enumerate() {
            let is_hovered = self.hovered_skill_index == Some(index);
            let is_central = skill.name == "ML";
            let base_radius = if is_central { 45.0 } else { 30.0 };
            let radius = if is_hovered {
                base_radius * 1.2
            } else {
                base_radius
            };

            // Skill circle with glow effect
            self.ctx.begin_path();
            self.ctx.arc(
                skill.x as f64,
                skill.y as f64,
                radius as f64,
                0.0,
                std::f64::consts::PI * 2.0,
            )?;

            if is_hovered {
                self.ctx.set_shadow_color(&skill.color);
                self.ctx.set_shadow_blur(20.0);
            }

            self.ctx.set_fill_style(&JsValue::from_str(&skill.color));
            self.ctx.fill();

            // Reset shadow
            self.ctx.set_shadow_blur(0.0);

            // Skill text
            let text_color = if skill.color == "#F7DF1E" || skill.color == "#f59e0b" {
                "#000"
            } else {
                "#fff"
            };
            self.ctx.set_fill_style(&JsValue::from_str(text_color));

            let font_size = if is_hovered {
                if is_central {
                    16
                } else {
                    12
                }
            } else {
                if is_central {
                    14
                } else {
                    11
                }
            };

            self.ctx
                .set_font(&format!("bold {}px Inter, sans-serif", font_size));
            self.ctx.set_text_align("center");
            self.ctx.set_text_baseline("middle");
            self.ctx
                .fill_text(&skill.name, skill.x as f64, skill.y as f64)?;
        }
        Ok(())
    }

    #[wasm_bindgen]
    pub fn handle_mouse_move(&mut self, client_x: f32, client_y: f32) {
        let rect = self.canvas.get_bounding_client_rect();
        self.mouse_x = client_x - rect.left() as f32;
        self.mouse_y = client_y - rect.top() as f32;

        // Check for hover
        self.hovered_skill_index = None;
        for (index, skill) in self.skills.iter().enumerate() {
            let dx = self.mouse_x - skill.x;
            let dy = self.mouse_y - skill.y;
            let distance = (dx * dx + dy * dy).sqrt();

            if distance < 40.0 {
                self.hovered_skill_index = Some(index);
                break;
            }
        }
    }

    #[wasm_bindgen]
    pub fn handle_mouse_leave(&mut self) {
        self.hovered_skill_index = None;
    }

    #[wasm_bindgen]
    pub fn handle_resize(&mut self) -> Result<(), JsValue> {
        self.setup_canvas_size()?;
        self.initialize_skill_positions();
        Ok(())
    }

    #[wasm_bindgen]
    pub fn get_hovered_skill(&self) -> JsValue {
        if let Some(index) = self.hovered_skill_index {
            if let Some(skill) = self.skills.get(index) {
                serde_wasm_bindgen::to_value(skill).unwrap_or(JsValue::NULL)
            } else {
                JsValue::NULL
            }
        } else {
            JsValue::NULL
        }
    }
}

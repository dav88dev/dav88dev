use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetInfo {
    pub file: String,
    pub src: Option<String>,
    #[serde(rename = "isEntry")]
    pub is_entry: Option<bool>,
    pub imports: Option<Vec<String>>,
    pub css: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize)]
pub struct AssetPaths {
    pub css_main: String,
    pub js_main: String,
    pub js_three_scene: String,
    pub js_main_legacy: String,
    pub js_three_scene_legacy: String,
    pub js_polyfills_legacy: String,
}

impl Default for AssetPaths {
    fn default() -> Self {
        Self {
            css_main: "/static/css/style.css".to_string(),
            js_main: "/static/js/main.js".to_string(),
            js_three_scene: "/static/js/threeScene.js".to_string(),
            js_main_legacy: "/static/js/main-legacy.js".to_string(),
            js_three_scene_legacy: "/static/js/threeScene-legacy.js".to_string(),
            js_polyfills_legacy: "/static/js/polyfills-legacy.js".to_string(),
        }
    }
}

pub fn load_asset_paths(static_dir: &str) -> Result<AssetPaths> {
    let manifest_path = Path::new(static_dir).join(".vite/manifest.json");

    // If manifest doesn't exist, return default paths for development
    if !manifest_path.exists() {
        tracing::warn!(
            "Vite manifest not found at {:?}, using default asset paths",
            manifest_path
        );
        return Ok(AssetPaths::default());
    }

    let manifest_content = std::fs::read_to_string(&manifest_path)?;
    let manifest: HashMap<String, AssetInfo> = serde_json::from_str(&manifest_content)?;

    let mut asset_paths = AssetPaths::default();

    // Map Vite manifest entries to our asset paths
    for (key, asset) in manifest {
        let file_path = format!("/static/{}", asset.file);

        match key.as_str() {
            "js/main.js" => asset_paths.js_main = file_path,
            "js/three-scene.js" => asset_paths.js_three_scene = file_path,
            "css/style.css" => asset_paths.css_main = file_path,
            "js/main-legacy.js" => asset_paths.js_main_legacy = file_path,
            "js/three-scene-legacy.js" => asset_paths.js_three_scene_legacy = file_path,
            "../vite/legacy-polyfills-legacy" => asset_paths.js_polyfills_legacy = file_path,
            _ => {} // Ignore other entries
        }
    }

    tracing::info!("Loaded asset paths from Vite manifest: {:?}", asset_paths);
    Ok(asset_paths)
}

// Three.js bindings for Rust WASM
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = THREE)]
    pub type Scene;
    
    #[wasm_bindgen(js_namespace = THREE)]
    pub type PerspectiveCamera;
    
    #[wasm_bindgen(js_namespace = THREE)]
    pub type WebGLRenderer;
    
    #[wasm_bindgen(js_namespace = THREE)]
    pub type Vector3;
    
    #[wasm_bindgen(js_namespace = THREE)]
    pub type Mesh;
    
    #[wasm_bindgen(js_namespace = THREE)]
    pub type SphereGeometry;
    
    #[wasm_bindgen(js_namespace = THREE)]
    pub type MeshPhongMaterial;
    
    #[wasm_bindgen(js_namespace = THREE)]
    pub type AmbientLight;
    
    #[wasm_bindgen(js_namespace = THREE)]
    pub type DirectionalLight;
    
    #[wasm_bindgen(js_namespace = THREE)]
    pub type Raycaster;
    
    // Vector3 methods
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_vector3(x: f32, y: f32, z: f32) -> Vector3;
    
    #[wasm_bindgen(method, js_name = set)]
    pub fn set(this: &Vector3, x: f32, y: f32, z: f32) -> &Vector3;
    
    #[wasm_bindgen(method, js_name = lerp)]
    pub fn lerp(this: &Vector3, target: &Vector3, alpha: f32) -> &Vector3;
    
    // Scene methods
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_scene() -> Scene;
    
    #[wasm_bindgen(method, js_name = add)]
    pub fn add_to_scene(this: &Scene, object: &JsValue);
    
    #[wasm_bindgen(method, js_name = remove)]
    pub fn remove_from_scene(this: &Scene, object: &JsValue);
    
    // Camera methods
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_perspective_camera(fov: f32, aspect: f32, near: f32, far: f32) -> PerspectiveCamera;
    
    #[wasm_bindgen(method, setter)]
    pub fn set_position(this: &PerspectiveCamera, position: &Vector3);
    
    #[wasm_bindgen(method, js_name = lookAt)]
    pub fn look_at(this: &PerspectiveCamera, target: &Vector3);
    
    // Renderer methods
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_webgl_renderer(parameters: &JsValue) -> WebGLRenderer;
    
    #[wasm_bindgen(method, js_name = setSize)]
    pub fn set_size(this: &WebGLRenderer, width: u32, height: u32);
    
    #[wasm_bindgen(method, js_name = render)]
    pub fn render(this: &WebGLRenderer, scene: &Scene, camera: &PerspectiveCamera);
    
    #[wasm_bindgen(method, getter)]
    pub fn domElement(this: &WebGLRenderer) -> web_sys::HtmlCanvasElement;
    
    // Geometry
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_sphere_geometry(radius: f32, width_segments: u32, height_segments: u32) -> SphereGeometry;
    
    // Material
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_mesh_phong_material(parameters: &JsValue) -> MeshPhongMaterial;
    
    // Mesh
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_mesh(geometry: &SphereGeometry, material: &MeshPhongMaterial) -> Mesh;
    
    #[wasm_bindgen(method, setter)]
    pub fn set_mesh_position(this: &Mesh, position: &Vector3);
    
    #[wasm_bindgen(method, getter)]
    pub fn position(this: &Mesh) -> Vector3;
    
    #[wasm_bindgen(method, getter)]
    pub fn rotation(this: &Mesh) -> Vector3;
    
    // Lights
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_ambient_light(color: u32, intensity: f32) -> AmbientLight;
    
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_directional_light(color: u32, intensity: f32) -> DirectionalLight;
    
    // Raycaster
    #[wasm_bindgen(constructor, js_namespace = THREE)]
    pub fn new_raycaster() -> Raycaster;
    
    #[wasm_bindgen(method, js_name = setFromCamera)]
    pub fn set_from_camera(this: &Raycaster, coords: &Vector3, camera: &PerspectiveCamera);
    
    #[wasm_bindgen(method, js_name = intersectObjects)]
    pub fn intersect_objects(this: &Raycaster, objects: &js_sys::Array) -> js_sys::Array;
}
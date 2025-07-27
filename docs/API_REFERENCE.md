# Full WASM Skills Visualization - API Reference

## WASM Module Interface

### FullWasmRenderer

The core WASM component that handles all Canvas2D rendering operations.

#### Constructor

```rust
#[wasm_bindgen(constructor)]
pub fn new(canvas_id: &str) -> Result<FullWasmRenderer, JsValue>
```

**Parameters:**
- `canvas_id: &str` - The HTML element ID of the target canvas

**Returns:**
- `Result<FullWasmRenderer, JsValue>` - Renderer instance or error

**Example:**
```javascript
const renderer = new wasmModule.FullWasmRenderer('skills-canvas');
```

#### Methods

##### render()
```rust
#[wasm_bindgen]
pub fn render(&mut self, delta_time: f32) -> Result<(), JsValue>
```

Renders a single frame of the skills visualization.

**Parameters:**
- `delta_time: f32` - Time elapsed since last frame (in seconds)

**Returns:**
- `Result<(), JsValue>` - Success or error

**Usage:**
```javascript
renderer.render(deltaTime);
```

##### handle_mouse_move()
```rust
#[wasm_bindgen]
pub fn handle_mouse_move(&mut self, client_x: f32, client_y: f32)
```

Processes mouse movement for hover detection.

**Parameters:**
- `client_x: f32` - Mouse X coordinate relative to viewport
- `client_y: f32` - Mouse Y coordinate relative to viewport

**Usage:**
```javascript
canvas.addEventListener('mousemove', (e) => {
    renderer.handle_mouse_move(e.clientX, e.clientY);
});
```

##### handle_mouse_leave()
```rust
#[wasm_bindgen]
pub fn handle_mouse_leave(&mut self)
```

Clears hover state when mouse leaves canvas.

**Usage:**
```javascript
canvas.addEventListener('mouseleave', () => {
    renderer.handle_mouse_leave();
});
```

##### handle_resize()
```rust
#[wasm_bindgen]
pub fn handle_resize(&mut self) -> Result<(), JsValue>
```

Updates canvas size and repositions skills after window resize.

**Returns:**
- `Result<(), JsValue>` - Success or error

**Usage:**
```javascript
window.addEventListener('resize', () => {
    renderer.handle_resize();
});
```

##### get_hovered_skill()
```rust
#[wasm_bindgen]
pub fn get_hovered_skill(&self) -> JsValue
```

Returns data for currently hovered skill.

**Returns:**
- `JsValue` - Skill object or null if no skill hovered

**Skill Object Structure:**
```typescript
interface Skill {
    name: string;
    level: number;
    category: string;
    color: string;
    description: string;
}
```

**Usage:**
```javascript
const hoveredSkill = renderer.get_hovered_skill();
if (hoveredSkill && hoveredSkill.name) {
    showTooltip(hoveredSkill);
}
```

## JavaScript API

### FullWasmSkills Class

Main JavaScript coordinator for the WASM skills visualization.

#### Constructor

```javascript
constructor()
```

Creates a new FullWasmSkills instance.

**Example:**
```javascript
const skillsViz = new FullWasmSkills();
```

#### Methods

##### init()
```javascript
async init(): Promise<void>
```

Initializes the WASM module and sets up the visualization.

**Returns:**
- `Promise<void>` - Resolves when initialization complete

**Throws:**
- Error if WASM module fails to load

**Usage:**
```javascript
try {
    await skillsViz.init();
    console.log('Skills visualization initialized');
} catch (error) {
    console.error('Failed to initialize:', error);
}
```

##### destroy()
```javascript
destroy(): void
```

Cleans up resources and stops animation.

**Usage:**
```javascript
skillsViz.destroy();
```

#### Properties

##### isInitialized
```javascript
readonly isInitialized: boolean
```

Indicates whether the visualization has been successfully initialized.

##### renderer
```javascript
readonly renderer: FullWasmRenderer | null
```

Reference to the WASM renderer instance.

## Data Structures

### Skill Configuration

Skills are configured with the following structure:

```typescript
interface SkillConfig {
    name: string;        // Display name
    level: number;       // Skill level (0-100)
    category: string;    // Technology category
    color: string;       // Hex color code
    description: string; // Tooltip description
}
```

**Default Skills:**
```javascript
const skills = [
    { name: 'ML', level: 85, category: 'AI/ML', color: '#f59e0b', description: 'Machine Learning expertise with TensorFlow and more' },
    { name: 'PHP', level: 95, category: 'Backend', color: '#777BB4', description: 'Backend development with 10+ years experience' },
    { name: 'Laravel', level: 93, category: 'Backend', color: '#FF2D20', description: 'Full-stack Laravel development since 2016' },
    { name: 'JavaScript', level: 92, category: 'Frontend', color: '#F7DF1E', description: 'Frontend and Node.js development' },
    { name: 'Rust', level: 80, category: 'Backend', color: '#CE422B', description: 'Systems programming and WebAssembly' },
    { name: 'Vue.js', level: 88, category: 'Frontend', color: '#4FC08D', description: 'Modern reactive frontend frameworks' },
    { name: 'Python', level: 90, category: 'Backend', color: '#3776AB', description: 'Data science and backend automation' },
    { name: 'MySQL', level: 90, category: 'Database', color: '#4479A1', description: 'Database design and optimization' },
    { name: 'Docker', level: 85, category: 'DevOps', color: '#2496ED', description: 'Containerization and DevOps' },
    { name: 'AWS', level: 82, category: 'DevOps', color: '#FF9900', description: 'Cloud infrastructure and services' },
    { name: 'Kubernetes', level: 78, category: 'DevOps', color: '#326CE5', description: 'Container orchestration' },
    { name: 'Redis', level: 85, category: 'Database', color: '#DC382D', description: 'Caching and session management' }
];
```

### Connection Configuration

Skill connections are defined as:

```typescript
interface Connection {
    from: string; // Source skill name
    to: string;   // Target skill name
}
```

**Default Connections:**
```javascript
const connections = [
    { from: 'PHP', to: 'Laravel' },
    { from: 'Laravel', to: 'MySQL' },
    { from: 'JavaScript', to: 'Vue.js' },
    { from: 'Python', to: 'AWS' },
    { from: 'Docker', to: 'Kubernetes' },
    { from: 'MySQL', to: 'Redis' },
    { from: 'AWS', to: 'Docker' },
    { from: 'Rust', to: 'JavaScript' },
    { from: 'PHP', to: 'JavaScript' },
    { from: 'Python', to: 'Docker' }
];
```

## Events

### Mouse Events

The system handles the following mouse events:

#### mousemove
**Target:** Canvas element  
**Handler:** Forwards coordinates to WASM for hover detection  
**Triggers:** Tooltip display/hide, connection highlighting

#### mouseleave
**Target:** Canvas element  
**Handler:** Clears hover state in WASM  
**Triggers:** Tooltip hide, connection unhighlight

#### resize
**Target:** Window  
**Handler:** Updates canvas size and skill positions  
**Triggers:** Canvas redraw, skill repositioning

### Custom Events

#### wasmInitialized
**Dispatched:** When WASM module successfully loads  
**Detail:** `{ renderer: FullWasmRenderer }`

#### wasmError
**Dispatched:** When WASM module fails to load  
**Detail:** `{ error: Error }`

## Error Handling

### Error Types

#### WasmLoadError
```javascript
class WasmLoadError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'WasmLoadError';
        this.cause = cause;
    }
}
```

#### CanvasError
```javascript
class CanvasError extends Error {
    constructor(message, canvasId) {
        super(message);
        this.name = 'CanvasError';
        this.canvasId = canvasId;
    }
}
```

### Error Recovery

#### WASM Loading Failure
```javascript
try {
    await skillsViz.init();
} catch (error) {
    if (error instanceof WasmLoadError) {
        // Show static fallback
        skillsViz.showErrorFallback();
    }
}
```

#### Runtime Errors
```javascript
// Animation loop error handling
const animate = (currentTime) => {
    try {
        renderer.render(deltaTime);
    } catch (error) {
        console.error('Render error:', error);
        // Stop animation, show static state
        cancelAnimationFrame(animationId);
    }
};
```

## Performance Considerations

### Optimization Guidelines

#### WASM Module Loading
- Load WASM module asynchronously
- Cache WASM instance for reuse
- Handle loading states appropriately

#### Animation Loop
- Use `requestAnimationFrame` for smooth animation
- Calculate delta time for frame-rate independent animation
- Handle animation errors gracefully

#### Memory Management
- Call `destroy()` when component unmounts
- Remove event listeners on cleanup
- Clear animation frames on cleanup

### Performance Monitoring

#### Frame Rate Monitoring
```javascript
let frameCount = 0;
let lastFpsUpdate = 0;

const animate = (currentTime) => {
    frameCount++;
    
    if (currentTime - lastFpsUpdate >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = currentTime;
        console.log(`FPS: ${fps}`);
    }
    
    renderer.render(deltaTime);
    requestAnimationFrame(animate);
};
```

#### Memory Usage Tracking
```javascript
const measureMemory = () => {
    if (performance.memory) {
        console.log({
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
        });
    }
};
```

## Browser Compatibility

### Required Features
- WebAssembly support (98%+ browsers)
- ES6 Modules (95%+ browsers)
- Canvas2D API (100% browsers)
- requestAnimationFrame (100% browsers)

### Feature Detection
```javascript
const isWasmSupported = (() => {
    try {
        if (typeof WebAssembly === 'object' && 
            typeof WebAssembly.instantiate === 'function') {
            const module = new WebAssembly.Module(
                Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
            );
            return module instanceof WebAssembly.Module;
        }
    } catch (e) {}
    return false;
})();

if (!isWasmSupported) {
    // Show fallback interface
    showStaticSkills();
}
```

## Build Configuration

### Required Cargo Features
```toml
[dependencies.web-sys]
version = "0.3"
features = [
  "console",
  "CanvasRenderingContext2d",
  "HtmlCanvasElement",
  "DomRect",
  "CssStyleDeclaration"
]
```

### WASM-pack Configuration
```bash
wasm-pack build --target web --out-dir ../static/wasm
```

### Optimization Flags
```toml
[profile.release]
opt-level = "s"  # Optimize for size
lto = true       # Link-time optimization
```
// Three.js ES module imports for r150+ compatibility
import * as THREE from 'three';

class ThreeScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.geometricShapes = [];
        this.networkNodes = [];
        this.dataStreams = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        this.isLoaded = false;
        this.clock = new THREE.Clock();
        this.composer = null;
        this.bloomPass = null;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 50, 1000);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 50);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('three-canvas'),
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Post-processing setup
        this.setupPostProcessing();
        
        // Create enhanced elements
        this.createAdvancedParticles();
        this.createNetworkVisualization();
        this.createDataStreams();
        this.createGeometricShapes();
        this.createFloatingElements();
        this.createHolographicElements();
        
        // Start animation
        this.animate();
        
        // Mark as loaded
        this.isLoaded = true;
    }

    setupPostProcessing() {
        // Post-processing for advanced effects
        if (typeof THREE.EffectComposer !== 'undefined') {
            this.composer = new THREE.EffectComposer(this.renderer);
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            // Bloom effect for glowing elements
            if (typeof THREE.UnrealBloomPass !== 'undefined') {
                this.bloomPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth, window.innerHeight),
                    1.5, 0.4, 0.85
                );
                this.composer.addPass(this.bloomPass);
            }
        }
    }
    
    createAdvancedParticles() {
        const particleCount = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);

        const colorPalette = [
            new THREE.Color(0x6366f1), // Primary
            new THREE.Color(0x8b5cf6), // Secondary
            new THREE.Color(0x06b6d4), // Accent
            new THREE.Color(0x10b981), // Success
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position in spherical distribution
            const radius = Math.random() * 100 + 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Random color from palette
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Random size
            sizes[i] = Math.random() * 3 + 1;
            
            // Random velocity
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        // Advanced particle shader material
        const vertexShader = `
            attribute float size;
            attribute vec3 velocity;
            varying vec3 vColor;
            varying float vOpacity;
            
            void main() {
                vColor = color;
                vOpacity = sin(position.x * 0.01 + position.y * 0.01 + position.z * 0.01) * 0.5 + 0.5;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
        
        const fragmentShader = `
            varying vec3 vColor;
            varying float vOpacity;
            
            void main() {
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                gl_FragColor = vec4(vColor, alpha * vOpacity * 0.8);
            }
        `;

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createNetworkVisualization() {
        // Create network nodes representing skills/technologies
        const nodeCount = 20;
        const nodeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const connections = [];
        
        for (let i = 0; i < nodeCount; i++) {
            const nodeMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.7, 0.8, 0.6),
                transparent: true,
                opacity: 0.8,
                emissive: new THREE.Color().setHSL(Math.random() * 0.3 + 0.7, 0.5, 0.1)
            });
            
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            
            // Position nodes in a network pattern
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = 30 + Math.random() * 20;
            const height = (Math.random() - 0.5) * 40;
            
            node.position.x = Math.cos(angle) * radius;
            node.position.y = height;
            node.position.z = Math.sin(angle) * radius;
            
            node.userData = {
                originalPosition: node.position.clone(),
                pulseSpeed: Math.random() * 0.02 + 0.01,
                connections: []
            };
            
            this.networkNodes.push(node);
            this.scene.add(node);
        }
        
        // Create connections between nodes
        this.createNetworkConnections();
    }
    
    createNetworkConnections() {
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.3
        });
        
        for (let i = 0; i < this.networkNodes.length; i++) {
            const node1 = this.networkNodes[i];
            
            // Connect to 2-4 nearby nodes
            const connectionCount = Math.floor(Math.random() * 3) + 2;
            
            for (let j = 0; j < connectionCount; j++) {
                const targetIndex = (i + j + 1) % this.networkNodes.length;
                const node2 = this.networkNodes[targetIndex];
                
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array([
                    node1.position.x, node1.position.y, node1.position.z,
                    node2.position.x, node2.position.y, node2.position.z
                ]);
                
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const line = new THREE.Line(geometry, connectionMaterial);
                
                this.scene.add(line);
                node1.userData.connections.push(line);
            }
        }
    }
    
    createDataStreams() {
        // Create flowing data streams
        for (let i = 0; i < 10; i++) {
            const streamGeometry = new THREE.BufferGeometry();
            const streamLength = 50;
            const positions = new Float32Array(streamLength * 3);
            const colors = new Float32Array(streamLength * 3);
            
            const startPos = new THREE.Vector3(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );
            
            const direction = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();
            
            for (let j = 0; j < streamLength; j++) {
                const j3 = j * 3;
                const progress = j / streamLength;
                
                positions[j3] = startPos.x + direction.x * progress * 30;
                positions[j3 + 1] = startPos.y + direction.y * progress * 30;
                positions[j3 + 2] = startPos.z + direction.z * progress * 30;
                
                const alpha = Math.sin(progress * Math.PI);
                colors[j3] = 0.4 + alpha * 0.6; // R
                colors[j3 + 1] = 0.4 + alpha * 0.6; // G
                colors[j3 + 2] = 1.0; // B
            }
            
            streamGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            streamGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const streamMaterial = new THREE.PointsMaterial({
                size: 2,
                vertexColors: true,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending
            });
            
            const stream = new THREE.Points(streamGeometry, streamMaterial);
            stream.userData = {
                speed: Math.random() * 0.02 + 0.01,
                direction: direction.clone()
            };
            
            this.dataStreams.push(stream);
            this.scene.add(stream);
        }
    }
    
    createHolographicElements() {
        // Create holographic UI elements
        const hologramGeometry = new THREE.PlaneGeometry(10, 6);
        const hologramMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            wireframe: true,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 3; i++) {
            const hologram = new THREE.Mesh(hologramGeometry, hologramMaterial.clone());
            
            hologram.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 60
            );
            
            hologram.rotation.x = Math.random() * Math.PI;
            hologram.rotation.y = Math.random() * Math.PI;
            
            hologram.userData = {
                rotationSpeed: Math.random() * 0.01 + 0.005,
                flickerSpeed: Math.random() * 0.1 + 0.05
            };
            
            this.scene.add(hologram);
        }
    }

    createGeometricShapes() {
        // Create various geometric shapes
        const shapes = [
            { geometry: new THREE.TetrahedronGeometry(2), color: 0x6366f1 },
            { geometry: new THREE.OctahedronGeometry(1.5), color: 0x8b5cf6 },
            { geometry: new THREE.IcosahedronGeometry(1.2), color: 0x06b6d4 },
            { geometry: new THREE.DodecahedronGeometry(1), color: 0x10b981 },
        ];

        shapes.forEach((shape, index) => {
            const material = new THREE.MeshPhongMaterial({
                color: shape.color,
                transparent: true,
                opacity: 0.7,
                shininess: 100
            });

            const mesh = new THREE.Mesh(shape.geometry, material);
            
            // Position shapes in a circle
            const angle = (index / shapes.length) * Math.PI * 2;
            const radius = 30;
            mesh.position.x = Math.cos(angle) * radius;
            mesh.position.y = Math.sin(angle) * radius;
            mesh.position.z = -20;
            
            // Add rotation data
            mesh.userData = {
                rotationSpeed: {
                    x: Math.random() * 0.02 - 0.01,
                    y: Math.random() * 0.02 - 0.01,
                    z: Math.random() * 0.02 - 0.01
                },
                originalPosition: mesh.position.clone()
            };
            
            this.geometricShapes.push(mesh);
            this.scene.add(mesh);
        });

        // Add lighting for the shapes
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
    }

    createFloatingElements() {
        // Create floating wireframe elements
        const wireframeGeometries = [
            new THREE.SphereGeometry(5, 16, 16),
            new THREE.BoxGeometry(6, 6, 6),
            new THREE.ConeGeometry(3, 8, 8),
            new THREE.TorusGeometry(4, 1, 8, 16)
        ];

        wireframeGeometries.forEach((geometry, index) => {
            const material = new THREE.MeshBasicMaterial({
                color: 0x6366f1,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });

            const mesh = new THREE.Mesh(geometry, material);
            
            // Position randomly
            mesh.position.x = (Math.random() - 0.5) * 80;
            mesh.position.y = (Math.random() - 0.5) * 80;
            mesh.position.z = (Math.random() - 0.5) * 80;
            
            // Add floating animation data
            mesh.userData = {
                floatSpeed: Math.random() * 0.02 + 0.01,
                floatRange: Math.random() * 10 + 5,
                originalY: mesh.position.y
            };
            
            this.scene.add(mesh);
        });
    }

    setupEventListeners() {
        // Mouse movement
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Scroll events for parallax
        window.addEventListener('scroll', () => {
            if (this.isLoaded) {
                this.updateParallax();
            }
        });
    }

    updateParallax() {
        const scrollY = window.pageYOffset;
        const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);
        
        // Move camera based on scroll
        this.camera.position.y = scrollPercent * 20;
        this.camera.rotation.x = scrollPercent * 0.1;
        
        // Move particles
        if (this.particles) {
            this.particles.rotation.y = scrollPercent * 0.5;
        }
        
        // Move geometric shapes
        this.geometricShapes.forEach((shape, index) => {
            const offset = index * 0.1;
            shape.position.y = shape.userData.originalPosition.y + 
                              Math.sin(scrollPercent * Math.PI * 2 + offset) * 5;
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        const deltaTime = this.clock.getDelta();
        
        // Animate enhanced particles
        if (this.particles) {
            this.particles.rotation.x = time * 0.05;
            this.particles.rotation.y = time * 0.08;
            
            // Update particle positions
            const positions = this.particles.geometry.attributes.position.array;
            const velocities = this.particles.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];
                
                // Boundary check
                if (Math.abs(positions[i]) > 100) velocities[i] *= -1;
                if (Math.abs(positions[i + 1]) > 100) velocities[i + 1] *= -1;
                if (Math.abs(positions[i + 2]) > 100) velocities[i + 2] *= -1;
            }
            
            this.particles.geometry.attributes.position.needsUpdate = true;
            
            // Mouse interaction
            this.particles.rotation.x += this.mouse.y * 0.05;
            this.particles.rotation.y += this.mouse.x * 0.05;
        }
        
        // Animate network nodes
        this.networkNodes.forEach((node, index) => {
            // Pulsing effect
            const pulse = Math.sin(time * node.userData.pulseSpeed) * 0.3 + 1;
            node.scale.setScalar(pulse);
            
            // Gentle floating motion
            node.position.y = node.userData.originalPosition.y + 
                            Math.sin(time * 0.5 + index) * 2;
            
            // Update material emissive for glow effect
            node.material.emissiveIntensity = pulse * 0.5;
        });
        
        // Animate data streams
        this.dataStreams.forEach((stream) => {
            stream.rotation.x += stream.userData.speed;
            stream.rotation.y += stream.userData.speed * 0.7;
            
            // Move stream along its direction
            stream.position.add(
                stream.userData.direction.clone().multiplyScalar(stream.userData.speed * 10)
            );
            
            // Reset position if too far
            if (stream.position.length() > 200) {
                stream.position.set(
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100
                );
            }
        });
        
        // Animate geometric shapes
        this.geometricShapes.forEach((shape, index) => {
            shape.rotation.x += shape.userData.rotationSpeed.x;
            shape.rotation.y += shape.userData.rotationSpeed.y;
            shape.rotation.z += shape.userData.rotationSpeed.z;
            
            // Enhanced mouse interaction with distance-based influence
            const distance = shape.position.distanceTo(new THREE.Vector3(
                this.mouse.x * 10, this.mouse.y * 10, 0
            ));
            const influence = Math.max(0, 1 - distance / 50);
            
            shape.rotation.x += this.mouse.y * 0.02 * influence;
            shape.rotation.y += this.mouse.x * 0.02 * influence;
            
            // Color shift based on interaction
            if (shape.material.emissive) {
                shape.material.emissiveIntensity = influence * 0.5;
            }
        });
        
        // Animate floating elements
        this.scene.children.forEach((child) => {
            if (child.userData && child.userData.floatSpeed) {
                child.position.y = child.userData.originalY + 
                                 Math.sin(time * child.userData.floatSpeed) * child.userData.floatRange;
                child.rotation.x = time * 0.2;
                child.rotation.z = time * 0.1;
            }
            
            // Animate holographic elements
            if (child.userData && child.userData.flickerSpeed) {
                child.rotation.y += child.userData.rotationSpeed;
                
                // Flickering effect
                const flicker = Math.sin(time * child.userData.flickerSpeed) * 0.5 + 0.5;
                child.material.opacity = 0.1 + flicker * 0.2;
            }
        });
        
        // Enhanced camera movement
        const targetX = this.mouse.x * 8;
        const targetY = this.mouse.y * 8;
        
        this.camera.position.x += (targetX - this.camera.position.x) * 0.02;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.02;
        
        // Smooth camera look-at with slight delay
        const lookAtTarget = new THREE.Vector3(
            this.mouse.x * 2,
            this.mouse.y * 2,
            0
        );
        this.camera.lookAt(lookAtTarget);
        
        // Render with post-processing if available
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up geometries and materials
        this.scene.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        this.renderer.dispose();
    }
}

// Initialize Three.js scene when page loads
let threeScene;

document.addEventListener('DOMContentLoaded', () => {
    // Add slight delay to ensure everything is loaded
    setTimeout(() => {
        threeScene = new ThreeScene();
        
        // Hide loader after scene is initialized
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }
        }, 1000);
    }, 100);
});

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
    if (threeScene) {
        threeScene.destroy();
    }
});

// Export for ES module compatibility
export { ThreeScene };
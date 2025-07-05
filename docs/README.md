# Personal Website - Rust + Rocket + Three.js

A modern, animated personal portfolio website built with Rust Rocket framework and Three.js for stunning 3D animations.

## Features

- **Modern Design**: Clean, responsive design with smooth animations
- **3D Animations**: Interactive Three.js scenes with particles and geometric shapes
- **Rust Backend**: Fast and secure backend using Rocket framework
- **Mobile Friendly**: Fully responsive design that works on all devices
- **Performance Optimized**: Efficient animations and lazy loading
- **SEO Ready**: Proper meta tags and semantic HTML structure

## Technology Stack

- **Backend**: Rust with Rocket framework
- **Frontend**: HTML5, CSS3, JavaScript
- **3D Graphics**: Three.js
- **Animations**: GSAP (GreenSock)
- **Templating**: Tera templates
- **Styling**: Modern CSS with CSS Grid and Flexbox

## Setup and Installation

1. **Prerequisites**:
   - Rust (latest stable version)
   - Cargo package manager

2. **Clone and install**:
   ```bash
   git clone <your-repo-url>
   cd myRustWebsite
   cargo build
   ```

3. **Run the development server**:
   ```bash
   cargo run
   ```

4. **Open your browser** and navigate to `http://localhost:8000`

## Customization

### Update Your Information

Edit the `CVData::default()` implementation in `src/main.rs` to include your personal information:

- Personal info (name, title, email, etc.)
- Work experience
- Education
- Skills with proficiency levels
- Projects with descriptions and links

### Modify the Design

- **Colors**: Update CSS custom properties in `static/css/style.css`
- **Animations**: Modify Three.js scenes in `static/js/three-scene.js`
- **Layout**: Edit the HTML template in `templates/index.html.tera`

### Add New Sections

1. Update the `CVData` struct in `src/main.rs`
2. Add corresponding HTML in the template
3. Style the new sections in CSS
4. Add animations if needed

## Project Structure

```
myRustWebsite/
├── src/
│   └── main.rs              # Main Rust application
├── templates/
│   └── index.html.tera      # HTML template
├── static/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   └── js/
│       ├── main.js          # Main JavaScript functionality
│       └── three-scene.js   # Three.js animations
├── Cargo.toml               # Rust dependencies
├── Rocket.toml              # Rocket configuration
└── README.md                # This file
```

## Deployment

### Local Development
```bash
cargo run
```

### Production Build
```bash
cargo build --release
./target/release/personal_website
```

### Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/personal_website .
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/static ./static
EXPOSE 8000
CMD ["./personal_website"]
```

## Performance Features

- **Lazy Loading**: Images and resources load on demand
- **Optimized Animations**: 60fps smooth animations using requestAnimationFrame
- **Efficient Rendering**: Three.js optimizations for better performance
- **Responsive Images**: Automatically scaled images for different screen sizes
- **Minified Assets**: Compressed CSS and JavaScript in production

## Browser Support

- Chrome/Chromium 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Rocket](https://rocket.rs/) - The web framework for Rust
- [Three.js](https://threejs.org/) - JavaScript 3D library
- [GSAP](https://greensock.com/gsap/) - Professional animation library
- [Tera](https://tera.netlify.app/) - Template engine for Rust
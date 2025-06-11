// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Add camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
camera.position.set(0, 50, 100);
controls.update();

// Add lighting
scene.add(new THREE.AmbientLight(0x333333));
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

// Create stars background
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starsVertices = [];
    
    for (let i = 0; i < 5000; i++) {
        starsVertices.push(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000
        );
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    scene.add(new THREE.Points(starsGeometry, starsMaterial));
}

createStars();

// Planet data
const planets = [
    { name: 'Sun', radius: 10, color: 0xffff00, distance: 0, speed: 0, rotationSpeed: 0.01 },
    { name: 'Mercury', radius: 1.5, color: 0xb5b5b5, distance: 20, speed: 0.04, rotationSpeed: 0.004 },
    { name: 'Venus', radius: 2.5, color: 0xe6c229, distance: 30, speed: 0.015, rotationSpeed: 0.002 },
    { name: 'Earth', radius: 2.7, color: 0x3498db, distance: 40, speed: 0.01, rotationSpeed: 0.02 },
    { name: 'Mars', radius: 2.2, color: 0xe67e22, distance: 50, speed: 0.008, rotationSpeed: 0.018 },
    { name: 'Jupiter', radius: 6, color: 0xf1c40f, distance: 70, speed: 0.002, rotationSpeed: 0.04 },
    { name: 'Saturn', radius: 5, color: 0xe5b849, distance: 90, speed: 0.0009, rotationSpeed: 0.038, hasRings: true },
    { name: 'Uranus', radius: 4, color: 0x5dade2, distance: 110, speed: 0.0004, rotationSpeed: 0.03 },
    { name: 'Neptune', radius: 3.8, color: 0x2980b9, distance: 130, speed: 0.0001, rotationSpeed: 0.032 }
];

// Create planets and orbits
const planetObjects = [];

function createPlanets() {
    planets.forEach(planet => {
        const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: planet.color });
        const mesh = new THREE.Mesh(geometry, material);
        
        if (planet.distance > 0) {
            const angle = Math.random() * Math.PI * 2;
            mesh.position.x = planet.distance * Math.cos(angle);
            mesh.position.z = planet.distance * Math.sin(angle);
            
            // Create orbit path
            const orbitPoints = [];
            for (let i = 0; i <= 64; i++) {
                const theta = (i / 64) * Math.PI * 2;
                orbitPoints.push(new THREE.Vector3(
                    planet.distance * Math.cos(theta),
                    0,
                    planet.distance * Math.sin(theta)
                ));
            }
            
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbit = new THREE.Line(orbitGeometry, new THREE.LineBasicMaterial({ color: 0x555555 }));
            scene.add(orbit);
        }
        
        // Add rings to Saturn
        if (planet.hasRings) {
            const ringGeometry = new THREE.RingGeometry(planet.radius * 1.5, planet.radius * 2, 32);
            const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({ 
                color: 0xc2b280,
                side: THREE.DoubleSide
            }));
            ring.rotation.x = Math.PI / 3;
            mesh.add(ring);
        }
        
        scene.add(mesh);
        planetObjects.push({
            mesh,
            speed: planet.speed,
            originalSpeed: planet.speed,
            distance: planet.distance,
            rotationSpeed: planet.rotationSpeed,
            name: planet.name,
            angle: planet.distance > 0 ? Math.random() * Math.PI * 2 : 0
        });
    });
}

createPlanets();

// Create speed controls
function setupSpeedControls() {
    const container = document.getElementById('speed-controls');
    
    planetObjects.forEach((planet, i) => {
        if (planet.name === 'Sun') return;
        
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between';
        
        const label = document.createElement('label');
        label.className = 'text-sm mr-2';
        label.textContent = planet.name;
        
        const input = document.createElement('input');
        input.type = 'range';
        input.min = '1';
        input.max = '4';
        input.step = '0.1';
        input.value = '1';
        input.className = 'flex-1 mx-2';
        
        const value = document.createElement('span');
        value.className = 'text-sm w-10 text-right';
        value.textContent = '1x';
        
        input.addEventListener('input', () => {
            const multiplier = parseFloat(input.value);
            planet.speed = planet.originalSpeed * multiplier;
            value.textContent = multiplier.toFixed(1) + 'x';
        });
        
        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(value);
        container.appendChild(div);
    });
}

setupSpeedControls();

// Animation control
let isPaused = false;
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (!isPaused) {
        planetObjects.forEach(planet => {
            if (planet.distance > 0) {
                planet.angle += planet.speed * delta;
                planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
                planet.mesh.position.z = planet.distance * Math.sin(planet.angle);
            }
            planet.mesh.rotation.y += planet.rotationSpeed * delta;
        });
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// UI controls
document.getElementById('pause-btn').addEventListener('click', () => {
    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? 'Resume' : 'Pause';
});

document.getElementById('reset-btn').addEventListener('click', () => {
    camera.position.set(0, 50, 100);
    controls.reset();
});

// Planet hover info
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetObjects.map(p => p.mesh));
    
    const info = document.getElementById('planet-info');
    if (intersects.length > 0) {
        const planet = planetObjects.find(p => p.mesh === intersects[0].object);
        if (planet) {
            document.getElementById('planet-name').textContent = planet.name;
            document.getElementById('planet-desc').textContent = 
                `${planet.name} is ${planet.distance} units from the Sun.`;
            info.classList.remove('hidden');
        }
    } else {
        info.classList.add('hidden');
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
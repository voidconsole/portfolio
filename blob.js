import * as THREE from "three"
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js"

function initThree() {
    // Get the container element
    const container = document.getElementById("scene-container")

    // Create scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x045e42)

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )
    camera.position.z = 5
//     camera.position.x = -4
//     camera.lookAt(0, 0, 0)
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    RectAreaLightUniformsLib.init()
    const areaLight1 = new THREE.RectAreaLight(0x25e8ac, 2, 10, 10)
    areaLight1.position.set(-2, 0, -5)
    areaLight1.lookAt(0, 0, 0)
    scene.add(areaLight1)
    const areaLight2 = new THREE.RectAreaLight(0x25e8ac, 1, 10, 10)
    areaLight2.position.set(2, 0, -2)
    areaLight2.lookAt(0, 0, 0)
    scene.add(areaLight2)

    // Create the bumpy glass blob
    const glassGeometry = new THREE.SphereGeometry(1.5, 128, 128)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        opacity: 1,
        color: 0x76b59e,
        metalness: 0.2,
        roughness: 0.3,
        transmission: 0.95,
        thickness: 1.48,
        ior: 1.55,
        transparent: true,
        side: THREE.FrontSide,
    })

    const glassBlob = new THREE.Mesh(glassGeometry, glassMaterial)
    scene.add(glassBlob)

    // Store original positions for resetting
    const originalGeometry = glassGeometry.clone()

    // Seeds for displacement patterns
    const seeds = {
        normal: 0,
        hover: 1,
    }

    // Transition parameters
    let currentSeed = seeds.normal
    let targetSeed = seeds.normal
    const transitionSpeed = 0.05 // Adjust for faster/slower transitions

    // Apply bumpy displacement to the glass blob surface with a specific seed
    const applyBumpyDisplacement = seed => {
        const positions = glassBlob.geometry.attributes.position
        const originalPositions = Array.from(
            originalGeometry.attributes.position.array
        )

        for (let i = 0; i < positions.count; i++) {
            const idx = i * 3
            const x = originalPositions[idx]
            const y = originalPositions[idx + 1]
            const z = originalPositions[idx + 2]

            // Calculate original radius and direction
            const radius = Math.sqrt(x * x + y * y + z * z)
            const nx = x / radius
            const ny = y / radius
            const nz = z / radius

            // Create bumpy displacement with seed influence
            const freq = 5
            const amp = 0.1

            // Add seed to change the pattern but keep the amplitude the same
            const noiseSeed = seed * 10 // Multiply by 10 for more noticeable change
            const noise =
                Math.sin(nx * freq + noiseSeed) *
                Math.cos(ny * freq + noiseSeed) *
                Math.sin(nz * freq + noiseSeed)

            const displacement = 1 + noise * amp

            // Apply displacement
            positions.array[idx] = nx * radius * displacement
            positions.array[idx + 1] = ny * radius * displacement
            positions.array[idx + 2] = nz * radius * displacement
        }

        positions.needsUpdate = true
        glassBlob.geometry.computeVertexNormals()
    }

    // Generate vertices for two states and store them
    const normalVertices = new Float32Array(
        glassGeometry.attributes.position.count * 3
    )
    const hoverVertices = new Float32Array(
        glassGeometry.attributes.position.count * 3
    )

    // Function to precompute vertex positions for both states
    const precomputeVertexStates = () => {
        const originalPositions = Array.from(
            originalGeometry.attributes.position.array
        )

        for (let i = 0; i < glassGeometry.attributes.position.count; i++) {
            const idx = i * 3
            const x = originalPositions[idx]
            const y = originalPositions[idx + 1]
            const z = originalPositions[idx + 2]

            // Calculate original radius and direction
            const radius = Math.sqrt(x * x + y * y + z * z)
            const nx = x / radius
            const ny = y / radius
            const nz = z / radius

            const freq = 5
            const amp = 0.1

            // Normal state vertices
            const normalNoiseSeed = seeds.normal * 10
            const normalNoise =
                Math.sin(nx * freq + normalNoiseSeed) *
                Math.cos(ny * freq + normalNoiseSeed) *
                Math.sin(nz * freq + normalNoiseSeed)
            const normalDisplacement = 1 + normalNoise * amp

            normalVertices[idx] = nx * radius * normalDisplacement
            normalVertices[idx + 1] = ny * radius * normalDisplacement
            normalVertices[idx + 2] = nz * radius * normalDisplacement

            // Hover state vertices
            const hoverNoiseSeed = seeds.hover * 10
            const hoverNoise =
                Math.sin(nx * freq + hoverNoiseSeed) *
                Math.cos(ny * freq + hoverNoiseSeed) *
                Math.sin(nz * freq + hoverNoiseSeed)
            const hoverDisplacement = 1 + hoverNoise * amp

            hoverVertices[idx] = nx * radius * hoverDisplacement
            hoverVertices[idx + 1] = ny * radius * hoverDisplacement
            hoverVertices[idx + 2] = nz * radius * hoverDisplacement
        }
    }

    // Call the precompute function
    precomputeVertexStates()

    // Initial displacement
    applyBumpyDisplacement(seeds.normal)

    // Create the glowing green core
    const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32)
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0x00573c,
        emissive: 0x00573c,
        emissiveIntensity: 0.1,
        metalness: 0,
        roughness: 1,
    })

    const greenCore = new THREE.Mesh(coreGeometry, coreMaterial)
    scene.add(greenCore)

    // Mouse hover detection
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let isHovering = false

    // Mouse move event handler
    function onMouseMove(event) {
        // Calculate normalized mouse position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        // Update the raycaster
        raycaster.setFromCamera(mouse, camera)

        // Check for intersections with the glass blob
        const intersects = raycaster.intersectObject(glassBlob)

        // Set target seed based on hover state
        if (intersects.length > 0) {
            targetSeed = seeds.hover
        } else {
            targetSeed = seeds.normal
        }
    }

    // Add mouse move event listener
    window.addEventListener("mousemove", onMouseMove, false)

    // Function to smoothly interpolate between vertex positions
    const updateVertices = () => {
        // Calculate step towards target seed
        if (Math.abs(targetSeed - currentSeed) > 0.001) {
            // Move current seed towards target
            currentSeed += (targetSeed - currentSeed) * transitionSpeed

            const positions = glassBlob.geometry.attributes.position

            // Interpolate between normal and hover vertices
            const t =
                (currentSeed - seeds.normal) / (seeds.hover - seeds.normal)
            const clampedT = Math.max(0, Math.min(1, t)) // Ensure t is between 0 and 1

            for (let i = 0; i < positions.count; i++) {
                const idx = i * 3

                // Linear interpolation between normal and hover vertices
                positions.array[idx] =
                    normalVertices[idx] * (1 - clampedT) +
                    hoverVertices[idx] * clampedT
                positions.array[idx + 1] =
                    normalVertices[idx + 1] * (1 - clampedT) +
                    hoverVertices[idx + 1] * clampedT
                positions.array[idx + 2] =
                    normalVertices[idx + 2] * (1 - clampedT) +
                    hoverVertices[idx + 2] * clampedT
            }

            positions.needsUpdate = true
            glassBlob.geometry.computeVertexNormals()
        }
    }

    // Add controls
    // const controls = new OrbitControls(camera, renderer.domElement)
    // controls.enableDamping = true
    // controls.dampingFactor = 0.05
    // controls.minDistance = 3
    // controls.maxDistance = 10

    // Handle window resize
    const handleResize = () => {
        const width = window.innerWidth
        const height = window.innerHeight

        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
    }
    glassBlob.rotation.z = 1.4
    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate)

        const time = Date.now() * 0.001

        // Update vertex positions with smooth transition
        updateVertices()

        // Rotate the glass blob slowly
        glassBlob.rotation.y += 0.003
        glassBlob.rotation.x += 0.001

        if (greenCore && greenCore.material) {
            coreMaterial.emissiveIntensity = 20 + Math.sin(time * 3) * 5
        }

        //     controls.update()
        renderer.render(scene, camera)
    }

    animate()

    // Cleanup function
    const cleanup = () => {
        window.removeEventListener("resize", handleResize)
        window.removeEventListener("mousemove", onMouseMove)
    }
}
window.initThree = initThree
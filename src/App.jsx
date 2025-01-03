import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import globe from '/globe.png';
import './App.css';

function App() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
 
    const cardsData = [
      { text: 'Wadah Kritik dan Saran BEM FASILKOM', url: 'https://docs.google.com/forms/d/e/1FAIpQLSf5_wIXNMw2p1SbRBMD1SqEhoR0N7xk47BYdDQKuVTNcosdqQ/viewform' },
      { text: 'Contact Person BEM FASLIKOM (Nadya)', url: 'https://wa.link/i667j7' },
      { text: 'Contact Person BEM FASLIKOM (Favian)', url: 'https://wa.link/5k4c9q' },
    ];
    const cardGeometry = new RoundedBoxGeometry(4, 0.5, 0.1, 6, 0.2); 
    const cardMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a40 }); 
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0xdddddd });
    const borderGeometry = new THREE.EdgesGeometry(cardGeometry);

    const sphereGeometry = new THREE.SphereGeometry(2.2, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(globe);

    const sphereMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      emissive: 0xffffff,
      emissiveIntensity: 0,
      shininess: 900,
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0.8, 0);
    scene.add(sphere);

    const ringGeometry = new THREE.TorusGeometry(4, 0.03, 10, 100);
    const colors = [];
    const totalVertices = ringGeometry.attributes.position.count;

    for (let i = 0; i < totalVertices; i++) {
      const angle = Math.atan2(
        ringGeometry.attributes.position.getY(i),
        ringGeometry.attributes.position.getX(i)
      );
      if (angle > 0) {
        colors.push(1, 0.992, 0.720);
      } else {
        colors.push(0.5, 0, 0.5);
      }
    }
    ringGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const ringMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 1.88;
    ring.rotation.y = Math.PI / -1.1;
    ring.position.set(0, 0.8, 0);
    scene.add(ring);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 0);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
    });

    const starCount = 1000;
    const positions = [];
    const starColors = [];
    const color = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
      positions.push((Math.random() - 0.5) * 100);
      positions.push((Math.random() - 0.5) * 100);
      positions.push((Math.random() - 0.5) * 100);

      color.setHSL(Math.random(), 1, 0.7);
      starColors.push(color.r, color.g, color.b);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const fontLoader = new FontLoader();
    const cardsPerRow = 1;
    const spacingX = 2.8; 
    const spacingY = 1; 
    const cards = [];
    const yOffset = -1.2;
    fontLoader.load('/font.json', (font) => {
      cardsData.forEach((cardData, index) => {
        const row = Math.floor(index / cardsPerRow);
        const col = index % cardsPerRow;
        const posX = col * spacingX - (spacingX / 150); 
        const posY = -row * spacingY + yOffset;
        const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
        const cardBorder = new THREE.LineSegments(borderGeometry, borderMaterial);

        cardMesh.position.set(posX, posY, 5); 
        cardBorder.position.set(posX, posY, 5); 

        scene.add(cardMesh);
        scene.add(cardBorder);
        cards.push({ mesh: cardMesh, url: cardData.url });
        const textGeometry = new TextGeometry(cardData.text, {
          font: font,
          size: 0.14,
          height: 0,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-1.9, posY, 5.1); 
        scene.add(textMesh);
      });
    });
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cards.map((card) => card.mesh));

      cards.forEach((card) => {
        if (intersects.find((intersect) => intersect.object === card.mesh)) {
          card.mesh.material.color.set(0x4444ff);
        } else {
          card.mesh.material.color.set(0x1a1a40);
        }
      });
    };
    const onMouseClick = (event) => {
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cards.map((card) => card.mesh));

      if (intersects.length > 0) {
        const clickedCard = cards.find((card) => card.mesh === intersects[0].object);
        if (clickedCard) {
          window.location.href = clickedCard.url;
        }
      }
    };

    window.addEventListener('click', onMouseClick, false);
    fontLoader.load('/font.json', (font) => {
      const textGeometry = new TextGeometry('B E M', {
        font: font,
        size: 0.3, 
        height: 0,
      });

      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff, 
        metalness: 0,
        roughness: 0,
        emissive: 0xffffff,
        emissiveIntensity: 1,
        shininess: 900,
      });

      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(2, 1.58, 1.2);
      scene.add(textMesh);
    });

    fontLoader.load('/font.json', (font) => {
      const textGeometry = new TextGeometry('FASILKOM', {
        font: font,
        size: 0.4, 
        height: 0,
      });

      const textMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFF80', 
        metalness: 0,
        roughness: 0,
        emissive: '#F9E400',
        emissiveIntensity: 0.8,
        shininess: 900,
      });

      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-1.20, 0.2, 4.2,1000);
      scene.add(textMesh);
    });
    fontLoader.load('/font.json', (font) => {
      const textGeometry = new TextGeometry('UNIVERITAS MERCU BUANA', {
        font: font,
        size: 0.140, 
        height: 0,
      });

      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000, 
        metalness: 0,
        roughness: 0,
      });

      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-1.13, 0, 4.2,1000);
      scene.add(textMesh);
    });

    camera.position.z = 11;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    function animate() {
      requestAnimationFrame(animate);
      sphere.rotation.y += 0.01;
      ring.rotation.z += 0.02;
      stars.rotation.y += 0.001;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
    setTimeout(() => {
      const solidColorMaterial = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
      sphere.material = solidColorMaterial;
      scene.add(border);
      function animate2() {
        requestAnimationFrame(animate2);
        sphere.rotation.y += 0.01;
        ring.rotation.z += 0.02;
        controls.update();
        renderer.render(scene, camera);
      }
    
      animate2();
    }, 10000);
    return () => {
      renderer.dispose();
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return null;
}

export default App;

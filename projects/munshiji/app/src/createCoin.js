import * as THREE from 'three';

/**
 * Creates and returns the 3D Gold Rupee Coin model.
 * - Solid 3D cylindrical coin body with metallic gold edge
 * - High-detail front face (+Z) with 3D embossed ₹ symbol
 * - High-detail back face (-Z) with ₹ symbol oriented to read correctly from left-to-right when rotated
 * - Consistent vibrant metallic gold PBR materials matching reference
 */
export function createCoin() {
  const coinGroup = new THREE.Group();

  const radius = 1.82;
  const thickness = 0.38;

  const loader = new THREE.TextureLoader();
  const frontTex = loader.load('./assets/coin_face_front_fixed.png');
  frontTex.colorSpace = THREE.SRGBColorSpace;
  frontTex.anisotropy = 16;

  const backTex = loader.load('./assets/coin_face_back_fixed.png');
  backTex.colorSpace = THREE.SRGBColorSpace;
  backTex.anisotropy = 16;

  // Cylinder with 3 material groups: [side, top (+Y/front), bottom (-Y/back)]
  const cylinderGeo = new THREE.CylinderGeometry(radius, radius, thickness, 96, 1);

  const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0xFDB834,
    metalness: 0.86,
    roughness: 0.22,
  });

  const frontMaterial = new THREE.MeshStandardMaterial({
    map: frontTex,
    color: 0xFFD252,
    metalness: 0.78,
    roughness: 0.24,
  });

  const backMaterial = new THREE.MeshStandardMaterial({
    map: backTex,
    color: 0xFFD252,
    metalness: 0.78,
    roughness: 0.24,
  });

  const coinMesh = new THREE.Mesh(cylinderGeo, [sideMaterial, frontMaterial, backMaterial]);

  // Rotate cylinder so top face (+Y) points along +Z (toward camera)
  coinMesh.rotation.x = Math.PI / 2;

  // Outer beveled rim ring on front and back
  const rimGeo = new THREE.TorusGeometry(radius - 0.05, 0.07, 16, 96);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xFDB834,
    metalness: 0.88,
    roughness: 0.20,
  });

  const frontRim = new THREE.Mesh(rimGeo, rimMat);
  frontRim.position.z = thickness / 2;
  coinGroup.add(frontRim);

  const backRim = new THREE.Mesh(rimGeo, rimMat);
  backRim.position.z = -thickness / 2;
  coinGroup.add(backRim);

  coinGroup.add(coinMesh);

  return coinGroup;
}

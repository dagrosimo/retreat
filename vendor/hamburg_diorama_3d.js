/**
 * HAMBURG 1840/1843 — CURATED 3D ARCHITECTURAL DIORAMA & LOCKED GERMANY MAP
 * Pure Three.js 3D Architectural Maquette of Hamburg Center + Locked 16 Bundesländer Map
 * with Cinematic "Whoosh" (ВЖУХ) Zoom-Through & Tight Invisible Camera Walls.
 */
(function () {
  'use strict';

  /* ==========================================================================
     1. PROCEDURAL ARCHITECTURAL TEXTURES (High-DPI CanvasTextures)
     ========================================================================== */
  function makeCanvas(w, h, drawFn) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    drawFn(ctx, w, h);
    const tex = new window.THREE.CanvasTexture(c);
    tex.wrapS = window.THREE.RepeatWrapping;
    tex.wrapT = window.THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
  }

  function buildArchitecturalTextures() {
    // 1. Hanseatic Clinker Red Brick Facade with 19th-century Arched Windows & Sandstone Trim
    const brickFacade = makeCanvas(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#893829';
      ctx.fillRect(0, 0, w, h);

      // Subtle brick course noise
      for (let y = 0; y < h; y += 8) {
        ctx.fillStyle = y % 16 === 0 ? 'rgba(60,18,10,0.18)' : 'rgba(220,165,140,0.08)';
        ctx.fillRect(0, y, w, 2);
        for (let x = (y % 16 === 0 ? 0 : 12); x < w; x += 24) {
          ctx.fillStyle = ((x + y) % 48 === 0) ? 'rgba(45,14,8,0.15)' : 'rgba(180,95,72,0.12)';
          ctx.fillRect(x, y, 20, 6);
        }
      }

      // 4 Floors with sandstone stringcourses
      const floors = 4;
      const fh = h / floors;
      const cols = 4;
      const cw = w / cols;

      for (let f = 0; f < floors; f++) {
        const fy = f * fh;
        // Sandstone cornice ledge
        ctx.fillStyle = '#D5C5AE';
        ctx.fillRect(0, fy, w, 8);
        ctx.fillStyle = '#572218';
        ctx.fillRect(0, fy + 8, w, 3);

        for (let c = 0; c < cols; c++) {
          const cx = c * cw + cw * 0.22;
          const ww = cw * 0.56;
          const wy = fy + fh * 0.22;
          const wh = fh * 0.62;

          // Sandstone window surround & arch
          ctx.fillStyle = '#DFD2BE';
          ctx.fillRect(cx - 5, wy - 4, ww + 10, wh + 10);
          ctx.beginPath();
          ctx.arc(cx + ww / 2, wy + 4, ww / 2 + 5, Math.PI, 0);
          ctx.fill();

          // Dark window glass with warm interior reflection
          const grad = ctx.createLinearGradient(cx, wy, cx + ww, wy + wh);
          grad.addColorStop(0, '#1E2933');
          grad.addColorStop(0.55, '#2C3B47');
          grad.addColorStop(1, '#584836');
          ctx.fillStyle = grad;
          ctx.fillRect(cx, wy, ww, wh);
          ctx.beginPath();
          ctx.arc(cx + ww / 2, wy + 4, ww / 2, Math.PI, 0);
          ctx.fill();

          // White casement muntins (переплёт)
          ctx.fillStyle = '#EAE2D3';
          ctx.fillRect(cx + ww / 2 - 2, wy - 4, 4, wh + 4);
          ctx.fillRect(cx, wy + wh * 0.38, ww, 3);
          ctx.fillRect(cx - 6, wy + wh + 2, ww + 12, 6);
        }
      }
    });

    // 2. Neo-Renaissance Warm Sandstone Facade (for Rathaus, Kunsthalle, Kontorhäuser)
    const sandstoneFacade = makeCanvas(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#D8CBB7';
      ctx.fillRect(0, 0, w, h);

      // Rusticated stone blocks
      for (let y = 0; y < h; y += 16) {
        ctx.fillStyle = 'rgba(90,76,60,0.16)';
        ctx.fillRect(0, y, w, 2);
        for (let x = (y % 32 === 0 ? 0 : 16); x < w; x += 32) {
          ctx.fillRect(x, y, 2, 16);
        }
      }

      const floors = 4;
      const fh = h / floors;
      const cols = 5;
      const cw = w / cols;

      for (let f = 0; f < floors; f++) {
        const fy = f * fh;
        // Classical entablature band
        ctx.fillStyle = '#B8A890';
        ctx.fillRect(0, fy, w, 10);
        ctx.fillStyle = '#EFE7DA';
        ctx.fillRect(0, fy + 3, w, 4);

        for (let c = 0; c < cols; c++) {
          const cx = c * cw + cw * 0.2;
          const ww = cw * 0.6;
          const wy = fy + fh * 0.22;
          const wh = fh * 0.62;

          // Pilaster strip between windows
          ctx.fillStyle = 'rgba(245,239,228,0.65)';
          ctx.fillRect(c * cw + 2, fy + 10, 8, fh - 12);

          // Pediment triangle over window
          ctx.fillStyle = '#9C8D78';
          ctx.beginPath();
          ctx.moveTo(cx - 6, wy - 2);
          ctx.lineTo(cx + ww / 2, wy - 14);
          ctx.lineTo(cx + ww + 6, wy - 2);
          ctx.closePath();
          ctx.fill();

          // Window pane
          const grad = ctx.createLinearGradient(cx, wy, cx, wy + wh);
          grad.addColorStop(0, '#1D2832');
          grad.addColorStop(0.7, '#2F3D48');
          grad.addColorStop(1, '#786145');
          ctx.fillStyle = grad;
          ctx.fillRect(cx, wy, ww, wh);

          // Mullions
          ctx.fillStyle = '#E6DEC8';
          ctx.fillRect(cx + ww / 2 - 1.5, wy, 3, wh);
          ctx.fillRect(cx, wy + wh * 0.36, ww, 3);
        }
      }
    });

    // 3. 17th-Century Hanseatic Fachwerk (Timber-Framed) Facade for Krameramtsstuben & Deichstraße
    const fachwerkFacade = makeCanvas(512, 512, (ctx, w, h) => {
      // Warm lime-plaster & brick infill background
      ctx.fillStyle = '#EFE8DA';
      ctx.fillRect(0, 0, w, h);

      const floors = 3;
      const fh = h / floors;
      const beamColor = '#3A251B';

      for (let f = 0; f < floors; f++) {
        const fy = f * fh;
        // Horizontal oak jetty beams
        ctx.fillStyle = beamColor;
        ctx.fillRect(0, fy, w, 14);
        ctx.fillRect(0, fy + fh - 10, w, 10);
        ctx.fillRect(0, fy + fh * 0.68, w, 8);

        // Vertical posts & diagonal braces
        const bays = 4;
        const bw = w / bays;
        for (let b = 0; b < bays; b++) {
          const bx = b * bw;
          ctx.fillStyle = beamColor;
          ctx.fillRect(bx, fy, 12, fh);

          // Diagonal timber braces in outer bays
          if (b === 0 || b === bays - 1) {
            ctx.strokeStyle = beamColor;
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(bx + 8, fy + fh - 10);
            ctx.lineTo(bx + bw - 4, fy + 14);
            ctx.stroke();
          }

          // Leaded casement window in upper panel
          const wx = bx + 20;
          const wy = fy + 22;
          const ww = bw - 32;
          const wh = fh * 0.42;

          ctx.fillStyle = '#25313A';
          ctx.fillRect(wx, wy, ww, wh);
          // Warm candlelit glow inside
          ctx.fillStyle = 'rgba(218, 165, 92, 0.28)';
          ctx.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);

          // Small lattice muntins
          ctx.fillStyle = '#EFE8DA';
          ctx.fillRect(wx + ww / 2 - 1.5, wy, 3, wh);
          ctx.fillRect(wx, wy + wh / 2 - 1.5, ww, 3);
        }
      }
    });

    // 4. Merchant Plaster Facade (Warm Ochre / Cream Bürgerhaus)
    const merchantFacade = makeCanvas(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#E3D3B7';
      ctx.fillRect(0, 0, w, h);

      const floors = 4;
      const fh = h / floors;
      const cols = 4;
      const cw = w / cols;

      for (let f = 0; f < floors; f++) {
        const fy = f * fh;
        ctx.fillStyle = '#C4B193';
        ctx.fillRect(0, fy, w, 7);

        for (let c = 0; c < cols; c++) {
          const cx = c * cw + cw * 0.22;
          const ww = cw * 0.56;
          const wy = fy + fh * 0.2;
          const wh = fh * 0.62;

          // Dark green Hanseatic shutters
          ctx.fillStyle = '#2F4A3E';
          ctx.fillRect(cx - 10, wy, 8, wh);
          ctx.fillRect(cx + ww + 2, wy, 8, wh);

          // Window frame & glass
          ctx.fillStyle = '#F7F3EB';
          ctx.fillRect(cx - 3, wy - 3, ww + 6, wh + 6);
          ctx.fillStyle = '#222F3A';
          ctx.fillRect(cx, wy, ww, wh);
          ctx.fillStyle = '#F7F3EB';
          ctx.fillRect(cx + ww / 2 - 1.5, wy, 3, wh);
          ctx.fillRect(cx, wy + wh * 0.4, ww, 3);
        }
      }
    });

    // 5. Brick Gothic Cathedral Wall with Pointed Lancet Stained-Glass Windows (St. Petri)
    const gothicBrick = makeCanvas(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#7D3022';
      ctx.fillRect(0, 0, w, h);

      for (let y = 0; y < h; y += 8) {
        ctx.fillStyle = y % 16 === 0 ? 'rgba(40,12,6,0.22)' : 'rgba(200,120,95,0.08)';
        ctx.fillRect(0, y, w, 2);
      }

      // Tall pointed Gothic lancet windows
      const bays = 4;
      const bw = w / bays;
      for (let b = 0; b < bays; b++) {
        const bx = b * bw;
        // Brick buttress pilaster
        ctx.fillStyle = '#632317';
        ctx.fillRect(bx, 0, 18, h);

        const wx = bx + 32;
        const ww = bw - 48;
        const wy = 90;
        const wh = h - 130;

        // Pointed arch outline
        ctx.fillStyle = '#4A1910';
        ctx.beginPath();
        ctx.moveTo(wx - 4, wy + wh);
        ctx.lineTo(wx - 4, wy + 40);
        ctx.quadraticCurveTo(wx + ww / 2, wy - 35, wx + ww + 4, wy + 40);
        ctx.lineTo(wx + ww + 4, wy + wh);
        ctx.closePath();
        ctx.fill();

        // Stained glass interior
        const grad = ctx.createLinearGradient(wx, wy, wx, wy + wh);
        grad.addColorStop(0, '#223342');
        grad.addColorStop(0.5, '#3A4A54');
        grad.addColorStop(1, '#755338');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(wx, wy + wh);
        ctx.lineTo(wx, wy + 42);
        ctx.quadraticCurveTo(wx + ww / 2, wy - 25, wx + ww, wy + 42);
        ctx.lineTo(wx + ww, wy + wh);
        ctx.closePath();
        ctx.fill();

        // Stone tracery bars
        ctx.strokeStyle = '#C5B49E';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(wx + ww / 2, wy - 5);
        ctx.lineTo(wx + ww / 2, wy + wh);
        ctx.stroke();
      }
    });

    // 6. Terracotta Clay Roof Tiles
    const roofTilesRed = makeCanvas(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#9E3E26';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 12) {
        ctx.fillStyle = 'rgba(45,12,5,0.28)';
        ctx.fillRect(0, y, w, 3);
        for (let x = 0; x < w; x += 16) {
          ctx.fillStyle = (x + y) % 32 === 0 ? 'rgba(220,120,85,0.14)' : 'rgba(60,18,10,0.14)';
          ctx.fillRect(x, y + 3, 14, 9);
        }
      }
    });

    // 7. Dark Blue-Gray Hanseatic Slate Shingles
    const roofSlate = makeCanvas(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#3B434A';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 10) {
        ctx.fillStyle = 'rgba(18,22,26,0.32)';
        ctx.fillRect(0, y, w, 2);
        for (let x = (y % 20 === 0 ? 0 : 8); x < w; x += 16) {
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(x, y + 2, 14, 7);
        }
      }
    });

    // 8. Patinated Verdigris Hamburg Copper (Rathaus, St. Petri, St. Michaelis roofs & spires)
    const copperPatina = makeCanvas(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#4B8B74';
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 12) {
        ctx.fillStyle = 'rgba(28,64,51,0.28)';
        ctx.fillRect(x, 0, 2, h);
        ctx.fillStyle = 'rgba(135,212,184,0.16)';
        ctx.fillRect(x + 2, 0, 2, h);
      }
      for (let y = 0; y < h; y += 32) {
        ctx.fillStyle = 'rgba(28,64,51,0.22)';
        ctx.fillRect(0, y, w, 2);
      }
    });

    // 9. Cobblestone Ground Texture
    const cobblestone = makeCanvas(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#D7CEBE';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 10) {
        for (let x = (y % 20 === 0 ? 0 : 7); x < w; x += 14) {
          ctx.fillStyle = ((x * 7 + y * 13) % 5 === 0) ? 'rgba(120,108,92,0.16)' : 'rgba(255,250,240,0.2)';
          ctx.fillRect(x, y, 11, 8);
        }
      }
    });
    cobblestone.repeat.set(8, 8);

    return {
      brickFacade,
      sandstoneFacade,
      fachwerkFacade,
      merchantFacade,
      gothicBrick,
      roofTilesRed,
      roofSlate,
      copperPatina,
      cobblestone
    };
  }

  /* ==========================================================================
     2. TRUE 3D HANSEATIC ROOF & BUILDING GEOMETRY BUILDERS (NO FLAT BOXES!)
     ========================================================================== */

  /**
   * Creates a pitched 3D saddle roof mesh (двускатная крыша с коньком и карнизом)
   * Ridge runs along the Z axis (depth `d`), gable faces on +Z and -Z.
   */
  function createPitchedRoofMesh(w, d, hRoof, roofMat, gableMat) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const hw = w / 2;
    const hd = d / 2;
    const ov = 0.22; // roof eave overhang

    // 2 sloped roof planes + 2 triangular gable walls
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-hw - ov, 0);
    roofShape.lineTo(0, hRoof);
    roofShape.lineTo(hw + ov, 0);
    roofShape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: d + ov * 2,
      bevelEnabled: false
    };
    const geom = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    geom.translate(0, 0, -hd - ov);

    // Fix UVs so roof tiles look crisp
    const pos = geom.attributes.position;
    const uvs = geom.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      uvs.setXY(i, (vz + hd) * 0.35, Math.hypot(vx, vy) * 0.45);
    }

    const mesh = new THREE.Mesh(geom, [gableMat || roofMat, roofMat]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    return group;
  }

  /**
   * Builds a genuine 3D Hanseatic Burger/Merchant House with:
   * - Stone foundation plinth
   * - Multi-story textured window walls
   * - Cornice molding
   * - Pitched roof (terracotta tiles, slate, or copper)
   * - Stepped Hanseatic gable (Treppengiebel) with cargo crane beam
   * - Dormer windows & brick chimneys
   */
  function createHanseaticHouse(opts) {
    const THREE = window.THREE;
    const {
      w = 3.2,
      d = 4.4,
      hWall = 4.8,
      hRoof = 2.6,
      wallMat,
      roofMat,
      gableMat,
      steppedGable = true,
      dormers = true,
      chimney = true
    } = opts;

    const group = new THREE.Group();

    // 1. Stone basement plinth
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x7A7267, roughness: 0.85 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.45, d + 0.16), plinthMat);
    plinth.position.y = 0.225;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Main textured building body
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, hWall, d), wallMat);
    body.position.y = 0.45 + hWall / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 3. Stone cornice band under roof
    const corniceMat = new THREE.MeshStandardMaterial({ color: 0xDFD4C0, roughness: 0.7 });
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, 0.22, d + 0.24), corniceMat);
    cornice.position.y = 0.45 + hWall + 0.11;
    cornice.castShadow = true;
    group.add(cornice);

    const roofBaseY = 0.45 + hWall + 0.2;

    // 4. Pitched Saddle Roof
    const roof = createPitchedRoofMesh(w, d, hRoof, roofMat, gableMat || wallMat);
    roof.position.y = roofBaseY;
    group.add(roof);

    // 5. Stepped Hanseatic Gable (Treppengiebel) on the front (+Z) and back (-Z)
    if (steppedGable) {
      const steps = 5;
      const gMat = gableMat || wallMat;
      for (let s = 0; s < steps; s++) {
        const frac = 1 - s / steps;
        const sw = w * frac * 0.92;
        const sh = (hRoof / steps) * 1.18;
        const sy = roofBaseY + (s + 0.45) * (hRoof / steps);

        const stepFront = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, 0.34), gMat);
        stepFront.position.set(0, sy, d / 2 + 0.08);
        stepFront.castShadow = true;
        group.add(stepFront);

        // Sandstone cap on each step
        const cap = new THREE.Mesh(new THREE.BoxGeometry(sw + 0.14, 0.1, 0.42), corniceMat);
        cap.position.set(0, sy + sh / 2 + 0.04, d / 2 + 0.08);
        group.add(cap);
      }

      // Traditional Hanseatic attic hoist beam (Ladebalken) projecting from top gable
      const beamMat = new THREE.MeshStandardMaterial({ color: 0x3A251B, roughness: 0.9 });
      const hoist = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.95), beamMat);
      hoist.position.set(0, roofBaseY + hRoof * 0.78, d / 2 + 0.45);
      group.add(hoist);
    }

    // 6. Roof Dormer Windows (Люкарны) along both roof slopes
    if (dormers && d >= 3.4) {
      const dormerCount = Math.max(1, Math.floor(d / 2.2));
      for (let i = 0; i < dormerCount; i++) {
        const dz = -d * 0.3 + (dormerCount > 1 ? (i / (dormerCount - 1)) * (d * 0.6) : 0);
        [-1, 1].forEach((side) => {
          const dBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.75, 0.62),
            corniceMat
          );
          dBox.position.set(side * (w * 0.28), roofBaseY + hRoof * 0.38, dz);
          dBox.castShadow = true;
          group.add(dBox);

          const dRoof = new THREE.Mesh(
            new THREE.ConeGeometry(0.52, 0.48, 4),
            roofMat
          );
          dRoof.rotation.y = Math.PI / 4;
          dRoof.position.set(side * (w * 0.28), roofBaseY + hRoof * 0.38 + 0.58, dz);
          group.add(dRoof);
        });
      }
    }

    // 7. Brick Chimney on roof ridge
    if (chimney) {
      const chimMat = new THREE.MeshStandardMaterial({ color: 0x7A2E20, roughness: 0.85 });
      const chim = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.1, 0.42), chimMat);
      chim.position.set(w * 0.12, roofBaseY + hRoof + 0.2, -d * 0.15);
      chim.castShadow = true;
      group.add(chim);
    }

    return group;
  }

  /**
   * Builds a 19th-Century Mansard Kontorhaus / Boulevard Block with corner cupola turret
   */
  function createMansardBuilding(opts) {
    const THREE = window.THREE;
    const {
      w = 6.0,
      d = 5.0,
      hWall = 5.4,
      hRoof = 2.1,
      wallMat,
      roofMat,
      copperMat,
      hasCornerTurret = false
    } = opts;

    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xD9CCB8, roughness: 0.75 });
    const darkBaseMat = new THREE.MeshStandardMaterial({ color: 0x8E8374, roughness: 0.85 });

    // Rusticated ground floor
    const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 1.2, d + 0.2), darkBaseMat);
    base.position.y = 0.6;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Main stories
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, hWall - 1.2, d), wallMat);
    body.position.y = 1.2 + (hWall - 1.2) / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Cornice ledge
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.35, 0.28, d + 0.35), stoneMat);
    cornice.position.y = hWall + 0.14;
    cornice.castShadow = true;
    group.add(cornice);

    // Steep Mansard Roof (4-sided frustum)
    const mansardGeom = new THREE.CylinderGeometry(
      Math.min(w, d) * 0.42,
      Math.max(w, d) * 0.68,
      hRoof,
      4
    );
    mansardGeom.rotateY(Math.PI / 4);
    mansardGeom.scale(w / Math.max(w, d), 1, d / Math.max(w, d));
    const mansard = new THREE.Mesh(mansardGeom, roofMat);
    mansard.position.y = hWall + 0.28 + hRoof / 2;
    mansard.castShadow = true;
    mansard.receiveShadow = true;
    group.add(mansard);

    // Flat top deck with skylight frame
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w * 0.56, 0.22, d * 0.56), stoneMat);
    deck.position.y = hWall + 0.28 + hRoof;
    group.add(deck);

    // Row of dormer windows on front and back slopes
    const nDorm = Math.max(2, Math.floor(w / 1.8));
    for (let i = 0; i < nDorm; i++) {
      const dx = -w * 0.32 + (i / (nDorm - 1)) * (w * 0.64);
      [-1, 1].forEach((side) => {
        const dorm = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.82, 0.55), stoneMat);
        dorm.position.set(dx, hWall + 0.85, side * (d * 0.42));
        dorm.castShadow = true;
        group.add(dorm);
      });
    }

    // Optional Corner Belvedere Turret with Verdigris Copper Dome
    if (hasCornerTurret && copperMat) {
      const tx = w / 2 - 0.35;
      const tz = d / 2 - 0.35;
      const turretShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.88, hWall + 1.5, 8),
        stoneMat
      );
      turretShaft.position.set(tx, (hWall + 1.5) / 2, tz);
      turretShaft.castShadow = true;
      group.add(turretShaft);

      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.92, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
        copperMat
      );
      dome.position.set(tx, hWall + 1.5, tz);
      dome.castShadow = true;
      group.add(dome);

      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.8, 8), copperMat);
      spire.position.set(tx, hWall + 2.9, tz);
      group.add(spire);
    }

    return group;
  }

  /* ==========================================================================
     3. THE 7 HERO LANDMARKS OF HAMBURG — CUSTOM SCULPTED 3D MODELS
     ========================================================================== */

  /**
   * 01: HAMBURGER KUNSTHALLE (1869 Schirrmacher & Hude Italianate Palace + Modern Cube)
   */
  function buildLandmark01Kunsthalle(mats) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xDDD0BC, roughness: 0.72 });
    const travertineMat = new THREE.MeshStandardMaterial({ color: 0xEFEAE0, roughness: 0.6 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x263947, roughness: 0.25, metalness: 0.5 });

    // 1. Raised Museum Bastion Terrace overlooking the Binnenalster
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(11.8, 1.2, 8.2), stoneMat);
    terrace.position.y = 0.6;
    terrace.castShadow = true;
    terrace.receiveShadow = true;
    group.add(terrace);

    // Grand ceremonial front staircase
    for (let s = 0; s < 4; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.3, 0.45 * (4 - s)),
        stoneMat
      );
      step.position.set(-1.6, 0.15 + s * 0.3, 4.1 + (4 - s) * 0.22);
      step.receiveShadow = true;
      group.add(step);
    }

    // 2. Historic 1869 Red-Brick & Sandstone Renaissance Palace (Left/Center on Terrace)
    const palX = -1.6;
    // Rusticated sandstone ground story
    const palBase = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.5, 5.2), mats.sandstone);
    palBase.position.set(palX, 1.2 + 0.75, 0);
    palBase.castShadow = true;
    palBase.receiveShadow = true;
    group.add(palBase);

    // Upper red-brick gallery stories
    const palUpper = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.7, 4.9), mats.brick);
    palUpper.position.set(palX, 1.2 + 1.5 + 1.35, 0);
    palUpper.castShadow = true;
    palUpper.receiveShadow = true;
    group.add(palUpper);

    // 4 Projecting Corner Risalit Pavilions with Hipped Slate Roofs
    [[-2.8, -2.0], [2.8, -2.0], [-2.8, 2.0], [2.8, 2.0]].forEach(([dx, dz]) => {
      const pav = new THREE.Mesh(new THREE.BoxGeometry(1.75, 4.5, 1.75), mats.brick);
      pav.position.set(palX + dx, 1.2 + 2.25, dz);
      pav.castShadow = true;
      group.add(pav);

      const pavRoof = new THREE.Mesh(new THREE.ConeGeometry(1.38, 1.45, 4), mats.slate);
      pavRoof.rotation.y = Math.PI / 4;
      pavRoof.position.set(palX + dx, 1.2 + 4.5 + 0.72, dz);
      pavRoof.castShadow = true;
      group.add(pavRoof);
    });

    // Front Classical Portico Loggia with Columns & Pediment
    const portico = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.8, 0.9), mats.sandstone);
    portico.position.set(palX, 1.2 + 1.9, 2.65);
    portico.castShadow = true;
    group.add(portico);

    const pediment = createPitchedRoofMesh(2.8, 1.1, 0.95, mats.slate, stoneMat);
    pediment.position.set(palX, 1.2 + 3.8, 2.65);
    group.add(pediment);

    // Central Octagonal Rotunda Drum & Copper Belvedere Dome
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.65, 1.6, 8), mats.sandstone);
    drum.position.set(palX, 1.2 + 4.2 + 0.8, 0);
    drum.castShadow = true;
    group.add(drum);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.58, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
      mats.copper
    );
    dome.position.set(palX, 1.2 + 5.75, 0);
    dome.castShadow = true;
    group.add(dome);

    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.9, 8), mats.copper);
    lantern.position.set(palX, 1.2 + 7.2, 0);
    group.add(lantern);

    // 3. Ungers Modernist Travertine Cube Pavilion (Right on Terrace)
    const cubeX = 3.5;
    const glassRecess = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.0, 2.8), glassMat);
    glassRecess.position.set(cubeX, 1.2 + 0.5, 0);
    group.add(glassRecess);

    const cubeBody = new THREE.Mesh(new THREE.BoxGeometry(3.3, 3.1, 3.3), travertineMat);
    cubeBody.position.set(cubeX, 1.2 + 1.0 + 1.55, 0);
    cubeBody.castShadow = true;
    cubeBody.receiveShadow = true;
    group.add(cubeBody);

    // Grid of square windows on the Ungers Cube + skylight pyramid
    const skylight = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.75, 4), glassMat);
    skylight.rotation.y = Math.PI / 4;
    skylight.position.set(cubeX, 1.2 + 4.1 + 0.37, 0);
    group.add(skylight);

    return group;
  }

  /**
   * 02: KRAMERAMTSSTUBEN & ST. MICHAELIS (17th-c. Timber-Framed Courtyard + Baroque Michel Spire)
   */
  function buildLandmark02Krameramtsstuben(mats) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const cobblePlinth = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.3, 8.8),
      new THREE.MeshStandardMaterial({ color: 0xC6BAA6, roughness: 0.9 })
    );
    cobblePlinth.position.y = 0.15;
    cobblePlinth.receiveShadow = true;
    group.add(cobblePlinth);

    // 1. Intimate Narrow Courtyard of 6 Crooked 17th-Century Fachwerk Guild Houses
    const rowConfigs = [
      // Left row of the narrow alley
      { x: -2.2, z: 2.3, w: 2.1, d: 2.2, h: 3.6, hr: 2.1, rot: 0.03 },
      { x: -2.15, z: 0.2, w: 2.2, d: 2.1, h: 4.1, hr: 2.3, rot: -0.02 },
      { x: -2.2, z: -1.8, w: 2.1, d: 2.0, h: 3.8, hr: 2.0, rot: 0.02 },
      // Right row of the narrow alley
      { x: 1.4, z: 2.3, w: 2.1, d: 2.2, h: 3.9, hr: 2.2, rot: -0.03 },
      { x: 1.35, z: 0.2, w: 2.2, d: 2.1, h: 3.5, hr: 2.1, rot: 0.02 },
      { x: 1.4, z: -1.8, w: 2.1, d: 2.0, h: 4.2, hr: 2.4, rot: -0.02 }
    ];

    rowConfigs.forEach((cfg) => {
      const fh = new THREE.Group();
      // Ground floor recessed
      const gf = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.9, 1.35, cfg.d * 0.9), mats.brick);
      gf.position.y = 0.675;
      gf.castShadow = true;
      fh.add(gf);

      // Overhanging timber-framed upper stories (Auskragung)
      const uf = new THREE.Mesh(
        new THREE.BoxGeometry(cfg.w, cfg.h - 1.2, cfg.d),
        mats.fachwerk
      );
      uf.position.y = 1.35 + (cfg.h - 1.2) / 2;
      uf.castShadow = true;
      uf.receiveShadow = true;
      fh.add(uf);

      // Steep red-tile gable roof oriented toward the courtyard alley
      const roof = createPitchedRoofMesh(cfg.w, cfg.d, cfg.hr, mats.redTile, mats.fachwerk);
      roof.rotation.y = Math.PI / 2;
      roof.position.y = cfg.h + 0.12;
      fh.add(roof);

      fh.position.set(cfg.x, 0.3, cfg.z);
      fh.rotation.y = cfg.rot;
      group.add(fh);
    });

    // Wrought-iron arch & gilded guild emblem at courtyard entrance
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x22201E, metalness: 0.7, roughness: 0.4 });
    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 0.14), ironMat);
    archBeam.position.set(-0.4, 3.2, 3.3);
    group.add(archBeam);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xDDA842, metalness: 0.8, roughness: 0.25 });
    const guildSign = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 12), goldMat);
    guildSign.rotation.x = Math.PI / 2;
    guildSign.position.set(-0.4, 2.85, 3.3);
    group.add(guildSign);

    // 2. Towering behind the courtyard: Baroque Church & Copper Lantern Spire of St. Michaelis ("Der Michel")
    const michelX = -0.4;
    const michelZ = -3.2;

    // Baroque brick nave & transept
    const nave = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.4, 2.6), mats.brick);
    nave.position.set(michelX, 0.3 + 2.2, michelZ);
    nave.castShadow = true;
    group.add(nave);

    const naveRoof = createPitchedRoofMesh(5.6, 2.6, 2.1, mats.copper, mats.brick);
    naveRoof.rotation.y = Math.PI / 2;
    naveRoof.position.set(michelX, 0.3 + 4.4, michelZ);
    group.add(naveRoof);

    // Monumental Brick & Sandstone West Tower
    const towerShaft = new THREE.Mesh(new THREE.BoxGeometry(2.65, 8.2, 2.65), mats.brick);
    towerShaft.position.set(michelX, 0.3 + 4.1, michelZ - 0.1);
    towerShaft.castShadow = true;
    group.add(towerShaft);

    // 4 Golden Clock Dials
    [[0, 1.35, 0], [0, -1.35, 0], [1.35, 0, Math.PI / 2], [-1.35, 0, Math.PI / 2]].forEach(([dx, dz, ry]) => {
      const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 16), goldMat);
      clock.rotation.x = Math.PI / 2;
      clock.rotation.z = ry;
      clock.position.set(michelX + dx, 7.2, michelZ - 0.1 + dz);
      group.add(clock);
    });

    // Iconic Verdigris-Copper Baroque Dome, Open Colonnaded Lantern & Spire
    const copperBaseDome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.45, 1.8, 8),
      mats.copper
    );
    copperBaseDome.position.set(michelX, 8.5 + 0.9, michelZ - 0.1);
    copperBaseDome.castShadow = true;
    group.add(copperBaseDome);

    // Open colonnade rotunda (Латерна Михаэлиса)
    const lanternPillars = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.78, 2.1, 8),
      mats.copper
    );
    lanternPillars.position.set(michelX, 10.3 + 1.05, michelZ - 0.1);
    lanternPillars.castShadow = true;
    group.add(lanternPillars);

    const spireCone = new THREE.Mesh(new THREE.ConeGeometry(0.92, 3.2, 8), mats.copper);
    spireCone.position.set(michelX, 12.4 + 1.6, michelZ - 0.1);
    spireCone.castShadow = true;
    group.add(spireCone);

    const crossOrb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), goldMat);
    crossOrb.position.set(michelX, 15.7, michelZ - 0.1);
    group.add(crossOrb);

    return group;
  }

  /**
   * 03: HAUPTKIRCHE ST. PETRI (Brick-Gothic Hall Cathedral + 132m Copper Pyramidal Spire)
   */
  function buildLandmark03StPetri(mats) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xE2AF46, metalness: 0.85, roughness: 0.25 });

    // Raised granite churchyard steps
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(10.2, 0.45, 6.2),
      new THREE.MeshStandardMaterial({ color: 0x9C9283, roughness: 0.85 })
    );
    plinth.position.y = 0.225;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 1. Brick-Gothic 3-aisled Hall Nave with Lancet Stained-Glass Windows
    const nave = new THREE.Mesh(new THREE.BoxGeometry(6.6, 5.2, 4.4), mats.gothicBrick);
    nave.position.set(1.2, 0.45 + 2.6, 0);
    nave.castShadow = true;
    nave.receiveShadow = true;
    group.add(nave);

    // Polygonal Gothic Choir Apse at East (+X)
    const apse = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 5.0, 6), mats.gothicBrick);
    apse.position.set(4.5, 0.45 + 2.5, 0);
    apse.castShadow = true;
    group.add(apse);

    const apseRoof = new THREE.Mesh(new THREE.ConeGeometry(2.25, 3.4, 6), mats.copper);
    apseRoof.position.set(4.5, 0.45 + 5.0 + 1.7, 0);
    apseRoof.castShadow = true;
    group.add(apseRoof);

    // Brick buttresses along north & south walls
    for (let i = -2; i <= 2; i++) {
      [-2.3, 2.3].forEach((zSide) => {
        const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.42, 5.1, 0.45), mats.brick);
        buttress.position.set(1.2 + i * 1.35, 0.45 + 2.55, zSide);
        buttress.castShadow = true;
        group.add(buttress);
      });
    }

    // Steep Verdigris-Copper Nave Roof (Ridge along X)
    const naveRoof = createPitchedRoofMesh(4.4, 6.6, 3.5, mats.copper, mats.brick);
    naveRoof.rotation.y = Math.PI / 2;
    naveRoof.position.set(1.2, 0.45 + 5.2, 0);
    group.add(naveRoof);

    // Delicate Copper Ridge Flèche (Dachreiter)
    const fleche = new THREE.Mesh(new THREE.ConeGeometry(0.32, 2.4, 6), mats.copper);
    fleche.position.set(1.8, 0.45 + 5.2 + 3.5 + 0.9, 0);
    group.add(fleche);

    // 2. Monumental West Brick Tower & Soaring 132m Green-Copper Spire
    const tx = -2.8;
    const towerShaft = new THREE.Mesh(new THREE.BoxGeometry(3.1, 9.6, 3.1), mats.gothicBrick);
    towerShaft.position.set(tx, 0.45 + 4.8, 0);
    towerShaft.castShadow = true;
    towerShaft.receiveShadow = true;
    group.add(towerShaft);

    // 4 Corner Brick Pinnacles at the base of the spire
    [[-1.35, -1.35], [1.35, -1.35], [-1.35, 1.35], [1.35, 1.35]].forEach(([dx, dz]) => {
      const pin = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.8, 4), mats.copper);
      pin.position.set(tx + dx, 0.45 + 9.6 + 0.9, dz);
      group.add(pin);
    });

    // 4 Golden Clock Dials
    [[0, 1.58, 0], [0, -1.58, 0], [1.58, 0, Math.PI / 2], [-1.58, 0, Math.PI / 2]].forEach(([dx, dz, ry]) => {
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 16), goldMat);
      dial.rotation.x = Math.PI / 2;
      dial.rotation.z = ry;
      dial.position.set(tx + dx, 8.2, dz);
      group.add(dial);
    });

    // Needle-sharp Octagonal Copper Spire
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.58, 9.4, 8), mats.copper);
    spire.position.set(tx, 0.45 + 9.6 + 4.7, 0);
    spire.castShadow = true;
    group.add(spire);

    // Golden Weathervane Orb at 19.8 units height
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 10), goldMat);
    orb.position.set(tx, 0.45 + 9.6 + 9.45, 0);
    group.add(orb);

    return group;
  }

  /**
   * 04: RATHAUSMARKT & HAMBURGER RATHAUS (Neo-Renaissance Sandstone Palace + Plaza + Monument)
   */
  function buildLandmark04Rathaus(mats) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xDDD0BC, roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xE2AF46, metalness: 0.85, roughness: 0.25 });

    // 1. Patterned Sandstone Plaza (Rathausmarkt) in front (+Z)
    const plaza = new THREE.Mesh(
      new THREE.BoxGeometry(13.2, 0.28, 12.2),
      new THREE.MeshStandardMaterial({ color: 0xCFC2AE, roughness: 0.85 })
    );
    plaza.position.set(0, 0.14, 1.2);
    plaza.receiveShadow = true;
    group.add(plaza);

    // Ornamental inlay mosaic square on Rathausmarkt
    const mosaic = new THREE.Mesh(
      new THREE.BoxGeometry(8.4, 0.31, 4.6),
      new THREE.MeshStandardMaterial({ color: 0xBFB099, roughness: 0.82 })
    );
    mosaic.position.set(0, 0.155, 4.1);
    mosaic.receiveShadow = true;
    group.add(mosaic);

    // 2. Neo-Renaissance Rathaus Palace (Main Front Wing + Two Lateral Courtyard Wings)
    // Main symmetrical front wing
    const frontWing = createMansardBuilding({
      w: 11.4,
      d: 3.4,
      hWall: 4.8,
      hRoof: 1.95,
      wallMat: mats.sandstone,
      roofMat: mats.copper,
      copperMat: mats.copper
    });
    frontWing.position.set(0, 0.28, -0.4);
    group.add(frontWing);

    // Left & Right Courtyard Wings framing the Ehrenhof
    [-4.3, 4.3].forEach((wx) => {
      const sideWing = createMansardBuilding({
        w: 2.8,
        d: 4.2,
        hWall: 4.6,
        hRoof: 1.8,
        wallMat: mats.sandstone,
        roofMat: mats.copper
      });
      sideWing.position.set(wx, 0.28, -3.2);
      group.add(sideWing);

      // Front corner pavilion towers with copper cupolas
      const pav = new THREE.Mesh(new THREE.BoxGeometry(2.3, 5.4, 3.8), mats.sandstone);
      pav.position.set(wx * 1.05, 0.28 + 2.7, -0.4);
      pav.castShadow = true;
      group.add(pav);

      const pavRoof = new THREE.Mesh(new THREE.ConeGeometry(1.85, 2.2, 4), mats.copper);
      pavRoof.rotation.y = Math.PI / 4;
      pavRoof.position.set(wx * 1.05, 0.28 + 5.4 + 1.1, -0.4);
      pavRoof.castShadow = true;
      group.add(pavRoof);
    });

    // Rear Emperor Wing (Kaisersaal) enclosing the Ehrenhof courtyard
    const rearWing = createMansardBuilding({
      w: 6.4,
      d: 2.2,
      hWall: 4.5,
      hRoof: 1.7,
      wallMat: mats.sandstone,
      roofMat: mats.copper
    });
    rearWing.position.set(0, 0.28, -4.4);
    group.add(rearWing);

    // 3. Central 112m Neo-Renaissance Rathaus Clock Tower
    const towerBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9.2, 2.5), mats.sandstone);
    towerBase.position.set(0, 0.28 + 4.6, -0.2);
    towerBase.castShadow = true;
    towerBase.receiveShadow = true;
    group.add(towerBase);

    // Octagonal Sandstone Belfry Stage
    const belfry = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.32, 2.4, 8), mats.sandstone);
    belfry.position.set(0, 9.48 + 1.2, -0.2);
    belfry.castShadow = true;
    group.add(belfry);

    // Golden Clock & Phönix Crest
    const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16), goldMat);
    clock.rotation.x = Math.PI / 2;
    clock.position.set(0, 8.3, 1.08);
    group.add(clock);

    // Multi-tiered Baroque Copper Spire of the Rathaus
    const onionDome = new THREE.Mesh(new THREE.SphereGeometry(1.18, 12, 10), mats.copper);
    onionDome.scale.set(1, 1.15, 1);
    onionDome.position.set(0, 12.1, -0.2);
    onionDome.castShadow = true;
    group.add(onionDome);

    const spireTop = new THREE.Mesh(new THREE.ConeGeometry(0.75, 4.2, 8), mats.copper);
    spireTop.position.set(0, 14.8, -0.2);
    spireTop.castShadow = true;
    group.add(spireTop);

    const eagleOrb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), goldMat);
    eagleOrb.position.set(0, 17.0, -0.2);
    group.add(eagleOrb);

    // 4. Bronze Equestrian Monument & Flagpoles on Rathausmarkt Plaza
    const ped = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 1.6), stoneMat);
    ped.position.set(0, 0.28 + 0.55, 4.1);
    ped.castShadow = true;
    group.add(ped);

    const statue = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 1.05), mats.copper);
    statue.position.set(0, 0.28 + 1.45, 4.1);
    statue.castShadow = true;
    group.add(statue);

    return group;
  }

  /**
   * 05: GÄNSEMARKT & LESSING-DENKMAL (Triangular Historic Square + 1881 Seated Bronze Lessing Monument)
   */
  function buildLandmark05Gaensemarkt(mats) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const graniteMat = new THREE.MeshStandardMaterial({ color: 0x9E9589, roughness: 0.78 });
    const redGraniteMat = new THREE.MeshStandardMaterial({ color: 0x8F493A, roughness: 0.55 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x3D6E5B, roughness: 0.42, metalness: 0.45 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xE2B857, roughness: 0.3, metalness: 0.8 });

    // 1. Triangular / Octagonal Cobblestone Square
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.8, 0.3, 8), graniteMat);
    plaza.position.y = 0.15;
    plaza.receiveShadow = true;
    group.add(plaza);

    // 2. Central Lessing Monument (Schaper 1881): Stepped Base + Red Granite Pedestal + Seated Bronze Lessing
    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, 0.35, 8), graniteMat);
    step1.position.y = 0.3 + 0.175;
    step1.receiveShadow = true;
    group.add(step1);

    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.75, 0.35, 8), graniteMat);
    step2.position.y = 0.65 + 0.175;
    group.add(step2);

    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.95, 1.45), redGraniteMat);
    pedestal.position.y = 1.0 + 0.975;
    pedestal.castShadow = true;
    group.add(pedestal);

    // Bronze portrait relief medallions on pedestal sides
    [[0, 0.75], [0, -0.75], [0.75, 0], [-0.75, 0]].forEach(([dx, dz]) => {
      const med = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), bronzeMat);
      med.position.set(dx, 1.95, dz);
      group.add(med);
    });

    // Seated Bronze Statue of Gotthold Ephraim Lessing in 18th-century armchair
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.95), bronzeMat);
    chair.position.set(0, 2.95 + 0.52, 0);
    chair.castShadow = true;
    group.add(chair);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.15, 10), bronzeMat);
    torso.position.set(0, 3.85, 0.05);
    torso.castShadow = true;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), bronzeMat);
    head.position.set(0, 4.65, 0.08);
    head.castShadow = true;
    group.add(head);

    // 4 Ornate Cast-Iron Candelabra Lamps framing the Monument
    [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]].forEach(([lx, lz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 2.5, 8), bronzeMat);
      post.position.set(lx, 0.3 + 1.25, lz);
      post.castShadow = true;
      group.add(post);

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), goldMat);
      globe.position.set(lx, 0.3 + 2.6, lz);
      group.add(globe);
    });

    // Two Flanking Classicist Gänsemarkt Burger Houses behind the square (-Z)
    const houseL = createHanseaticHouse({
      w: 2.8,
      d: 3.2,
      hWall: 4.5,
      hRoof: 2.2,
      wallMat: mats.merchant,
      roofMat: mats.slate,
      steppedGable: true
    });
    houseL.position.set(-2.9, 0.2, -3.1);
    group.add(houseL);

    const houseR = createHanseaticHouse({
      w: 2.8,
      d: 3.2,
      hWall: 4.8,
      hRoof: 2.4,
      wallMat: mats.brick,
      roofMat: mats.redTile,
      steppedGable: true
    });
    houseR.position.set(2.9, 0.2, -3.1);
    group.add(houseR);

    return group;
  }

  /**
   * 06: DEICHSTRASSE & NIKOLAIFLEET (Row of 6 Historic Canal Merchant Houses + Pontoons)
   */
  function buildLandmark06Deichstrasse(mats) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    // Stone Canal Quay Platform along the Nikolaifleet
    const quay = new THREE.Mesh(
      new THREE.BoxGeometry(11.6, 0.7, 5.2),
      new THREE.MeshStandardMaterial({ color: 0x8A8073, roughness: 0.88 })
    );
    quay.position.y = 0.35;
    quay.castShadow = true;
    quay.receiveShadow = true;
    group.add(quay);

    // 6 Iconic Narrow Gabled Merchant Houses of Deichstraße (standing shoulder-to-shoulder)
    const specs = [
      { x: -4.4, w: 1.75, d: 3.6, hw: 4.8, hr: 2.5, mat: mats.brick, rMat: mats.redTile, step: true },
      { x: -2.65, w: 1.7, d: 3.8, hw: 5.4, hr: 2.7, mat: mats.fachwerk, rMat: mats.redTile, step: false },
      { x: -0.9, w: 1.8, d: 3.7, hw: 5.1, hr: 2.6, mat: mats.merchant, rMat: mats.slate, step: true },
      { x: 0.9, w: 1.75, d: 3.9, hw: 5.7, hr: 2.8, mat: mats.brick, rMat: mats.redTile, step: true },
      { x: 2.65, w: 1.7, d: 3.6, hw: 4.6, hr: 2.4, mat: mats.fachwerk, rMat: mats.redTile, step: false },
      { x: 4.4, w: 1.8, d: 3.8, hw: 5.2, hr: 2.6, mat: mats.sandstone, rMat: mats.slate, step: true }
    ];

    specs.forEach((s) => {
      const h = createHanseaticHouse({
        w: s.w,
        d: s.d,
        hWall: s.hw,
        hRoof: s.hr,
        wallMat: s.mat,
        roofMat: s.rMat,
        steppedGable: s.step,
        dormers: true,
        chimney: true
      });
      h.position.set(s.x, 0.7, -0.2);
      group.add(h);
    });

    // Wooden Canal Landing Pontoons & Mooring Piles in front (+Z into Nikolaifleet)
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5A3D2B, roughness: 0.9 });
    const pontoon = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.18, 1.1), woodMat);
    pontoon.position.set(0, 0.25, 3.15);
    pontoon.receiveShadow = true;
    group.add(pontoon);

    for (let px = -3.4; px <= 3.4; px += 1.7) {
      const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.3, 8), woodMat);
      pile.position.set(px, 0.55, 3.75);
      pile.castShadow = true;
      group.add(pile);
    }

    return group;
  }

  /**
   * 07: MUSEUM FÜR HAMBURGISCHE GESCHICHTE (Fritz Schumacher 1922 Red-Brick Complex at Holstenwall)
   */
  function buildLandmark07HistoryMuseum(mats) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const parkMat = new THREE.MeshStandardMaterial({ color: 0x6D8256, roughness: 0.9 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xDFD3BF, roughness: 0.75 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x3A586B, roughness: 0.25, metalness: 0.45 });

    // 1. Landscaped Holstenwall Bastion Mound
    const bastion = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.65, 8.6), parkMat);
    bastion.position.y = 0.325;
    bastion.receiveShadow = true;
    group.add(bastion);

    // 2. Main Schumacher Long Red-Brick Wing with Dramatic High-Pitched Hipped Red-Tile Roof
    const mainWing = createHanseaticHouse({
      w: 8.6,
      d: 3.4,
      hWall: 4.2,
      hRoof: 3.2,
      wallMat: mats.brick,
      roofMat: mats.redTile,
      steppedGable: false,
      dormers: true,
      chimney: true
    });
    mainWing.rotation.y = Math.PI / 2;
    mainWing.position.set(0, 0.65, 1.5);
    group.add(mainWing);

    // 3. Transverse North Wing & Glazed Inner Courtyard (Крытый стеклянный двор музея)
    const sideWing = createHanseaticHouse({
      w: 3.4,
      d: 4.8,
      hWall: 4.2,
      hRoof: 2.9,
      wallMat: mats.brick,
      roofMat: mats.redTile,
      steppedGable: true,
      dormers: true
    });
    sideWing.position.set(-2.6, 0.65, -1.2);
    group.add(sideWing);

    // Glass-vaulted Museum Courtyard Roof between wings
    const glassCourt = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.8, 3.6), glassMat);
    glassCourt.position.set(1.2, 0.65 + 1.9, -1.2);
    glassCourt.castShadow = true;
    group.add(glassCourt);

    const glassVault = createPitchedRoofMesh(3.8, 3.6, 1.4, glassMat, stoneMat);
    glassVault.position.set(1.2, 0.65 + 3.8, -1.2);
    group.add(glassVault);

    // 4. Historic Baroque Sandstone Petri-Portal & Cylindrical Brick Corner Tower
    const portal = new THREE.Mesh(new THREE.BoxGeometry(1.9, 3.6, 0.55), stoneMat);
    portal.position.set(0.4, 0.65 + 1.8, 3.35);
    portal.castShadow = true;
    group.add(portal);

    const roundTower = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.45, 5.6, 14), mats.brick);
    roundTower.position.set(3.5, 0.65 + 2.8, -1.8);
    roundTower.castShadow = true;
    group.add(roundTower);

    const towerCone = new THREE.Mesh(new THREE.ConeGeometry(1.55, 2.6, 14), mats.redTile);
    towerCone.position.set(3.5, 0.65 + 5.6 + 1.3, -1.8);
    towerCone.castShadow = true;
    group.add(towerCone);

    return group;
  }

  /* ==========================================================================
     4. BRIDGES, SHIPS, SAILBOATS & TREES
     ========================================================================== */

  function createStoneArchBridge(length, width, arches = 3) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xC8BBA8, roughness: 0.82 });
    const darkStone = new THREE.MeshStandardMaterial({ color: 0x8F8476, roughness: 0.88 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xE5B95C, roughness: 0.3, metalness: 0.7 });

    // Road deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(length, 0.45, width), stoneMat);
    deck.position.y = 1.05;
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);

    // Stone balustrades
    [-width / 2 + 0.15, width / 2 - 0.15].forEach((bz) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.45, 0.24), stoneMat);
      rail.position.set(0, 1.45, bz);
      rail.castShadow = true;
      group.add(rail);
    });

    // Piers in water
    for (let i = 0; i <= arches; i++) {
      const px = -length / 2 + (i / arches) * length;
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.2, width + 0.35), darkStone);
      pier.position.set(px, 0.55, 0);
      pier.castShadow = true;
      group.add(pier);

      // Bridge lanterns
      [-width / 2 + 0.15, width / 2 - 0.15].forEach((lz) => {
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), goldMat);
        lamp.position.set(px, 1.95, lz);
        group.add(lamp);
      });
    }

    return group;
  }

  function createHanseaticShip(scale = 1) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x4B2F20, roughness: 0.82 });
    const deckMat = new THREE.MeshStandardMaterial({ color: 0xB89468, roughness: 0.85 });
    const sailMat = new THREE.MeshStandardMaterial({ color: 0xF2EAD9, roughness: 0.7 });

    // Hull
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.55, 4.6, 10), hullMat);
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(1, 1, 0.62);
    hull.position.y = 0.32;
    hull.castShadow = true;
    group.add(hull);

    // Deck cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.65, 0.85), deckMat);
    cabin.position.set(-1.1, 0.72, 0);
    cabin.castShadow = true;
    group.add(cabin);

    // Two Wooden Masts with Yards & Furled Sails
    [-0.3, 1.0].forEach((mx, idx) => {
      const mh = idx === 0 ? 3.8 : 3.1;
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, mh, 8), hullMat);
      mast.position.set(mx, 0.5 + mh / 2, 0);
      mast.castShadow = true;
      group.add(mast);

      const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), sailMat);
      yard.rotation.x = Math.PI / 2;
      yard.position.set(mx, 0.5 + mh * 0.68, 0);
      group.add(yard);
    });

    group.scale.setScalar(scale);
    return group;
  }

  function createAlsterSailboat() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x5A3A28, roughness: 0.8 });
    const sailMat = new THREE.MeshStandardMaterial({
      color: 0xFAF5EA,
      roughness: 0.6,
      side: THREE.DoubleSide
    });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 0.55), hullMat);
    hull.position.y = 0.12;
    hull.castShadow = true;
    group.add(hull);

    const sailShape = new THREE.Shape();
    sailShape.moveTo(0, 0.25);
    sailShape.lineTo(0, 1.75);
    sailShape.lineTo(-0.75, 0.35);
    sailShape.closePath();

    const sail = new THREE.Mesh(new THREE.ShapeGeometry(sailShape), sailMat);
    sail.position.x = 0.25;
    sail.castShadow = true;
    group.add(sail);

    return group;
  }

  function createLindenTree(scale = 1, tint = 0x5C754A) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4A3628, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.82 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.1, 7), trunkMat);
    trunk.position.y = 0.55;
    trunk.castShadow = true;
    group.add(trunk);

    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.78, 1), leafMat);
    crown1.position.set(0, 1.45, 0);
    crown1.castShadow = true;
    crown1.receiveShadow = true;
    group.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), leafMat);
    crown2.position.set(0.32, 1.25, 0.22);
    crown2.castShadow = true;
    group.add(crown2);

    group.scale.setScalar(scale);
    return group;
  }

  /**
   * 07-OHLSDORF: PARK-CEMETERY OHLSDORF (Memorial Park Meadow, Neo-Gothic Brick Chapel & Runge/Gensler Steles)
   */
  function buildLandmark07Ohlsdorf(mats) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x678052, roughness: 0.92 });
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xCFC4B0, roughness: 0.88 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xDDD2C0, roughness: 0.75 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x3F6D5B, roughness: 0.45, metalness: 0.45 });

    // Lush memorial park plateau
    const meadow = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.45, 11.5), lawnMat);
    meadow.position.y = 0.225;
    meadow.receiveShadow = true;
    group.add(meadow);

    // Crossed gravel memorial avenues
    const pathX = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.08, 1.5), pathMat);
    pathX.position.set(0, 0.49, 1.2);
    pathX.receiveShadow = true;
    group.add(pathX);

    const pathZ = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 10.8), pathMat);
    pathZ.position.set(0, 0.49, 0);
    pathZ.receiveShadow = true;
    group.add(pathZ);

    // Neo-Gothic Red-Brick Ohlsdorf Memorial Chapel
    const chapel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.8, 3.4), mats.gothicBrick);
    chapel.position.set(-2.2, 0.45 + 1.9, -2.4);
    chapel.castShadow = true;
    chapel.receiveShadow = true;
    group.add(chapel);

    const chapelRoof = createPitchedRoofMesh(3.4, 4.8, 2.3, mats.copper, mats.brick);
    chapelRoof.rotation.y = Math.PI / 2;
    chapelRoof.position.set(-2.2, 0.45 + 3.8, -2.4);
    group.add(chapelRoof);

    const belfry = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.6, 6), mats.copper);
    belfry.position.set(-2.2, 0.45 + 6.1 + 1.1, -2.4);
    belfry.castShadow = true;
    group.add(belfry);

    // Runge Memorial Stele (Althamburgischer Gedächtnisfriedhof) & Gensler Family Monument (Heckengarten)
    const steles = [
      { x: 2.8, z: -1.6, h: 2.3, w: 0.85 },
      { x: 4.3, z: -0.6, h: 1.9, w: 1.1 },
      { x: 3.1, z: 2.8, h: 1.5, w: 0.75 }
    ];
    steles.forEach((st) => {
      const base = new THREE.Mesh(new THREE.BoxGeometry(st.w + 0.35, 0.35, st.w + 0.35), stoneMat);
      base.position.set(st.x, 0.45 + 0.175, st.z);
      group.add(base);

      const pillar = new THREE.Mesh(new THREE.BoxGeometry(st.w, st.h, st.w * 0.55), stoneMat);
      pillar.position.set(st.x, 0.45 + 0.35 + st.h / 2, st.z);
      pillar.castShadow = true;
      group.add(pillar);

      const plaque = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12), bronzeMat);
      plaque.rotation.x = Math.PI / 2;
      plaque.position.set(st.x, 0.45 + 0.35 + st.h * 0.65, st.z + st.w * 0.3);
      group.add(plaque);
    });

    // Park trees framing the cemetery avenues
    const parkTrees = [
      [-5.6, -4.0], [-5.4, 3.6], [5.4, -3.8], [5.5, 3.5], [0.8, -4.2], [-3.2, 3.8]
    ];
    parkTrees.forEach(([tx, tz], i) => {
      const tree = createLindenTree(0.95 + (i % 2) * 0.2, i % 2 === 0 ? 0x4E663E : 0x5E784B);
      tree.position.set(tx, 0.45, tz);
      group.add(tree);
    });

    return group;
  }

  /**
   * Lightweight pitched-roof Hanseatic city block for the deep outer skyline (fast 60fps!)
   */
  function createOuterCityBlock(w, d, hWall, hRoof, wallMat, roofMat, castShadow = false) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, hWall, d), wallMat);
    body.position.y = hWall / 2;
    body.castShadow = castShadow;
    body.receiveShadow = castShadow;
    group.add(body);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(Math.max(w, d) * 0.68, hRoof, 4),
      roofMat
    );
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
    roof.position.y = hWall + hRoof / 2;
    roof.castShadow = castShadow;
    group.add(roof);

    return group;
  }

  /* ==========================================================================
     5. CURATED HAMBURG DIORAMA SCENE (Realistic Compressed Geography + Invisible Walls)
     ========================================================================== */

  // Compressed real Hamburg coordinates (-Z = North, +Z = South, -X = West, +X = East)
  const DIORAMA_LANDMARKS = [
    {
      id: 'hm-1', // 01: Group Hotel & Conference Hall by Binnenalster (Jungfernstieg)
      num: '01',
      x: 0.5,
      z: -2.0,
      pinY: 17.5,
      camTarget: [0.5, 3.0, -2.0],
      camDist: 30,
      camAzimuth: -0.05,
      camPolar: 0.76
    },
    {
      id: 'hm-2', // 02: Hamburger Kunsthalle (East of Binnenalster / Glockengießerwall)
      num: '02',
      x: 24.5,
      z: -15.5,
      pinY: 10.2,
      camTarget: [20.0, 2.2, -14.5],
      camDist: 30,
      camAzimuth: 0.22,
      camPolar: 0.76
    },
    {
      id: 'hm-3', // 03: Deichstraße & Nikolaifleet (South-Central near Elbe)
      num: '03',
      x: -1.5,
      z: 16.5,
      pinY: 9.6,
      camTarget: [-1.5, 2.2, 12.0],
      camDist: 30,
      camAzimuth: 0.08,
      camPolar: 0.78
    },
    {
      id: 'hm-4', // 04: St. Nikolai Memorial & Old Town Hall (East of Deichstraße / Hopfenmarkt)
      num: '04',
      x: 16.5,
      z: 9.5,
      pinY: 20.2,
      camTarget: [15.5, 4.0, 8.5],
      camDist: 32,
      camAzimuth: 0.16,
      camPolar: 0.74
    },
    {
      id: 'hm-5', // 05: Museum für Hamburgische Geschichte (West at Holstenwall Bastion)
      num: '05',
      x: -30.5,
      z: 3.5,
      pinY: 10.5,
      camTarget: [-22.0, 2.4, 3.0],
      camDist: 32,
      camAzimuth: -0.28,
      camPolar: 0.76
    },
    {
      id: 'hm-6', // 06: Caffamacherreihe / Artists' Association Garden (Northwest Neustadt)
      num: '06',
      x: -17.5,
      z: -14.0,
      pinY: 7.4,
      camTarget: [-16.5, 1.8, -13.5],
      camDist: 28,
      camAzimuth: -0.2,
      camPolar: 0.77
    },
    {
      id: 'hm-7', // 07: Park Cemetery Ohlsdorf (Northeast beyond Außenalster)
      num: '07',
      x: 26.5,
      z: -36.0,
      pinY: 9.6,
      camTarget: [20.0, 2.0, -26.0],
      camDist: 34,
      camAzimuth: 0.14,
      camPolar: 0.76
    }
  ];

  class HamburgDioramaStage {
    constructor(opts) {
      this.container = opts.container;
      this.onSelectLandmark = opts.onSelectLandmark || function () {};
      this.onSelectCityFromCountry = opts.onSelectCityFromCountry || function () {};
      this.getLandmarksData = opts.getLandmarksData || function () { return []; };
      this.getCitiesData = opts.getCitiesData || function () { return []; };
      this.loc = opts.loc || function (obj, key) { return obj[key]; };

      this.mode = 'city'; // 'city' | 'country'
      this.isTransitioning = false;
      this._transitionTimer = null;
      this.activeLandmarkId = 'hm-1';
      this.landmarkGroups = {};
      this.pinElements = {};
      this.ships = [];
      this.sailboats = [];

      // Default overview framing: pulled back so ALL 7 spaced-out landmarks + deep city backdrop fit cleanly
      this.DEFAULT_CAM = {
        targetX: -1.5,
        targetY: 1.5,
        targetZ: -7.5,
        distance: 92,
        azimuth: -0.05,
        polar: 0.78
      };

      // Camera spherical coordinates with TIGHT INVISIBLE WALLS
      this.cam = {
        targetX: this.DEFAULT_CAM.targetX,
        targetY: this.DEFAULT_CAM.targetY,
        targetZ: this.DEFAULT_CAM.targetZ,
        distance: this.DEFAULT_CAM.distance,
        azimuth: this.DEFAULT_CAM.azimuth,
        polar: this.DEFAULT_CAM.polar,
        // Goal state for smooth spring interpolation
        goalTargetX: this.DEFAULT_CAM.targetX,
        goalTargetY: this.DEFAULT_CAM.targetY,
        goalTargetZ: this.DEFAULT_CAM.targetZ,
        goalDistance: this.DEFAULT_CAM.distance,
        goalAzimuth: this.DEFAULT_CAM.azimuth,
        goalPolar: this.DEFAULT_CAM.polar
      };

      // STRICT INVISIBLE WALLS around Hamburg center (surrounding city extends to ±125 / -155)
      this.BOUNDS = {
        minX: -22,
        maxX: 20,
        minZ: -26,
        maxZ: 12,
        minDist: 26,
        maxDist: 102,
        minAzimuth: -0.50,
        maxAzimuth: 0.50,
        minPolar: 0.54,
        maxPolar: 0.85
      };

      this.initDOM();
      this.initThreeScene();
      this.buildCityDiorama();
      this.renderLockedCountryMap();
      this.bindInteraction();
      this.animate();
    }

    initDOM() {
      this.container.innerHTML = '';

      // 1. Locked Germany Country Layer (16 Bundesländer — NO DRAGGING, NO ROTATION)
      this.countryLayer = document.createElement('div');
      this.countryLayer.className = 'diorama-country-layer is-hidden';
      this.container.appendChild(this.countryLayer);

      // 2. Three.js 3D City Diorama Layer
      this.cityLayer = document.createElement('div');
      this.cityLayer.className = 'diorama-city-layer';
      this.container.appendChild(this.cityLayer);

      // 3. HTML 3D-Projected Pins Container inside City Layer
      this.pinsLayer = document.createElement('div');
      this.pinsLayer.className = 'diorama-pins-layer';
      this.cityLayer.appendChild(this.pinsLayer);
    }

    initThreeScene() {
      const THREE = window.THREE;
      const w = this.container.clientWidth || 640;
      const h = this.container.clientHeight || 540;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xE8E0CE);
      this.scene.fog = new THREE.FogExp2(0xE8E0CE, 0.0042);

      this.camera = new THREE.PerspectiveCamera(38, w / h, 1, 420);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if ('outputEncoding' in this.renderer && THREE.sRGBEncoding) {
        this.renderer.outputEncoding = THREE.sRGBEncoding;
      }

      this.cityLayer.insertBefore(this.renderer.domElement, this.pinsLayer);

      // Warm Architectural Golden-Hour Lighting
      const hemiLight = new THREE.HemisphereLight(0xFFF7E8, 0x8E7D68, 0.74);
      hemiLight.position.set(0, 60, 0);
      this.scene.add(hemiLight);

      const sunLight = new THREE.DirectionalLight(0xFFF1D6, 1.08);
      sunLight.position.set(44, 64, 40);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 5;
      sunLight.shadow.camera.far = 210;
      const d = 66;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      this.scene.add(sunLight);

      // Soft warm fill light from the Elbe reflection side
      const fillLight = new THREE.DirectionalLight(0xC9DCE6, 0.35);
      fillLight.position.set(-32, 22, -26);
      this.scene.add(fillLight);

      // Highlight ring under active landmark
      const ringGeom = new THREE.RingGeometry(4.2, 5.0, 36);
      ringGeom.rotateX(-Math.PI / 2);
      this.focusRing = new THREE.Mesh(
        ringGeom,
        new THREE.MeshBasicMaterial({ color: 0xC23B1A, side: THREE.DoubleSide })
      );
      this.focusRing.position.set(0.5, 0.45, -2.0);
      this.scene.add(this.focusRing);
    }

    buildCityDiorama() {
      const THREE = window.THREE;
      const tex = buildArchitecturalTextures();

      this.mats = {
        brick: new THREE.MeshStandardMaterial({ map: tex.brickFacade, roughness: 0.78 }),
        sandstone: new THREE.MeshStandardMaterial({ map: tex.sandstoneFacade, roughness: 0.72 }),
        fachwerk: new THREE.MeshStandardMaterial({ map: tex.fachwerkFacade, roughness: 0.8 }),
        merchant: new THREE.MeshStandardMaterial({ map: tex.merchantFacade, roughness: 0.76 }),
        gothicBrick: new THREE.MeshStandardMaterial({ map: tex.gothicBrick, roughness: 0.8 }),
        redTile: new THREE.MeshStandardMaterial({ map: tex.roofTilesRed, roughness: 0.75 }),
        slate: new THREE.MeshStandardMaterial({ map: tex.roofSlate, roughness: 0.68 }),
        copper: new THREE.MeshStandardMaterial({ map: tex.copperPatina, roughness: 0.48, metalness: 0.32 }),
        cobble: new THREE.MeshStandardMaterial({ map: tex.cobblestone, roughness: 0.88 })
      };

      // 1. WATER SYSTEM (Elbe River, Binnenalster, Außenalster, Alsterfleet & Nikolaifleet Canals)
      this.waterMat = new THREE.MeshStandardMaterial({
        color: 0x39687A,
        roughness: 0.24,
        metalness: 0.38
      });
      const waterBase = new THREE.Mesh(new THREE.PlaneGeometry(420, 380, 16, 16), this.waterMat);
      waterBase.rotation.x = -Math.PI / 2;
      waterBase.position.set(0, -0.25, -25);
      waterBase.receiveShadow = true;
      this.scene.add(waterBase);

      // 2. GRANITE QUAY & COBBLESTONE URBAN ISLANDS (extending deep into the horizon on all 4 sides!)
      const quayWallMat = new THREE.MeshStandardMaterial({ color: 0x7E756A, roughness: 0.88 });

      const addLandIsland = (x, z, w, d, h = 0.6, castShadow = true) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w + 0.35, h, d + 0.35), quayWallMat);
        wall.position.set(x, -0.3 + h / 2, z);
        wall.receiveShadow = true;
        wall.castShadow = castShadow;
        this.scene.add(wall);

        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), this.mats.cobble);
        top.position.set(x, -0.3 + h + 0.07, z);
        top.receiveShadow = true;
        this.scene.add(top);
      };

      // Neustadt West Quarter (Holstenwall, Caffamacherreihe, St. Michaelis + deep West Hamburg)
      addLandIsland(-72.0, -16.0, 125.0, 82.0, 0.6, true);
      // Altstadt Central Island (Jungfernstieg Hotel & Deichstraße) -> Between Alsterfleet (-9.5..-6.5) & Nikolaifleet (6.5..9.5)
      addLandIsland(0.0, 8.5, 13.0, 33.0, 0.6, true);
      // Altstadt East Quarter (Kunsthalle, St. Nikolai, Ohlsdorf + deep East Hamburg)
      addLandIsland(74.5, -16.0, 129.0, 82.0, 0.6, true);
      // Far North Hamburg (Winterhude / Eppendorf / Barmbek closing off the northern horizon beyond Außenalster!)
      addLandIsland(0.0, -110.0, 275.0, 110.0, 0.6, false);
      // South Harbor / Speicherstadt / Wilhelmsburg across the Elbe (z > 37)
      addLandIsland(0.0, 64.0, 275.0, 54.0, 0.6, false);

      // Green Bastion Park Strip along Holstenwall (West) around History Museum
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x768B5E, roughness: 0.9 });
      const parkStrip = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.18, 34.0), grassMat);
      parkStrip.position.set(-31.5, 0.38, 1.0);
      parkStrip.receiveShadow = true;
      this.scene.add(parkStrip);

      // White Circular Alsterpavillon & Pier on Jungfernstieg overlooking Binnenalster
      const pavMat = new THREE.MeshStandardMaterial({ color: 0xF5EFE2, roughness: 0.65 });
      const alsterPav = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, 1.1, 12), pavMat);
      alsterPav.position.set(-1.5, 0.85, -8.5);
      alsterPav.castShadow = true;
      this.scene.add(alsterPav);

      const alsterDome = new THREE.Mesh(
        new THREE.SphereGeometry(1.42, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
        this.mats.copper
      );
      alsterDome.position.set(-1.5, 1.4, -8.5);
      this.scene.add(alsterDome);

      // 3. HISTORIC STONE ARCH BRIDGES ACROSS CANALS & ALSTER
      // Lombardsbrücke (Separating Binnenalster and Außenalster)
      const lombards = createStoneArchBridge(20.5, 2.8, 3);
      lombards.position.set(0.5, -0.35, -24.0);
      this.scene.add(lombards);

      // Kennedybrücke (Further north across Außenalster)
      const kennedy = createStoneArchBridge(20.5, 2.4, 3);
      kennedy.position.set(0.5, -0.35, -35.0);
      this.scene.add(kennedy);

      // Schleusenbrücke (Connecting Jungfernstieg/Altstadt across Alsterfleet)
      const schleusen = createStoneArchBridge(4.4, 2.4, 2);
      schleusen.position.set(-8.0, -0.35, -2.5);
      this.scene.add(schleusen);

      // Trostbrücke (Connecting Altstadt Island to St. Nikolai across Nikolaifleet)
      const trost = createStoneArchBridge(4.4, 2.2, 2);
      trost.position.set(8.2, -0.35, 6.5);
      this.scene.add(trost);

      // Hohe Brücke (South end of Nikolaifleet near Deichstraße & Elbe)
      const hohe = createStoneArchBridge(4.4, 2.0, 2);
      hohe.position.set(8.2, -0.35, 17.5);
      this.scene.add(hohe);

      // 4. MOUNT THE 7 CUSTOM 3D LANDMARK MODELS (matched 1-to-1 with data.js!)
      const builders = {
        'hm-1': () => buildLandmark04Rathaus(this.mats),       // 01: Group Hotel & Rathausmarkt at Binnenalster
        'hm-2': () => buildLandmark01Kunsthalle(this.mats),    // 02: Hamburger Kunsthalle
        'hm-3': () => buildLandmark06Deichstrasse(this.mats),  // 03: Deichstraße & Nikolaifleet
        'hm-4': () => buildLandmark03StPetri(this.mats),       // 04: St. Nikolai Spire & Old Town Hall
        'hm-5': () => buildLandmark07HistoryMuseum(this.mats), // 05: Museum für Hamburgische Geschichte
        'hm-6': () => buildLandmark05Gaensemarkt(this.mats),   // 06: Caffamacherreihe / Artists' Garden
        'hm-7': () => buildLandmark07Ohlsdorf(this.mats)       // 07: Park Cemetery Ohlsdorf
      };

      DIORAMA_LANDMARKS.forEach((lm) => {
        const modelGroup = builders[lm.id]();
        modelGroup.position.set(lm.x, 0.35, lm.z);
        modelGroup.userData = { landmarkId: lm.id };
        modelGroup.traverse((child) => {
          if (child.isMesh) {
            child.userData = { landmarkId: lm.id };
          }
        });
        this.scene.add(modelGroup);
        this.landmarkGroups[lm.id] = modelGroup;
      });

      // Bonus iconic Hamburg skyline monument: St. Michaelis ("Der Michel") & Krameramtsstuben in Neustadt
      const michelGroup = buildLandmark02Krameramtsstuben(this.mats);
      michelGroup.position.set(-19.5, 0.35, 14.5);
      this.scene.add(michelGroup);

      // 5. DETAILED INNER HANSEATIC CITY BLOCKS BETWEEN THE 7 LANDMARKS (~1 block spacing)
      const neighborhoodSpecs = [
        // Between Jungfernstieg (hm-1) and Deichstraße (hm-3) on the Central Island
        { type: 'mansard', x: -1.8, z: 7.2, w: 4.8, d: 3.8, hw: 4.9, hr: 1.9, mat: 'sandstone', rMat: 'slate', turret: false },
        { type: 'gable', x: 3.0, z: 7.2, w: 3.0, d: 3.8, hw: 4.8, hr: 2.4, mat: 'brick', rMat: 'redTile', rot: 0 },

        // Between Jungfernstieg (hm-1), Caffamacherreihe (hm-6), History Museum (hm-5) & St. Michaelis
        { type: 'mansard', x: -15.5, z: -2.0, w: 5.4, d: 4.0, hw: 5.0, hr: 2.0, mat: 'sandstone', rMat: 'slate', turret: true },
        { type: 'mansard', x: -15.5, z: 4.5, w: 5.0, d: 3.8, hw: 4.8, hr: 1.9, mat: 'merchant', rMat: 'copper', turret: false },
        { type: 'gable', x: -22.5, z: -3.5, w: 3.4, d: 4.0, hw: 4.7, hr: 2.4, mat: 'brick', rMat: 'redTile', rot: 0 },
        { type: 'gable', x: -22.5, z: 3.5, w: 3.4, d: 4.0, hw: 4.6, hr: 2.3, mat: 'fachwerk', rMat: 'redTile', rot: 0 },
        { type: 'mansard', x: -28.0, z: -13.5, w: 5.6, d: 4.2, hw: 5.0, hr: 2.0, mat: 'merchant', rMat: 'slate', turret: true },
        { type: 'gable', x: -12.5, z: 15.5, w: 3.2, d: 4.0, hw: 4.9, hr: 2.5, mat: 'brick', rMat: 'redTile', rot: 0 },
        { type: 'gable', x: -29.5, z: 16.5, w: 3.8, d: 4.2, hw: 4.8, hr: 2.4, mat: 'brick', rMat: 'redTile', rot: 0 },

        // Between Kunsthalle (hm-2) and St. Nikolai (hm-4) in Altstadt East (Mönckebergstraße / Kontorhausviertel)
        { type: 'mansard', x: 16.5, z: -2.5, w: 5.8, d: 4.2, hw: 5.2, hr: 2.1, mat: 'sandstone', rMat: 'copper', turret: true },
        { type: 'gable', x: 23.5, z: -2.5, w: 3.4, d: 4.0, hw: 5.0, hr: 2.5, mat: 'brick', rMat: 'redTile', rot: 0 },
        { type: 'gable', x: 27.5, z: -2.5, w: 3.2, d: 3.8, hw: 4.8, hr: 2.4, mat: 'merchant', rMat: 'slate', rot: 0 },
        { type: 'mansard', x: 26.5, z: 8.5, w: 5.6, d: 4.4, hw: 5.3, hr: 2.1, mat: 'brick', rMat: 'copper', turret: true },
        { type: 'gable', x: 15.5, z: 18.5, w: 3.6, d: 4.2, hw: 5.4, hr: 2.7, mat: 'brick', rMat: 'redTile', rot: 0 },
        { type: 'gable', x: 20.0, z: 18.5, w: 3.6, d: 4.2, hw: 5.1, hr: 2.6, mat: 'brick', rMat: 'slate', rot: 0 },
        { type: 'gable', x: 25.0, z: 18.5, w: 3.8, d: 4.2, hw: 5.4, hr: 2.7, mat: 'brick', rMat: 'redTile', rot: 0 },

        // Between Kunsthalle (hm-2) and Ohlsdorf (hm-7) along Außenalster East (St. Georg)
        { type: 'mansard', x: 17.5, z: -26.0, w: 5.8, d: 4.2, hw: 5.0, hr: 2.0, mat: 'sandstone', rMat: 'slate', turret: false },
        { type: 'mansard', x: 26.0, z: -26.0, w: 5.6, d: 4.2, hw: 4.9, hr: 2.0, mat: 'merchant', rMat: 'copper', turret: true },
        { type: 'gable', x: 33.5, z: -25.5, w: 3.8, d: 4.0, hw: 4.8, hr: 2.4, mat: 'brick', rMat: 'redTile', rot: 0 },

        // North-West Dammtor / Rotherbaum along Außenalster West (behind Caffamacherreihe)
        { type: 'mansard', x: -16.5, z: -26.0, w: 5.8, d: 4.4, hw: 5.1, hr: 2.0, mat: 'sandstone', rMat: 'slate', turret: true },
        { type: 'mansard', x: -24.5, z: -26.0, w: 5.6, d: 4.4, hw: 4.9, hr: 2.0, mat: 'merchant', rMat: 'copper', turret: false },
        { type: 'gable', x: -32.0, z: -26.0, w: 3.8, d: 4.0, hw: 4.8, hr: 2.4, mat: 'brick', rMat: 'redTile', rot: 0 },
        { type: 'mansard', x: -17.0, z: -36.5, w: 6.0, d: 4.5, hw: 5.0, hr: 2.0, mat: 'merchant', rMat: 'slate', turret: false },
        { type: 'mansard', x: -26.0, z: -36.5, w: 5.8, d: 4.5, hw: 4.9, hr: 2.0, mat: 'sandstone', rMat: 'slate', turret: true }
      ];

      neighborhoodSpecs.forEach((b) => {
        let mesh;
        if (b.type === 'mansard') {
          mesh = createMansardBuilding({
            w: b.w,
            d: b.d,
            hWall: b.hw,
            hRoof: b.hr,
            wallMat: this.mats[b.mat],
            roofMat: this.mats[b.rMat],
            copperMat: this.mats.copper,
            hasCornerTurret: b.turret
          });
        } else {
          mesh = createHanseaticHouse({
            w: b.w,
            d: b.d,
            hWall: b.hw,
            hRoof: b.hr,
            wallMat: this.mats[b.mat],
            roofMat: this.mats[b.rMat],
            steppedGable: true,
            dormers: true,
            chimney: true
          });
        }
        mesh.position.set(b.x, 0.35, b.z);
        if (b.rot) mesh.rotation.y = b.rot;
        this.scene.add(mesh);
      });

      // 5B. DEEP CONTINUOUS OUTER CITY FABRIC (stretching to the horizon North/West/East/South — ZERO void!)
      const wallMats = [this.mats.brick, this.mats.sandstone, this.mats.merchant, this.mats.brick, this.mats.fachwerk];
      const roofMats = [this.mats.redTile, this.mats.slate, this.mats.redTile, this.mats.copper, this.mats.slate];
      const hash = (a, b) => {
        const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
        return s - Math.floor(s);
      };

      const isBlockedForOuter = (x, z) => {
        // Skip core inner city where detailed landmarks & inner blocks live
        if (x > -37 && x < 37 && z > -43 && z < 26) return true;
        // Skip Außenalster / Binnenalster water channel
        if (x > -11 && x < 12 && z > -57 && z < 26) return true;
        // Skip Elbe River
        if (z > 23 && z < 39) return true;
        return false;
      };

      for (let gx = -108; gx <= 108; gx += 11) {
        for (let gz = -138; gz <= 66; gz += 11) {
          const jx = (hash(gx, gz) - 0.5) * 3.2;
          const jz = (hash(gz, gx) - 0.5) * 3.2;
          const bx = gx + jx;
          const bz = gz + jz;
          if (isBlockedForOuter(bx, bz)) continue;

          const r = hash(gx + 7, gz + 13);
          // Leave occasional breathing courtyards/streets
          if (r < 0.14) continue;

          const bw = 4.2 + hash(gx * 2, gz) * 3.4;
          const bd = 4.0 + hash(gx, gz * 2) * 3.2;
          const bh = 3.6 + hash(gx + 3, gz - 5) * 2.8;
          const bhr = 1.7 + hash(gx - 2, gz + 4) * 1.4;
          const wMat = wallMats[Math.floor(hash(gx, gz + 1) * wallMats.length)];
          const rMat = roofMats[Math.floor(hash(gx + 1, gz) * roofMats.length)];
          const nearCore = Math.abs(bx) < 58 && bz > -68 && bz < 48;

          const blk = createOuterCityBlock(bw, bd, bh, bhr, wMat, rMat, nearCore);
          blk.position.set(bx, 0.35, bz);
          this.scene.add(blk);
        }
      }

      // 6. PHILOSOPHICAL ROUTE GOLDEN-TERRACOTTA STUDS CONNECTING 01 -> 07
      const routePoints = [
        new THREE.Vector3(0.5, 0.55, -2.0),   // 01 Hotel / Jungfernstieg
        new THREE.Vector3(12.0, 0.55, -8.0),
        new THREE.Vector3(24.5, 0.55, -15.5), // 02 Kunsthalle
        new THREE.Vector3(16.5, 0.55, 9.5),   // 04 St. Nikolai
        new THREE.Vector3(8.2, 0.9, 17.5),    // Hohe Brücke
        new THREE.Vector3(-1.5, 0.55, 16.5),  // 03 Deichstraße
        new THREE.Vector3(-18.0, 0.55, 8.0),
        new THREE.Vector3(-30.5, 0.55, 3.5),  // 05 History Museum
        new THREE.Vector3(-17.5, 0.55, -14.0),// 06 Caffamacherreihe
        new THREE.Vector3(0.5, 0.9, -24.0),   // Lombardsbrücke
        new THREE.Vector3(26.5, 0.55, -36.0)  // 07 Ohlsdorf
      ];
      const curve = new THREE.CatmullRomCurve3(routePoints);
      const pts = curve.getPoints(96);
      const studMat = new THREE.MeshStandardMaterial({ color: 0xC23B1A, roughness: 0.4 });
      pts.forEach((p, idx) => {
        if (idx % 2 === 0) {
          const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 10), studMat);
          stud.position.copy(p);
          this.scene.add(stud);
        }
      });

      // 7. HISTORIC SHIPS ON THE ELBE & SAILBOATS ON THE BINNENALSTER / AUSSENALSTER
      const shipCoords = [
        { x: -24.0, z: 30.5, scale: 1.25, rot: 0.05 },
        { x: -4.5, z: 31.8, scale: 1.35, rot: -0.04 },
        { x: 16.5, z: 30.2, scale: 1.2, rot: 0.07 },
        { x: 35.0, z: 31.2, scale: 1.15, rot: -0.06 }
      ];
      shipCoords.forEach((sc) => {
        const ship = createHanseaticShip(sc.scale);
        ship.position.set(sc.x, -0.25, sc.z);
        ship.rotation.y = sc.rot;
        this.scene.add(ship);
        this.ships.push(ship);
      });

      const sailCoords = [
        { x: -2.0, z: -15.5, rot: 0.4 },
        { x: 4.2, z: -13.2, rot: -0.3 },
        { x: 1.8, z: -19.2, rot: 0.8 },
        { x: -1.5, z: -30.5, rot: -0.5 },
        { x: 5.5, z: -42.0, rot: 0.3 }
      ];
      sailCoords.forEach((sc) => {
        const boat = createAlsterSailboat();
        boat.position.set(sc.x, -0.22, sc.z);
        boat.rotation.y = sc.rot;
        this.scene.add(boat);
        this.sailboats.push(boat);
      });

      // 8. LINDEN & OAK TREES ALONG JUNGFERNSTIEG, HOLSTENWALL, ALSTER & BOULEVARDS
      const treeCoords = [
        // Jungfernstieg promenade
        [-5.2, -7.2], [-3.2, -7.2], [2.2, -7.2], [4.5, -7.2],
        // Holstenwall park around Museum für Hamburgische Geschichte
        [-35.0, -9.0], [-27.5, -7.5], [-35.5, -2.5], [-34.8, 9.5], [-26.8, 10.5], [-35.5, 14.0],
        // Around Kunsthalle & Lombardsbrücke
        [13.5, -18.5], [16.5, -21.2], [31.5, -16.5], [32.5, -10.5],
        // Around Caffamacherreihe & Außenalster shores
        [-11.5, -16.5], [-23.5, -18.5], [-11.5, -29.5], [-11.5, -39.5],
        [12.5, -29.5], [12.5, -39.5], [13.0, -48.0], [-12.0, -48.0]
      ];
      const tints = [0x5C754A, 0x4E663E, 0x6F8554];
      treeCoords.forEach(([tx, tz], i) => {
        const tree = createLindenTree(0.95 + (i % 3) * 0.16, tints[i % tints.length]);
        tree.position.set(tx, 0.35, tz);
        this.scene.add(tree);
      });

      this.buildLandmarkHTMLPins();
    }

    buildLandmarkHTMLPins() {
      this.pinsLayer.innerHTML = '';
      this.pinElements = {};
      const landmarks = this.getLandmarksData();

      DIORAMA_LANDMARKS.forEach((dLm) => {
        const dataLm = landmarks.find((l) => l.id === dLm.id);
        const fullTitle = dataLm ? this.loc(dataLm, 'name') : dLm.id;
        const shortName = fullTitle.split('(')[0].trim();

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `map3d-pin ${dLm.id === this.activeLandmarkId ? 'is-active' : ''}`;
        btn.setAttribute('data-map-landmark', dLm.id);
        btn.innerHTML = `<span class="map3d-pin__num">${dLm.num}</span> <span>${shortName}</span>`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.focusLandmark(dLm.id, true);
          this.onSelectLandmark(dLm.id, true);
        });

        this.pinsLayer.appendChild(btn);
        this.pinElements[dLm.id] = { el: btn, spec: dLm };
      });
    }

    /* ========================================================================
       6. LOCKED GERMANY COUNTRY MAP (16 BUNDESLÄNDER — ZERO PAN/ROTATE)
       ======================================================================== */
    renderLockedCountryMap() {
      const geo = window.GERMANY_BUNDESLAENDER_GEOJSON;
      if (!geo || !geo.features) return;

      // Bounding box centered strictly on Germany (lon: 5.65..15.25, lat: 47.15..55.15)
      const minLon = 5.65, maxLon = 15.25;
      const minLat = 47.15, maxLat = 55.15;
      const svgW = 680, svgH = 560;

      const proj = (lon, lat) => {
        const x = ((lon - minLon) / (maxLon - minLon)) * (svgW - 110) + 55;
        const y = ((maxLat - lat) / (maxLat - minLat)) * (svgH - 64) + 32;
        return [x, y];
      };

      const ringToPath = (ring) => {
        const step = ring.length > 90 ? 3 : 2;
        let d = '';
        for (let i = 0; i < ring.length; i += step) {
          const [x, y] = proj(ring[i][0], ring[i][1]);
          d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        }
        if (ring.length > 0) {
          const [lx, ly] = proj(ring[ring.length - 1][0], ring[ring.length - 1][1]);
          d += 'L' + lx.toFixed(1) + ',' + ly.toFixed(1) + 'Z';
        }
        return d;
      };

      let pathsHtml = '';
      const statePalette = [
        '#DFD6C3', '#E5DEC9', '#D9CEB8', '#E2DAC6',
        '#DDD2BC', '#E6DFCE', '#D7CCB6', '#E0D8C5'
      ];

      geo.features.forEach((feat, idx) => {
        const name = (feat.properties && feat.properties.name) || '';
        const isHamburgState = name.toLowerCase().includes('hamburg');
        const geom = feat.geometry;
        let pathD = '';

        if (geom.type === 'Polygon') {
          geom.coordinates.forEach((ring) => { pathD += ringToPath(ring); });
        } else if (geom.type === 'MultiPolygon') {
          geom.coordinates.forEach((poly) => {
            poly.forEach((ring) => { pathD += ringToPath(ring); });
          });
        }

        const fill = isHamburgState ? '#C23B1A' : statePalette[idx % statePalette.length];
        const cls = isHamburgState ? 'country-state is-hamburg' : 'country-state';
        pathsHtml += `<path class="${cls}" d="${pathD}" fill="${fill}" data-state-name="${name}"></path>`;
      });

      // State labels positioned cleanly at state centroids (Germany only)
      const stateLabels = [
        { name: 'SCHLESWIG-HOLSTEIN', lon: 9.7, lat: 54.25 },
        { name: 'MECKLENBURG-VORPOMMERN', lon: 12.5, lat: 53.75 },
        { name: 'NIEDERSACHSEN', lon: 9.1, lat: 52.75 },
        { name: 'BRANDENBURG', lon: 13.4, lat: 52.15 },
        { name: 'SACHSEN-ANHALT', lon: 11.65, lat: 51.9 },
        { name: 'NORDRHEIN-WESTFALEN', lon: 7.5, lat: 51.45 },
        { name: 'HESSEN', lon: 9.1, lat: 50.65 },
        { name: 'THÜRINGEN', lon: 11.0, lat: 50.85 },
        { name: 'SACHSEN', lon: 13.3, lat: 51.05 },
        { name: 'RHEINLAND-PFALZ', lon: 7.4, lat: 49.9 },
        { name: 'BADEN-WÜRTTEMBERG', lon: 9.15, lat: 48.55 },
        { name: 'BAYERN', lon: 11.6, lat: 48.95 }
      ];

      let labelsHtml = '';
      stateLabels.forEach((sl) => {
        const [sx, sy] = proj(sl.lon, sl.lat);
        labelsHtml += `<text x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" class="country-state-label">${sl.name}</text>`;
      });

      // City coordinates for pins on the locked country map (5 German cities)
      const cityCoords = {
        hamburg: [9.9937, 53.5511],
        dresden: [13.7373, 51.0504],
        berlin: [13.405, 52.52],
        frankfurt: [8.6821, 50.1109],
        munich: [11.582, 48.1351]
      };

      // Route polyline connecting the 5 expedition cities
      const routeOrder = ['hamburg', 'dresden', 'berlin', 'frankfurt', 'munich'];
      const routePts = routeOrder.map((cid) => {
        const [cx, cy] = proj(cityCoords[cid][0], cityCoords[cid][1]);
        return `${cx.toFixed(1)},${cy.toFixed(1)}`;
      }).join(' ');

      const [hhX, hhY] = proj(cityCoords.hamburg[0], cityCoords.hamburg[1]);
      this.hamburgOriginPct = {
        x: ((hhX / svgW) * 100).toFixed(1) + '%',
        y: ((hhY / svgH) * 100).toFixed(1) + '%'
      };

      const cities = this.getCitiesData();
      let cityPinsHtml = '';
      cities.forEach((city) => {
        const ll = cityCoords[city.id];
        if (!ll) return;
        const [cx, cy] = proj(ll[0], ll[1]);
        const xPct = ((cx / svgW) * 100).toFixed(2);
        const yPct = ((cy / svgH) * 100).toFixed(2);
        const isHH = city.id === 'hamburg';
        cityPinsHtml += `
          <button type="button"
                  class="country-city-pin ${isHH ? 'is-hamburg-hero' : ''}"
                  style="left:${xPct}%; top:${yPct}%;"
                  data-country-city="${city.id}">
            <span class="map3d-pin__num">№${city.issueNo}</span>
            <span>${this.loc(city, 'name')}</span>
            ${isHH ? '<span class="country-pin-cta">3D →</span>' : ''}
          </button>`;
      });

      this.countryLayer.innerHTML = `
        <div class="country-map-locked" id="country-map-locked">
          <svg class="country-svg" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet">
            <text x="84" y="54" class="country-sea-label">NORDSEE</text>
            <text x="470" y="42" class="country-sea-label">OSTSEE</text>
            <g class="country-states-group">
              ${pathsHtml}
            </g>
            <polyline class="country-route-line" points="${routePts}" />
            <circle cx="${hhX.toFixed(1)}" cy="${hhY.toFixed(1)}" r="15" class="country-hamburg-pulse" />
            ${labelsHtml}
          </svg>
          <div class="country-pins-overlay">
            ${cityPinsHtml}
          </div>
        </div>
      `;

      // Bind clicks on the locked country city pins
      this.countryLayer.querySelectorAll('[data-country-city]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cid = btn.getAttribute('data-country-city');
          if (cid === 'hamburg') {
            this.whooshToCity();
          } else {
            this.onSelectCityFromCountry(cid);
          }
        });
      });
    }

    /* ========================================================================
       7. SMOOTH GPU-COMPOSITED TRANSITION (Country <-> City 3D Diorama)
       ======================================================================== */
    whooshToCity() {
      if (this.mode === 'city') {
        this.resetCityOverview();
        return;
      }
      clearTimeout(this._transitionTimer);
      this.mode = 'city';
      this.isTransitioning = true;

      const lockedEl = this.countryLayer.querySelector('#country-map-locked');
      if (lockedEl && this.hamburgOriginPct) {
        lockedEl.style.transformOrigin = `${this.hamburgOriginPct.x} ${this.hamburgOriginPct.y}`;
      }

      // Position 3D camera slightly above overview for a clean, decisive descent
      this.cam.targetX = this.DEFAULT_CAM.targetX;
      this.cam.targetY = this.DEFAULT_CAM.targetY;
      this.cam.targetZ = this.DEFAULT_CAM.targetZ;
      this.cam.distance = 112;
      this.cam.polar = 0.58;
      this.cam.azimuth = this.DEFAULT_CAM.azimuth;

      this.cam.goalTargetX = this.DEFAULT_CAM.targetX;
      this.cam.goalTargetY = this.DEFAULT_CAM.targetY;
      this.cam.goalTargetZ = this.DEFAULT_CAM.targetZ;
      this.cam.goalDistance = this.DEFAULT_CAM.distance;
      this.cam.goalPolar = this.DEFAULT_CAM.polar;
      this.cam.goalAzimuth = this.DEFAULT_CAM.azimuth;

      // Render one immediate frame before revealing so there is zero flash
      this.renderFrame(performance.now() * 0.001);

      this.cityLayer.classList.remove('is-fading-out');
      this.countryLayer.classList.remove('is-zooming-out');
      this.countryLayer.classList.add('is-zooming-in');

      this._transitionTimer = setTimeout(() => {
        this.countryLayer.classList.add('is-hidden');
        this.countryLayer.classList.remove('is-zooming-in');
        this.isTransitioning = false;
      }, 380);
    }

    whooshToCountry() {
      if (this.mode === 'country') return;
      clearTimeout(this._transitionTimer);
      this.mode = 'country';
      this.isTransitioning = true;

      const lockedEl = this.countryLayer.querySelector('#country-map-locked');
      if (lockedEl && this.hamburgOriginPct) {
        lockedEl.style.transformOrigin = `${this.hamburgOriginPct.x} ${this.hamburgOriginPct.y}`;
      }

      // Gently lift 3D camera while cross-fading cleanly into Germany map (zero blur, pure GPU)
      this.cam.goalDistance = Math.min(115, this.cam.distance + 16);
      this.cam.goalPolar = 0.62;
      this.cityLayer.classList.add('is-fading-out');

      // Prepare country layer in its slightly zoomed-in start state without transition
      this.countryLayer.classList.remove('is-hidden', 'is-zooming-in');
      this.countryLayer.classList.add('is-zooming-out');

      // Force a single layout read so the browser commits the start transform cleanly
      if (lockedEl) void lockedEl.offsetWidth;

      // Animate smoothly to scale(1), opacity(1)
      this.countryLayer.classList.remove('is-zooming-out');

      this._transitionTimer = setTimeout(() => {
        this.isTransitioning = false;
      }, 380);
    }

    resetCityOverview() {
      this.cam.goalTargetX = this.DEFAULT_CAM.targetX;
      this.cam.goalTargetY = this.DEFAULT_CAM.targetY;
      this.cam.goalTargetZ = this.DEFAULT_CAM.targetZ;
      this.cam.goalDistance = this.DEFAULT_CAM.distance;
      this.cam.goalAzimuth = this.DEFAULT_CAM.azimuth;
      this.cam.goalPolar = this.DEFAULT_CAM.polar;
    }

    rotateAngleStep() {
      if (this.mode !== 'city') return;
      const steps = [-0.38, -0.06, 0.24, 0.44];
      let nextIdx = 0;
      for (let i = 0; i < steps.length; i++) {
        if (Math.abs(this.cam.goalAzimuth - steps[i]) < 0.12) {
          nextIdx = (i + 1) % steps.length;
          break;
        }
      }
      this.cam.goalAzimuth = steps[nextIdx];
    }

    focusLandmark(landmarkId) {
      if (this.mode !== 'city') {
        this.whooshToCity();
      }
      this.activeLandmarkId = landmarkId;
      const spec = DIORAMA_LANDMARKS.find((l) => l.id === landmarkId) || DIORAMA_LANDMARKS[0];
      if (!spec) return;

      // Update active pin styles
      Object.keys(this.pinElements).forEach((id) => {
        this.pinElements[id].el.classList.toggle('is-active', id === landmarkId);
      });

      // Move 3D highlight ring to landmark
      if (this.focusRing) {
        this.focusRing.position.set(spec.x, 0.45, spec.z);
      }

      // Clamp camera goal inside invisible walls around the landmark
      this.cam.goalTargetX = Math.max(this.BOUNDS.minX, Math.min(this.BOUNDS.maxX, spec.camTarget[0]));
      this.cam.goalTargetY = spec.camTarget[1];
      this.cam.goalTargetZ = Math.max(this.BOUNDS.minZ, Math.min(this.BOUNDS.maxZ, spec.camTarget[2]));
      this.cam.goalDistance = spec.camDist;
      this.cam.goalAzimuth = spec.camAzimuth;
      this.cam.goalPolar = spec.camPolar;
    }

    /* ========================================================================
       8. BOUNDED CAMERA INTERACTION WITH INVISIBLE WALLS
       ======================================================================== */
    clampToInvisibleWalls() {
      const B = this.BOUNDS;
      if (this.cam.goalTargetX < B.minX) this.cam.goalTargetX = B.minX;
      if (this.cam.goalTargetX > B.maxX) this.cam.goalTargetX = B.maxX;
      if (this.cam.goalTargetZ < B.minZ) this.cam.goalTargetZ = B.minZ;
      if (this.cam.goalTargetZ > B.maxZ) this.cam.goalTargetZ = B.maxZ;

      if (this.cam.goalAzimuth < B.minAzimuth) this.cam.goalAzimuth = B.minAzimuth;
      if (this.cam.goalAzimuth > B.maxAzimuth) this.cam.goalAzimuth = B.maxAzimuth;
      if (this.cam.goalPolar < B.minPolar) this.cam.goalPolar = B.minPolar;
      if (this.cam.goalPolar > B.maxPolar) this.cam.goalPolar = B.maxPolar;
      if (this.cam.goalDistance < B.minDist) this.cam.goalDistance = B.minDist;
      if (this.cam.goalDistance > B.maxDist) this.cam.goalDistance = B.maxDist;
    }

    bindInteraction() {
      const THREE = window.THREE;
      const dom = this.renderer.domElement;
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      let isDragging = false;
      let dragButton = 0;
      let startX = 0, startY = 0;
      let moved = 0;

      dom.addEventListener('contextmenu', (e) => e.preventDefault());

      dom.addEventListener('pointerdown', (e) => {
        if (this.mode !== 'city') return;
        isDragging = true;
        dragButton = e.button;
        startX = e.clientX;
        startY = e.clientY;
        moved = 0;
        dom.setPointerCapture(e.pointerId);
      });

      dom.addEventListener('pointermove', (e) => {
        if (!isDragging || this.mode !== 'city') return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        moved += Math.hypot(dx, dy);

        if (dragButton === 2 || e.ctrlKey || e.shiftKey) {
          // Slight bounded tilt/orbit within invisible walls
          this.cam.goalAzimuth -= dx * 0.0045;
          this.cam.goalPolar = Math.max(
            this.BOUNDS.minPolar,
            Math.min(this.BOUNDS.maxPolar, this.cam.goalPolar + dy * 0.0035)
          );
        } else {
          // Distance-scaled pan around center, hitting invisible walls smoothly
          const panSpeed = this.cam.distance * 0.00095;
          const cosA = Math.cos(this.cam.azimuth);
          const sinA = Math.sin(this.cam.azimuth);
          this.cam.goalTargetX -= (dx * cosA + dy * sinA) * panSpeed;
          this.cam.goalTargetZ -= (-dx * sinA + dy * cosA) * panSpeed;
        }
        this.clampToInvisibleWalls();
      });

      dom.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        dom.releasePointerCapture(e.pointerId);

        // If it was a click (not a drag), raycast 3D landmark buildings!
        if (moved < 6 && this.mode === 'city') {
          const rect = dom.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, this.camera);

          const meshes = [];
          Object.values(this.landmarkGroups).forEach((grp) => {
            grp.traverse((ch) => { if (ch.isMesh) meshes.push(ch); });
          });

          const hits = raycaster.intersectObjects(meshes, false);
          if (hits.length > 0 && hits[0].object.userData.landmarkId) {
            const lmId = hits[0].object.userData.landmarkId;
            this.focusLandmark(lmId);
            this.onSelectLandmark(lmId, true);
          }
        }
      });

      dom.addEventListener('wheel', (e) => {
        if (this.mode !== 'city') return;
        e.preventDefault();
        this.cam.goalDistance += e.deltaY * 0.018;
        this.clampToInvisibleWalls();
      }, { passive: false });

      window.addEventListener('resize', () => {
        const w = this.container.clientWidth || 640;
        const h = this.container.clientHeight || 540;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      });
    }

    updateHTMLPinsProjection() {
      const THREE = window.THREE;
      const w = this.container.clientWidth || 640;
      const h = this.container.clientHeight || 540;
      const v = new THREE.Vector3();

      Object.keys(this.pinElements).forEach((id) => {
        const { el, spec } = this.pinElements[id];
        v.set(spec.x, spec.pinY, spec.z);
        v.project(this.camera);

        const sx = (v.x * 0.5 + 0.5) * w;
        const sy = (-v.y * 0.5 + 0.5) * h;

        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
      });
    }

    renderFrame(t) {
      // Smooth spring damping toward bounded goal camera (snappier during transitions)
      const lerp = this.isTransitioning ? 0.17 : 0.13;
      this.cam.targetX += (this.cam.goalTargetX - this.cam.targetX) * lerp;
      this.cam.targetY += (this.cam.goalTargetY - this.cam.targetY) * lerp;
      this.cam.targetZ += (this.cam.goalTargetZ - this.cam.targetZ) * lerp;
      this.cam.distance += (this.cam.goalDistance - this.cam.distance) * lerp;
      this.cam.azimuth += (this.cam.goalAzimuth - this.cam.azimuth) * lerp;
      this.cam.polar += (this.cam.goalPolar - this.cam.polar) * lerp;

      const sinP = Math.sin(this.cam.polar);
      const cosP = Math.cos(this.cam.polar);
      const sinA = Math.sin(this.cam.azimuth);
      const cosA = Math.cos(this.cam.azimuth);

      this.camera.position.set(
        this.cam.targetX + this.cam.distance * sinP * sinA,
        this.cam.targetY + this.cam.distance * cosP,
        this.cam.targetZ + this.cam.distance * sinP * cosA
      );
      this.camera.lookAt(this.cam.targetX, this.cam.targetY, this.cam.targetZ);

      // Gentle bobbing of ships on the Elbe & sailboats on the Binnenalster
      this.ships.forEach((ship, i) => {
        ship.position.y = -0.25 + Math.sin(t * 1.6 + i) * 0.05;
        ship.rotation.z = Math.sin(t * 1.2 + i) * 0.025;
      });
      this.sailboats.forEach((boat, i) => {
        boat.position.y = -0.22 + Math.sin(t * 2.1 + i * 1.5) * 0.035;
        boat.rotation.z = Math.cos(t * 1.7 + i) * 0.03;
      });

      // Subtle pulse on active landmark ring
      if (this.focusRing) {
        const s = 1 + Math.sin(t * 3.2) * 0.06;
        this.focusRing.scale.set(s, s, 1);
      }

      this.renderer.render(this.scene, this.camera);
      if (this.mode === 'city') {
        this.updateHTMLPinsProjection();
      }
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      // Pause WebGL completely while idle on the 2D Germany map so Bundesländer hover is 60fps instant
      if (this.mode === 'country' && !this.isTransitioning) {
        return;
      }

      this.renderFrame(performance.now() * 0.001);
    }
  }

  window.HamburgDioramaStage = HamburgDioramaStage;
  window.HAMBURG_DIORAMA_LANDMARKS = DIORAMA_LANDMARKS;
})();

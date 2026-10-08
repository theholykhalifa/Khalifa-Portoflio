/* HOLY // pixel operative avatars — 10x10 grids, '.' = transparent */
const AVATARS = [
 { name: "RED HOOD", pal: { R: "#FF3355", K: "#0a0d12", C: "#7DEBFF", S: "#3a4653" }, rows: [
  "...RRRR...", "..RRRRRR..", ".RRRRRRRR.", ".RRRRRRRR.", ".RRKCCKRR.",
  ".RRKCCKRR.", "..RRKKRR..", "..RRRRRR..", ".RSRRRRSR.", "RRRRRRRRRR"] },
 { name: "SENTINEL", pal: { B: "#4D7CFE", W: "#F5F7FA", K: "#0a0d12", S: "#3a4653" }, rows: [
  "...BBBB...", "..BBBBBB..", ".BBBBBBBB.", ".BWWWWWWB.", ".BWKWWKWB.",
  ".BWWWWWWB.", "..BBBBBB..", "..BSBBBS..", ".BBBBBBBB.", "BBBBBBBBBB"] },
 { name: "CIPHER", pal: { G: "#00ffa3", K: "#0a0d12", W: "#F5F7FA", S: "#3a4653" }, rows: [
  "....GG....", "....GG....", "..GGGGGG..", ".GGGGGGGG.", ".GGKGGKGG.",
  ".GGGGGGGG.", ".GGWWWWGG.", "..GGGGGG..", "...GGGG...", "..SSSSSS.."] },
 { name: "PHANTOM", pal: { P: "#c792ea", W: "#F5F7FA", K: "#0a0d12", S: "#3a4653" }, rows: [
  "...PPPP...", "..PPPPPP..", ".PPPPPPPP.", ".PPPPPPPP.", ".PPWPPWPP.",
  ".PPWPPWPP.", "..PPPPPP..", "...PPPP...", "..PKKKKP..", "..PPPPPP.."] },
 { name: "WARDEN", pal: { Y: "#FFB020", R: "#FF3355", K: "#0a0d12", S: "#3a4653" }, rows: [
  "....RR....", "...RRRR...", "..YYYYYY..", ".YYYYYYYY.", ".YYKYYKYY.",
  ".YYYYYYYY.", "..YYYYYY..", "..YSYYYS..", ".YYYYYYYY.", "YYYYYYYYYY"] },
 { name: "OWNER", admin: true, img: "assets/owner-face.png" },
];
function avatarSVG(i, size) {
  const a = AVATARS[i] || AVATARS[0];
  if (a.img) return `<img class="avimg" src="${a.img}" alt="${a.name} avatar">`;
  let r = "";
  a.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === "." || !a.pal[ch]) return;
      r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${a.pal[ch]}"/>`;
    });
  });
  return `<svg viewBox="0 0 10 10" width="${size || 96}" height="${size || 96}" shape-rendering="crispEdges" role="img" aria-label="${a.name} avatar">${r}</svg>`;
}

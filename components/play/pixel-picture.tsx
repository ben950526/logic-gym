import { pictureGrid, type Picture } from "@/lib/puzzles/pictures";

/** 用格子畫出圖鑑圖案（不用圖片檔） */
export function PixelPicture({ picture }: { picture: Picture }) {
  const grid = pictureGrid(picture);
  const n = grid.length;
  return (
    <div className="lgp-pixel" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="img" aria-label={picture.name}>
      {grid.flat().map((v, i) => (
        <i key={i} style={{ background: v ? picture.color : "transparent" }} />
      ))}
    </div>
  );
}

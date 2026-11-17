import Link from "next/link";

import { GamePanel } from "@/components/game/game-panel";

import { UniversePickerGrid } from "@/components/world/universe-picker-grid";



export function HomeDepartSection() {

  return (

    <section className="player-home-depart">

      <h2 className="player-home-section-title">出發去</h2>

      <p className="player-home-depart-hint">

        先選適合年齡的宇宙，再挑主題星系與星球 · 每天一兩關就夠

      </p>



      <GamePanel className="game-panel-adventure membership-card player-home-depart-card">

        <UniversePickerGrid />

      </GamePanel>



      <p className="player-home-depart-foot">

        不確定從哪開始？

        <Link href="/universe/grades-3-4" className="player-home-depart-foot-link">

          中年級宇宙

        </Link>

        目前有完整關卡

      </p>

    </section>

  );

}


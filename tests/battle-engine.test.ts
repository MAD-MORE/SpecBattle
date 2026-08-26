import {describe,expect,it} from "vitest";
import {runBattle} from "@/lib/scoring/battle-engine";
import type {Phone} from "@/types/battle";
const a:Phone={id:"a",name:"A",brand:"Test",specs:{performance:90,camera:80,display:70,battery:60,storage:50,connectivity:90}};
const b:Phone={id:"b",name:"B",brand:"Test",specs:{performance:80,camera:85,display:75,battery:65,storage:45,connectivity:80}};
describe("battle engine",()=>{it("scores each spec independently",()=>{const r=runBattle(a,b);expect(r.rounds).toHaveLength(6);expect(r.rounds[0].winner).toBe("left");expect(r.rounds[1].winner).toBe("right")});it("returns the higher total as winner",()=>{const r=runBattle(a,b);expect(r.winner).toBe("left")})});

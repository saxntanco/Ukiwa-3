import { CARDS } from './cards.js';
import { apply, legalActions, other } from './engine.js';
// AI receives its own hand + public board/counts. Unknown draws stay unknown in search.
export function publicView(state, side) {
    const s = structuredClone(state);
    s.players.forEach((p, i) => { p.deck = p.deck.map((_, n) => ({ uid: `unknown-deck-${i}-${n}`, card: 'tesla' })); if (i !== side)
        p.hand = p.hand.map((_, n) => ({ uid: `unknown-hand-${i}-${n}`, card: 'tesla' })); });
    s.logs = [];
    s.events = [];
    return s;
}
function actions(s, side) { return legalActions(s, side).filter(a => a.type !== 'end' && !(a.type === 'play' && a.uid.startsWith('unknown-'))); }
function value(s, side) {
    if (s.winner !== null)
        return s.winner === side ? 100000 : s.winner === 'draw' ? 0 : -100000;
    const me = s.players[side], enemy = s.players[other(side)];
    const board = (p) => p.board.reduce((v, u) => v + u.attack * 1.7 + Math.min(u.health, 8) * .9 + (CARDS[u.card].guard ? 1.8 : 0), 0);
    return board(me) - board(enemy) * 1.3 + (20 - enemy.life) * 1.6 - (20 - me.life) * 1.3 + me.hand.length * .8;
}
export function chooseAction(state, side = 1) {
    const root = publicView(state, side);
    if (root.active !== side || root.winner !== null)
        return { type: 'end' };
    let beam = [];
    let best;
    for (const a of actions(root, side)) {
        const r = apply(root, side, a);
        if (!r.ok)
            continue;
        const n = { s: r.state, first: a, score: value(r.state, side) };
        if (n.s.winner === side)
            return a;
        beam.push(n);
        if (!best || n.score > best.score)
            best = n;
    }
    // Beam search finds short lethal combinations (buff → guard removal → face damage).
    beam.sort((a, b) => b.score - a.score);
    beam = beam.slice(0, 14);
    for (let depth = 1; depth < 5; depth++) {
        const next = [];
        for (const node of beam) {
            for (const a of actions(node.s, side)) {
                const r = apply(node.s, side, a);
                if (!r.ok)
                    continue;
                if (r.state.winner === side)
                    return node.first;
                const n = { s: r.state, first: node.first, score: value(r.state, side) - depth * .025 };
                next.push(n);
                if (!best || n.score > best.score)
                    best = n;
            }
        }
        next.sort((a, b) => b.score - a.score);
        beam = next.slice(0, 14);
        if (!beam.length)
            break;
    }
    return best && best.score > value(root, side) + .01 ? best.first : { type: 'end' };
}

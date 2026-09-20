import { CARD_IDS } from './cards.js';
export const DECKS = {
    balanced: { name: '均衡回路', tip: 'まずはこちら。全カード2枚の万能型。', cards: CARD_IDS.flatMap(id => [id, id]) },
    rush: { name: '閃光ラッシュ', tip: '速攻と強化で序盤から攻め切る。', cards: ['spark', 'spark', 'spark', 'spark', 'resistor', 'capacitor', 'capacitor', 'diode', 'diode', 'diode', 'coil', 'coil', 'transistor', 'short', 'short', 'overclock', 'overclock', 'overclock', 'lightning', 'lightning'] },
    guard: { name: '鉄壁リアクター', tip: '守護で耐え、テスラの全体攻撃で反撃。', cards: ['spark', 'resistor', 'resistor', 'resistor', 'resistor', 'capacitor', 'capacitor', 'capacitor', 'diode', 'coil', 'coil', 'transistor', 'transistor', 'tesla', 'tesla', 'tesla', 'short', 'short', 'overclock', 'lightning'] },
    storm: { name: '雷撃コントロール', tip: 'ドローと除去で盤面を整え、落雷で決着。', cards: ['spark', 'resistor', 'resistor', 'capacitor', 'diode', 'diode', 'coil', 'coil', 'coil', 'transistor', 'tesla', 'short', 'short', 'short', 'overclock', 'overclock', 'lightning', 'lightning', 'lightning', 'lightning'] }
};

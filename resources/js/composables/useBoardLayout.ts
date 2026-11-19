import { onBeforeUnmount, onMounted } from 'vue';
import type { Ref } from 'vue';
import { folders, sectionLabel } from '../data/sections';
import type { FolderId } from '../data/sections';

type Point = [number, number];
type Rect = { x: number; y: number; w: number; h: number };
type Positions = Partial<Record<FolderId, Point>>;
type BoardItem = { id: FolderId; element: HTMLButtonElement; w: number; h: number };

const storageKey = 'alisa-board-v8-left';
const mobileOrder = [
    'hard-skills',
    'experience',
    'about',
    'tools',
    'photo-guide',
    'boosting',
    'mare',
] satisfies FolderId[];
const edge = 8;
const gap = 20;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const overlaps = (a: Rect, b: Rect) =>
    a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

function readPositions(): Positions {
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
        if (!stored || typeof stored !== 'object') return {};
        const result: Positions = {};
        for (const id of mobileOrder) {
            const value: unknown = (stored as Record<string, unknown>)[id];
            if (Array.isArray(value) && value.length === 2 && value.every(Number.isFinite)) {
                result[id] = [value[0], value[1]];
            }
        }
        return result;
    } catch {
        return {};
    }
}

function pack(items: BoardItem[], width: number, height: number, hero: Rect, positions: Positions) {
    const blocked: Rect[] = [hero, { x: 0, y: 0, w: 120, h: 66 }];
    const placed = new Map<FolderId, Rect>();
    let fits = true;

    for (const { id, w, h } of items) {
        const saved = positions[id];
        if (saved) {
            // Manual positions may overlap without forcing the automatic layout to shrink.
            placed.set(id, {
                x: clamp(saved[0] * width - w / 2, edge, width - w - edge),
                y: clamp(saved[1] * height - h / 2, edge, height - h - edge),
                w,
                h,
            });
            continue;
        }

        const {
            anchor: [fx, fy],
            side,
        } = folders[id];
        const left = side === 'left';
        const targetX = fx * (left ? hero.x : width) - w / 2;
        const targetY = fy * height - h / 2;
        let nearest: Rect | undefined;
        let distance = Infinity;

        for (let y = edge; y <= height - h - edge; y += 12) {
            for (let x = edge; x <= width - w - edge; x += 12) {
                if (left !== x + w / 2 < width / 2) continue;
                const candidateDistance = (x - targetX) ** 2 + (y - targetY) ** 2;
                if (candidateDistance >= distance) continue;
                const candidate = { x, y, w, h };
                if (blocked.some((rect) => overlaps(candidate, rect))) continue;
                nearest = candidate;
                distance = candidateDistance;
            }
        }

        if (!nearest) {
            fits = false;
            nearest = {
                x: clamp(targetX, edge, width - w - edge),
                y: clamp(targetY, edge, height - h - edge),
                w,
                h,
            };
        }
        blocked.push(nearest);
        placed.set(id, nearest);
    }

    return { placed, fits };
}

export function useBoardLayout(board: Ref<HTMLElement | null>, hero: Ref<HTMLElement | null>) {
    let positions: Positions = {};
    let observer: ResizeObserver | undefined;
    let mounted = false;
    const narrow = () => window.matchMedia('(max-width: 760px)').matches;
    const items = () =>
        Array.from(board.value?.querySelectorAll<HTMLButtonElement>('.obj') ?? [], (element) => ({
            id: element.dataset.id as FolderId,
            element,
            w: element.offsetWidth,
            h: element.offsetHeight,
        }));

    function layout() {
        const canvas = board.value;
        const identity = hero.value;
        if (!canvas || !identity) return;

        const width = canvas.clientWidth;
        if (narrow()) {
            canvas.style.setProperty('--s', '1');
            const columnWidth = (width - 44) / 2;
            const scale = Math.min(1.1, columnWidth / Math.max(...items().map(({ w }) => w)));
            canvas.style.setProperty('--s', scale.toFixed(3));
            const measured = new Map(items().map((item) => [item.id, item]));
            let y = identity.offsetTop + identity.offsetHeight + Math.round(48 * scale);

            for (let index = 0; index < mobileOrder.length; index += 2) {
                const row = mobileOrder.slice(index, index + 2).map((id) => measured.get(id)!);
                const height = Math.max(...row.map(({ h }) => h));
                row.forEach(({ element, w, h }, column) => {
                    const x =
                        row.length === 1
                            ? (width - w) / 2
                            : 16 + column * (columnWidth + 12) + (columnWidth - w) / 2;
                    place(element, Math.round(x), Math.round(y + height - h));
                });
                y += height + Math.round(34 * scale);
            }
            canvas.style.height = y + 24 + 'px';
        } else {
            canvas.style.height = '';
            const height = canvas.clientHeight;
            const boardRect = canvas.getBoundingClientRect();
            const heroRect = identity.getBoundingClientRect();
            const obstacle = {
                x: heroRect.left - boardRect.left,
                y: heroRect.top - boardRect.top,
                w: heroRect.width,
                h: heroRect.height,
            };
            let scale = Math.max(
                0.55,
                Math.min(1, height / 760, width / 1280, Math.max(0.75, (obstacle.x - 56) / 400)),
            );
            let packed: ReturnType<typeof pack>;
            do {
                canvas.style.setProperty('--s', scale.toFixed(3));
                packed = pack(items(), width, height, obstacle, positions);
                if (packed.fits || scale <= 0.5) break;
                scale = Math.max(0.5, scale - 0.06);
            } while (true);
            for (const { id, element } of items()) {
                const rect = packed.placed.get(id)!;
                place(element, rect.x, rect.y);
            }
        }

        for (const { id, element, w, h } of items()) {
            const dimensions = element.querySelector('.dim');
            if (dimensions) dimensions.textContent = sectionLabel(id) + '  ' + w + ' × ' + h;
        }
    }

    function place(element: HTMLElement, x: number, y: number) {
        element.style.left = x + 'px';
        element.style.top = y + 'px';
    }

    function remember(id: FolderId, element: HTMLElement) {
        const canvas = board.value;
        if (!canvas) return;
        positions[id] = [
            (parseFloat(element.style.left) + element.offsetWidth / 2) / canvas.clientWidth,
            (parseFloat(element.style.top) + element.offsetHeight / 2) / canvas.clientHeight,
        ];
        try {
            localStorage.setItem(storageKey, JSON.stringify(positions));
        } catch {
            /* Storage can be disabled. */
        }
    }

    function reset() {
        positions = {};
        try {
            localStorage.removeItem(storageKey);
        } catch {
            /* The board can still reset. */
        }
        layout();
    }

    onMounted(() => {
        mounted = true;
        positions = readPositions();
        layout();
        if (hero.value) {
            observer = new ResizeObserver(layout);
            observer.observe(hero.value);
        }
        window.addEventListener('resize', layout);
        void document.fonts.ready.then(() => {
            if (mounted) layout();
        });
    });

    onBeforeUnmount(() => {
        mounted = false;
        observer?.disconnect();
        window.removeEventListener('resize', layout);
    });

    return { narrow, place, remember, reset };
}

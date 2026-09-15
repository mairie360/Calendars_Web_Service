// Exécuteur de hooks React sans DOM : implémente useState/useMemo/useCallback/useEffect avec le même
// modèle que React (état par position d'appel, dépendances comparées par Object.is, effets après rendu,
// mises à jour regroupées en microtâche). À installer avec `stubModule('react', react)` avant de charger
// le hook testé.

function depsChanged(previous, next) {
  return !previous || !next || previous.length !== next.length || previous.some((value, index) => !Object.is(value, next[index]));
}

let current;

const react = {
  useState(initial) {
    const hook = current;
    const index = hook.cursor++;
    if (!(index in hook.slots)) hook.slots[index] = typeof initial === 'function' ? initial() : initial;
    const setState = hook.setters[index] ??= (value) => {
      const next = typeof value === 'function' ? value(hook.slots[index]) : value;
      if (Object.is(next, hook.slots[index]) || hook.unmounted) return;
      hook.slots[index] = next;
      hook.schedule();
    };
    return [hook.slots[index], setState];
  },
  useMemo(factory, deps) {
    const hook = current;
    const index = hook.cursor++;
    const previous = hook.slots[index];
    if (previous && !depsChanged(previous.deps, deps)) return previous.value;
    hook.slots[index] = { deps, value: factory() };
    return hook.slots[index].value;
  },
  useCallback(callback, deps) {
    return react.useMemo(() => callback, deps);
  },
  useEffect(effect, deps) {
    const hook = current;
    const index = hook.cursor++;
    const previous = hook.slots[index];
    if (previous && !depsChanged(previous.deps, deps)) return;
    hook.slots[index] = { deps, cleanup: previous?.cleanup };
    hook.effectSlots.add(index);
    hook.effects.push(() => {
      previous?.cleanup?.();
      hook.slots[index].cleanup = effect() ?? undefined;
    });
  },
};

/** Rend `useHook()` et le re-rend à chaque mise à jour d'état ; `result.current` suit le dernier rendu. */
function renderHook(useHook) {
  const hook = {
    slots: [],
    setters: [],
    effects: [],
    effectSlots: new Set(),
    cursor: 0,
    renders: 0,
    unmounted: false,
    scheduled: false,
    schedule() {
      if (hook.scheduled) return;
      hook.scheduled = true;
      queueMicrotask(() => { hook.scheduled = false; if (!hook.unmounted) render(); });
    },
  };
  const result = { current: undefined, get renders() { return hook.renders; } };

  function render() {
    current = hook;
    hook.cursor = 0;
    try {
      result.current = useHook();
    } finally {
      current = undefined;
    }
    hook.renders += 1;
    const effects = hook.effects.splice(0);
    effects.forEach((run) => run());
  }

  render();

  return {
    result,
    /** Attend que `predicate(result.current)` soit vrai (réseau réel : on laisse tourner la boucle d'événements). */
    async waitFor(predicate, { timeout = 3000 } = {}) {
      const deadline = Date.now() + timeout;
      while (!(await settled(hook), predicate(result.current))) {
        if (Date.now() > deadline) throw new Error('waitFor : condition non atteinte');
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      return result.current;
    },
    unmount() {
      hook.unmounted = true;
      hook.effectSlots.forEach((index) => hook.slots[index].cleanup?.());
    },
  };
}

async function settled(hook) {
  while (hook.scheduled) await new Promise((resolve) => setImmediate(resolve));
}

module.exports = { react, renderHook };

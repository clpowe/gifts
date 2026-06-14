<script setup lang="ts">
const { query, results, ensureLoaded, clear } = useBirthdaySearch();
const orgsStore = useOrganizationStore();

const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const pop = ref<HTMLElement | null>(null);
const activeIndex = ref(-1);
const isOpen = ref(false);

function position() {
    const i = input.value;
    const p = pop.value;
    if (!i || !p) return;
    const r = i.getBoundingClientRect();
    p.style.left = `${r.left}px`;
    p.style.top = `${r.bottom + 4}px`;
    p.style.width = `${r.width}px`;
}

function show() {
    const p = pop.value;
    if (!p) return;
    if (!p.matches(":popover-open")) p.showPopover();
    isOpen.value = true;
    position();
}

function hide() {
    const p = pop.value;
    if (p?.matches(":popover-open")) p.hidePopover();
    isOpen.value = false;
}

function onToggle(e: ToggleEvent) {
    isOpen.value = e.newState === "open";
}

function onReflow() {
    if (pop.value?.matches(":popover-open")) position();
}

watch(query, () => {
    activeIndex.value = -1;
    if (query.value.trim()) show();
    else hide();
});

watch(() => orgsStore.activeOrgId, ensureLoaded);

onMounted(() => {
    ensureLoaded();
    // reposition while open (popover is fixed in viewport coords)
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
});

onBeforeUnmount(() => {
    window.removeEventListener("scroll", onReflow, true);
    window.removeEventListener("resize", onReflow);
});

// manual popover has no light-dismiss; wire our own
onClickOutside(root, () => hide());

function go(id: string) {
    navigateTo(`/birthdays/${id}`);
    clear();
    hide();
}

function onFocus() {
    if (query.value.trim()) show();
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        hide();
        return;
    }
    const open = pop.value?.matches(":popover-open");
    if (!open || !results.value.length) return;
    if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex.value = (activeIndex.value + 1) % results.value.length;
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex.value =
            (activeIndex.value - 1 + results.value.length) %
            results.value.length;
    } else if (e.key === "Enter") {
        e.preventDefault();
        const item = results.value[activeIndex.value] ?? results.value[0];
        if (item) go(item.id);
    }
}
</script>
<template>
    <div ref="root" class="search">
        <input
            ref="input"
            v-model="query"
            type="search"
            role="combobox"
            placeholder="Search people…"
            aria-label="Search birthdays"
            aria-controls="search-results"
            :aria-expanded="isOpen"
            autocomplete="off"
            @focus="onFocus"
            @keydown="onKeydown"
        />

        <ul
            id="search-results"
            ref="pop"
            popover="manual"
            class="search__results"
            role="listbox"
            @toggle="onToggle"
        >
            <li v-if="!results.length" class="search__empty">No matches</li>
            <li
                v-for="(b, i) in results"
                :key="b.id"
                role="option"
                :aria-selected="i === activeIndex"
                class="search__item"
                :class="{ 'is-active': i === activeIndex }"
                @mouseenter="activeIndex = i"
                @mousedown.prevent="go(b.id)"
            >
                <strong>{{ b.name }}</strong>
                <span class="search__meta">{{ b.relation }}</span>
            </li>
        </ul>
    </div>
</template>
<style scoped>
.search {
    position: relative;
    flex: 1 1 14rem;
    max-width: 20rem;
}
.search input {
    width: 100%;
}

/* popover element: clear UA defaults, position via JS (left/top/width inline) */
.search__results {
    position: fixed;
    inset: auto;
    margin: 0;
    list-style: none;
    overflow-y: auto;
}
.search__item {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
}
.search__item.is-active {
    background: #eef2ff;
}
.search__meta {
}
.search__empty {
}
</style>
